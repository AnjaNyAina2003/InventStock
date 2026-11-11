import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Settings.css'
import { faCoins, faPlus, faRuler, faSave, faTag, faTimes, faXmark } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import AddUnite from "../../Modal/Unite/AddUnite";
import UpdtUnite from "../../Modal/Unite/UpdtUnite";
import DelConfirm from "../../Modal/Confirm/DelConfirm";
import Table from "../Tables/Table";
import TableSquel from "../Tables/TableSquel";
import apiClient from "../../../../../api/apiClient";
import { useSubmitState } from "../../../../../hooks/useSubmitState";
import { useDevise } from "../../../../../hooks/useDevise";

const SectionHeader = ({ icon, title }) => (
  <div className="sectionLabel">
    <FontAwesomeIcon icon={icon} className="sectionIcon"></FontAwesomeIcon>
    <span className="sectionTitle">{title}</span>
  </div>
);

const CardDivider = () => <div className="divider" />;

const FieldInfo = ({ label, desc }) => (
  <div>
    <p className="fieldLabel">{label}</p>
    <p className="fieldDesc">{desc}</p>
  </div>
);

const ToggleGroup = ({ options, value, onChange }) => (
  <div className="toggleGroup">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`toggleBtn ${value === opt.value ? "toggleBtnActive" : ""}`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const SelectField = ({ value, onChange, options }) => (
  <select className="select" value={value} onChange={(e) => onChange(e.target.value)} >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const CardRow = ({ label, desc, children }) => (
  <div className="cardRow">
    <FieldInfo label={label} desc={desc} />
    {children}
  </div>
);

const CURRENCY_OPTIONS = [
  { value: "MGA", label: "Ar | Ariary" },
  { value: "EUR", label: "\u00A0€\u00A0 | Euro" },
  { value: "USD", label: "\u00A0$\u00A0 | Dollar Américain" },
  { value: "GBP", label: "\u00A0£\u00A0 | Livre Sterling" },
];

const UNIT_OPTIONS = [
  { value: "MASSE", label: "Masse" },
  { value: "QUANTITE", label: "Quantite" },
  { value: "VOLUME", label: "Volume" },
  { value: "LONGUEUR", label: "Longueur" },
];

const Settings = () => {
  const { setDevise } = useDevise();
  const [currency, setCurrency] = useState("MGA");
  const [unitFilter, setUnitFilter] = useState("MASSE");

  const [categories, setCategories] = useState([]);
  const [unites, setUnites] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingUnite, setLoadingUnite] = useState(true);

  const [toggleState, setToggleState] = useState(0)
  const [showAddCategorie, setShowAddCategorie] = useState(false);
  const [newCatTitre, setNewCatTitre] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatTitre, setEditingCatTitre] = useState("");
  const [selectedItem, setSelectedItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { submitting: savingCat, run: runCat } = useSubmitState();
  const { submitting: deleting, run: runDelete } = useSubmitState();

  const toggleTab = (index) => {
    setToggleState(index);
  }

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiClient.get("/produit/listCat");
      setCategories(res.data);
    } catch {
      toast.error("Impossible de charger les catégories");
    } finally {
      setLoadingCat(false);
    }
  }, []);

  const fetchUnites = useCallback(async () => {
    try {
      const res = await apiClient.get("/produit/listUnite");
      setUnites(res.data);
    } catch {
      toast.error("Impossible de charger les unités");
    } finally {
      setLoadingUnite(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchUnites();
    apiClient.get("/produit/devise")
      .then((res) => setCurrency(res.data.devise))
      .catch(() => {});
  }, [fetchCategories, fetchUnites]);

  const handleCurrencyChange = (value) => {
    setCurrency(value);
    apiClient.patch("/produit/devise", { devise: value })
      .then(() => {
        setDevise(value);
        toast.success("Devise mise à jour");
      })
      .catch(() => toast.error("Impossible de mettre à jour la devise"));
  };

  const handleAddCategorie = () => {
    if (!newCatTitre.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }
    runCat(async () => {
      const res = await apiClient.post("/produit/addCat", { titre: newCatTitre.trim() });
      setCategories((prev) => [...prev, res.data]);
      setNewCatTitre("");
      setShowAddCategorie(false);
    }, { successMessage: "Catégorie ajoutée" });
  };

  const handleStartEditCategorie = (item) => {
    setEditingCatId(item.id);
    setEditingCatTitre(item.titre);
  };

  const handleSaveEditCategorie = () => {
    if (!editingCatTitre.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }
    runCat(async () => {
      const res = await apiClient.patch(`/produit/actCat/${editingCatId}`, { titre: editingCatTitre.trim() });
      setCategories((prev) => prev.map((c) => (c.id === editingCatId ? res.data : c)));
      setEditingCatId(null);
    }, { successMessage: "Catégorie modifiée" });
  };

  const handleAddUniteSuccess = (nouvelleUnite) => {
    setUnites((prev) => [...prev, nouvelleUnite]);
    toggleTab(0);
  };

  const handleUpdateUniteSuccess = (uniteModifiee) => {
    setUnites((prev) => prev.map((u) => (u.id === uniteModifiee.id ? uniteModifiee : u)));
    setSelectedItem(null);
    toggleTab(0);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem || !deleteTarget) return;
    runDelete(async () => {
      if (deleteTarget === "unite") {
        await apiClient.delete(`/produit/actUnite/${selectedItem.id}`);
        setUnites((prev) => prev.filter((u) => u.id !== selectedItem.id));
      } else {
        await apiClient.delete(`/produit/actCat/${selectedItem.id}`);
        setCategories((prev) => prev.filter((c) => c.id !== selectedItem.id));
      }
      setSelectedItem(null);
      setDeleteTarget(null);
      toggleTab(0);
    }, { successMessage: deleteTarget === "unite" ? "Unité supprimée" : "Catégorie supprimée" });
  };

  const filteredUnites = unites.filter((u) => u.types === unitFilter);

  return (
    <div className="setting-wrap">  
      <div className="page">
        <div className="header">
          <div className="headerAccent"/>
            <h1 className="headerTitle">Administration</h1>
        </div>

        <div className="set-content">
          <section className="section">
            <SectionHeader icon={faCoins} title="Devise" />
            <div className="set-card">
              <CardRow label="Devise" desc="Utilisée pour afficher les prix et valeurs">
                <SelectField value={currency} onChange={handleCurrencyChange} options={CURRENCY_OPTIONS} />
              </CardRow>
            </div>
          </section>

          <section className="section">
            <SectionHeader icon={faTag} title="Catégories" />
            <div className="set-card">
              <div className="tableSection">
                <div className="tableTopBar">
                  <span className="tableCount">{categories.length} catégorie(s)</span>
                  {showAddCategorie && (
                    <div className="addCat">
                      <input 
                        type='text' 
                        className="inputCat" 
                        name='nom_cat'
                        value={newCatTitre}
                        onChange={(e) => setNewCatTitre(e.target.value)}
                        placeholder="Nom de la catégorie"
                      />
                      <button onClick={handleAddCategorie} className="addBtn" disabled={savingCat}>
                        <FontAwesomeIcon icon={faSave} />
                        <span>{savingCat ? "..." : "Enregistrer"}</span>
                      </button>
                    </div>
                  )}
                  <button onClick={() => setShowAddCategorie(!showAddCategorie)} className={showAddCategorie ? "addBtn cancelBtn" : "addBtn"}>
                    <FontAwesomeIcon icon={showAddCategorie ? faTimes : faPlus} />
                    <span>{showAddCategorie ? "Annuler" : "Ajouter"}</span>
                  </button>
                </div>
                <CardDivider />
                {loadingCat ? (
                  <TableSquel columns={1} />
                ) : editingCatId ? (
                  <div className="addCat">
                    <input
                      type='text'
                      className="inputCat"
                      value={editingCatTitre}
                      onChange={(e) => setEditingCatTitre(e.target.value)}
                    />
                    <button onClick={handleSaveEditCategorie} className="addBtn" disabled={savingCat}>
                      <FontAwesomeIcon icon={faSave} />
                      <span>{savingCat ? "..." : "Enregistrer"}</span>
                    </button>
                    <button onClick={() => setEditingCatId(null)} className="addBtn cancelBtn">
                      <FontAwesomeIcon icon={faTimes} />
                      <span>Annuler</span>
                    </button>
                  </div>
                ) : (
                  <Table
                    items={categories}
                    columns={[{ key: "titre", label: "Nom" }]}
                    onEdit={handleStartEditCategorie}
                    onDelete={(item) =>{ setSelectedItem(item); setDeleteTarget("categorie"); toggleTab(3); }}
                  />
                )}
              </div>
            </div>
          </section>

          <section className="section">
            <SectionHeader icon={faRuler} title="Unités de mesure" />
            <div className="set-card">
              <CardRow>
                <ToggleGroup options={UNIT_OPTIONS} value={unitFilter} onChange={setUnitFilter} />
                <button onClick={() => toggleTab(1)} className="addBtn">
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Ajouter</span>
                </button>
              </CardRow>
              <CardDivider />
              {loadingUnite ? (
                <TableSquel columns={3} />
              ) : (
                <Table
                  items={filteredUnites}
                  columns={
                    [
                      {key:"types", label:"Type"},
                      {key:"unite", label:"Unite"},
                      {key:"brev", label:"Symbole"}
                    ]
                  }
                  onEdit={(item) =>{ setSelectedItem(item); toggleTab(2); }}
                  onDelete={(item) =>{ setSelectedItem(item); setDeleteTarget("unite"); toggleTab(3); }}
                />
                )}
            </div>
          </section>
        </div>
      </div>
      <div className={toggleState === 1 ? "info-modal active-modal" : "info-modal"}>
        <div className='info-modal-content'>
          <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
          <AddUnite onSuccess={handleAddUniteSuccess} />
        </div>
      </div>
      <div className={toggleState === 2 ? "info-modal active-modal" : "info-modal"}>
        <div className='info-modal-content'>
          <FontAwesomeIcon icon={faXmark} className='close' onClick={() => toggleTab(0)}></FontAwesomeIcon>
          <UpdtUnite item={selectedItem} onSuccess={handleUpdateUniteSuccess}/>
        </div>
      </div>
      <div className={toggleState === 3 ? "info-modal active-modal" : "info-modal"}>
          <div className='modalConf-content'>
            <DelConfirm itemName={deleteTarget === "unite" ? selectedItem?.unite : selectedItem?.titre} />
            <div className="but_log">
              <button  onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? "Suppression..." : "Confirmer"}
              </button>
              <button onClick={() => toggleTab(0)}>Annuler</button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;