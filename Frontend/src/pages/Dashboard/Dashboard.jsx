import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import Body from './components/Body/Body'
import './Dashboard.css'

export default function Dashboard() {
  return (
    <>
     <Navbar />
     <div className='dash-body'>
        <Sidebar />
        <Body />
     </div>
    </>
  )
}
