import axios from "axios";

const colorNodesAPI = axios.create({
  baseURL: "http://26.166.216.244:5197/api",// ajusta al puerto de tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default colorNodesAPI;
