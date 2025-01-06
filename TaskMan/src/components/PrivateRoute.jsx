import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../store";

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
