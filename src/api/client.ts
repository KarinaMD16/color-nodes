import axios from "axios";

const colorNodesAPI = axios.create({
  baseURL: "http://26.48.186.190:5197/api",// ajusta al puerto de tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default colorNodesAPI;
