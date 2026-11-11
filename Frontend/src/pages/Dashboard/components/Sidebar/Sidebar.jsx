import React from 'react'
import './Sidebar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBox, faClipboardList, faExchange, faHouse, faTruck } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className='sidebar-content'>
      <NavLink to="/acceuil">
        {({isActive}) => (
          <button className={`menu-button ${isActive ? "active" : ""}`}><FontAwesomeIcon icon={faHouse}/>Acceuil</button>
        )}
      </NavLink>
      <NavLink to="/produit">
        {({isActive}) => (
        <button className={`menu-button ${isActive ? "active" : ""}`}><FontAwesomeIcon icon={faBox}/>Produits</button>
        )}
      </NavLink>
      <NavLink to="/mouvement-stock">
        {({isActive}) => (
        <button className={`menu-button ${isActive ? "active" : ""}`}><FontAwesomeIcon icon={faExchange}/>Entrées / Sorties</button>
        )}
      </NavLink>
      <NavLink to="/fournisseur">
        {({isActive}) => (
        <button className={`menu-button ${isActive ? "active" : ""}`}><FontAwesomeIcon icon={faTruck}/>Fournisseurs</button>
        )}
      </NavLink>
      <NavLink to="/commande">
        {({isActive}) => (
        <button className={`menu-button ${isActive ? "active" : ""}`}><FontAwesomeIcon icon={faClipboardList}/>Commandes</button>
        )}
      </NavLink>
    </div>
  )
}
