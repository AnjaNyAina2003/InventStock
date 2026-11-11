import React, { useState } from 'react'
import { faCheck,  } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Stack, Typography } from '@mui/material'
import { useSubmitState } from '../../../../../hooks/useSubmitState'
import toast from 'react-hot-toast'
import apiClient from '../../../../../api/apiClient'
import FournisseurFormFields from './FournisseurFormFields'

export default function AddFns({ onSuccess }) {
  const { submitting, run } = useSubmitState();

  const [float, setFloat] = useState({
    type: "", nom_fns: "", adresse: "", mail: "",
  });

  const floatLabel = (e) => {
    const {name, value} = e.target;
    setFloat((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!float.type || !float.nom_fns || !float.adresse || !float.mail) {
      toast.error("Merci de remplir tous les champs");
      return;
    }

    run(async () => {
      const res = await apiClient.post("/fournisseur/addFns", {
        nom_fournisseur: float.nom_fns,
        type: float.type,
        adresse: float.adresse,
        mail: float.mail,
      });
      onSuccess?.(res.data);
      setFloat({ type: "", nom_fns: "", adresse: "", mail: "" });
    }, { successMessage: "Fournisseur ajouté" });
  };

  return (
    <Stack gap={'1rem'} component="form" onSubmit={handleSubmit}>
      <Typography variant='h5' fontWeight={600} className='titleForm'>Ajouter un nouveau fournisseur</Typography>
      <FournisseurFormFields float={float} floatLabel={floatLabel} />
      <button className='button valid valid_modal' disabled={submitting}>
        {submitting ? "Ajout..." : "Valider"} <FontAwesomeIcon className='icon' icon={faCheck}/>
      </button>
    </Stack>
  )
}
