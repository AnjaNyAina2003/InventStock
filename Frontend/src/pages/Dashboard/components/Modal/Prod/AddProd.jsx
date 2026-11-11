import React, { useState } from 'react'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Stack, Typography } from '@mui/material'
import { useSubmitState } from '../../../../../hooks/useSubmitState'
import { useProduitOptions } from '../../../../../hooks/useProduitOptions'
import apiClient from '../../../../../api/apiClient'
import toast from 'react-hot-toast'
import ProduitFormFields from './ProduitFormFields'

export default function AddProd({onSuccess}) {
  const options = useProduitOptions();
  const { submitting, run } = useSubmitState();
  const [fournisseurQuery, setfournisseurQuery] = useState("");
  const [fournisseurFocused, setFournisseurFocused] = useState(false);

  const [float, setFloat] = useState({
    categorie: "", nom_prod: "", qtt: "", prix: "", typunite: "", unite: "", fns: "",
  });

  const floatLabel = (e) => {
    const {name, value} = e.target;

    setFloat((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "typunite") {
      setFloat((prev) => ({ ...prev, unite: "" }));
      options.loadUnitesForType(value);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!float.categorie || !float.nom_prod || !float.qtt || !float.unite || !float.fns) {
      toast.error("Merci de remplir tous les champs");
      return;
    }

    run(async () => {
      const res = await apiClient.post("/produit/addProd", {
        categorie: float.categorie,
        nom_produit: float.nom_prod,
        quantite: Number(float.qtt),
        prix_unitaire: float.prix ? Number(float.prix) : 0,
        prod_unite: float.unite,
        fournisseur: float.fns,
      });
      onSuccess?.(res.data);
      setFloat({ categorie: "", nom_prod: "", qtt: "", prix: "", typunite: "", unite: "", fns: "" });
      setfournisseurQuery("");
    }, { successMessage: "Produit ajouté" });
  };

  return (
    <Stack gap={'1rem'} component="form" onSubmit={handleSubmit}>
      <Typography variant='h5' fontWeight={600} className='titleForm'>Ajouter un nouveau produit</Typography>
        <ProduitFormFields float={float} floatLabel={floatLabel} options={options} fournisseurQuery={fournisseurQuery} onFournisseurQueryChange={setfournisseurQuery} fournisseurFocused={fournisseurFocused} onFournisseurFocusChange={setFournisseurFocused} />
        <button type='submit' className='button valid valid_modal' disabled={submitting}>
          {submitting ? "En cours..." : "Valider"} <FontAwesomeIcon className='icon' icon={faCheck}/>
        </button>
    </Stack>
  )
}
