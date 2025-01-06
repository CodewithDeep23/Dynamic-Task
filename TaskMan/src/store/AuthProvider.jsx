import { AuthContext } from "./AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const navigate = useNavigate();

    // Save token in localStorage for persistence
    // const saveToken = (newToken) => {
    //   setToken(newToken);
    //   if (newToken) {
    //     localStorage.setItem("token", newToken);
    //   } else {
    //     localStorage.removeItem("token");
    //     navigate("/login")
    //   }
    // };

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    navigate("/"); // Redirect to home page after login
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login"); // Redirect to login after logout
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
