import { createContext, useContext } from "react";

// Create Context
export const AuthContext = createContext();

// Custom hook for accessing auth context
export function useAuth(){
  return useContext(AuthContext);
}
