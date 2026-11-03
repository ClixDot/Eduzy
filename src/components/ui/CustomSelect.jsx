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
  icon: Icon = GraduationCap,
  menuTitle = 'Available Programs',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  const getOptionValue = (opt) => (typeof opt === 'string' ? opt : opt.name || opt.label || opt.value);

  // Keep the keyboard-highlighted option visible
  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, activeIndex]);

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

  const toggleMenu = () => {
    if (!isOpen) {
      setActiveIndex(options.findIndex((opt) => getOptionValue(opt) === value));
    }
    setIsOpen((prev) => !prev);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && activeIndex >= 0) {
        handleSelect(getOptionValue(options[activeIndex]));
      } else {
        toggleMenu();
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        toggleMenu();
        return;
      }
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((prev) => {
        if (prev < 0) return step === 1 ? 0 : options.length - 1;
        return (prev + step + options.length) % options.length;
      });
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
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select-trigger-content">
          <Icon size={17} className="custom-select-icon" aria-hidden="true" />
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
            <span>{menuTitle}</span>
          </div>

          <div className="custom-select-options-list" ref={listRef}>
            {options.map((opt, idx) => {
              const optValue = getOptionValue(opt);
              const optCategory = typeof opt === 'object' ? opt.category || opt.badge : null;
              const isSelected = optValue === value;

              return (
                <div
                  key={idx}
                  role="option"
                  aria-selected={isSelected}
                  className={`custom-select-option ${isSelected ? 'selected' : ''} ${idx === activeIndex ? 'active' : ''}`}
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
