import "./App.css";
import { useEffect, useRef, useState } from "react";
import ReactMapGL, { Marker, Popup, FlyToInterpolator } from "react-map-gl";
import useSupercluster from "use-supercluster";
import getData from "./utils";
import Toolbar from "./Toolbar";

const styleSchema = {
  vehicle: "green",
  parking: "blue",
  poi: "orange",
};

function App() {
  const mapRef = useRef();
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 51.99,
    longitude: 19.456,
    zoom: 6,
  });
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    getData(setData);
  }, []);

  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Escape") {
        setSelectedItem(null);
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  const clusterPoints = data.map((item) => ({
    type: "Feature",
    properties: {
      cluster: false,
      itemId: item.id,
      category: item.discriminator,
    },
    geometry: {
      type: "Point",
      coordinates: [
        parseFloat(item.location.longitude),
        parseFloat(item.location.latitude),
      ],
    },
  }));

  const bounds = mapRef.current
    ? mapRef.current.getMap().getBounds().toArray().flat()
    : null;

  const { clusters, supercluster } = useSupercluster({
    points: clusterPoints,
    zoom: viewport.zoom,
    bounds,
    options: {
      radius: 75,
      maxZoom: 20,
    },
  });

  function showPopup(cluster) {
    let item = data.filter((e) => e.id === cluster.properties.itemId)[0];
    setSelectedItem(item);
  }

  return (
    <ReactMapGL
      {...viewport}
      mapStyle="mapbox://styles/mapbox/light-v10"
      mapboxApiAccessToken="pk.eyJ1Ijoic2Nhcm4tcmVhcGVyIiwiYSI6ImNrbXVjdGVtcTA0MzUyb2s1ZGdnYTMyZXkifQ.kBnmF1nXeQvyAMlZVyuYdg"
      onViewportChange={(nextViewport) => setViewport(nextViewport)}
      ref={mapRef}
      data-testid="app"
    >
      <Toolbar setData={setData} />
      {clusters?.map((cluster) => {
        const { cluster: isCluster, point_count: pointCount } =
          cluster.properties;
        const [longitude, latitude] = cluster.geometry.coordinates;
        if (isCluster) {
          return (
            <Marker key={cluster.id} latitude={latitude} longitude={longitude}>
              <div
                className="cluster"
                onClick={() => {
                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster.id),
                    20
                  );
                  setViewport({
                    ...viewport,
                    latitude,
                    longitude,
                    zoom: expansionZoom,
                    transitionInterpolator: new FlyToInterpolator({
                      speed: 2,
                    }),
                    transitionDuration: "auto",
                  });
                }}
              >
                {pointCount}
              </div>
            </Marker>
          );
        }
        return (
          <Marker
            key={cluster.properties.itemId}
            latitude={latitude}
            longitude={longitude}
          >
            <div
              className="marker"
              style={{
                background: styleSchema[cluster.properties.category],
              }}
              onClick={() => showPopup(cluster)}
            ></div>
          </Marker>
        );
      })}
      {selectedItem && (
        <Popup
          latitude={selectedItem.location.latitude}
          longitude={selectedItem.location.longitude}
          onClose={() => setSelectedItem(null)}
        >
          {selectedItem.discriminator === "vehicle" && (
            <div>
              <strong style={{ color: "green" }}>VEHICLE</strong>
              <div className="title">{selectedItem.name}</div>
              <p style={{ marginTop: ".25rem" }}>
                type: {selectedItem.type.toLowerCase()}
              </p>
              <p>
                plates: <strong>{selectedItem.platesNumber}</strong>
              </p>
              <div
                style={{
                  color: selectedItem.status === "AVAILABLE" ? "green" : "red",
                }}
              >
                {selectedItem.status}
              </div>
              <div className="battery">
                Battery: {selectedItem.batteryLevelPct}%
              </div>
            </div>
          )}
          {selectedItem.discriminator === "parking" && (
            <div>
              <strong style={{ color: "blue" }}>PARKING</strong>
              <div className="title">
                {selectedItem.address.street}{" "}
                <span>{selectedItem.address.house}</span>
              </div>
              <p style={{ marginTop: ".25rem" }}>{selectedItem.description}</p>
              <hr />
              <p>
                Available spaces:{" "}
                <strong style={{ color: "green" }}>
                  {selectedItem.availableSpacesCount}
                </strong>
              </p>
              <p>
                Total spaces: <strong>{selectedItem.spacesCount}</strong>
              </p>
            </div>
          )}
          {selectedItem.discriminator === "poi" && (
            <div>
              <strong style={{ color: "orange" }}>POINT OF INTEREST</strong>
              <div className="title">{selectedItem.description}</div>
              <p>
                {selectedItem.address.street}{" "}
                <strong>{selectedItem.address.house}</strong>
              </p>
              <p>{selectedItem.address.city}</p>
            </div>
          )}
        </Popup>
      )}
    </ReactMapGL>
  );
}

export default App;
