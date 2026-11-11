import React, { useEffect, useState } from 'react'
import { faBoxesAlt, faBoxOpen, faCheck, faTags } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Stack, Typography } from '@mui/material'
import apiClient from '../../../../../api/apiClient'
import toast from 'react-hot-toast'
import AutocompleteSelect from '../../mini-funct/Autocomplete/AutocompleteSelect'
import { useDevise } from '../../../../../hooks/useDevise'

export default function UpdtLigneCommande({ item, onUpdate }) {
  const { symbol } = useDevise();
  const [float, setFloat] = useState({
    nom_prod: "", qtt: "", prixUni: "",
  });
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [produitQuery, setProduitQuery] = useState("");

  useEffect(() => {
    if (!item) return;
    setFloat({
      produit: item.produit || "",
      qtt: item.quantite ?? "",
      prixUni: item.prix_unitaire ?? "",
    });
    setSelectedProduit(null);
  }, [item]);

  const floatLabel = (e) => {
    const {name, value} = e.target;
    setFloat((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const searchProduits = async (query) => {
    const res = await apiClient.get(`/produit/listProd?search=${encodeURIComponent(query)}`);
    return res.data.map((p) => ({ value: p.id, label: p.nom_produit, raw: p }));
  };

  const handleProduitChange = (e, opt) => {
    floatLabel(e);
    if (opt?.raw) {
      setSelectedProduit(opt.raw);
      setFloat((prev) => ({ ...prev, prixUni: opt.raw.prix_unitaire ?? prev.prixUni }));
    } else {
      setSelectedProduit(null);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item) return;
    
    const produitId = selectedProduit?.id ?? item.produit;
    const produitNom = selectedProduit?.nom_produit ?? item.produit_nom;
    const uniteId = selectedProduit?.prod_unite ?? item.unite;
    const uniteNom = selectedProduit?.unite_nom ?? item.unite_nom;

    if (!produitId || !float.qtt || !float.prixUni) {
      toast.error("Merci de remplir tous les champs");
      return;
    }

    onUpdate?.({
      produit: produitId,
      produit_nom: produitNom,
      unite: uniteId,
      unite_nom: uniteNom,
      quantite: Number(float.qtt),
      prix_unitaire: Number(float.prixUni),
    });
  };
  
  return (
    <Stack gap={'1rem'} component="form" onSubmit={handleSubmit}>
        <Typography variant='h5' fontWeight={600} className='titleForm'>Modifier la commande N°1</Typography>
        <div className={`max-inpWidth floating-div ${(float.produit || produitQuery) ? "filled" : ""}`}>
          <FontAwesomeIcon className='icon input-icon' icon={faBoxOpen}/>
          <AutocompleteSelect
            name="produit"
            value={float.produit}
            onChange={handleProduitChange}
            onSearch={searchProduits}
            onQueryChange={setProduitQuery}
            selectedLabel={selectedProduit ? undefined : item?.produit_nom}
            placeholder="Tape le nom d'un produit..."
            className="input-select max-inpWidth"
          />
          <label>Produits</label>
        </div>
        <div className='selectMini-cont'>
          <div className={`mini-inpWidth floating-div ${float.qtt ? "filled" : ""}`}>
            <FontAwesomeIcon className='icon input-icon' icon={faBoxesAlt}/>
            <input type='number' name='qtt' className='float-label inputMini' value={float.qtt} onChange={floatLabel}></input>
            <label>Quantité</label>
          </div>
          <div className='mini-inpWidth floating-div filled'>
            <input type='text' className='float-label inputMini' value={selectedProduit?.unite_nom || item?.unite_nom || ""} disabled></input>
            <label>Unité</label>
          </div>
        </div>
        <div className={`max-inpWidth floating-div ${float.prixUni ? "filled" : ""}`}>
          <FontAwesomeIcon className='icon input-icon' icon={faTags}/>
          <input type='number' step="0.01" name='prixUni' className='float-label' value={float.prixUni} onChange={floatLabel}></input>
          <label>Prix Unitaire ({symbol})</label>
        </div>
        <button type='submit' className='button valid valid_modal'><FontAwesomeIcon className='icon' icon={faCheck}/> Valider </button>
    </Stack>
  )
}
