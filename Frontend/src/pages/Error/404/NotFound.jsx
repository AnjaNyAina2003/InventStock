import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import '../Error.css'

export default function NotFound() {
  return (
    <div className='error-container'>
      <div className='error-card notFound'>
        <FontAwesomeIcon className='notFound-icon' icon={faExclamationCircle} />
        <h1>ERROR 404</h1>
        <p>Cette page que vous essayer de joindre n'existe pas.</p>
        <Link to="/auth/login" className='button butAuth error404 valid_modal'>
          Revenir à la page de connexion
        </Link>
      </div>
    </div>
  )
}