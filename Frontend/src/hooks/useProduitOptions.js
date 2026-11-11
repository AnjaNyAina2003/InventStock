import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

const TYPEUNITE_OPTIONS = [
  { value: 'MASSE', label: 'Masse' },
  { value: 'QUANTITE', label: 'Quantite' },
  { value: 'VOLUME', label: 'Volume' },
  { value: 'LONGUEUR', label: 'Longueur' },
];

export function useProduitOptions() {
  const [categories, setCategories] = useState([]);
  const [unites, setUnites] = useState([]);

  useEffect(() => {
    apiClient.get("/produit/listCat").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const loadUnitesForType = (type) => {
    apiClient.get(`/produit/typeUnite/${type}`)
      .then((res) => setUnites(res.data))
      .catch(() => setUnites([]));
  };

  const searchFournisseurs = async (query) => {
    const res = await apiClient.get(`/fournisseur/addFns?search=${encodeURIComponent(query)}`);
    return res.data.map((f) => ({ value: f.id, label: f.nom_fournisseur, raw: f }));
  };

  return {
    categorieOptions: categories.map((c) => ({ value: c.id, label: c.titre })),
    uniteOptions: unites.map((u) => ({ value: u.id, label: u.unite })),
    typeUniteOptions: TYPEUNITE_OPTIONS,
    loadUnitesForType,
    searchFournisseurs,
  };
}
