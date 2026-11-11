import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function AdminRoute() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Accès réservé aux administrateurs");
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/acceuil" replace />;
  }

  return <Outlet />;
}