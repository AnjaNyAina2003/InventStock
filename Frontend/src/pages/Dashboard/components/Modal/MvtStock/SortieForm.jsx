import React, { useState } from 'react'
import { faBoxesAlt, faCheck, faSignOutAlt, faUser, faUserFriends } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Stack, Typography } from '@mui/material'
import toast from 'react-hot-toast'
import apiClient from '../../../../../api/apiClient'
import { useSubmitState } from '../../../../../hooks/useSubmitState'
import { useAuth } from '../../../../../hooks/useAuth'

export default function SortieForm({ item, onSuccess }) {
  const { user } = useAuth();
  const { submitting, run } = useSubmitState();
  const [quantite, setQuantite] = useState("");
  const [beneficiaire, setBeneficiaire] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item) return;

    if (!quantite || Number(quantite) <= 0) {
      toast.error("Merci d'indiquer une quantité valide");
      return;
    }
    if (Number(quantite) > item.quantite) {
      toast.error("Stock insuffisant pour cette sortie");
      return;
    }

    run(async () => {
      const res = await apiClient.post(`/produit/sortieStock/${item.id}`, {
        quantite: Number(quantite),
        effectue_par: user?.username || "",
        beneficiaire: beneficiaire || "aucun",
      });
      setQuantite("");
      setBeneficiaire("");
      onSuccess?.(res.data);
    }, { successMessage: "Sortie de stock enregistrée" });
  };

  return (
    <Stack gap={'1rem'} component="form" onSubmit={handleSubmit}>
      <div className='titleForm'>
        <FontAwesomeIcon className='icon title-icon' icon={faSignOutAlt}/>
        <Typography variant='h5' fontWeight={600}>Sortie de stock — {item?.nom_produit}</Typography>
      </div>

      <p className='subtext'>Stock actuel : <strong>{item?.quantite}</strong></p>

      <div className={`max-inpWidth floating-div ${quantite ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faBoxesAlt}/>
        <input
          type='number'
          min="1"
          max={item?.quantite}
          className='float-label max-inpWidth'
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
        />
        <label>Quantité sortie</label>
      </div>

      <div className={`max-inpWidth floating-div ${beneficiaire ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faUserFriends}/>
        <input
          type='text'
          className='float-label max-inpWidth'
          value={beneficiaire}
          onChange={(e) => setBeneficiaire(e.target.value)}
        />
        <label>Bénéficiaire</label>
      </div>

      <div className='max-inpWidth floating-div filled'>
        <FontAwesomeIcon className='icon input-icon' icon={faUser}/>
        <input type='text' className='float-label max-inpWidth' value={user?.username || ""} disabled />
        <label>Effectué par</label>
      </div>

      <button type='submit' className='button valid valid_modal' disabled={submitting}>
        {submitting ? "Enregistrement..." : "Confirmer la sortie"} <FontAwesomeIcon className='icon' icon={faCheck}/>
      </button>
    </Stack>
  )
}
