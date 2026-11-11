import React, {useCallback, useEffect, useRef, useState} from 'react'
import { MenuItem, TextField, Typography } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTruck, faFileExport, faFilter, faRedo, faPlusCircle, faXmark, faFileImport } from '@fortawesome/free-solid-svg-icons'
import AddFns from '../../Modal/Fournisseur/AddFns'
import Table from '../Tables/Table'
import DelConfirm from '../../Modal/Confirm/DelConfirm'
import UpdtFns from '../../Modal/Fournisseur/UpdtFns'
import { useSubmitState } from '../../../../../hooks/useSubmitState'
import apiClient from '../../../../../api/apiClient'
import toast from 'react-hot-toast'
import { exportToExcel } from '../../../../../utils/exportExcel'
import { TYPE_FOURNISSEUR_OPTIONS } from '../../../../../hooks/useFournisseurOptions'
import { importExcel } from '../../../../../utils/importExcel'
import TableSquel from '../Tables/TableSquel'

export default function Fournisseurs() {
  const [toggleState, setToggleState] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  const [fournisseurs, setFournisseurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)
  const { submitting: deleting, run } = useSubmitState()

  const toggleTab = (index) => {
    setToggleState(index);
  }

  const fetchFournisseurs = useCallback(async () => {
    try {
      const res = await apiClient.get("/fournisseur/addFns");
      setFournisseurs(res.data);
    } catch {
      toast.error("Impossible de charger les fournisseurs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFournisseurs();
  }, [fetchFournisseurs]);

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    run(async () => {
      await apiClient.delete(`/fournisseur/actFns/${selectedItem.id}`);
      setFournisseurs((prev) => prev.filter((f) => f.id !== selectedItem.id));
      setSelectedItem(null);
      toggleTab(0);
    }, { successMessage: "Fournisseur supprimé" });
  };

  const handleAddSuccess = (nouveauFournisseur) => {
    setFournisseurs((prev) => [nouveauFournisseur, ...prev]);
    toggleTab(0);
  };

  const handleUpdateSuccess = (fournisseurModifie) => {
    setFournisseurs((prev) => prev.map((f) => (f.id === fournisseurModifie.id ? fournisseurModifie : f)));
    setSelectedItem(null);
    toggleTab(0);
  };

  const filteredFournisseurs = fournisseurs.filter((f) =>
    f.nom_fournisseur?.toLowerCase().includes(appliedSearch.toLowerCase()) &&
    (typeFilter === "" || f.type === typeFilter)
  );

   const handleImportFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const rows = importExcel(text);

      if (rows.length === 0) {
        toast.error("Le fichier est vide ou illisible");
        return;
      }

      const validTypes = TYPE_FOURNISSEUR_OPTIONS.map((t) => t.value);
      let success = 0;
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;

        if (!row["Nom du fournisseur"]?.trim()) {
          errors.push(`Ligne ${rowNum} : nom du fournisseur manquant`);
          continue;
        }
        const type = row["Type"]?.trim().toLowerCase();
        if (!validTypes.includes(type)) {
          errors.push(`Ligne ${rowNum} : type "${row["Type"]}" invalide`);
          continue;
        }

        try {
          const res = await apiClient.post("/fournisseur/addFns", {
            nom_fournisseur: row["Nom du fournisseur"].trim(),
            type,
            adresse: row["Adresse"]?.trim() || "",
            mail: row["Mail"]?.trim() || "",
          });
          setFournisseurs((prev) => [res.data, ...prev]);
          success++;
        } catch {
          errors.push(`Ligne ${rowNum} : échec de la création côté serveur`);
        }
      }

      if (success > 0) toast.success(`${success} fournisseur(s) importé(s)`);
      if (errors.length > 0) {
        toast.error(`${errors.length} ligne(s) ignorée(s) — voir la console pour le détail`);
        console.warn("Erreurs d'import :", errors);
      }
    } catch {
      toast.error("Impossible de lire le fichier");
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    const rows = filteredFournisseurs.map((f) => ({
      "Nom du fournisseur": f.nom_fournisseur,
      "Type": f.type,
      "Adresse": f.adresse,
      "Mail": f.mail,
    }));
    exportToExcel(rows, "fournisseurs");
  };

  return (
    <div className='content'>
      <div className='action-content'>
        <Typography variant='h5' fontWeight={600} className='title'><FontAwesomeIcon icon={faTruck}/> Fournisseurs</Typography>
        <div className='button-content'>
          <button className='button add' onClick={() => toggleTab(1)}><FontAwesomeIcon className='icon' icon={faPlusCircle}/> Ajouter un fournisseur</button>
        </div>
        <div className='filter-content'>
          <div className='filterInput'>
            <TextField 
              label='Rechercher un fournisseur' 
              type='search' 
              variant='outlined' 
              size='small' 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: "15rem"}}/>
            <TextField select label='Fournisseurs' value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} helperText="Filtrer par type" size='small' sx={{
              width: "12rem"
            }}>
              <MenuItem value="">Type de fournisseur</MenuItem>
              {TYPE_FOURNISSEUR_OPTIONS.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
          </div>
          <div className='filterButFour-content'>
            <button className='button filter' onClick={() => setAppliedSearch(search)}><FontAwesomeIcon className='icon' icon={faFilter}/> Filtrer</button>
            <button className='button reinit' onClick={() => {setSearch(""); setAppliedSearch(""); setTypeFilter(""); fetchFournisseurs();}}><FontAwesomeIcon className='icon' icon={faRedo}/> Réinitialiser</button>
            <button className='button import' onClick={() => fileInputRef.current.click()} disabled={importing}>
              <FontAwesomeIcon className='icon' icon={faFileImport}/> {importing ? "Import en cours..." : "Importer (fichier .csv)"}
            </button>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
            <button className='button export' onClick={handleExport}><FontAwesomeIcon className='icon' icon={faFileExport}/> Exporter</button>
          </div>
        </div>
      </div>
      <div className='cont-table'>
        {loading ? (
          <TableSquel columns={4} />
        ) : (
          <Table
            items={filteredFournisseurs}
            columns={
              [
                {key:"nom_fournisseur", label:"Nom du fournisseur"},
                {key:"type", label:"Type"},
                {key:"adresse", label:"Adresse"},
                {key:"mail", label:"Mail"}
              ]
            }
            onEdit={(item) =>{ setSelectedItem(item); toggleTab(2); }}
            onDelete={(item) =>{ setSelectedItem(item); toggleTab(3); }}
          />
          )}
      </div>
      <div className={toggleState === 1 ? "info-modal active-modal" : "info-modal"}>
        <div className='info-modal-content'>
          <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
          <AddFns onSuccess={handleAddSuccess}/>
        </div>
      </div>
      <div className={toggleState === 2 ? "info-modal active-modal" : "info-modal"}>
        <div className='info-modal-content'>
          <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
          <UpdtFns item={selectedItem} onSuccess={handleUpdateSuccess}/>
        </div>
      </div>
      <div className={toggleState === 3 ? "info-modal active-modal" : "info-modal"}>
          <div className='modalConf-content'>
            <DelConfirm itemName={selectedItem?.nom_fournisseur}/>
            <div className="but_log">
              <button onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? "Supression..." : "Confirmer"}
              </button>
              <button onClick={() => toggleTab(0)}>Annuler</button>
            </div>
          </div>
      </div>
    </div>
  )
}
