import axios from "axios";
// http://26.48.186.190:7081
const colorNodesAPI = axios.create({
  baseURL: "26.166.216.244:5197/api",// ajusta al puerto de tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default colorNodesAPI;
