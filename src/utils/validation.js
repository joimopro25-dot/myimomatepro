/**
 * VALIDATION UTILITIES - RealEstateCRM Pro
 * Comprehensive validation and sanitization functions
 * Includes Portuguese-specific validations
 */

/**
 * Email validation
 */
export const validateEmail = (email) => {
  if (!email) return { valid: false, error: 'Email é obrigatório' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = emailRegex.test(email);
  
  return {
    valid,
    error: valid ? null : 'Email inválido'
  };
};

/**
 * Portuguese phone number validation
 * Accepts: +351 XXX XXX XXX, 9XXXXXXXX, etc.
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) return { valid: true }; // Phone is optional
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Portuguese phone patterns
  const patterns = [
    /^(\+351)?9[1236]\d{7}$/,  // Mobile
    /^(\+351)?2[12]\d{7}$/,     // Fixed Lisbon/Porto
    /^(\+351)?2[3-9]\d{7}$/      // Fixed other regions
  ];
  
  const valid = patterns.some(pattern => pattern.test(cleaned));
  
  return {
    valid,
    error: valid ? null : 'Número de telefone inválido',
    formatted: formatPhoneNumber(cleaned)
  };
};

/**
 * Format Portuguese phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Add +351 if not present
  const withCountry = cleaned.startsWith('351') 
    ? cleaned 
    : cleaned.length === 9 
      ? '351' + cleaned 
      : cleaned;
  
  // Format as +351 XXX XXX XXX
  if (withCountry.length === 12) {
    return `+${withCountry.slice(0, 3)} ${withCountry.slice(3, 6)} ${withCountry.slice(6, 9)} ${withCountry.slice(9)}`;
  }
  
  return phone;
};

/**
 * Portuguese NIF (Tax ID) validation
 */
export const validateNIF = (nif) => {
  if (!nif) return { valid: true }; // NIF is optional
  
  const cleaned = nif.replace(/\D/g, '');
  
  // Must be 9 digits
  if (cleaned.length !== 9) {
    return { 
      valid: false, 
      error: 'NIF deve ter 9 dígitos' 
    };
  }
  
  // First digit must be 1, 2, 3, 5, 6, 8 or 9
  const validFirstDigits = ['1', '2', '3', '5', '6', '8', '9'];
  if (!validFirstDigits.includes(cleaned[0])) {
    return { 
      valid: false, 
      error: 'NIF inválido' 
    };
  }
  
  // Validate check digit (Portuguese NIF algorithm)
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(cleaned[i]) * (9 - i);
  }
  
  const checkDigit = 11 - (sum % 11);
  const expectedDigit = checkDigit >= 10 ? 0 : checkDigit;
  
  const valid = parseInt(cleaned[8]) === expectedDigit;
  
  return {
    valid,
    error: valid ? null : 'NIF inválido'
  };
};

/**
 * Portuguese postal code validation
 * Format: XXXX-XXX
 */
export const validatePostalCode = (postalCode) => {
  if (!postalCode) return { valid: true }; // Optional
  
  const pattern = /^\d{4}-\d{3}$/;
  const valid = pattern.test(postalCode);
  
  return {
    valid,
    error: valid ? null : 'Código postal inválido (formato: XXXX-XXX)'
  };
};

/**
 * Format postal code
 */
export const formatPostalCode = (postalCode) => {
  if (!postalCode) return '';
  
  const cleaned = postalCode.replace(/\D/g, '');
  
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  
  return postalCode;
};

/**
 * Password validation
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { valid: false, errors: ['Password é obrigatória'] };
  }
  
  if (password.length < 6) {
    errors.push('Mínimo 6 caracteres');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Deve conter pelo menos um número');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Deve conter pelo menos uma letra maiúscula');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Name validation
 */
export const validateName = (name, minLength = 2) => {
  if (!name) {
    return { valid: false, error: 'Nome é obrigatório' };
  }
  
  if (name.trim().length < minLength) {
    return { 
      valid: false, 
      error: `Nome deve ter pelo menos ${minLength} caracteres` 
    };
  }
  
  // Check for invalid characters
  const validNamePattern = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!validNamePattern.test(name)) {
    return { 
      valid: false, 
      error: 'Nome contém caracteres inválidos' 
    };
  }
  
  return { valid: true };
};

/**
 * Currency/Money validation
 */
export const validateCurrency = (value, min = 0, max = null) => {
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return { valid: false, error: 'Valor inválido' };
  }
  
  if (numValue < min) {
    return { 
      valid: false, 
      error: `Valor mínimo: €${min}` 
    };
  }
  
  if (max !== null && numValue > max) {
    return { 
      valid: false, 
      error: `Valor máximo: €${max}` 
    };
  }
  
  return { 
    valid: true,
    formatted: formatCurrency(numValue)
  };
};

/**
 * Format currency
 */
export const formatCurrency = (value) => {
  if (value === 'unlimited') return 'Ilimitado';
  
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Date validation
 */
export const validateDate = (date, minDate = null, maxDate = null) => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Data inválida' };
  }
  
  if (minDate && dateObj < new Date(minDate)) {
    return { 
      valid: false, 
      error: `Data deve ser após ${formatDate(minDate)}` 
    };
  }
  
  if (maxDate && dateObj > new Date(maxDate)) {
    return { 
      valid: false, 
      error: `Data deve ser antes de ${formatDate(maxDate)}` 
    };
  }
  
  return { valid: true };
};

/**
 * Format date
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return new Intl.DateTimeFormat('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Format date time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return new Intl.DateTimeFormat('pt-PT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * URL validation
 */
export const validateURL = (url) => {
  if (!url) return { valid: true }; // Optional
  
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { 
      valid: false, 
      error: 'URL inválido' 
    };
  }
};

/**
 * Sanitize input (remove dangerous characters)
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate required fields
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors[field] = `${field} é obrigatório`;
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate form data with multiple rules
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    // Check required
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = rule.message || `${field} é obrigatório`;
      return;
    }
    
    // Skip validation if field is optional and empty
    if (!rule.required && !value) {
      return;
    }
    
    // Check custom validator
    if (rule.validator) {
      const result = rule.validator(value);
      if (!result.valid) {
        errors[field] = result.error || rule.message || `${field} inválido`;
      }
    }
    
    // Check min length
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `Mínimo ${rule.minLength} caracteres`;
    }
    
    // Check max length
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `Máximo ${rule.maxLength} caracteres`;
    }
    
    // Check pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} formato inválido`;
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Debounce function for input validation
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Export all validators as a single object
 */
export const validators = {
  email: validateEmail,
  phone: validatePhoneNumber,
  nif: validateNIF,
  postalCode: validatePostalCode,
  password: validatePassword,
  name: validateName,
  currency: validateCurrency,
  date: validateDate,
  url: validateURL,
  required: (value) => ({
    valid: !!value && value.toString().trim() !== '',
    error: 'Campo obrigatório'
  })
};

/**
 * Export all formatters as a single object
 */
export const formatters = {
  phone: formatPhoneNumber,
  postalCode: formatPostalCode,
  currency: formatCurrency,
  date: formatDate,
  dateTime: formatDateTime,
  sanitize: sanitizeInput
};