/**
 * CLIENT MODEL - RealEstateCRM Pro
 * Complete client data structure with qualifications
 * Supports multi-tenant architecture
 */

// Client relationship status options
export const RELATIONSHIP_STATUS = {
  SINGLE: 'single',
  MARRIED: 'married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed',
  PARTNERSHIP: 'partnership'
};

// Client source options
export const CLIENT_SOURCE = {
  WEBSITE: 'website',
  REFERRAL: 'referral',
  SOCIAL: 'social',
  COLDCALL: 'coldcall',
  WALKIN: 'walkin',
  ADVERTISEMENT: 'advertisement',
  OTHER: 'other'
};

// Qualification types
export const QUALIFICATION_TYPES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  LANDLORD: 'landlord',
  TENANT: 'tenant',
  INVESTOR: 'investor',
  DEVELOPER: 'developer',
  PROPERTY_MANAGER: 'propertyManager'
};

// Client tags
export const CLIENT_TAGS = {
  HOT: 'hot',
  WARM: 'warm',
  COLD: 'cold',
  VIP: 'vip',
  PROBLEMATIC: 'problematic',
  INACTIVE: 'inactive',
  PRIORITY: 'priority'
};

// Client category based on score
export const CLIENT_CATEGORY = {
  A: 'A', // High value (80-100 score)
  B: 'B', // Medium value (50-79 score)
  C: 'C'  // Low value (0-49 score)
};

// Preferred contact methods
export const CONTACT_PREFERENCE = {
  PHONE: 'phone',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  SMS: 'sms',
  INPERSON: 'inperson'
};

/**
 * Create a new client object with defaults
 */
export function createClientData(data = {}) {
  return {
    // Basic Info (Quick Add)
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || '',
    
    // Personal Identification
    ccNumber: data.ccNumber || '',
    ccExpiryDate: data.ccExpiryDate || null,
    nif: data.nif || '',
    dateOfBirth: data.dateOfBirth || null,
    birthPlace: data.birthPlace || {
      city: '',
      country: 'Portugal'
    },
    naturality: data.naturality || '',
    nationality: data.nationality || 'Portuguesa',
    
    // Complete Address
    address: data.address || {
      street: '',
      number: '',
      floor: '',
      side: '',
      postalCode: '',
      city: '',
      parish: '',
      municipality: '',
      district: '',
      country: 'Portugal'
    },
    
    // Contact & Professional
    alternativePhone: data.alternativePhone || '',
    whatsapp: data.whatsapp || data.phone || '',
    alternativeEmail: data.alternativeEmail || '',
    preferredContact: data.preferredContact || CONTACT_PREFERENCE.PHONE,
    occupation: data.occupation || '',
    company: data.company || '',
    annualIncome: data.annualIncome || 0,
    
    // Relationship & Spouse
    relationshipStatus: data.relationshipStatus || RELATIONSHIP_STATUS.SINGLE,
    spouse: data.spouse || null,
    
    // Financial
    hasCredit: data.hasCredit || false,
    creditApproved: data.creditApproved || false,
    creditAmount: data.creditAmount || 0,
    bank: data.bank || '',
    
    // Qualifications
    qualifications: data.qualifications || [],
    
    // Metadata
    source: data.source || CLIENT_SOURCE.OTHER,
    referredBy: data.referredBy || '',
    tags: data.tags || [],
    clientScore: data.clientScore || {
      engagement: 0,
      financial: 0,
      urgency: 0,
      overall: 0,
      category: CLIENT_CATEGORY.C
    },
    notes: data.notes || '',
    
    // System fields
    consultantId: data.consultantId || '',
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    lastContactedAt: data.lastContactedAt || null,
    nextFollowUp: data.nextFollowUp || null,
    isDeleted: false,
    isActive: true
  };
}

/**
 * Create spouse data structure
 */
export function createSpouseData(data = {}) {
  return {
    name: data.name || '',
    ccNumber: data.ccNumber || '',
    ccExpiryDate: data.ccExpiryDate || null,
    nif: data.nif || '',
    dateOfBirth: data.dateOfBirth || null,
    nationality: data.nationality || 'Portuguesa',
    phone: data.phone || '',
    email: data.email || '',
    occupation: data.occupation || '',
    annualIncome: data.annualIncome || 0,
    isAlsoClient: data.isAlsoClient || false,
    linkedClientId: data.linkedClientId || null
  };
}

/**
 * Create a qualification
 */
export function createQualification(type, preferences = {}) {
  const baseQualification = {
    id: generateQualificationId(),
    type,
    active: true,
    createdAt: new Date(),
    opportunityId: null,
    preferences: {}
  };

  // Add type-specific preferences
  switch (type) {
    case QUALIFICATION_TYPES.BUYER:
      baseQualification.preferences = {
        budgetMin: preferences.budgetMin || 0,
        budgetMax: preferences.budgetMax || 0,
        propertyTypes: preferences.propertyTypes || [],
        locations: preferences.locations || [],
        features: preferences.features || [],
        urgency: preferences.urgency || 'exploring',
        financing: preferences.financing || 'mortgage',
        financingApproved: preferences.financingApproved || false,
        viewingAvailability: preferences.viewingAvailability || []
      };
      break;
      
    case QUALIFICATION_TYPES.SELLER:
      baseQualification.preferences = {
        propertyToSell: preferences.propertyToSell || null,
        askingPrice: preferences.askingPrice || 0,
        minimumPrice: preferences.minimumPrice || 0,
        reasonForSelling: preferences.reasonForSelling || '',
        timeline: preferences.timeline || '3months',
        currentMortgage: preferences.currentMortgage || 0,
        exclusivity: preferences.exclusivity || false
      };
      break;
      
    case QUALIFICATION_TYPES.TENANT:
      baseQualification.preferences = {
        rentalBudget: preferences.rentalBudget || 0,
        leaseDuration: preferences.leaseDuration || '12months',
        moveInDate: preferences.moveInDate || null,
        petFriendly: preferences.petFriendly || false,
        parkingRequired: preferences.parkingRequired || false,
        furnishedRequired: preferences.furnishedRequired || false
      };
      break;
      
    case QUALIFICATION_TYPES.LANDLORD:
      baseQualification.preferences = {
        properties: preferences.properties || [],
        expectedRent: preferences.expectedRent || 0,
        managementRequired: preferences.managementRequired || false,
        petPolicy: preferences.petPolicy || 'negotiable',
        preferredTenantType: preferences.preferredTenantType || 'any'
      };
      break;
      
    case QUALIFICATION_TYPES.INVESTOR:
      baseQualification.preferences = {
        investmentBudget: preferences.investmentBudget || 0,
        investmentGoals: preferences.investmentGoals || [],
        roiExpectation: preferences.roiExpectation || 0,
        riskTolerance: preferences.riskTolerance || 'medium',
        investmentHorizon: preferences.investmentHorizon || 'longterm',
        propertyTypes: preferences.propertyTypes || [],
        locations: preferences.locations || []
      };
      break;
      
    case QUALIFICATION_TYPES.DEVELOPER:
      baseQualification.preferences = {
        developmentBudget: preferences.developmentBudget || 0,
        projectTypes: preferences.projectTypes || [],
        landRequired: preferences.landRequired || false,
        partnershipsOpen: preferences.partnershipsOpen || false,
        timeline: preferences.timeline || ''
      };
      break;
      
    case QUALIFICATION_TYPES.PROPERTY_MANAGER:
      baseQualification.preferences = {
        managementServices: preferences.managementServices || [],
        propertyTypes: preferences.propertyTypes || [],
        feeStructure: preferences.feeStructure || '',
        numberOfProperties: preferences.numberOfProperties || 0
      };
      break;
  }

  return baseQualification;
}

/**
 * Calculate client score
 */
export function calculateClientScore(client, interactions = []) {
  let engagementScore = 0;
  let financialScore = 0;
  let urgencyScore = 0;

  // Engagement Score (based on interactions)
  if (interactions.length > 0) {
    const recentInteractions = interactions.filter(i => {
      const daysSince = (Date.now() - new Date(i.date)) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length;
    
    engagementScore = Math.min(100, recentInteractions * 10);
  }

  // Financial Score (based on income and credit)
  if (client.annualIncome > 100000) financialScore += 40;
  else if (client.annualIncome > 50000) financialScore += 30;
  else if (client.annualIncome > 30000) financialScore += 20;
  else if (client.annualIncome > 20000) financialScore += 10;
  
  if (client.creditApproved) financialScore += 30;
  if (client.hasCredit) financialScore += 10;
  
  // Add spouse income if married
  if (client.spouse?.annualIncome) {
    financialScore += Math.min(20, client.spouse.annualIncome / 5000);
  }
  
  financialScore = Math.min(100, financialScore);

  // Urgency Score (based on qualifications)
  const activeQualifications = client.qualifications?.filter(q => q.active) || [];
  activeQualifications.forEach(qual => {
    if (qual.type === QUALIFICATION_TYPES.BUYER) {
      if (qual.preferences?.urgency === 'immediate') urgencyScore += 50;
      else if (qual.preferences?.urgency === '3months') urgencyScore += 30;
      else if (qual.preferences?.urgency === '6months') urgencyScore += 20;
      else if (qual.preferences?.urgency === 'year') urgencyScore += 10;
    }
  });
  
  urgencyScore = Math.min(100, urgencyScore);

  // Calculate overall score (weighted average)
  const overall = Math.round(
    (engagementScore * 0.3) + 
    (financialScore * 0.4) + 
    (urgencyScore * 0.3)
  );

  // Determine category
  let category = CLIENT_CATEGORY.C;
  if (overall >= 80) category = CLIENT_CATEGORY.A;
  else if (overall >= 50) category = CLIENT_CATEGORY.B;

  return {
    engagement: engagementScore,
    financial: financialScore,
    urgency: urgencyScore,
    overall,
    category
  };
}

/**
 * Validate client data
 */
export function validateClientData(client, isQuickAdd = false) {
  const errors = {};

  // Required fields for quick add
  if (!client.name || client.name.trim().length < 2) {
    errors.name = 'Nome é obrigatório (mínimo 2 caracteres)';
  }

  // If not quick add, validate more fields
  if (!isQuickAdd) {
    // Validate NIF if provided
    if (client.nif && !/^\d{9}$/.test(client.nif)) {
      errors.nif = 'NIF deve ter 9 dígitos';
    }

    // Validate CC number if provided
    if (client.ccNumber && !/^\d{8}$/.test(client.ccNumber.replace(/\s/g, ''))) {
      errors.ccNumber = 'Número do CC inválido';
    }

    // Validate email
    if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
      errors.email = 'Email inválido';
    }

    // Validate phone
    if (client.phone && !/^[+]?[\d\s()-]+$/.test(client.phone)) {
      errors.phone = 'Telefone inválido';
    }

    // Validate postal code
    if (client.address?.postalCode && !/^\d{4}-\d{3}$/.test(client.address.postalCode)) {
      errors.postalCode = 'Código postal deve ter formato XXXX-XXX';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Generate unique qualification ID
 */
function generateQualificationId() {
  return `qual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format client display name
 */
export function formatClientName(client) {
  if (!client) return '';
  
  let name = client.name;
  if (client.spouse?.name && client.relationshipStatus === RELATIONSHIP_STATUS.MARRIED) {
    name += ` & ${client.spouse.name}`;
  }
  
  return name;
}

/**
 * Get qualification label
 */
export function getQualificationLabel(type) {
  const labels = {
    [QUALIFICATION_TYPES.BUYER]: 'Comprador',
    [QUALIFICATION_TYPES.SELLER]: 'Vendedor',
    [QUALIFICATION_TYPES.LANDLORD]: 'Senhorio',
    [QUALIFICATION_TYPES.TENANT]: 'Inquilino',
    [QUALIFICATION_TYPES.INVESTOR]: 'Investidor',
    [QUALIFICATION_TYPES.DEVELOPER]: 'Promotor',
    [QUALIFICATION_TYPES.PROPERTY_MANAGER]: 'Gestor de Propriedades'
  };
  
  return labels[type] || type;
}

/**
 * Get tag color
 */
export function getTagColor(tag) {
  const colors = {
    [CLIENT_TAGS.HOT]: 'red',
    [CLIENT_TAGS.WARM]: 'orange',
    [CLIENT_TAGS.COLD]: 'blue',
    [CLIENT_TAGS.VIP]: 'purple',
    [CLIENT_TAGS.PROBLEMATIC]: 'gray',
    [CLIENT_TAGS.INACTIVE]: 'gray',
    [CLIENT_TAGS.PRIORITY]: 'green'
  };
  
  return colors[tag] || 'gray';
}

export default {
  RELATIONSHIP_STATUS,
  CLIENT_SOURCE,
  QUALIFICATION_TYPES,
  CLIENT_TAGS,
  CLIENT_CATEGORY,
  CONTACT_PREFERENCE,
  createClientData,
  createSpouseData,
  createQualification,
  calculateClientScore,
  validateClientData,
  formatClientName,
  getQualificationLabel,
  getTagColor
};