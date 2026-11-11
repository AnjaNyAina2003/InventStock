import React from 'react'

export default function DelConfirm({itemName}) {
  return (
    <div className='title-content'>
      <p className='title-primeConf'>Confirmer la suppression</p>
      <p className='subtext'>
        {itemName
          ?<>Êtes-vous sûr de vouloir supprimer <strong>{itemName}</strong> ?</>
          : "Êtes-vous sûr de vouloir supprimer ceci?"}
      </p>
    </div>
  )
}
