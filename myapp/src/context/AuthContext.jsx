import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true); // add loading state

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUserToken(token);
    setLoading(false); // add this
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setUserToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout , loading }}>
      {children}
    </AuthContext.Provider>
  );
}