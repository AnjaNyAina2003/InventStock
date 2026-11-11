import { MenuItem, TextField, Typography } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardList, faFileImport, faFilter, faPlusCircle, faRedo } from '@fortawesome/free-solid-svg-icons'
import { NavLink, useNavigate } from 'react-router-dom'
import TableCommandes from '../Tables/TableCommandes'
import TableSquel from '../Tables/TableSquel'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSubmitState } from '../../../../../hooks/useSubmitState'
import { useDevise } from '../../../../../hooks/useDevise'
import apiClient from '../../../../../api/apiClient'
import toast from 'react-hot-toast'
import DelConfirm from '../../Modal/Confirm/DelConfirm'
import { exportToExcel } from '../../../../../utils/exportExcel'
import { importExcel } from '../../../../../utils/importExcel'
import './StatusBadge.css'

const STAT_OPTIONS = [
  { value: 'ATTENTE', label: 'En attente' },
  { value: 'COURS', label: 'En cours' },
  { value: 'LIVREE', label: 'Livrée' },
  { value: 'ANNULEE', label: 'Annulée' },
]

const STATUT_STYLE = {
  ATTENTE: "status-attente",
  COURS: "status-cours",
  LIVREE: "status-livree",
  ANNULEE: "status-annulee",
}

const renderStatutBadge = (statut) => {
  const label = STAT_OPTIONS.find((s) => s.value === statut)?.label || statut;
  const className = STATUT_STYLE[statut] || "";
  return <span className={`status-badge ${className}`}>{label}</span>;
}

export default function Commandes() {
  const { formatDevise } = useDevise();
  const [toggleState, setToggleState] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [statutFilter, setStatutFilter] = useState("")
  const [fournisseurFilter, setFournisseurFilter] = useState("")
  const [fournisseurs, setFournisseurs] = useState([])
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)
  const { submitting: deleting, run } = useSubmitState()
  const navigate = useNavigate()

  const toggleTab = (index) => setToggleState(index);

  const fetchCommandes = useCallback(async () => {
    try {
      const res = await apiClient.get("/commande/addCom");
      setCommandes(res.data);
    } catch {
      toast.error("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommandes();
    apiClient.get("/fournisseur/addFns").then((res) => setFournisseurs(res.data)).catch(() => {});
  }, [fetchCommandes]);

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    run(async () => {
      await apiClient.delete(`/commande/actCom/${selectedItem.id}`);
      setCommandes((prev) => prev.filter((c) => c.id !== selectedItem.id));
      setSelectedItem(null);
      toggleTab(0);
    }, { successMessage: "Commande supprimée" });
  };

  const displayCommandes = commandes.map((c) => ({
    ...c,
    date_formatee: new Date(c.date_commande).toLocaleDateString("fr-FR"),
    montant_formate: formatDevise(c.montant_total),
    statut_badge: renderStatutBadge(c.statut),
  }));

  const filteredCommandes = displayCommandes.filter((c) =>
    c.numero_commande?.toLowerCase().includes(appliedSearch.toLowerCase()) &&
    (statutFilter === "" || c.statut === statutFilter) &&
    (fournisseurFilter === "" || String(c.fournisseur) === String(fournisseurFilter))
  );

  const handleExportCommande = (item) => {
    if (!item.lignes || item.lignes.length === 0) {
      toast.error("Cette commande n'a aucune ligne à exporter");
      return;
    }
    const rows = item.lignes.map((l) => ({
      "Produit": l.produit_nom,
      "Quantité": l.quantite,
      "Unité": l.unite_nom,
      "Prix unitaire": l.prix_unitaire,
      "Sous total": Number(l.quantite) * Number(l.prix_unitaire),
    }));
    exportToExcel(rows, `commande_${item.numero_commande}`);
  };

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

      const produitsRes = await apiClient.get("/produit/listProd");
      const produitsRef = produitsRes.data;
      const validStatuts = STAT_OPTIONS.map((s) => s.value);

      const groups = {};
      rows.forEach((row) => {
        const key = row["N° commande"]?.trim();
        if (!key) return;
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });

      let success = 0;
      const errors = [];

      for (const [groupKey, groupRows] of Object.entries(groups)) {
        const first = groupRows[0];
        const fournisseur = fournisseurs.find(
          (f) => f.nom_fournisseur?.toLowerCase() === first["Fournisseur"]?.trim().toLowerCase()
        );
        const statut = first["Statut"]?.trim().toUpperCase();

        if (!fournisseur) {
          errors.push(`${groupKey} : fournisseur "${first["Fournisseur"]}" introuvable`);
          continue;
        }
        if (!validStatuts.includes(statut)) {
          errors.push(`${groupKey} : statut "${first["Statut"]}" invalide`);
          continue;
        }

        const lignes = [];
        let groupHasError = false;
        for (const row of groupRows) {
          const produit = produitsRef.find(
            (p) => p.nom_produit?.toLowerCase() === row["Produit"]?.trim().toLowerCase()
          );
          if (!produit) {
            errors.push(`${groupKey} : produit "${row["Produit"]}" introuvable`);
            groupHasError = true;
            continue;
          }
          lignes.push({
            produit: produit.id,
            quantite: Number(row["Quantité"]) || 0,
            unite: produit.prod_unite,
            prix_unitaire: Number(row["Prix unitaire"]) || 0,
          });
        }

        if (groupHasError || lignes.length === 0) continue;

        try {
          await apiClient.post("/commande/addCom", { fournisseur: fournisseur.id, statut, lignes });
          success++;
        } catch {
          errors.push(`${groupKey} : échec de la création côté serveur`);
        }
      }

      await fetchCommandes();

      if (success > 0) toast.success(`${success} commande(s) importée(s)`);
      if (errors.length > 0) {
        toast.error(`${errors.length} ligne(s)/groupe(s) ignoré(s) — voir la console`);
        console.warn("Erreurs d'import :", errors);
      }
    } catch {
      toast.error("Impossible de lire le fichier");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className='content'>
      <div className='action-content'>
        <Typography variant='h5' fontWeight={600} className='title'><FontAwesomeIcon icon={faClipboardList}/> Commandes</Typography>
        <div className='button-content'>
          <NavLink to="/commande-form">
            <button className='button add'><FontAwesomeIcon className='icon' icon={faPlusCircle}/> Ajouter une commande</button>
          </NavLink>
        </div>
        <div className='filter-content'>
          <div className='filterInput'>
            <TextField 
              label='Rechercher une commande' 
              type='search' 
              variant='outlined' 
              size='small' 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{width: "15rem"}}
            />
            <TextField select label='statut' value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} helperText="Filtrer par statut" size='small' sx={{ width: "12rem" }}>
              <MenuItem value="">Tous les status</MenuItem>
              {STAT_OPTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>
            <TextField select label='fournisseur' value={fournisseurFilter} onChange={(e) => setFournisseurFilter(e.target.value)} helperText="Filtrer par fournisseur" size='small' sx={{ width: "12rem" }}>
              <MenuItem value="">Tous les fournisseurs</MenuItem>
              {fournisseurs.map((f) => (
                <MenuItem key={f.id} value={f.id}>{f.nom_fournisseur}</MenuItem>
              ))}
            </TextField>
          </div>
          <div className='filterBut-content'>
            <button className='button filter' onClick={() => setAppliedSearch(search)}><FontAwesomeIcon className='icon' icon={faFilter}/> Filtrer</button>
            <button className='button reinit' onClick={() => {setSearch(""); setAppliedSearch(""); setStatutFilter(""); setFournisseurFilter(""); fetchCommandes();}}><FontAwesomeIcon className='icon' icon={faRedo}/> Réinitialiser</button>
            <button className='button import' onClick={() => fileInputRef.current.click()} disabled={importing}>
              <FontAwesomeIcon className='icon' icon={faFileImport}/> {importing ? "Import en cours..." : "Importer (.csv)"}
            </button>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
      <div className='cont-table'>
        {loading ? (
          <TableSquel columns={5} />
        ) : (
          <TableCommandes
            items={filteredCommandes}
            columns={
              [
                {key:"numero_commande", label:"N° commande"},
                {key:"fournisseur_nom", label:"Fournisseur"},
                {key:"statut_badge", label:"Statut"},
                {key:"montant_formate", label:"Montant total"},
                {key:"date_formatee", label:"Date"}
              ]
            }
            onEdit={(item) => navigate(`/commande-edit/${item.id}`)}
            onDelete={(item) => { setSelectedItem(item); toggleTab(3); }}
            onExport={handleExportCommande}
          />
        )}
      </div>
      <div className={toggleState === 3 ? "info-modal active-modal" : "info-modal"}>
        <div className='modalConf-content'>
          <DelConfirm itemName={selectedItem?.numero_commande} />
          <div className="but_log">
            <button onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? "Suppression..." : "Confirmer"}
            </button>
            <button onClick={() => toggleTab(0)}>Annuler</button>
          </div>
        </div>
      </div>
    </div>
  )
}
