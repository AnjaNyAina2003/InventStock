import React from 'react'
import './Body.css'
import { Outlet } from 'react-router-dom'

export default function Body() {
  return (
    <div className='body-content'>
      <Outlet />
    </div>
  )
}
