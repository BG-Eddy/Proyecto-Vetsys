import axios from "axios";

// Creamos una instancia única de Axios
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  auth: {
    username: "admin",
    password: "admin123"
  },
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;