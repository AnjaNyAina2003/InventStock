import React, { useEffect, useState } from 'react'
import { faHistory } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Stack, Typography } from '@mui/material'
import TableAffiche from '../../Menu/Tables/TableAffiche'
import apiClient from '../../../../../api/apiClient'

export default function Entree() {
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/produit/historiqueMvt")
      .then((res) => {
        const entrees = res.data
          .filter((m) => m.mouvement_type === "ENTREE")
          .map((m) => ({
            id: m.id,
            nom_produit: m.produit?.nom_produit,
            quantite: m.quantite,
            effectue_par: m.effectue_par,
            date_create: new Date(m.date_create).toLocaleString("fr-FR"),
          }));
        setMouvements(entrees);
      })
      .catch(() => setMouvements([]))
      .finally(() => setLoading(false));
  }, []);
    
  return (
    <Stack gap={'1rem'}>
      <div className='titleForm'>
        <FontAwesomeIcon className='icon title-icon' icon={faHistory}/>
        <Typography variant='h5' fontWeight={600} >Historique des produits Entrée</Typography>
      </div>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <TableAffiche
          items={mouvements}
          columns={
            [
              { key: "nom_produit", label: "Produit" },
              { key: "quantite", label: "Quantité" },
              { key: "effectue_par", label: "Effectué par" },
              { key: "date_create", label: "Date" },
            ]
          }
        />
      )}
    </Stack>
  )
}
