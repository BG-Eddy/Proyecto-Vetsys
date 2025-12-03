import axios from "axios";

// Creamos una instancia única de Axios
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  auth: {
    username: "admin", // Credenciales (En el futuro esto se manejará con tokens, pero para V1 está bien)
    password: "SuperClaveSegura2025" 
  },
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;