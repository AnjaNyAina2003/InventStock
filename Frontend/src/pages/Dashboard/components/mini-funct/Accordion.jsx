import React, {useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPowerOff, faUser, faWrench } from '@fortawesome/free-solid-svg-icons';
import LogOut from '../Modal/Confirm/LogOut';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import toast from 'react-hot-toast';
export default function Accordion({ onClose }) {
  const [toggleState, setToggleState] = useState(0)
  const toggleTab = (index) => {
    setToggleState(index);
  }
  const {logout, user} = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    navigate("/auth/login");
    await logout();
    toast.success("Déconnexion réussie");
  }

  return (
    <>
      <div className='list-content'>
          <ul>
            <NavLink to="/profil" className="list-li" onClick={onClose}>
              <FontAwesomeIcon icon={faUser}/><li>Profile</li>
            </NavLink>
            {user?.role === "ADMIN" && (
              <NavLink to="/settings" className="list-li" onClick={onClose}>
                <FontAwesomeIcon icon={faWrench}/><li>Administration</li>
              </NavLink>
            )}
            <li onClick={() => toggleTab(2)}><FontAwesomeIcon icon={faPowerOff}/>Logout</li>
          </ul>
      </div>

      <div className={toggleState === 2 ? "info-modal active-modal" : "info-modal"}>
        <div className='modalConf-content'>
          <LogOut />
          <div className="but_log">
            <button onClick={handleLogout}>Confirmer</button>
            <button onClick={() => toggleTab(0)}>Annuler</button>
          </div>
        </div>
      </div>
    </>
  )
}
