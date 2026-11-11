import {Typography} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faSignInAlt, faUserPlus} from '@fortawesome/free-solid-svg-icons'
import { NavLink } from 'react-router-dom';
import { Outlet } from 'react-router-dom'
import './Auth.css'

export default function Auth() {
  return (
    <> 
      <div className='auth-body'>
        <div className='auth-choice'>
          <div className='logo-content'>
              <div className='cont-logo'>
                <FontAwesomeIcon icon={faBolt} className='logo'></FontAwesomeIcon>
              </div>
              <Typography variant='h7' fontWeight={500}>InventStockManaging</Typography>
          </div>
          <div className='choice-border'>
            <NavLink to="login">
            {({isActive}) => (
                <button className={`choice-button login-button ${isActive ? "active" : ""}`}><FontAwesomeIcon icon={faSignInAlt}/>Connexion</button>
            )}
            </NavLink>
            <NavLink to="signup">
            {({isActive}) => (
            <button className={`choice-button signup-button ${isActive ? "active" : ""}`}><FontAwesomeIcon icon={faUserPlus}/>Inscription</button>
            )}
            </NavLink>
          </div>
        </div>
        <div className='form-content'>
            <Outlet />
        </div>
      </div>
    </>
  )
}
