import axios from "axios";

const colorNodesAPI = axios.create({
  baseURL: "https://localhost:7081/api", // ajusta al puerto de tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default colorNodesAPI;
