import React from 'react'
import './LoadingScreen.css'

export default function LoadingScreen({ message = "Chargement..." }) {
  return (
    <div className='loading-container'>
      <div className='loading-spinner' />
      <p className='loading-text'>{message}</p>
    </div>
  )
}
