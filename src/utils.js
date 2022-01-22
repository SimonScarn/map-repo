import axios from "axios";


export default function getData(setState) {
    axios.all([
        axios.get("https://dev.vozilla.pl/api-client-portal/map?objectType=vehicle"),
        axios.get("https://dev.vozilla.pl/api-client-portal/map?objectType=parking"),
        axios.get("https://dev.vozilla.pl/api-client-portal/map?objectType=poi")
       ])
       .then(axios.spread((obj1, obj2, obj3) => {
        setState([
          ...obj1.data.objects,
          ...obj2.data.objects,
          ...obj3.data.objects
          ])
       }));
}


