import React, { useState } from 'react'
import { faBoxesAlt, faBoxOpen, faCheck, faTags } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Stack, TextField, Typography } from '@mui/material'
import apiClient from '../../../../../api/apiClient'
import toast from 'react-hot-toast'
import AutocompleteSelect from '../../mini-funct/Autocomplete/AutocompleteSelect'
import { useDevise } from '../../../../../hooks/useDevise'

export default function AddCom({ onAdd }) {
  const { symbol } = useDevise();
  const [float, setFloat] = useState({
    produit: "", qtt: "", prixUni: "",
  });
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [produitQuery, setProduitQuery] = useState("");
  const [produitFocused, setProduitFocused] = useState(false);
  

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
      setFloat((prev) => ({ ...prev, prixUni: opt.raw.prix_unitaire ?? "" }));
    } else {
      setSelectedProduit(null);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!float.produit || !float.qtt || !float.prixUni || !selectedProduit) {
      toast.error("Merci de remplir tous les champs");
      return;
    }

    onAdd?.({
      produit: selectedProduit.id,
      produit_nom: selectedProduit.nom_produit,
      unite: selectedProduit.prod_unite,
      unite_nom: selectedProduit.unite_nom,
      quantite: Number(float.qtt),
      prix_unitaire: Number(float.prixUni),
    });
  };

  return (
    <Stack gap={'1rem'} component="form" onSubmit={handleSubmit}>
      <Typography variant='h5' fontWeight={600} className='titleForm'>Ajouter une ligne de commande</Typography>
      <div className={`max-inpWidth floating-div ${(float.produit|| produitQuery || produitFocused) ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faBoxOpen}/>
        <AutocompleteSelect
          name="produit"
          value={float.produit}
          onChange={handleProduitChange}
          onSearch={searchProduits}
          onQueryChange={setProduitQuery}
          onFocusChange={setProduitFocused}
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
          <input type='text' className='float-label inputMini' value={selectedProduit?.unite_nom || ""} disabled></input>
          <label>Unité</label>
        </div>
      </div>
      <div className={`max-inpWidth floating-div ${float.prixUni ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faTags}/>
        <input type='number' step="0.01" name='prixUni' className='float-label' value={float.prixUni} onChange={floatLabel}></input>
        <label>Prix Unitaire ({symbol})</label>
      </div>
      <button type='submit' className='button valid valid_modal'><FontAwesomeIcon className='icon' icon={faCheck}/> Valider</button>
    </Stack>
  )
}
