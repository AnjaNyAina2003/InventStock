import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { AuthContext } from "./AuthContext";
import { isTokenExpired } from '../utils/jwt'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      setError(
        err.response?.data?.detail || "Email ou mot de passe incorrect"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ username, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/signin", { username, email, password });
      return res.data;
    } catch (err) {
      setError(
        err.response?.data ? JSON.stringify(err.response.data) : "Erreur lors de l'inscription"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (partialUser) => {
    setUser((prev) => {
      const merged = {...prev, ...partialUser};
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    })
  }

  const logout = async (reason = null) => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      if (refresh) await api.post("/logout", { refresh });
    } catch {
      //
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);

      if (reason === "expired") {
        sessionStorage.setItem("logout_reason", "expired");
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      const access = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");
      if (!access) return;

      if (!isTokenExpired(access)) return; 

      if (refresh && !isTokenExpired(refresh)) {
        try {
          const res = await api.post("/refresh", { refresh });
          localStorage.setItem("access_token", res.data.access);
          if (res.data.refresh) {
            localStorage.setItem("refresh_token", res.data.refresh)
          }
        } catch {
          await logout("expired");
        }
      } else {
        await logout("expired");
      }
    };

    const interval = setInterval(checkSession, 30000); // toutes les 30s
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
}