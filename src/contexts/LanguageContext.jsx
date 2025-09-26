/**
 * LANGUAGE CONTEXT - RealEstateCRM Pro
 * Context for managing language state and i18n throughout the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n, { 
  t, 
  setLanguage as setI18nLanguage, 
  getLanguage,
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
  plural
} from '../i18n';

// Create context
const LanguageContext = createContext();

// Custom hook for using language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Language provider component
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => getLanguage());
  const [isChanging, setIsChanging] = useState(false);

  // Available languages with metadata
  const languages = [
    {
      code: 'pt',
      name: 'Português',
      flag: '🇵🇹',
      locale: 'pt-PT'
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇬🇧',
      locale: 'en-US'
    }
  ];

  // Change language
  const changeLanguage = async (newLanguage) => {
    if (newLanguage === language) return;
    
    setIsChanging(true);
    
    try {
      // Update i18n
      setI18nLanguage(newLanguage);
      
      // Update state
      setLanguageState(newLanguage);
      
      // Update document language attribute
      document.documentElement.lang = newLanguage;
      
      // Notify user (optional)
      console.log(`Language changed to: ${newLanguage}`);
      
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  // Toggle between languages
  const toggleLanguage = () => {
    const currentIndex = languages.findIndex(l => l.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    changeLanguage(languages[nextIndex].code);
  };

  // Get current language info
  const getCurrentLanguage = () => {
    return languages.find(l => l.code === language) || languages[0];
  };

  // Set document language on mount
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Subscribe to language changes from i18n
  useEffect(() => {
    const unsubscribe = i18n.onLanguageChange((newLang) => {
      setLanguageState(newLang);
    });

    return unsubscribe;
  }, []);

  // Context value
  const value = {
    // Current language
    language,
    currentLanguage: getCurrentLanguage(),
    languages,
    
    // Language change functions
    changeLanguage,
    toggleLanguage,
    isChanging,
    
    // Translation functions
    t,
    translate: t, // Alias
    
    // Formatting functions
    formatCurrency,
    formatDate,
    formatNumber,
    formatRelativeTime,
    plural,
    
    // Helper functions
    isPortuguese: () => language === 'pt',
    isEnglish: () => language === 'en',
    
    // Format with current locale
    formatters: {
      currency: (amount, currency = 'EUR') => formatCurrency(amount, currency),
      date: (date, options) => formatDate(date, options),
      number: (number, options) => formatNumber(number, options),
      relativeTime: (date) => formatRelativeTime(date),
      percentage: (value) => formatNumber(value / 100, { style: 'percent' })
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// HOC for components that need language
export function withLanguage(Component) {
  return function WrappedComponent(props) {
    const languageProps = useLanguage();
    return <Component {...props} {...languageProps} />;
  };
}

export default LanguageContext;