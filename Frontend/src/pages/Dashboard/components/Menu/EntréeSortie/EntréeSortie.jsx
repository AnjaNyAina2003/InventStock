import React, { useCallback, useEffect, useState } from 'react'
import { MenuItem, TextField, Typography } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileExport, faFilter, faRedo, faSignInAlt, faSignOutAlt, faXmark, faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import Entree from '../../Modal/MvtStock/Entree'
import Sortie from '../../Modal/MvtStock/Sortie'
import TableMvtStock from '../Tables/TableMvtStock'
import apiClient from '../../../../../api/apiClient'
import toast from 'react-hot-toast'
import EntreeForm from '../../Modal/MvtStock/EntreeForm'
import SortieForm from '../../Modal/MvtStock/SortieForm'
import { formatDate } from '../../../../../utils/formatDate'
import { exportToExcel } from '../../../../../utils/exportExcel'
import TableSquel from '../Tables/TableSquel'

const TYPE_OPTIONS = [
  { value: 'MASSE', label: 'Masse' },
  { value: 'QUANTITE', label: 'Quantite' },
  { value: 'VOLUME', label: 'Volume' },
  { value: 'LONGUEUR', label: 'Longueur' },
]

export default function EntréeSortie() {
  const [toggleState, setToggleState] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")

  const toggleTab = (index) => {
    setToggleState(index);
  }

  const fetchProduits = useCallback(async () => {
    try {
      const res = await apiClient.get("/produit/listProd");
      setProduits(res.data);
    } catch {
      toast.error("Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProduits();
  }, [fetchProduits]);

  const handleMvtSuccess = (produitMaj) => {
    setProduits((prev) => prev.map((p) => (p.id === produitMaj.id ? { ...p, quantite: produitMaj.quantite } : p)));
    setSelectedItem(null);
    toggleTab(0);
  };

  const filteredProduits = produits.filter((p) =>
    p.nom_produit?.toLowerCase().includes(appliedSearch.toLowerCase()) &&
    (typeFilter === "" || p.unite_type === typeFilter)
  );

  const displayProduits = filteredProduits.map((p) => ({
    ...p,
    date_create_formate: formatDate(p.date_create, true),
  }));

  const handleExport = () => {
    const rows = displayProduits.map((p) => ({
      "Produit": p.nom_produit,
      "Quantite en stock": p.quantite,
      "Niveau réapprovisionnement": p.niveau_reapprovisionnement,
      "Unité": p.unite_nom,
      "Date de création": p.date_create_formate,
    }));
    exportToExcel(rows, "stock_produits");
  };

  return (
    <div className='content'>
      <div className='action-content'>
        <Typography variant='h5' fontWeight={600} className='title'><FontAwesomeIcon icon={faExchangeAlt}/> Entrées / Sorties</Typography>
        <div className='button-content'>
          <button className='button entree' onClick={() => toggleTab(1)}><FontAwesomeIcon className='icon' icon={faSignInAlt}/> Historique des Entrées</button>
          <button className='button sortie' onClick={() => toggleTab(2)}><FontAwesomeIcon className='icon' icon={faSignOutAlt}/> Historique des Sorties</button>
        </div>
        <div className='filter-content'>
          <div className='filterInput'>
            <TextField 
              label='Rechercher un produit' 
              type='search' 
              variant='outlined' 
              size='small' 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{width: "15rem"}}
            />
            <TextField select label='types' value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} helperText="Choisir le type" size='small' sx={{
              width: "12rem"
            }}>
              <MenuItem value="">Tous les categories</MenuItem>
              {TYPE_OPTIONS.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
          </div>
          <div className='filterBut-content'>
            <button className='button filter' onClick={() => setAppliedSearch(search)}><FontAwesomeIcon className='icon' icon={faFilter}/> Filtrer</button>
            <button className='button reinit' onClick={() => {setSearch(""); setAppliedSearch(""); setTypeFilter(""); fetchProduits();}}><FontAwesomeIcon className='icon' icon={faRedo}/> Réinitialiser</button>
            <button className='button export' onClick={handleExport}><FontAwesomeIcon className='icon' icon={faFileExport}/> Exporter</button>
          </div>
        </div>
      </div>
      <div className='cont-table'>
        {loading ? (
          <TableSquel columns={5} />
        ) : (
          <TableMvtStock
            items={displayProduits}
            columns={
              [
                {key:"nom_produit", label:"Produit"},
                {key:"quantite", label:"Quantite en stock"},
                {key:"niveau_reapprovisionnement", label:"Niv° réapprovision"},
                {key:"unite_nom", label:"Unité"},
                {key:"date_create_formate", label:"Date de création"}
              ]
            }
            onIn={(item) =>{ setSelectedItem(item); toggleTab(3); }}
            onOut={(item) =>{ setSelectedItem(item); toggleTab(4); }}
          />
        )}
      </div>
      <div className={toggleState === 1 ? "info-modal active-modal" : "info-modal"}>
        <div className='histo-modal-content'>
          <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
          <Entree />
        </div>
      </div>
      <div className={toggleState === 2 ? "info-modal active-modal" : "info-modal"}>
        <div className='histo-modal-content'>
          <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
          <Sortie />
        </div>
      </div>
      <div className={toggleState === 3 ? "info-modal active-modal" : "info-modal"}>
        <div className='info-modal-content'>
          <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
          <EntreeForm item={selectedItem} onSuccess={handleMvtSuccess} />
        </div>
      </div>
      <div className={toggleState === 4 ? "info-modal active-modal" : "info-modal"}>
        <div className='info-modal-content'>
          <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
          <SortieForm item={selectedItem} onSuccess={handleMvtSuccess} />
        </div>
      </div>
    </div>
  )
}
