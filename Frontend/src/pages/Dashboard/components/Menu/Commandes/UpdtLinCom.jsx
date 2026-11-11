import React, {useEffect, useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faLeftLong, faListCheck, faPlusCircle, faSave, faTruck, faXmark } from '@fortawesome/free-solid-svg-icons'
import AddCom from '../../Modal/Commande/AddCom'
import { Typography } from '@mui/material'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import UpdtLigneCommande from '../../Modal/Commande/UpdtLigneCommande'
import DelConfirm from '../../Modal/Confirm/DelConfirm'
import CustomSelect from '../../mini-funct/CustomSelect'
import Table from '../Tables/Table'
import { useSubmitState } from '../../../../../hooks/useSubmitState'
import { useDevise } from '../../../../../hooks/useDevise'
import apiClient from '../../../../../api/apiClient'
import toast from 'react-hot-toast'
import AutocompleteSelect from '../../mini-funct/Autocomplete/AutocompleteSelect'
import LoadingScreen from '../../../../Loading/LoadingScreen'

const STAT_OPTIONS = [
  { value: 'ATTENTE', label: 'En attente' },
  { value: 'COURS', label: 'En cours' },
  { value: 'LIVREE', label: 'Livrée' },
  { value: 'ANNULEE', label: 'Annulée' },
]

export default function UpdtLinCom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { submitting, run } = useSubmitState();
  const { formatDevise } = useDevise();
  const [loading, setLoading] = useState(true);
  const [fournisseurLabel, setFournisseurLabel] = useState("");
  const [fournisseurFocused, setFournisseurFocused] = useState(false);
  const [fournisseurQuery, setFournisseurQuery] = useState("");
  const [lignes, setLignes] = useState([]);
  const [selectedLigneIndex, setSelectedLigneIndex] = useState(null);
  const [toggleState, setToggleState] = useState(0)
  const toggleTab = (index) => {
    setToggleState(index);
  }
  const [float, setFloat] = useState({
    fns: "", stat: ""
  });
  const floatLabel = (e) => {
    const {name, value} = e.target;

    setFloat((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const searchFournisseurs = async (query) => {
    const res = await apiClient.get(`/fournisseur/addFns?search=${encodeURIComponent(query)}`);
    return res.data.map((f) => ({ value: f.id, label: f.nom_fournisseur }));
  };

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/commande/actCom/${id}`).then((res) => {
      const c = res.data;
      setFloat({ fns: c.fournisseur, stat: c.statut });
      setFournisseurLabel(c.fournisseur_nom || "");
      setLignes(c.lignes.map((l) => ({
        produit: l.produit,
        produit_nom: l.produit_nom,
        unite: l.unite,
        unite_nom: l.unite_nom,
        quantite: l.quantite,
        prix_unitaire: l.prix_unitaire,
      })));
    }).catch(() => toast.error("Impossible de charger la commande"))
      .finally(() => setLoading(false));
  }, [id]);

  const lignesAffichees = lignes.map((l, index) => ({
    ...l,
    index,
    sous_total_affiche: formatDevise(l.quantite * l.prix_unitaire),
    prix_unitaire_affiche: formatDevise(l.prix_unitaire),
  }));

  const handleAddLigne = (ligne) => {
    setLignes((prev) => [...prev, ligne]);
    toggleTab(0);
  };

  const handleUpdateLigne = (ligneMaj) => {
    setLignes((prev) => prev.map((l, i) => (i === selectedLigneIndex ? ligneMaj : l)));
    setSelectedLigneIndex(null);
    toggleTab(0);
  };

  const handleDeleteLigne = () => {
    setLignes((prev) => prev.filter((_, i) => i !== selectedLigneIndex));
    setSelectedLigneIndex(null);
    toggleTab(0);
  };

  const handleSave = () => {
    if (!float.fns || !float.stat) {
      toast.error("Merci de choisir un fournisseur et un statut");
      return;
    }
    if (lignes.length === 0) {
      toast.error("Ajoute au moins une ligne de commande");
      return;
    }

    run(async () => {
      const payload = {
        fournisseur: float.fns,
        statut: float.stat,
        lignes: lignes.map((l) => ({
          produit: l.produit,
          quantite: l.quantite,
          unite: l.unite,
          prix_unitaire: l.prix_unitaire,
        })),
      };
      await apiClient.patch(`/commande/actCom/${id}`, payload);
      navigate("/commande");
    }, { successMessage: "Commande modifiée" });
  };

  if (loading) {
   return <LoadingScreen message="Chargement..." />;
  }

  return (
    <div className='modCom-content'>    
      <Typography variant='h5' margin={1} fontWeight={600} className='titleForm'>Modifier la commande</Typography>
      <div className={`max-inpWidth floating-div ${(float.fns || fournisseurQuery || fournisseurFocused) ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faTruck}/>
        <AutocompleteSelect
          name="fns"
          value={float.fns}
          onChange={floatLabel}
          onSearch={searchFournisseurs}
          onQueryChange={setFournisseurQuery}
          onFocusChange={setFournisseurFocused}
          selectedLabel={fournisseurLabel || undefined}
          placeholder="Tape le nom d'un fournisseur..."
          className="input-select max-inpWidth"
        />
        <label>Fournisseur</label>
      </div>
      <div className={`mini-inpWidth floating-div ${float.stat ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faListCheck}/>
        <CustomSelect
          name="stat"
          value={float.stat}
          onChange={floatLabel}
          options={STAT_OPTIONS}
          className='input-select mini-inpWidth'
        />
        <label>Statut</label>
        <FontAwesomeIcon className='select-iconFnsP' icon={faChevronDown}/>
      </div>
      <div className='buttonLiCom-content'>
          <button className='buttonLiCom' onClick={() => toggleTab(1)}><FontAwesomeIcon className='icon' icon={faPlusCircle}/> Ajouter une ligne de commande</button>
      </div>
      <div className='cont-table'>
        <Table
          items={lignesAffichees}
          columns={
            [
              {key:"produit_nom", label:"Produit"},
              {key:"quantite", label:"Quantite"},
              {key:"prix_unitaire_affiche", label:"Prix Unitaire"},
              {key:"sous_total_affiche", label:"Sous Total"}
            ]
          }
          onEdit={(item) =>{ setSelectedLigneIndex(item.index); toggleTab(2); }}
          onDelete={(item) =>{ setSelectedLigneIndex(item.index); toggleTab(3); }}
        />
      </div>
      <div className='buttonValidLiCom-content'>
        <NavLink to="/commande">
          <button className='buttonValidLiCom cancel'><FontAwesomeIcon className='icon' icon={faLeftLong}/> Annuler</button>
        </NavLink>
        <button className='buttonValidLiCom save' onClick={handleSave} disabled={submitting}>
          <FontAwesomeIcon className='icon' icon={faSave}/> {submitting ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
      <div className={toggleState === 1 ? "info-modal active-modal" : "info-modal"}>
          <div className='info-modal-content'>
            <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
            <AddCom onAdd={handleAddLigne}/>
          </div>
      </div>
      <div className={toggleState === 2 ? "info-modal active-modal" : "info-modal"}>
          <div className='info-modal-content'>
            <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
            <UpdtLigneCommande item={lignes[selectedLigneIndex]} onUpdate={handleUpdateLigne}/>
          </div>
      </div>
      <div className={toggleState === 3 ? "info-modal active-modal" : "info-modal"}>
          <div className='modalConf-content'>
            <DelConfirm itemName={lignes[selectedLigneIndex]?.produit_nom}/>
            <div className="but_log">
              <button onClick={handleDeleteLigne}>Confirmer</button>
              <button onClick={() => toggleTab(0)}>Annuler</button>
            </div>
          </div>
      </div>
    </div>
  )
}
