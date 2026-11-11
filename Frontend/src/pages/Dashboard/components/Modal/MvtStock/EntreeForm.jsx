import React, { useState } from 'react'
import { faBoxesAlt, faCheck, faSignInAlt, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Stack, Typography } from '@mui/material'
import toast from 'react-hot-toast'
import apiClient from '../../../../../api/apiClient'
import { useSubmitState } from '../../../../../hooks/useSubmitState'
import { useAuth } from '../../../../../hooks/useAuth'

export default function EntreeForm({ item, onSuccess }) {
  const { user } = useAuth();
  const { submitting, run } = useSubmitState();
  const [quantite, setQuantite] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item) return;

    if (!quantite || Number(quantite) <= 0) {
      toast.error("Merci d'indiquer une quantité valide");
      return;
    }

    run(async () => {
      const res = await apiClient.post(`/produit/entreeStock/${item.id}`, {
        quantite: Number(quantite),
        effectue_par: user?.username || "",
      });
      setQuantite("");
      onSuccess?.(res.data);
    }, { successMessage: "Entrée de stock enregistrée" });
  };

  return (
    <Stack gap={'1rem'} component="form" onSubmit={handleSubmit}>
      <div className='titleForm'>
        <FontAwesomeIcon className='icon title-icon' icon={faSignInAlt}/>
        <Typography variant='h5' fontWeight={600}>Entrée de stock — {item?.nom_produit}</Typography>
      </div>

      <p className='subtext'>Stock actuel : <strong>{item?.quantite}</strong></p>

      <div className={`max-inpWidth floating-div ${quantite ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faBoxesAlt}/>
        <input
          type='number'
          min="1"
          className='float-label max-inpWidth'
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
        />
        <label>Quantité reçue</label>
      </div>

      <div className='max-inpWidth floating-div filled'>
        <FontAwesomeIcon className='icon input-icon' icon={faUser}/>
        <input type='text' className='float-label max-inpWidth' value={user?.username || ""} disabled />
        <label>Effectué par</label>
      </div>

      <button type='submit' className='button valid valid_modal' disabled={submitting}>
        {submitting ? "Enregistrement..." : "Confirmer l'entrée"} <FontAwesomeIcon className='icon' icon={faCheck}/>
      </button>
    </Stack>
  )
}
