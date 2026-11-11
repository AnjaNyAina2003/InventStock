import React, { useEffect, useState } from 'react'
import { faBoxesStacked, faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Stack, Typography } from '@mui/material'
import toast from 'react-hot-toast'
import apiClient from '../../../../../api/apiClient'
import { useSubmitState } from '../../../../../hooks/useSubmitState'

export default function ReapproForm({ item, onSuccess }) {
  const { submitting, run } = useSubmitState();
  const [seuil, setSeuil] = useState("");

  useEffect(() => {
    if (!item) return;
    setSeuil(item.niveau_reapprovisionnement ?? "");
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item) return;

    if (seuil === "" || Number(seuil) < 0) {
      toast.error("Merci d'indiquer un seuil valide");
      return;
    }

    run(async () => {
      const res = await apiClient.patch(`/produit/nivReappro/${item.id}`, {
        niveau_reapprovisionnement: Number(seuil),
      });
      onSuccess?.(res.data);
    }, { successMessage: "Seuil de réapprovisionnement mis à jour" });
  };

  return (
    <Stack gap={'1rem'} component="form" onSubmit={handleSubmit}>
      <div className='titleForm column'>
        <div className='titleReappro'>
          <FontAwesomeIcon className='icon title-icon' icon={faBoxesStacked}/>
          <Typography variant='h5' fontWeight={600}>Réapprovisionnement</Typography>
        </div>
        <Typography variant='h6' fontWeight={600} className='prodReappro'>— {item?.nom_produit} —</Typography>
      </div>

      <p className='subtext'>Stock actuel : <strong>{item?.quantite}</strong></p>

      <div className={`max-inpWidth floating-div ${seuil !== "" ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faBoxesStacked}/>
        <input
          type='number'
          min="0"
          className='float-label max-inpWidth'
          value={seuil}
          onChange={(e) => setSeuil(e.target.value)}
        />
        <label>Seuil de réapprovisionnement</label>
      </div>

      <button type='submit' className='button valid valid_modal' disabled={submitting}>
        {submitting ? "Enregistrement..." : "Valider"} <FontAwesomeIcon className='icon' icon={faCheck}/>
      </button>
    </Stack>
  )
}
