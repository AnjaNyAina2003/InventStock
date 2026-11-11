import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isTokenExpired } from '../utils/jwt'
import api from '../api/axiosInstance'
import LoadingScreen from '../pages/Loading/LoadingScreen'

export default function ProtectedRoute() {
  const { user, logout } = useAuth();
  const [checking, setChecking] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const verify = async () => {
      if (sessionStorage.getItem("logout_reason") === "expired") {
        sessionStorage.removeItem("logout_reason");
        setRedirectTo("/session-expired");
        setChecking(false);
        return;
      }

      const access = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");

      if (!user || !access) {
        setRedirectTo("/unauthorized");
        setChecking(false);
        return;
      }

      if (!isTokenExpired(access)) {
        setRedirectTo(null);
        setChecking(false);
        return;
      }

      if (refresh && !isTokenExpired(refresh)) {
        try {
          const res = await api.post("/refresh", { refresh });
          localStorage.setItem("access_token", res.data.access);
          if (res.data.refresh) {
            localStorage.setItem("refresh_token", res.data.refresh);
          }
          setRedirectTo(null);
        } catch {
          await logout("expired");
          setRedirectTo("/session-expired");
        }
      } else {
        await logout("expired");
        setRedirectTo("/session-expired");
      }
      setChecking(false);
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (checking) {
    return <LoadingScreen message="Vérification de la session..." />;
  }

  if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
  
}