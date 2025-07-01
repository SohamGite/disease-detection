import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios
        .get("http://127.0.0.1:8000/chats", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setUser({ username: "user" }); // Replace with actual user fetch if available
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/login",
        new URLSearchParams({ username, password })
      );
      const { access_token } = response.data;
      setToken(access_token);
      setUser({ username });
      localStorage.setItem("token", access_token);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  };

  const signup = async (username, email, password) => {
    try {
      await axios.post("http://127.0.0.1:8000/signup", {
        username,
        email,
        password,
      });
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Signup failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
