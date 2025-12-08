import React, { createContext, useState, useContext } from "react";

// Usamos la variable de entorno
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // CORRECCIÓN 1: Inicialización perezosa (Lazy Init)
  // Lee el localStorage UNA sola vez al cargar, evitando el useEffect innecesario.
  const [user, setUser] = useState(() => localStorage.getItem("user"));
  const [authHeader, setAuthHeader] = useState(() => localStorage.getItem("authHeader"));

  // (El useEffect de inicialización ya no es necesario, lo borramos)

  const login = async (username, password) => {
    const token = btoa(`${username}:${password}`);
    const header = `Basic ${token}`;

    try {
      // Petición al backend
      const response = await fetch(`${API_URL}/login`, { 
        method: "GET",
        headers: {
          "Authorization": header
        }
      });

      if (response.ok) {
        setUser(username);
        setAuthHeader(header);
        localStorage.setItem("authHeader", header);
        localStorage.setItem("user", username);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAuthHeader(null);
    localStorage.removeItem("authHeader");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, authHeader, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};