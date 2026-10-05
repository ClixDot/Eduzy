import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, GraduationCap } from 'lucide-react';
import './CustomSelect.css';

export default function CustomSelect({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = '-- Choose a course --',
  error,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (val) => {
    onChange({
      target: {
        name,
        value: val,
      },
    });
    setIsOpen(false);
  };

  // Find selected option object or string
  const selectedOption = options.find((opt) => {
    if (typeof opt === 'string') return opt === value;
    return (opt.name || opt.label || opt.value) === value;
  });

  const displayLabel = selectedOption
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.name || selectedOption.label)
    : '';

  return (
    <div 
      className={`custom-select-container ${isOpen ? 'is-open' : ''} ${error ? 'is-invalid' : ''} ${className}`} 
      ref={dropdownRef}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        className={`custom-select-trigger ${displayLabel ? 'has-value' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select-trigger-content">
          <GraduationCap size={17} className="custom-select-icon" aria-hidden="true" />
          <span className="custom-select-label">
            {displayLabel || <span className="custom-select-placeholder">{placeholder}</span>}
          </span>
        </span>

        <span className="custom-select-arrow-box">
          <ChevronDown 
            size={18} 
            className={`custom-select-arrow ${isOpen ? 'rotate' : ''}`} 
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Custom Floating Dropdown Menu */}
      {isOpen && (
        <div className="custom-select-menu" role="listbox" tabIndex={-1}>
          <div className="custom-select-menu-header">
            <span>Available Programs</span>
          </div>

          <div className="custom-select-options-list">
            {options.map((opt, idx) => {
              const optValue = typeof opt === 'string' ? opt : opt.name || opt.label || opt.value;
              const optCategory = typeof opt === 'object' ? opt.category || opt.badge : null;
              const isSelected = optValue === value;

              return (
                <div
                  key={idx}
                  role="option"
                  aria-selected={isSelected}
                  className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(optValue)}
                >
                  <div className="custom-select-option-info">
                    <span className="custom-select-option-text">{optValue}</span>
                    {optCategory && (
                      <span className="custom-select-option-badge">
                        {optCategory}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={16} className="custom-select-check" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
