import React, { useState, useEffect, useRef } from 'react'
import {Typography, IconButton, Menu, MenuItem} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Navbar.css'
import { faBolt, faCaretDown, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import Accordion from '../mini-funct/Accordion';
import { useAuth } from '../../../../hooks/useAuth';

export default function Navbar() {
  const { user } = useAuth();
  const [toggleState, setToggleState] = useState(0)
  const toggleTab = (index) => {
    setToggleState(index);
  }
 const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setToggleState(0);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className='nav-wrapper'>
        <div className='nav-content'>
            <div className='logo-content'>
              <div className='cont-logo'>
                <FontAwesomeIcon icon={faBolt} className='logo'></FontAwesomeIcon>
              </div>
              <Typography variant='h7' fontWeight={500}>InventStockManaging</Typography>
            </div>
            <div className='info-content'>
              <div>
                {user?.avatar_url
                  ? <div className='user-img'><img src={user.avatar_url} alt="avatar"/></div>
                  : <FontAwesomeIcon icon={faUserCircle} className='icon-user'/>
                }
              </div>
              <Typography>{user?.username}</Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={() => toggleTab(1)}
                color="inherit"
              >
                <FontAwesomeIcon icon={faCaretDown} className='icon-down'/>
              </IconButton>
              <div className={toggleState === 1 ? "drawer-modal active-drawer" : "drawer-modal"}>
                <div className='drawer-modal-content' ref={dropdownRef}>
                  <Accordion onClose={() => setToggleState(0)}/>
                </div>
              </div>
            </div>
        </div>
    </nav>
  )
}
