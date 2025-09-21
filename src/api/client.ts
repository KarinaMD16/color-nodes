import axios from "axios";

//kary: 26.233.244.31
//elein: 26.48.186.190
//lando: 26.166.216.244

const colorNodesAPI = axios.create({
  baseURL: "http://26.233.244.31:5197/api",// ajusta al puerto de tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default colorNodesAPI;
