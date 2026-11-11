import React, { useState } from 'react'
import { faBoxesAlt, faChevronDown, faLayerGroup, faMoneyBill, faRuler, faSlidersH, faTags, faTruck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CustomSelect from '../../mini-funct/CustomSelect'
import AutocompleteSelect from '../../mini-funct/Autocomplete/AutocompleteSelect';
import { useDevise } from '../../../../../hooks/useDevise';

export default function ProduitFormFields({ float, floatLabel, options, uniteLabel = "Unité", fournisseurLabel, onFournisseurChange, fournisseurQuery, onFournisseurQueryChange }) {
  const { symbol } = useDevise();
  const { categorieOptions, searchFournisseurs, uniteOptions, typeUniteOptions } = options;
  const [fournisseurFocused, setFournisseurFocused] = useState(false);

  return (
    <>
      <div className={`max-inpWidth floating-div ${float.categorie ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faLayerGroup}/>
        <CustomSelect
          name="categorie"
          value={float.categorie}
          onChange={floatLabel}
          options={categorieOptions}
          className="input-select max-inpWidth"
        />
        <label>Categorie</label>
        <FontAwesomeIcon className='select-icon' icon={faChevronDown}/>
      </div>

      <div className='selectMini-cont'>
        <div className={`mini-inpWidth floating-div ${float.nom_prod ? "filled" : ""}`}>
          <FontAwesomeIcon className='icon input-icon' icon={faTags}/>
          <input type='text' name='nom_prod' className='float-label inputMini' value={float.nom_prod} onChange={floatLabel}></input>
          <label>Nom produit</label>
        </div>
        <div className={`mini-inpWidth floating-div ${float.qtt ? "filled" : ""}`}>
          <FontAwesomeIcon className='icon input-icon' icon={faBoxesAlt}/>
          <input type='number' name='qtt' className='float-label inputMini' value={float.qtt} onChange={floatLabel}></input>
          <label>Quantité</label>
        </div>
      </div>

      <div className='selectMini-cont'>
        <div className={`mini-inpWidth floating-div ${float.typunite ? "filled" : ""}`}>
          <FontAwesomeIcon className='icon input-icon' icon={faRuler}/>
          <CustomSelect
            name="typunite"
            value={float.typunite}
            onChange={floatLabel}
            options={typeUniteOptions}
            className="input-select mini-inpWidth"
          />
          <label>{uniteLabel === "Unité" ? "Types Unité" : uniteLabel}</label>
          <FontAwesomeIcon className='select-iconUnit' icon={faChevronDown}/>
        </div>
        <div className={`mini-inpWidth floating-div ${float.unite ? "filled" : ""}`}>
          <FontAwesomeIcon className='icon input-icon' icon={faSlidersH}/>
          <CustomSelect
            name="unite"
            value={float.unite}
            onChange={floatLabel}
            options={uniteOptions}
            className="input-select mini-inpWidth"
          />
          <label>Unité</label>
          <FontAwesomeIcon className='select-iconUnit' icon={faChevronDown}/>
        </div>
      </div>

      <div className={`max-inpWidth floating-div ${float.prix ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faMoneyBill}/>
        <input type='number' step="0.01" name='prix' className='float-label inputMini max-inpWidth' value={float.prix} onChange={floatLabel}></input>
        <label>Prix unitaire ({symbol})</label>
      </div>

      <div className={`max-inpWidth floating-div ${(float.fns || fournisseurQuery || fournisseurFocused) ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faTruck}/>
        <AutocompleteSelect
          name="fns"
          value={float.fns}
          onChange={onFournisseurChange || floatLabel}
          onSearch={searchFournisseurs}
          onQueryChange={onFournisseurQueryChange}
          onFocusChange={setFournisseurFocused}
          selectedLabel={fournisseurLabel}
          placeholder="Tape le nom d'un fournisseur..."
          className="input-select max-inpWidth"
        />
        <label>Fournisseur</label>
      </div>
    </>
  );
}
