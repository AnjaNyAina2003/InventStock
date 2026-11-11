import { useContext } from "react";
import { DeviseContext } from "../context/DeviseContext";

export function useDevise() {
  const context = useContext(DeviseContext);
  if (!context) throw new Error("useDevise doit être utilisé dans un DeviseProvider");
  return context;
}
