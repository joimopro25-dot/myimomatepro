/**
 * CLIENT MODEL - MyImoMatePro
 * Data structure and validation for clients
 * Each client belongs to a specific consultant
 */

// Client data structure
export const createClientModel = (consultantId) => ({
  // Ownership - CRITICAL FOR DATA ISOLATION
  consultantId: consultantId, // Links client to specific consultant
  
  // Core Information
  name: '',
  phone: '',
  email: '',
  nif: '',
  contactPreference: 'phone', // phone | email | whatsapp
  bestContactTime: '',
  
  // Personal Details
  birthDate: null,
  birthPlace: '',
  cc: '',
  ccValidity: null,
  profession: '',
  maritalStatus: 'single', // single | married | divorced | widow | union
  marriageRegime: '', // only if married/union
  
  // Address
  address: {
    street: '',
    postalCode: '',
    city: ''
  },
  
  // Spouse Information (only if married/union)
  spouse: {
    name: '',
    phone: '',
    email: '',
    nif: '',
    cc: '',
    ccValidity: null,
    birthDate: null,
    birthPlace: '',
    profession: ''
  },
  
  // Financial Qualification
  financial: {
    monthlyIncome: 0,
    spouseMonthlyIncome: 0,
    totalHousehold: 0, // auto-calculated
    hasLoans: false,
    monthlyLoanPayments: 0,
    hasPreApproval: false,
    preApprovalBank: '',
    preApprovalAmount: 0
  },
  
  // Relationship Management
  leadSource: 'direct', // direct | referral | website | social | other
  tags: [], // ['hot', 'investor', 'first-timer', 'cash-buyer', etc.]
  nextContactDate: null,
  internalNotes: '',
  status: 'active', // active | inactive | archived
  
  // System fields
  gdprConsent: false,
  gdprConsentDate: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Validation rules
export const validateClient = (client) => {
  const errors = {};
  
  // Required fields
  if (!client.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!client.phone?.trim()) {
    errors.phone = 'Phone is required';
  }
  
  // Phone format validation (Portuguese)
  if (client.phone && !isValidPortuguesePhone(client.phone)) {
    errors.phone = 'Invalid phone format';
  }
  
  // Email validation
  if (client.email && !isValidEmail(client.email)) {
    errors.email = 'Invalid email format';
  }
  
  // NIF validation (Portuguese tax number)
  if (client.nif && !isValidNIF(client.nif)) {
    errors.nif = 'Invalid NIF format (9 digits required)';
  }
  
  // GDPR consent required
  if (!client.gdprConsent) {
    errors.gdprConsent = 'GDPR consent is required';
  }
  
  // Spouse NIF validation if provided
  if (client.spouse?.nif && !isValidNIF(client.spouse.nif)) {
    errors.spouseNif = 'Invalid spouse NIF format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper validation functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPortuguesePhone = (phone) => {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Portuguese phone: starts with 9 (mobile) or 2 (landline), 9 digits total
  // Or international format +351...
  const phoneRegex = /^(\+351)?[29]\d{8}$/;
  return phoneRegex.test(cleaned);
};

const isValidNIF = (nif) => {
  // Portuguese NIF: exactly 9 digits
  const cleaned = nif.replace(/\s/g, '');
  return /^\d{9}$/.test(cleaned);
};

// Format helpers
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `+351 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

export const formatNIF = (nif) => {
  const cleaned = nif.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return nif;
};

export const formatCC = (cc) => {
  const cleaned = cc.replace(/[\s\-]/g, '');
  if (cleaned.length >= 8) {
    // Format: 12345678 9 ZZ0
    return `${cleaned.slice(0, 8)} ${cleaned.slice(8, 9)} ${cleaned.slice(9)}`.trim();
  }
  return cc;
};

// Calculate age from birth date
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Calculate total household income
export const calculateTotalHousehold = (monthlyIncome, spouseIncome) => {
  const income = parseFloat(monthlyIncome) || 0;
  const spouse = parseFloat(spouseIncome) || 0;
  return income + spouse;
};

// Available options for dropdowns
export const CLIENT_OPTIONS = {
  contactPreference: [
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' }
  ],
  
  maritalStatus: [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widow', label: 'Widow(er)' },
    { value: 'union', label: 'Civil Union' }
  ],
  
  marriageRegime: [
    { value: 'communion', label: 'Communion of Property' },
    { value: 'separation', label: 'Separation of Property' },
    { value: 'acquired', label: 'Communion of Acquired Property' }
  ],
  
  leadSource: [
    { value: 'direct', label: 'Direct Contact' },
    { value: 'referral', label: 'Referral' },
    { value: 'website', label: 'Website' },
    { value: 'social', label: 'Social Media' },
    { value: 'other', label: 'Other' }
  ],
  
  tags: [
    'Hot Lead',
    'Investor',
    'First-time Buyer',
    'Cash Buyer',
    'Urgent',
    'Flexible Timeline',
    'Pre-approved',
    'Looking to Sell',
    'Looking to Buy',
    'Rental Interest'
  ],
  
  status: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ]
};

// Activity types for timeline
export const ACTIVITY_TYPES = {
  call: { icon: '📞', label: 'Phone Call' },
  email: { icon: '📧', label: 'Email' },
  whatsapp: { icon: '💬', label: 'WhatsApp' },
  meeting: { icon: '🤝', label: 'Meeting' },
  viewing: { icon: '🏠', label: 'Property Viewing' },
  note: { icon: '📝', label: 'Note' }
};

// Create activity record
export const createActivity = (type, note = '', consultantId) => ({
  type,
  note,
  timestamp: new Date(),
  createdBy: consultantId
});

export default {
  createClientModel,
  validateClient,
  formatPhone,
  formatNIF,
  formatCC,
  calculateAge,
  calculateTotalHousehold,
  CLIENT_OPTIONS,
  ACTIVITY_TYPES,
  createActivity
};