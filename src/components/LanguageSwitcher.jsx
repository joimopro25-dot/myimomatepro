/**
 * LANGUAGE SWITCHER COMPONENT - RealEstateCRM Pro
 * Component for switching between available languages
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

export default function LanguageSwitcher({ variant = 'dropdown', className = '' }) {
  const { 
    language, 
    languages, 
    changeLanguage, 
    toggleLanguage,
    isChanging,
    currentLanguage 
  } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Render based on variant
  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleLanguage}
        disabled={isChanging}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        title={`Switch to ${languages.find(l => l.code !== language)?.name}`}
      >
        <span className="text-xl">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguage.code.toUpperCase()}
        </span>
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            disabled={isChanging || lang.code === language}
            className={`
              flex items-center space-x-1 px-3 py-1.5 rounded-md
              transition-all duration-200
              ${lang.code === language 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }
              disabled:cursor-not-allowed
            `}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm font-medium">
              {lang.code.toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <LanguageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <span className="text-xl">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguage.name}
        </span>
        <ChevronDownIcon 
          className={`
            w-4 h-4 text-gray-400 transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className={`
          absolute right-0 mt-2 w-48 py-1
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          rounded-lg shadow-lg
          z-50
        `}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              disabled={isChanging}
              className={`
                w-full flex items-center justify-between px-4 py-2
                hover:bg-gray-50 dark:hover:bg-gray-700
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {lang.name}
                </span>
              </div>
              {lang.code === language && (
                <CheckIcon className="w-4 h-4 text-primary-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Mini version for tight spaces
export function LanguageSwitcherMini({ className = '' }) {
  const { toggleLanguage, currentLanguage, isChanging } = useLanguage();
  
  return (
    <button
      onClick={toggleLanguage}
      disabled={isChanging}
      className={`
        p-2 rounded-lg
        hover:bg-gray-100 dark:hover:bg-gray-800
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={currentLanguage.name}
    >
      <span className="text-xl">{currentLanguage.flag}</span>
    </button>
  );
}