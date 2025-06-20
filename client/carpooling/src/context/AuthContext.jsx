import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (credentials) => {
    try {
      
      const { data } = await api.post("/auth/login", credentials);
      console.log(data,"login data")
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("id", data.id);
      setToken(data.token);

      const decoded = jwtDecode(data.token);
      setUser(decoded);

      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      return decoded; 
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      navigate("/");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const isAuthenticated = !!token;
  const isDriver = user?.role === "driver";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isDriver,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
