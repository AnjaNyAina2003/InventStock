import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

/**
 * CustomSelect — remplace les <select> natifs pour des options joliment stylisées.
 * Props :
 *   name        — string   : nom du champ (identique à l'ancien <select name="...">)
 *   value       — string   : valeur contrôlée
 *   onChange    — function : reçoit un event synthétique { target: { name, value } }
 *   options     — array    : [{ value, label }]
 *   className   — string   : classes CSS supplémentaires (ex: "input-select max-inpWidth")
 *   placeholder — string   : label de l'option vide (optionnel)
 */
export default function CustomSelect({
  name,
  value,
  onChange,
  options = [],
  className = '',
  placeholder = '',
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  /* Ferme le dropdown si on clique ailleurs */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optValue) => {
    onChange({ target: { name, value: optValue } })
    setOpen(false)
  }

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''

  return (
    <div
      ref={ref}
      className={`custom-select-wrapper ${className}`}
      style={{ position: 'relative', width: '100%', cursor: 'pointer' }}
    >
      <div
        className={`custom-select-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          paddingRight: '1.5rem',
          fontSize: 'inherit',
          color: selectedLabel ? 'inherit' : 'transparent',
          userSelect: 'none',
        }}
      >
        {selectedLabel || placeholder}
      </div>

      {open && (
        <ul
          className="custom-select-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            margin: 0,
            padding: '6px',
            listStyle: 'none',
            background: '#12161f',
            border: '1.5px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            animation: 'csDropdown 0.18s cubic-bezier(0.16,1,0.3,1)',
            transformOrigin: 'top center',
            overflow: 'hidden',
          }}
        >
          {/* Option vide */}
          <li
            onClick={() => handleSelect('')}
            style={optionStyle(value === '')}
          >
            <span style={{ opacity: 0.4, fontStyle: 'italic' }}>— aucun —</span>
            {value === '' && <FontAwesomeIcon icon={faCheck} style={checkStyle} />}
          </li>

          {options.map((opt, i) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              style={{
                ...optionStyle(value === opt.value),
                animationDelay: `${i * 0.04}s`,
              }}
              className="cs-option"
            >
              <span>{opt.label}</span>
              {value === opt.value && (
                <FontAwesomeIcon icon={faCheck} style={checkStyle} />
              )}
            </li>
          ))}
        </ul>
      )}

      <style>{`
        @keyframes csDropdown {
          from { opacity: 0; transform: scaleY(0.92) translateY(-6px); }
          to   { opacity: 1; transform: scaleY(1)    translateY(0);     }
        }
        .cs-option {
          animation: csFadeIn 0.22s ease both;
        }
        @keyframes csFadeIn {
          from { opacity: 0; transform: translateX(-4px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        .cs-option:hover {
          background: rgba(56,189,248,0.15) !important;
          color: #38BDF8 !important;
          padding-left: 18px !important;
        }
      `}</style>
    </div>
  )
}

const optionStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '9px 12px',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: active ? 600 : 400,
  color: active ? '#38BDF8' : 'rgba(255,255,255,0.85)',
  background: active ? 'rgba(56,189,248,0.15)' : 'transparent',
  cursor: 'pointer',
  transition: 'background 0.15s ease, color 0.15s ease, padding-left 0.15s ease',
})

const checkStyle = {
  fontSize: '0.75rem',
  color: '#3b5bdb',
  marginLeft: '8px',
  flexShrink: 0,
}
