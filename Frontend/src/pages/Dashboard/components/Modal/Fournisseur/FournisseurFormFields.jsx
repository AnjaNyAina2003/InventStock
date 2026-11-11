import React from 'react'
import { faChevronDown, faEnvelope, faHouse, faLayerGroup, faTags } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CustomSelect from '../../mini-funct/CustomSelect'
import { TYPE_FOURNISSEUR_OPTIONS } from '../../../../../hooks/useFournisseurOptions';

export default function FournisseurFormFields({ float, floatLabel }) {
  return (
    <>
      <div className={`max-inpWidth floating-div ${float.type ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faLayerGroup}/>
        <CustomSelect
          name="type"
          value={float.type}
          onChange={floatLabel}
          options={TYPE_FOURNISSEUR_OPTIONS}
          className="input-select max-inpWidth"
        />
        <label>Type de fournisseur</label>
        <FontAwesomeIcon className='select-icon' icon={faChevronDown}/>
      </div>
      <div className={`max-inpWidth floating-div ${float.nom_fns ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faTags}/>
        <input type='text' name='nom_fns' className='float-label' value={float.nom_fns} onChange={floatLabel}></input>
        <label>Nom du fournisseur</label>
      </div>
      <div className={`max-inpWidth floating-div ${float.adresse ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faHouse}/>
        <input type='text' name='adresse' className='float-label' value={float.adresse} onChange={floatLabel}></input>
        <label>Adresse</label>
      </div>
      <div className={`max-inpWidth floating-div ${float.mail ? "filled" : ""}`}>
        <FontAwesomeIcon className='icon input-icon' icon={faEnvelope}/>
        <input type='email' name='mail' className='float-label' value={float.mail} onChange={floatLabel}></input>
        <label>Mail</label>
      </div>
    </>
  );
}