/**
 * i18n CONFIGURATION - RealEstateCRM Pro
 * Internationalization system for PT/EN support
 * Simple implementation without external dependencies
 */

import ptTranslations from './translations/pt';
import enTranslations from './translations/en';

class I18n {
  constructor() {
    this.translations = {
      pt: ptTranslations,
      en: enTranslations
    };
    
    // Default language
    this.currentLanguage = this.getStoredLanguage() || 'pt';
    
    // Fallback language
    this.fallbackLanguage = 'pt';
    
    // Listeners for language changes
    this.listeners = [];
  }

  /**
   * Get stored language preference
   */
  getStoredLanguage() {
    try {
      return localStorage.getItem('crm_language') || null;
    } catch {
      return null;
    }
  }

  /**
   * Set and store language preference
   */
  setLanguage(language) {
    if (!this.translations[language]) {
      console.warn(`Language ${language} not available, falling back to ${this.fallbackLanguage}`);
      language = this.fallbackLanguage;
    }
    
    this.currentLanguage = language;
    
    try {
      localStorage.setItem('crm_language', language);
    } catch (error) {
      console.error('Failed to store language preference:', error);
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(language));
  }

  /**
   * Get current language
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }

  /**
   * Translate a key
   * Supports nested keys with dot notation: 'nav.dashboard'
   */
  t(key, params = {}) {
    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];
    
    // Navigate through nested object
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        translation = undefined;
        break;
      }
    }
    
    // Fallback to fallback language if not found
    if (translation === undefined && this.currentLanguage !== this.fallbackLanguage) {
      translation = this.translations[this.fallbackLanguage];
      for (const k of keys) {
        if (translation && typeof translation === 'object') {
          translation = translation[k];
        } else {
          translation = undefined;
          break;
        }
      }
    }
    
    // If still not found, return the key
    if (translation === undefined) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    // Replace parameters in translation
    // Example: "Welcome {{name}}" with params = { name: 'John' }
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return this.interpolate(translation, params);
    }
    
    return translation;
  }

  /**
   * Interpolate parameters in translation string
   */
  interpolate(str, params) {
    let result = str;
    
    Object.keys(params).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, params[key]);
    });
    
    return result;
  }

  /**
   * Format number according to locale
   */
  formatNumber(number, options = {}) {
    const locale = this.currentLanguage === 'pt' ? 'pt-PT' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  }

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'EUR') {
    const locale = this.currentLanguage === 'pt' ? 'pt-PT' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format date
   */
  formatDate(date, options = {}) {
    const locale = this.currentLanguage === 'pt' ? 'pt-PT' : 'en-US';
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  }

  /**
   * Format relative time (e.g., "3 days ago")
   */
  formatRelativeTime(date) {
    const locale = this.currentLanguage === 'pt' ? 'pt-PT' : 'en-US';
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    if (diffDays > 0) {
      return rtf.format(-diffDays, 'day');
    } else if (diffHours > 0) {
      return rtf.format(-diffHours, 'hour');
    } else if (diffMins > 0) {
      return rtf.format(-diffMins, 'minute');
    } else {
      return rtf.format(-diffSecs, 'second');
    }
  }

  /**
   * Subscribe to language changes
   */
  onLanguageChange(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Get translation for plurals
   */
  plural(key, count, params = {}) {
    const translation = this.t(key);
    
    if (typeof translation === 'object') {
      let pluralKey;
      
      if (count === 0 && translation.zero) {
        pluralKey = 'zero';
      } else if (count === 1) {
        pluralKey = 'one';
      } else {
        pluralKey = 'other';
      }
      
      const pluralTranslation = translation[pluralKey] || translation.other || key;
      return this.interpolate(pluralTranslation, { count, ...params });
    }
    
    return this.interpolate(translation, { count, ...params });
  }

  /**
   * Check if translation exists
   */
  exists(key) {
    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        return false;
      }
    }
    
    return translation !== undefined;
  }
}

// Create and export singleton instance
const i18n = new I18n();

// Helper functions for easier access
export const t = (key, params) => i18n.t(key, params);
export const setLanguage = (language) => i18n.setLanguage(language);
export const getLanguage = () => i18n.getLanguage();
export const formatCurrency = (amount, currency) => i18n.formatCurrency(amount, currency);
export const formatDate = (date, options) => i18n.formatDate(date, options);
export const formatNumber = (number, options) => i18n.formatNumber(number, options);
export const formatRelativeTime = (date) => i18n.formatRelativeTime(date);
export const plural = (key, count, params) => i18n.plural(key, count, params);
export const onLanguageChange = (callback) => i18n.onLanguageChange(callback);

export default i18n;