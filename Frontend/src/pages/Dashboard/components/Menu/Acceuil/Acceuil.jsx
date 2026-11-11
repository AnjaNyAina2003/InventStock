import React, { useEffect, useState } from 'react'
import './Acceuil.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardCheck, faSackDollar, faTags, faTruck } from '@fortawesome/free-solid-svg-icons'
import { Typography } from '@mui/material'
import toast from 'react-hot-toast'
import ChartEntreesSorties from '../../mini-funct/ChartEntreesSorties'
import apiClient from '../../../../../api/apiClient'
import LoadingScreen from '../../../../Loading/LoadingScreen'
import { useDevise } from '../../../../../hooks/useDevise'

export default function Acceuil() {
  const { formatDevise } = useDevise();
  const [produits, setProduits] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [totalFournisseurs, setTotalFournisseurs] = useState(0);
  const [totalCommandes, setTotalCommandes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [prodRes, mvtRes, fnsRes, comRes] = await Promise.all([
          apiClient.get("/produit/listProd"),
          apiClient.get("/produit/historiqueMvt"),
          apiClient.get("/fournisseur/addFns"),
          apiClient.get("/commande/addCom"),
        ]);

        setProduits(prodRes.data);
        setMouvements(mvtRes.data.slice(0, 4));
        setTotalFournisseurs(fnsRes.data.length);
        setTotalCommandes(comRes.data.length);
      } catch {
        toast.error("Impossible de charger le tableau de bord");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const valeurTotale = produits.reduce(
    (total, p) => total + (Number(p.quantite) || 0) * (Number(p.prix_unitaire) || 0),
    0
  );

  if (loading) {
   return <LoadingScreen message="Chargement..." />;
  }

  return (
    <div className='acceuil-content'>
      <div className='card-content'>
        <div className='card first-card'>
          <div className='info-card'>
            <div className='produit'>
              <Typography variant='h8' fontWeight={500} className='title-card'>Valeur total Produits</Typography>
              <div className='cont-icône-prod first-card'>
                <FontAwesomeIcon icon={faSackDollar} className='icône-prod'/>
              </div>
            </div>
            <Typography variant='p' className='valeur first-cardColor'>
              {formatDevise(valeurTotale)} 
            </Typography>
          </div>
        </div>
        <div className='card second-card'>
          <div className='info-card'>
            <div className='produit'>
              <Typography variant='h8' fontWeight={500} className='title-card'>Types de Produits</Typography>
              <div className='cont-icône-prod second-card'>
                <FontAwesomeIcon icon={faTags} className='icône-prod'/>
              </div>
            </div>
            <Typography variant='p' className='valeur second-cardColor'>{produits.length}</Typography>
          </div>
        </div>
        <div className='card third-card'>
          <div className='info-card'>
            <div className='produit'>
              <Typography variant='h8' fontWeight={500} className='title-card'>Total Fournisseurs</Typography>
              <div className='cont-icône-prod third-card'>
                <FontAwesomeIcon icon={faTruck} className='icône-prod'/>
              </div>
            </div>
            <Typography variant='p' className='valeur third-cardColor'>{totalFournisseurs}</Typography>
          </div>
        </div>
        <div className='card last-card'>
          <div className='info-card'>
            <div className='produit'>
              <Typography variant='h8' fontWeight={500} className='title-card'>Total Commmandes</Typography>
              <div className='cont-icône-prod last-card'>
                <FontAwesomeIcon icon={faClipboardCheck} className='icône-prod'/>
              </div>
            </div>
            <Typography variant='p' className='valeur last-cardColor'>{totalCommandes}</Typography>
          </div>
        </div>
      </div>
      <div className='other-prodInfo'>
        <div className='graph-prod'>
          <ChartEntreesSorties/>
        </div>
        <div className='tab-info'>
          <div className="panel-title">Derniers mouvements</div>
            <div className="table-rows">
              {mouvements.length === 0 && (
                <p style={{ opacity: 0.5, padding: "0.5rem" }}>Aucun mouvement récent</p>
              )}
              {mouvements.map((mvt) => (
                <div className="table-row" key={mvt.id}>
                  <span className="name">{mvt.produit?.nom_produit}</span>
                  <span className="qty">
                    {mvt.mouvement_type === "ENTREE" ? "+" : "-"}{mvt.quantite} unités
                  </span>
                  <span className={`badge ${mvt.mouvement_type === "ENTREE" ? "in" : "out"}`}>
                    {mvt.mouvement_type === "ENTREE" ? "Entrée" : "Sortie"}
                  </span>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  )
}