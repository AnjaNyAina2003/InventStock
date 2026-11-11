import React, { useEffect, useRef, useState } from 'react'
import './AutocompleteSelect.css'

export default function AutocompleteSelect({
  name, value, onChange,
  options = [], onSearch, selectedLabel, onQueryChange, onFocusChange,
  className = '', placeholder = 'Rechercher...', minChars = 1,
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState(options);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (selectedLabel !== undefined) {
      setQuery(selectedLabel || '');
      return;
    }
  }, [selectedLabel]);
  
  useEffect(() => {
    if (selectedLabel === undefined && !onSearch) {
      const selected = options.find((o) => String(o.value) === String(value));
      setQuery(selected ? selected.label : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runLocalFilter = (q) => {
    setResults(options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())));
  };

  const handleInputChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    onQueryChange?.(q);
    if (value) onChange({ target: { name, value: "" } });

    if (onSearch) {
      clearTimeout(debounceRef.current);
      if (q.length < minChars) {
        setResults([]);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await onSearch(q);
          setResults(res);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      runLocalFilter(q);
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setOpen(true);
    onFocusChange?.(true);
    if (!onSearch) runLocalFilter(query);
  };

  const handleBlur = () => {
    setFocused(false);
    onFocusChange?.(false);
  }

  const handleSelect = (opt) => {
    setQuery(opt.label);
    setOpen(false);
    onQueryChange?.(opt.label);
    onChange({ target: { name, value: opt.value } }, opt);
  };

  return (
    <div className={`autocomplete-wrap ${className}`} ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={focused ? placeholder : ''}
        className="autocomplete-input"
        autoComplete="off"
      />
      {open && query.length >= minChars && (
        <ul className="autocomplete-dropdown">
          {loading ? (
            <li className="autocomplete-empty">Recherche...</li>
          ) : results.length > 0 ? (
            results.slice(0, 8).map((opt) => (
              <li key={opt.value} onClick={() => handleSelect(opt)}>
                {opt.label}
              </li>
            ))
          ) : (
            <li className="autocomplete-empty">Aucun résultat</li>
          )}
        </ul>
      )}
    </div>
  );
}
