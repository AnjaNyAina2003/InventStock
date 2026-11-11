import React, {useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAt, faCheckCircle, faEye, faEyeSlash, faLock, faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import '/src/pages/Authentication/Auth.css'
import { useAuth } from '../../../hooks/useAuth';
import { useSubmitState } from '../../../hooks/useSubmitState';
import toast from 'react-hot-toast';
import { Navigate, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [float, setFloat] = useState({
      user: "",
      mail: "",
      mdp: "",
      verifmdp: "",
  });
  const floatLabel = (e) => {
    const {name, value} = e.target;

    setFloat((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  const [showPass, setShowPass] = useState(true);

  const { signup } = useAuth();
  const navigate = useNavigate();
  const { submitting, run } = useSubmitState();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!float.user || !float.mail || !float.mdp || !float.verifmdp) {
      toast.error("Merci de remplir tous les champs");
      return;
    }

    if (float.mdp !== float.verifmdp){
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    run(async () => {
      await signup({ username: float.user, email: float.mail, password: float.mdp});
      setTimeout(() => navigate("/auth/login"), 1200);
    }, {successMessage : "Compte crée ! Redirection..."});
  };

  return (
    <form className='formsign-content' onSubmit={handleSubmit}>
      <h1 className="title-form">Inscription</h1>
      <div className='inputAuthSign'>
        <div className='cont-infoUser'>
          <div className={`floating-divSign ${float.user ? "filled" : ""}`}>
            <FontAwesomeIcon className='icon input-icon' icon={faUser}/>
            <input type='text' name='user' className='inputSign float-label' value={float.user} onChange={floatLabel}></input>
            <label>Username</label>
          </div>
          <div className={`floating-divSign ${float.mail ? "filled" : ""}`}>
            <FontAwesomeIcon className='icon input-icon' icon={faAt}/>
            <input type='text' name='mail' className='inputSign float-label' value={float.mail} onChange={floatLabel}></input>
            <label>Email</label>
          </div>
        </div>
        <div className='cont-infoUser'>
          <div className={`floating-divSign ${float.mdp ? "filled" : ""}`}>
            <FontAwesomeIcon className='icon input-icon' icon={faLock}/>
            <input type={showPass ? "text" : "password"} name='mdp' className='inputSign float-label' value={float.mdp} onChange={floatLabel}></input>
            <label>Mots de passe</label>
            <FontAwesomeIcon onClick={() => setShowPass(prev => !prev)} className='icon last-iconSign' icon={showPass ? faEye : faEyeSlash}/>
          </div>
          <div className={`floating-divSign ${float.verifmdp ? "filled" : ""}`}>
            <FontAwesomeIcon className='icon input-icon' icon={faCheckCircle}/>
            <input type={showPass ? "text" : "password"} name='verifmdp' className='inputSign float-label' value={float.verifmdp} onChange={floatLabel}></input>
            <label>Retaper le Mots de passe</label>
            <FontAwesomeIcon onClick={() => setShowPass(prev => !prev)} className='icon last-iconSign' icon={showPass ? faEye : faEyeSlash}/>
          </div>
        </div>
      </div>
      <button type='submit' className='button butAuth cancel valid_modal' disabled={submitting}>{submitting ? "Inscription en cours..." : "S'inscrire"} <FontAwesomeIcon className='icon' icon={faUserPlus}/></button>
    </form>
  )
}
