/**
 * AGENT MODEL - MyImoMatePro
 * Manages external agents, partner agents, and self-representation
 */

// Agent Types
export const AGENT_TYPES = {
  EXTERNAL: 'external',      // Other agencies' agents
  PARTNER: 'partner',         // Frequent collaborators
  COMPETITOR: 'competitor',   // Competing agencies
  SELF: 'self',              // When you represent the seller
  OWNER: 'owner'             // FSBO - For Sale By Owner
};

// Relationship Quality
export const RELATIONSHIP_QUALITY = {
  EXCELLENT: { value: 'excellent', label: 'Excelente', color: 'green' },
  GOOD: { value: 'good', label: 'Boa', color: 'blue' },
  NEUTRAL: { value: 'neutral', label: 'Neutra', color: 'gray' },
  DIFFICULT: { value: 'difficult', label: 'Difícil', color: 'red' }
};

// Response Time Categories
export const RESPONSE_TIMES = {
  IMMEDIATE: { value: 'immediate', label: 'Imediato', hours: 1 },
  FAST: { value: 'fast', label: 'Rápido', hours: 4 },
  NORMAL: { value: 'normal', label: 'Normal', hours: 24 },
  SLOW: { value: 'slow', label: 'Lento', hours: 48 }
};

// Communication Preferences
export const COMMUNICATION_PREFERENCES = {
  PHONE: { value: 'phone', label: 'Telefone', icon: 'PhoneIcon' },
  WHATSAPP: { value: 'whatsapp', label: 'WhatsApp', icon: 'WhatsAppIcon' },
  EMAIL: { value: 'email', label: 'Email', icon: 'EmailIcon' },
  SMS: { value: 'sms', label: 'SMS', icon: 'MessageIcon' },
  IN_PERSON: { value: 'in_person', label: 'Presencial', icon: 'UserIcon' }
};

// Commission Types
export const COMMISSION_TYPES = {
  PERCENTAGE: { value: 'percentage', label: 'Percentagem', symbol: '%' },
  FIXED: { value: 'fixed', label: 'Valor Fixo', symbol: '€' },
  NEGOTIABLE: { value: 'negotiable', label: 'Negociável', symbol: '' }
};

/**
 * Agent Model Schema
 */
export const AgentSchema = {
  // Basic Information
  id: '',
  name: '',
  agency: '',
  licenseNumber: '', // Professional license
  type: AGENT_TYPES.EXTERNAL,
  
  // Contact Information
  contactInfo: {
    phonePrimary: '',
    phoneSecondary: '',
    whatsapp: '',
    email: '',
    officePhone: '',
    website: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      area: ''
    }
  },
  
  // Professional Details
  professional: {
    workingAreas: [], // ["Lisboa", "Cascais", "Sintra"]
    specializations: [], // ["luxury", "apartments", "commercial"]
    yearsExperience: 0,
    languages: ['portuguese'], // Languages spoken
    certifications: [], // Additional certifications
    averageDealSize: 0,
    totalPropertiesListed: 0
  },
  
  // Relationship Management
  relationship: {
    quality: RELATIONSHIP_QUALITY.NEUTRAL.value,
    firstContactDate: null,
    lastContactDate: null,
    totalDealsTogeter: 0,
    activeDeals: 0,
    successfulDeals: 0,
    failedDeals: 0,
    successRate: 0, // Calculated: (successful/total) * 100
    preferredCommunication: COMMUNICATION_PREFERENCES.WHATSAPP.value,
    responseTime: RESPONSE_TIMES.NORMAL.value,
    notes: '',
    tags: [] // ["reliable", "tough negotiator", "flexible"]
  },
  
  // Commission Structure
  commission: {
    type: COMMISSION_TYPES.PERCENTAGE.value,
    standardRate: 2.5, // Standard commission percentage
    negotiableRange: {
      min: 2.0,
      max: 3.0
    },
    lastNegotiated: null,
    splitAgreement: '50/50', // How commission is split
    notes: '',
    historicalRates: [] // Track past commission rates
  },
  
  // Performance Metrics
  metrics: {
    averageResponseTime: 0, // in hours
    averageDaysToClose: 0,
    averagePriceReduction: 0, // % from asking price
    viewingConversionRate: 0, // viewings that lead to offers
    offerAcceptanceRate: 0, // offers that get accepted
    clientSatisfactionScore: 0, // 1-5 rating
    lastUpdated: null
  },
  
  // Interaction History
  interactions: [], // Array of interaction records
  
  // Administrative
  status: 'active', // active, inactive, blacklisted
  createdAt: null,
  createdBy: '',
  updatedAt: null,
  updatedBy: '',
  consultantId: '', // Which consultant manages this agent relationship
};

/**
 * Interaction Record Schema
 */
export const InteractionSchema = {
  id: '',
  date: null,
  type: '', // phone, email, meeting, whatsapp, viewing
  subject: '',
  propertyRef: '', // If related to specific property
  dealRef: '', // If related to specific deal
  duration: 0, // in minutes for calls/meetings
  outcome: '', // positive, neutral, negative
  notes: '',
  followUpRequired: false,
  followUpDate: null,
  attachments: [] // Email attachments, documents
};

/**
 * Helper Functions
 */

// Calculate agent's success rate
export const calculateSuccessRate = (agent) => {
  const total = agent.relationship.successfulDeals + agent.relationship.failedDeals;
  if (total === 0) return 0;
  return Math.round((agent.relationship.successfulDeals / total) * 100);
};

// Determine agent reliability score
export const calculateReliabilityScore = (agent) => {
  let score = 0;
  
  // Response time (max 30 points)
  switch (agent.relationship.responseTime) {
    case RESPONSE_TIMES.IMMEDIATE.value: score += 30; break;
    case RESPONSE_TIMES.FAST.value: score += 20; break;
    case RESPONSE_TIMES.NORMAL.value: score += 10; break;
    case RESPONSE_TIMES.SLOW.value: score += 5; break;
  }
  
  // Success rate (max 40 points)
  const successRate = calculateSuccessRate(agent);
  score += Math.round(successRate * 0.4);
  
  // Relationship quality (max 30 points)
  switch (agent.relationship.quality) {
    case RELATIONSHIP_QUALITY.EXCELLENT.value: score += 30; break;
    case RELATIONSHIP_QUALITY.GOOD.value: score += 20; break;
    case RELATIONSHIP_QUALITY.NEUTRAL.value: score += 10; break;
    case RELATIONSHIP_QUALITY.DIFFICULT.value: score += 0; break;
  }
  
  return score;
};

// Get agent rating (A, B, C)
export const getAgentRating = (agent) => {
  const score = calculateReliabilityScore(agent);
  if (score >= 70) return 'A';
  if (score >= 40) return 'B';
  return 'C';
};

// Format commission display
export const formatCommission = (commission) => {
  if (commission.type === COMMISSION_TYPES.PERCENTAGE.value) {
    return `${commission.standardRate}%`;
  } else if (commission.type === COMMISSION_TYPES.FIXED.value) {
    return `€${commission.standardRate.toLocaleString('pt-PT')}`;
  }
  return 'Negociável';
};

// Check if agent is high-performer
export const isHighPerformer = (agent) => {
  return (
    agent.relationship.quality === RELATIONSHIP_QUALITY.EXCELLENT.value &&
    calculateSuccessRate(agent) >= 75 &&
    agent.relationship.responseTime !== RESPONSE_TIMES.SLOW.value
  );
};

// Get agent badge/tags
export const getAgentBadges = (agent) => {
  const badges = [];
  
  if (isHighPerformer(agent)) {
    badges.push({ label: 'Top Performer', color: 'gold' });
  }
  
  if (agent.relationship.totalDealsTogeter >= 10) {
    badges.push({ label: 'Parceiro Frequente', color: 'blue' });
  }
  
  if (agent.relationship.responseTime === RESPONSE_TIMES.IMMEDIATE.value) {
    badges.push({ label: 'Resposta Rápida', color: 'green' });
  }
  
  if (agent.professional.yearsExperience >= 10) {
    badges.push({ label: 'Veterano', color: 'purple' });
  }
  
  return badges;
};

// Create new agent object
export const createNewAgent = (initialData = {}) => {
  return {
    ...AgentSchema,
    ...initialData,
    id: initialData.id || `agent_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    relationship: {
      ...AgentSchema.relationship,
      ...initialData.relationship,
      firstContactDate: new Date()
    },
    metrics: {
      ...AgentSchema.metrics,
      lastUpdated: new Date()
    }
  };
};

// Validate agent data
export const validateAgent = (agent) => {
  const errors = [];
  
  if (!agent.name || agent.name.trim().length < 2) {
    errors.push('Nome do agente é obrigatório');
  }
  
  if (!agent.contactInfo.phonePrimary && !agent.contactInfo.email) {
    errors.push('Pelo menos um contato (telefone ou email) é obrigatório');
  }
  
  if (agent.commission.type === COMMISSION_TYPES.PERCENTAGE.value) {
    if (agent.commission.standardRate < 0 || agent.commission.standardRate > 10) {
      errors.push('Comissão deve estar entre 0% e 10%');
    }
  }
  
  return errors;
};

// Search/filter agents
export const filterAgents = (agents, filters) => {
  return agents.filter(agent => {
    // Status filter
    if (filters.status && agent.status !== filters.status) return false;
    
    // Type filter
    if (filters.type && agent.type !== filters.type) return false;
    
    // Area filter
    if (filters.area && !agent.professional.workingAreas.includes(filters.area)) return false;
    
    // Quality filter
    if (filters.quality && agent.relationship.quality !== filters.quality) return false;
    
    // Search term
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      return (
        agent.name.toLowerCase().includes(search) ||
        agent.agency?.toLowerCase().includes(search) ||
        agent.contactInfo.email?.toLowerCase().includes(search) ||
        agent.contactInfo.phonePrimary?.includes(search)
      );
    }
    
    return true;
  });
};

// Sort agents
export const sortAgents = (agents, sortBy = 'name', order = 'asc') => {
  return [...agents].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'successRate':
        aValue = calculateSuccessRate(a);
        bValue = calculateSuccessRate(b);
        break;
      case 'totalDeals':
        aValue = a.relationship.totalDealsTogeter;
        bValue = b.relationship.totalDealsTogeter;
        break;
      case 'responseTime':
        aValue = Object.values(RESPONSE_TIMES).findIndex(rt => rt.value === a.relationship.responseTime);
        bValue = Object.values(RESPONSE_TIMES).findIndex(rt => rt.value === b.relationship.responseTime);
        break;
      case 'lastContact':
        aValue = a.relationship.lastContactDate || new Date(0);
        bValue = b.relationship.lastContactDate || new Date(0);
        break;
      default:
        aValue = a[sortBy];
        bValue = b[sortBy];
    }
    
    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};