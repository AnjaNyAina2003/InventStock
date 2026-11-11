import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAt, faEye, faEyeSlash, faLock, faSignIn } from '@fortawesome/free-solid-svg-icons';
import '/src/pages/Authentication/Auth.css'
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useSubmitState } from '../../../hooks/useSubmitState';
import toast from 'react-hot-toast';

export default function Login() {
  const [float, setFloat] = useState({
    mail: "",
    mdp: "",
  });
  const floatLabel = (e) => {
    const {name, value} = e.target;

    setFloat((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  const [showPass, setShowPass] = useState(true);
  const {login} = useAuth();
  const navigate = useNavigate();
  const { submitting, run } = useSubmitState();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!float.mail || !float.mdp) {
      toast.error("Merci de remplir tous les champs");
      return;
    }

    run(async () => {
      const user = await login(float.mail, float.mdp);
      navigate("/acceuil");
      return user;
    }, {successMessage : "Connexion Réussi"});
  };

  return (
    <form className='formlog-content' onSubmit={handleSubmit}>
      <h1 className="title-form">Connexion</h1>
        <div className='cont-inputLog'>
          <div className='inputAuth'>
            <div className={`floating-divSign ${float.mail ? "filled" : ""}`}>
              <FontAwesomeIcon className='icon input-icon' icon={faAt}/>
              <input type='text' name='mail' className='inputLog float-label' value={float.mail} onChange={floatLabel}></input>
              <label>Email</label>
            </div>
            <div className={`floating-divSign ${float.mdp ? "filled" : ""}`}>
              <FontAwesomeIcon className='icon input-icon' icon={faLock}/>
              <input type={showPass ? "text" : "password"} name='mdp' className='inputLog float-label' value={float.mdp} onChange={floatLabel}></input>
              <label>Mot de passe</label>
              <FontAwesomeIcon onClick={() => setShowPass(prev => !prev)} className='icon last-icon' icon={showPass ? faEye : faEyeSlash}/>
            </div>
          </div>
        </div>
      <button type='submit' className='button butAuth cancel valid_modal' disabled={submitting}>{submitting ? "Connexion..." : "Se connecter"} <FontAwesomeIcon className='icon' icon={faSignIn}/></button>
    </form>
  )
}
