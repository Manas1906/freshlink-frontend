"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    const savedEmail = localStorage.getItem("email");
    const savedName = localStorage.getItem("fullName");

    if (savedToken) {
      setToken(savedToken);
      if (savedRole) setRole(savedRole);
      if (savedEmail) setEmail(savedEmail);
      if (savedName) setFullName(savedName);
    }
    setLoading(false);
  }, []);

  const login = async (loginEmail, loginPass) => {
    setLoading(true);
    try {
      const jwtToken = await api.post("/backend/auth/login", {
        email: loginEmail,
        password: loginPass,
      });

      // Decode role and email from JWT payload
      const payload = JSON.parse(atob(jwtToken.split(".")[1]));
      const userRole = payload.role;
      const userEmail = payload.email || loginEmail;
      
      // Attempt to retrieve full name from user service
      let userFullName = "User";
      try {
        localStorage.setItem("token", jwtToken); // temporarily store to let api fetch work
        const profile = await api.get("/backend/user/me");
        if (profile && profile.fullName) {
          userFullName = profile.fullName;
        }
      } catch (err) {
        console.warn("Could not retrieve user details from user-service", err);
      }

      setToken(jwtToken);
      setRole(userRole);
      setEmail(userEmail);
      setFullName(userFullName);

      localStorage.setItem("token", jwtToken);
      localStorage.setItem("role", userRole);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("fullName", userFullName);

      return { role: userRole, fullName: userFullName };
    } catch (err) {
      localStorage.removeItem("token");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, regEmail, regPass, regRole) => {
    setLoading(true);
    try {
      const jwtToken = await api.post("/backend/auth/register", {
        fullName: name,
        email: regEmail,
        password: regPass,
        role: regRole,
      });

      setToken(jwtToken);
      setRole(regRole);
      setEmail(regEmail);
      setFullName(name);

      localStorage.setItem("token", jwtToken);
      localStorage.setItem("role", regRole);
      localStorage.setItem("email", regEmail);
      localStorage.setItem("fullName", name);

      return { role: regRole, fullName: name };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    setRole("");
    setEmail("");
    setFullName("");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("fullName");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        email,
        fullName,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
