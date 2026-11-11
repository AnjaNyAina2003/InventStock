import React, {useCallback, useEffect, useRef, useState} from 'react'
import { MenuItem, TextField, Typography } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBox, faFileExport, faFileImport, faFilter, faPlusCircle, faRedo, faXmark } from '@fortawesome/free-solid-svg-icons'
import TableProduit from '../Tables/TableProduit'
import TableSquel from '../Tables/TableSquel'
import AddProd from '../../Modal/Prod/AddProd'
import DelConfirm from '../../Modal/Confirm/DelConfirm'
import UpdtProd from '../../Modal/Prod/UpdtProd'
import { useSubmitState } from '../../../../../hooks/useSubmitState'
import { useDevise } from '../../../../../hooks/useDevise'
import apiClient from '../../../../../api/apiClient'
import toast from 'react-hot-toast'
import { exportToExcel } from '../../../../../utils/exportExcel'
import { importExcel } from '../../../../../utils/importExcel'
import ReapproForm from '../../Modal/Prod/ReapproForm'

export default function Produit() {
  const { formatDevise } = useDevise();
  const [toggleState, setToggleState] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [categorieFilter, setCategorieFilter] = useState("")
  const [categories, setCategories] = useState([])
  const [fournisseursRef, setFournisseursRef] = useState([])
  const [unitesRef, setUnitesRef] = useState([])
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)
  const { submitting: deleting, run } = useSubmitState()
  const [produits, setProduits] = useState([])
  
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
    apiClient.get("/produit/listCat").then((res) => setCategories(res.data)).catch(() => {});
    apiClient.get("/fournisseur/addFns").then((res) => setFournisseursRef(res.data)).catch(() => {});
    apiClient.get("/produit/listUnite").then((res) => setUnitesRef(res.data)).catch(() => {});
  }, [fetchProduits]);

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    run(async () => {
      await apiClient.delete(`/produit/actProd/${selectedItem.id}`);
      setProduits((prev) => prev.filter((p) => p.id !== selectedItem.id));
      setSelectedItem(null);
      toggleTab(0);
    }, { successMessage: "Produit supprimé" });
  };

  const handleAddSuccess = (nouveauProduit) => {
    setProduits((prev) => [nouveauProduit, ...prev]);
    toggleTab(0);
  };

  const handleUpdateSuccess = (produitModifie) => {
    setProduits((prev) => prev.map((p) => (p.id === produitModifie.id ? produitModifie : p)));
    setSelectedItem(null);
    toggleTab(0);
  };

  const handleReapproSuccess = (produitPartiel) => {
    setProduits((prev) => prev.map((p) => (p.id === produitPartiel.id ? { ...p, ...produitPartiel } : p)));
    setSelectedItem(null);
    toggleTab(0);
  };

  const filteredProduits = produits.filter((p) =>
    p.nom_produit?.toLowerCase().includes(appliedSearch.toLowerCase()) &&
    (categorieFilter === "" || String(p.categorie) === String(categorieFilter))
  );

  const displayProduits = filteredProduits.map((p) => ({
    ...p,
    prix_unitaire_affiche: formatDevise(p.prix_unitaire),
  }));

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

      let success = 0;
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; 

        const categorie = categories.find(
          (c) => c.titre?.toLowerCase() === row["Catégorie"]?.trim().toLowerCase()
        );
        const fournisseur = fournisseursRef.find(
          (f) => f.nom_fournisseur?.toLowerCase() === row["Fournisseur"]?.trim().toLowerCase()
        );
        const unite = unitesRef.find(
          (u) => u.unite?.toLowerCase() === row["Unité"]?.trim().toLowerCase()
        );

        if (!row["Nom produit"]?.trim()) {
          errors.push(`Ligne ${rowNum} : nom du produit manquant`);
          continue;
        }
        if (!categorie) {
          errors.push(`Ligne ${rowNum} : catégorie "${row["Catégorie"]}" introuvable`);
          continue;
        }
        if (!fournisseur) {
          errors.push(`Ligne ${rowNum} : fournisseur "${row["Fournisseur"]}" introuvable`);
          continue;
        }
        if (!unite) {
          errors.push(`Ligne ${rowNum} : unité "${row["Unité"]}" introuvable`);
          continue;
        }
        try {
          await apiClient.post("/produit/addProd", {
            categorie: categorie.id,
            nom_produit: row["Nom produit"].trim(),
            quantite: Number(row["Quantité"]) || 0,
            prix_unitaire: Number(row["Prix unitaire"]) || 0,
            prod_unite: unite.id,
            fournisseur: fournisseur.id,
          });
          success++;
        } catch {
          errors.push(`Ligne ${rowNum} : échec de la création côté serveur`);
        }
      }

      await fetchProduits();

      if (success > 0) toast.success(`${success} produit(s) importé(s)`);
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
    const rows = filteredProduits.map((p) => ({
      "Catégorie": p.categorie_nom,
      "Nom produit": p.nom_produit,
      "Quantité": p.quantite,
      "Unité": p.unite_nom,
      "Fournisseur": p.fournisseur_nom,
      "Prix unitaire": p.prix_unitaire,
    }));
    exportToExcel(rows, "produits");
  };

  return (
    <div className='content'>
      <div className='action-content'>
        <Typography variant='h5' fontWeight={600} className='title'><FontAwesomeIcon icon={faBox}/> Produits</Typography>
        <div className='button-content'>
          <button className='button add' onClick={() => toggleTab(1)}><FontAwesomeIcon className='icon' icon={faPlusCircle}/> Ajouter un produit</button>
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
            <TextField select label='categorie' value={categorieFilter} onChange={(e) => setCategorieFilter(e.target.value)} helperText="Filtrer par categorie" size='small' sx={{
              width: "12rem"
            }}>
              <MenuItem value=''>Tous les catégories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.titre}</MenuItem>
              ))}
            </TextField>
          </div>
          <div className='filterButFour-content'>
            <button className='button filter' onClick={() => setAppliedSearch(search)}><FontAwesomeIcon className='icon' icon={faFilter}/> Filtrer</button>
            <button className='button reinit' onClick={() => {setSearch(""); ; setAppliedSearch(""); setCategorieFilter(""); fetchProduits();}}><FontAwesomeIcon className='icon' icon={faRedo}/> Réinitialiser</button>
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
          <TableSquel columns={5} />
        ) : (
          <TableProduit
            items={displayProduits}
            columns={
              [
                {key:"categorie_nom", label:"Categorie"},
                {key:"nom_produit", label:"Nom produit"},
                {key:"quantite", label:"Quantite"},
                {key:"unite_nom", label:"Unite"},
                {key:"fournisseur_nom", label:"Fournisseur"}
              ]
            }
            onEdit={(item) =>{ setSelectedItem(item); toggleTab(2); }}
            onDelete={(item) =>{ setSelectedItem(item); toggleTab(3); }}
            onReappro={(item) =>{ setSelectedItem(item); toggleTab(4); }}
          />
        )}
      </div>
      <div className={toggleState === 1 ? "info-modal active-modal" : "info-modal"}>
        <div className='info-modal-content'>
          <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
          <AddProd onSuccess={handleAddSuccess} />
        </div>
      </div>
      <div className={toggleState === 2 ? "info-modal active-modal" : "info-modal"}>
        <div className='info-modal-content'>
          <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
          <UpdtProd item={selectedItem} onSuccess={handleUpdateSuccess}/>
        </div>
      </div>
      <div className={toggleState === 3 ? "info-modal active-modal" : "info-modal"}>
          <div className='modalConf-content'>
            <DelConfirm itemName={selectedItem?.nom_produit}/>
            <div className="but_log">
              <button onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? "Suppression..." : "Confirmer"}
              </button>
              <button onClick={() => toggleTab(0)}>Annuler</button>
            </div>
          </div>
      </div>
      <div className={toggleState === 4 ? "info-modal active-modal" : "info-modal"}>
        <div className='info-modal-content'>
          <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
          <ReapproForm item={selectedItem} onSuccess={handleReapproSuccess}/>
        </div>
      </div>
    </div>
  )
}
