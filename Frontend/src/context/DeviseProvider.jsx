import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { useAuth } from "../hooks/useAuth";
import { DeviseContext } from "./DeviseContext";

const SYMBOLS = { MGA: "Ar", EUR: "€", USD: "$", GBP: "£" };

export function DeviseProvider({ children }) {
  const { user } = useAuth();
  const [devise, setDevise] = useState("MGA");

  useEffect(() => {
    if (!user) return;
    apiClient.get("/produit/devise")
      .then((res) => setDevise(res.data.devise))
      .catch(() => {});
  }, [user]);

  const symbol = SYMBOLS[devise] || "Ar";

  const formatDevise = (amount) => {
    const num = Number(amount) || 0;
    return `${num.toLocaleString("fr-FR")} ${symbol}`;
  };

  return (
    <DeviseContext.Provider value={{ devise, symbol, formatDevise, setDevise }}>
      {children}
    </DeviseContext.Provider>
  );
}
