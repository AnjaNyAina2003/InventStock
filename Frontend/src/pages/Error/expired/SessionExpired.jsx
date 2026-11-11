import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHourglassEnd } from '@fortawesome/free-solid-svg-icons'
import '../Error.css'

export default function SessionExpired() {
  return (
    <div className='error-container'>
      <div className='error-card expired'>
        <FontAwesomeIcon className='expired-icon' icon={faHourglassEnd} />
        <h1>Session expirée</h1>
        <p>Votre session de travail a atteint sa durée maximale.</p>
        <Link to="/auth/login" className='button butAuth cancel valid_modal'>
          Se reconnecter
        </Link>
      </div>
    </div>
  )
}