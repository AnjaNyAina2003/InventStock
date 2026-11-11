import { useState, useRef } from "react";
import './Profil.css'
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../../../hooks/useAuth";
import { useSubmitState } from "../../../../../hooks/useSubmitState";
import api from "../../../../../api/axiosInstance";

const IconUser = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
    stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconCamera = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Profil() {
  const { user, updateUser } = useAuth();
  const { submitting, run } = useSubmitState();
  const [username, setUsername] = useState(user?.username || "");
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file){
      setAvatarUrl(URL.createObjectURL(file));
      setAvatarFile(file);
    } 
  };

  const handleSave = () => {
    run(async () => {
          if (username !== user?.username || avatarFile) {
            const formData = new FormData();
            if (username !== user?.username) formData.append("username", username);
            if(avatarFile) formData.append("avatar", avatarFile);
            const res = await api.patch("/me", formData);
            updateUser(res.data);
            setAvatarFile(null)
          }
    
          if (oldPwd && newPwd) {
            await api.post("/change-mdp", {
              old_password: oldPwd,
              new_password: newPwd,
            });
            setOldPwd("");
            setNewPwd("");
          }
        }, { successMessage: "Profil mis à jour" });
  };

  const handleCancel = () => {
    setUsername(user?.username || "");
    setOldPwd("");
    setNewPwd("");
    setAvatarUrl(null);
  };

  return (
    <>
      <div className="pro-wrap">
        <div className="pro-card">
          <div className="pro-header">
            <div className="pro-avatar-wrap">
              <div className="pro-avatar" onClick={() => fileRef.current.click()}>
                {avatarUrl || user?.avatar_url
                  ? <img src={avatarUrl || user?.avatar_url} alt="avatar" />
                  : <IconUser />
                }
              </div>
              <label className="pro-cam-btn" title="Changer la photo"
                onClick={() => fileRef.current.click()}>
                <IconCamera />
              </label>
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>

            <div className="pro-header-info">
              <h1>{user?.username}</h1>
              <p>{user?.email}</p>
            </div>

            <span className="pro-badge">{user?.role}</span>
          </div>

          <p className="pro-section-title">Informations personnelles</p>

            <div className="pro-field">
              <label className="pro-label">Username</label>
              <input
                className="pro-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
              />
            </div>

          <div className="pro-divider" />

          <p className="pro-section-title">Sécurité du compte</p>

          <div className="pro-field">
            <label className="pro-label">Adresse e-mail</label>
            <input
              className="pro-inputSec"
              value={user?.email || ""}
              disabled
            />
          </div>

          <div className="pro-field">
            <label className="pro-label">Mot de passe actuel</label>
            <div className="pro-input-icon">
              <input
                className="pro-inputSec"
                type={showOld ? "text" : "password"}
                value={oldPwd}
                onChange={e => setOldPwd(e.target.value)}
                placeholder="* * * * * * *"
              />
              <button className="pro-eye-btn" onClick={() => setShowOld(!showOld)}>
                {showOld ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <div className="pro-field">
            <label className="pro-label">Nouveau mot de passe</label>
            <div className="pro-input-icon">
              <input
                className="pro-inputSec"
                type={showNew ? "text" : "password"}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="* * * * * * *"
              />
              <button className="pro-eye-btn" onClick={() => setShowNew(!showNew)}>
                {showNew ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <div className="pro-actions">
            <NavLink to="/acceuil">
              <button className="pro-btn-ghost" onClick={handleCancel}>
                Annuler
              </button>
            </NavLink>
            <button className="pro-btn-primary" onClick={handleSave} disabled={submitting}>
              {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}