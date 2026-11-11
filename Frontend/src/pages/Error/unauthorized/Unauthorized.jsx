import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import '../Error.css'

export default function Unauthorized() {
  return (
    <div className='error-container'>
      <div className='error-card unauth'>
        <FontAwesomeIcon className='unauth-icon' icon={faLock} />
        <h1>Accès refusé</h1>
        <p>Vous devez être connecté pour accéder à cette page.</p>
        <Link to="/auth/login" className='button butAuth error valid_modal'>
          Revenir à la page de connexion
        </Link>
      </div>
    </div>
  )
}