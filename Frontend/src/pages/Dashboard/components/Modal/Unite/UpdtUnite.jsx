import React, { useEffect, useState } from 'react'
import { faCheck, faChevronDown, faHashtag, faLayerGroup, faTags } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Stack, Typography } from '@mui/material'
import CustomSelect from '../../mini-funct/CustomSelect'
import { useSubmitState } from '../../../../../hooks/useSubmitState'
import toast from 'react-hot-toast'
import apiClient from '../../../../../api/apiClient'

const TYPE_UNITE_OPTIONS = [
  { value: 'MASSE',  label: 'Masse' },
  { value: 'QUANTITE', label: 'Quantite' },
  { value: 'VOLUME', label: 'Volume' },
  { value: 'LONGUEUR', label: 'Longueur' }
]

export default function UpdtUnite({item, onSuccess}) {
  const { submitting, run } = useSubmitState();
  const [float, setFloat] = useState({
    type_unit: "", nom_unit: "", brev: "",
  });

  useEffect(() => {
    if (!item) return;
    setFloat({
      type_unit: item.types || "",
      nom_unit: item.unite || "",
      brev: item.brev || "",
    });
  }, [item]);

  const floatLabel = (e) => {
    const {name, value} = e.target;

    setFloat((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item) return;

    if (!float.type_unit || !float.nom_unit || !float.brev) {
      toast.error("Merci de remplir tous les champs");
      return;
    }

    run(async () => {
      const res = await apiClient.patch(`/produit/actUnite/${item.id}`, {
        types: float.type_unit,
        unite: float.nom_unit,
        brev: float.brev,
      });
      onSuccess?.(res.data);
    }, { successMessage: "Unité modifiée" });
  };

  return (
    <Stack gap={'1rem'} component="form" onSubmit={handleSubmit}>
        <Typography variant='h5' fontWeight={600} className='titleForm'>Modifier l'unite</Typography>
        <div className={`max-inpWidth floating-div ${float.type_unit ? "filled" : ""}`}>
          <FontAwesomeIcon className='icon input-icon' icon={faLayerGroup}/>
          <CustomSelect
            name="type_unit"
            value={float.type_unit}
            onChange={floatLabel}
            options={TYPE_UNITE_OPTIONS}
            className="input-select max-inpWidth"
          />
          <label>Type de l'unite</label>
          <FontAwesomeIcon className='select-icon' icon={faChevronDown}/>
        </div>
        <div className={`max-inpWidth floating-div ${float.nom_unit ? "filled" : ""}`}>
          <FontAwesomeIcon className='icon input-icon' icon={faTags}/>
          <input type='text' name='nom_unit' className='float-label' value={float.nom_unit} onChange={floatLabel}></input>
          <label>Nom de l'unite</label>
        </div>
        <div className={`max-inpWidth floating-div ${float.brev ? "filled" : ""}`}>
          <FontAwesomeIcon className='icon input-icon' icon={faHashtag}/>
          <input type='text' name='brev' className='float-label' value={float.brev} onChange={floatLabel}></input>
          <label>Symbole</label>
        </div>
        <button type='submit' className='button valid valid_modal' disabled={submitting}>
          {submitting ? "Modification..." : "Valider"} <FontAwesomeIcon className='icon' icon={faCheck}/>
        </button>
    </Stack>
  )
}