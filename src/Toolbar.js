import { useEffect, useState } from "react";
import "./Toolbar.css";
import getData from "./utils";


function Toolbar({ setData }) {
  const [filters, setFilters] = useState({
    vehicle: true,
    parking: true,
    poi: true,
  });
  const [items, setItems] = useState([]);
  const [minPercentage, setMinPercentage] = useState(1);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    getData(setItems);
  }, []);

  function handleChange(e) {
    let value = e.target.value;
    if (filters[value] === true) {
      setFilters((prevState) => {
        return {
          ...prevState,
          [value]: false,
        };
      });
    } else {
      setAvailable(true);
      setFilters((prevState) => {
        return {
          ...prevState,
          [value]: true,
        };
      });
    }
  }

  useEffect(() => {
    setData(() =>
      items.filter((item) => filters[item.discriminator.toLowerCase()] === true)
    );
    if (Object.values(filters).every((e) => e === false)) {
      setData([]);
    }
  }, [filters]);

  useEffect(() => {
    if (!filters["vehicle"] === true) return;
    setAvailable(true);
    setData(() =>
      items.filter((item) => filters[item.discriminator.toLowerCase()] === true)
    );
    if (parseInt(minPercentage) >= 0) {
      setData((prevState) =>
        prevState.filter(
          (e) =>
            !(
              e.discriminator === "vehicle" &&
              e.batteryLevelPct < parseInt(minPercentage) &&
              e.status !== `${available ? "available" : "unavailable"}`
            )
        )
      );
    }
  }, [minPercentage]);

  useEffect(() => {
    if (filters["vehicle"] === true) setMinPercentage(0);
  }, [filters["vehicle"]]);

  useEffect(() => {
    setData(() =>
      items.filter((item) => filters[item.discriminator.toLowerCase()] === true)
    );
    if (available === false) {
      setData((prevState) =>
        prevState.filter(
          (e) =>
            !(
              e.discriminator === "vehicle" &&
              e.status !== null &&
              e.status !== "UNAVAILABLE"
            )
        )
      );
    } else {
      setData((prevState) =>
        prevState.filter(
          (e) => !(e.discriminator === "vehicle" && e.status === null)
        )
      );
    }
  }, [available, filters]);

  return (
    <div className="toolbar" data-testid="toolbar">
      <div className="row">
        <input
          type="checkbox"
          id="vehicle"
          value="vehicle"
          checked={filters["vehicle"]}
          onChange={handleChange}
        />
        <label style={{ color: "red" }} htmlFor="vehicle">
          vehicles
        </label>
        <div className="row" style={{ marginLeft: "6rem" }}>
          <input
            type="checkbox"
            id="available"
            value="available"
            checked={available}
            onChange={() => setAvailable(true)}
          />
          <label htmlFor="available">available</label>
          <input
            type="checkbox"
            id="unavailable"
            value="unavailable"
            checked={!available}
            onChange={() => setAvailable(false)}
            style={{ marginLeft: "1.5rem" }}
          />
          <label htmlFor="unavailable">unavailable</label>
        </div>
        <div>
          min % of battery:
          <input
            className="batteryInput"
            value={minPercentage}
            onChange={(e) => setMinPercentage(e.target.value)}
          />
        </div>
      </div>
      <hr />
      <div className="row">
        <input
          type="checkbox"
          id="parking"
          value="parking"
          checked={filters["parking"]}
          onChange={handleChange}
          className="checkbox"
        />
        <label style={{ color: "blue" }} htmlFor="parking">
          parkings
        </label>
      </div>
      <hr />

      <div className="row">
        <input
          type="checkbox"
          id="poi"
          value="poi"
          checked={filters["poi"]}
          onChange={handleChange}
        />
        <label style={{ color: "green" }} htmlFor="point">
          points of interest
        </label>
      </div>
    </div>
  );
}

export default Toolbar;
