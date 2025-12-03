import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authHeader, setAuthHeader] = useState(null); // Aquí guardamos "Basic dXNlcjpwYXNz"

  // Al cargar la app, revisamos si ya había iniciado sesión antes
  useEffect(() => {
    const savedAuth = localStorage.getItem("authHeader");
    const savedUser = localStorage.getItem("user");
    if (savedAuth && savedUser) {
      setAuthHeader(savedAuth);
      setUser(savedUser);
    }
  }, []);

  const login = async (username, password) => {
    // 1. Creamos la credencial encriptada en Base64
    const token = btoa(`${username}:${password}`);
    const header = `Basic ${token}`;

    try {
      // 2. Probamos contra el backend para ver si es real
      const response = await fetch("http://localhost:8080/api/login", {
        method: "GET",
        headers: {
          "Authorization": header
        }
      });

      if (response.ok) {
        // 3. Si es correcto, guardamos en el estado y en localStorage
        setUser(username);
        setAuthHeader(header);
        localStorage.setItem("authHeader", header);
        localStorage.setItem("user", username);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error de conexión", error);
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