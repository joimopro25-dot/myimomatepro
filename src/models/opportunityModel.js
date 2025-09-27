/**
 * OPPORTUNITY MODEL - RealEstateCRM Pro
 * Auto-created opportunities from client qualifications
 * Supports multi-tenant architecture
 */

// Opportunity status options
export const OPPORTUNITY_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  LOST: 'lost',
  WON: 'won'
};

// Opportunity stages for different types
export const OPPORTUNITY_STAGES = {
  buyer: [
    'initial_contact',
    'needs_assessment',
    'property_search',
    'viewings',
    'offer_preparation',
    'negotiation',
    'contract',
    'financing',
    'closing'
  ],
  seller: [
    'initial_contact',
    'property_evaluation',
    'listing_preparation',
    'marketing',
    'showings',
    'offer_received',
    'negotiation',
    'contract',
    'closing'
  ],
  landlord: [
    'initial_contact',
    'property_preparation',
    'listing',
    'tenant_screening',
    'lease_negotiation',
    'contract_signing',
    'move_in'
  ],
  tenant: [
    'initial_contact',
    'requirements_gathering',
    'property_search',
    'viewings',
    'application',
    'approval',
    'lease_signing',
    'move_in'
  ],
  investor: [
    'initial_contact',
    'investment_analysis',
    'property_identification',
    'due_diligence',
    'financing_arrangement',
    'offer_submission',
    'negotiation',
    'closing',
    'property_management'
  ],
  developer: [
    'initial_contact',
    'project_assessment',
    'feasibility_study',
    'land_acquisition',
    'planning_approval',
    'financing',
    'construction',
    'marketing',
    'sales'
  ],
  propertyManager: [
    'initial_contact',
    'portfolio_assessment',
    'proposal',
    'contract_negotiation',
    'onboarding',
    'ongoing_management'
  ]
};

// Urgency levels
export const URGENCY_LEVELS = {
  IMMEDIATE: 'immediate',
  THREE_MONTHS: '3months',
  SIX_MONTHS: '6months',
  ONE_YEAR: 'year',
  EXPLORING: 'exploring'
};

// Financing types
export const FINANCING_TYPES = {
  CASH: 'cash',
  MORTGAGE: 'mortgage',
  BOTH: 'both',
  INVESTOR: 'investor',
  PRIVATE: 'private'
};

// Property types
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  VILLA: 'villa',
  TOWNHOUSE: 'townhouse',
  PENTHOUSE: 'penthouse',
  DUPLEX: 'duplex',
  STUDIO: 'studio',
  LAND: 'land',
  COMMERCIAL: 'commercial',
  OFFICE: 'office',
  WAREHOUSE: 'warehouse',
  RETAIL: 'retail',
  BUILDING: 'building',
  FARM: 'farm',
  OTHER: 'other'
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Create a new opportunity from a qualification
 */
export function createOpportunityFromQualification(client, qualification) {
  const baseOpportunity = {
    // Client info
    clientId: client.id,
    clientName: client.name,
    clientPhone: client.phone,
    clientEmail: client.email,
    
    // Qualification info
    qualificationType: qualification.type,
    qualificationId: qualification.id,
    
    // Auto-generated title
    title: generateOpportunityTitle(client.name, qualification.type),
    description: '',
    
    // Status and stage
    status: OPPORTUNITY_STATUS.ACTIVE,
    stage: OPPORTUNITY_STAGES[qualification.type]?.[0] || 'initial_contact',
    
    // Dates
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expectedCloseDate: calculateExpectedCloseDate(qualification),
    actualCloseDate: null,
    
    // Values and probability
    estimatedValue: 0,
    actualValue: 0,
    probability: calculateInitialProbability(qualification),
    commission: 0,
    commissionPercentage: getDefaultCommission(qualification.type),
    
    // Priority and scoring
    priority: PRIORITY_LEVELS.MEDIUM,
    score: calculateOpportunityScore(qualification),
    
    // Associated records
    deals: [],
    properties: [],
    tasks: [],
    notes: [],
    documents: [],
    
    // Tracking
    lastActivity: new Date().toISOString(),
    nextFollowUp: calculateNextFollowUp(),
    daysInStage: 0,
    totalDays: 0,
    
    // Flags
    isActive: true,
    isDeleted: false,
    isArchived: false
  };

  // Add type-specific data
  switch (qualification.type) {
    case 'buyer':
      return {
        ...baseOpportunity,
        buyerData: createBuyerData(qualification.preferences)
      };
    
    case 'seller':
      return {
        ...baseOpportunity,
        sellerData: createSellerData(qualification.preferences)
      };
    
    case 'landlord':
      return {
        ...baseOpportunity,
        landlordData: createLandlordData(qualification.preferences)
      };
    
    case 'tenant':
      return {
        ...baseOpportunity,
        tenantData: createTenantData(qualification.preferences)
      };
    
    case 'investor':
      return {
        ...baseOpportunity,
        investorData: createInvestorData(qualification.preferences)
      };
    
    case 'developer':
      return {
        ...baseOpportunity,
        developerData: createDeveloperData(qualification.preferences)
      };
    
    case 'propertyManager':
      return {
        ...baseOpportunity,
        propertyManagerData: createPropertyManagerData(qualification.preferences)
      };
    
    default:
      return baseOpportunity;
  }
}

/**
 * Create buyer-specific data
 */
function createBuyerData(preferences = {}) {
  return {
    budgetMin: preferences.budgetMin || 0,
    budgetMax: preferences.budgetMax || 0,
    propertyTypes: preferences.propertyTypes || [],
    locations: preferences.locations || [],
    features: preferences.features || [],
    bedrooms: preferences.bedrooms || { min: 1, max: null },
    bathrooms: preferences.bathrooms || { min: 1, max: null },
    area: preferences.area || { min: null, max: null },
    urgency: preferences.urgency || URGENCY_LEVELS.EXPLORING,
    financing: preferences.financing || FINANCING_TYPES.MORTGAGE,
    financingApproved: preferences.financingApproved || false,
    financingAmount: preferences.financingAmount || 0,
    downPayment: preferences.downPayment || 0,
    motivations: preferences.motivations || [],
    currentSituation: preferences.currentSituation || '',
    viewingAvailability: preferences.viewingAvailability || [],
    excludeGround: preferences.excludeGround || false,
    requiresParking: preferences.requiresParking || false,
    requiresElevator: preferences.requiresElevator || false,
    petFriendly: preferences.petFriendly || false
  };
}

/**
 * Create seller-specific data
 */
function createSellerData(preferences = {}) {
  return {
    propertyId: preferences.propertyId || null,
    propertyAddress: preferences.propertyAddress || '',
    propertyType: preferences.propertyType || '',
    askingPrice: preferences.askingPrice || 0,
    minimumPrice: preferences.minimumPrice || 0,
    reason: preferences.reason || '',
    timeline: preferences.timeline || URGENCY_LEVELS.THREE_MONTHS,
    currentMortgage: preferences.currentMortgage || 0,
    propertyCondition: preferences.propertyCondition || '',
    renovationsNeeded: preferences.renovationsNeeded || [],
    tenantOccupied: preferences.tenantOccupied || false,
    availableForViewings: preferences.availableForViewings || true,
    flexibleOnPrice: preferences.flexibleOnPrice || false,
    includesFurniture: preferences.includesFurniture || false,
    exclusiveContract: preferences.exclusiveContract || false,
    marketingPreferences: preferences.marketingPreferences || []
  };
}

/**
 * Create landlord-specific data
 */
function createLandlordData(preferences = {}) {
  return {
    propertyId: preferences.propertyId || null,
    propertyAddress: preferences.propertyAddress || '',
    propertyType: preferences.propertyType || '',
    monthlyRent: preferences.monthlyRent || 0,
    deposit: preferences.deposit || 0,
    leaseTerm: preferences.leaseTerm || '12months',
    availableFrom: preferences.availableFrom || null,
    petPolicy: preferences.petPolicy || 'no_pets',
    furnishing: preferences.furnishing || 'unfurnished',
    utilities: preferences.utilities || 'tenant_pays',
    tenantPreferences: preferences.tenantPreferences || [],
    requiredDocuments: preferences.requiredDocuments || [],
    propertyManagement: preferences.propertyManagement || false
  };
}

/**
 * Create tenant-specific data
 */
function createTenantData(preferences = {}) {
  return {
    budgetMin: preferences.budgetMin || 0,
    budgetMax: preferences.budgetMax || 1500,
    propertyTypes: preferences.propertyTypes || [],
    locations: preferences.locations || [],
    moveInDate: preferences.moveInDate || null,
    leaseTerm: preferences.leaseTerm || '12months',
    occupants: preferences.occupants || 1,
    pets: preferences.pets || [],
    employmentStatus: preferences.employmentStatus || '',
    monthlyIncome: preferences.monthlyIncome || 0,
    guarantor: preferences.guarantor || false,
    furnishingPreference: preferences.furnishingPreference || 'any',
    parkingRequired: preferences.parkingRequired || false,
    smokingStatus: preferences.smokingStatus || 'non_smoker'
  };
}

/**
 * Create investor-specific data
 */
function createInvestorData(preferences = {}) {
  return {
    investmentBudget: preferences.investmentBudget || 0,
    investmentType: preferences.investmentType || 'buy_to_let',
    targetROI: preferences.targetROI || 0,
    propertyTypes: preferences.propertyTypes || [],
    locations: preferences.locations || [],
    riskTolerance: preferences.riskTolerance || 'medium',
    investmentHorizon: preferences.investmentHorizon || '5years',
    financingRequired: preferences.financingRequired || false,
    experienceLevel: preferences.experienceLevel || 'beginner',
    portfolioSize: preferences.portfolioSize || 0,
    managementPreference: preferences.managementPreference || 'property_manager'
  };
}

/**
 * Create developer-specific data
 */
function createDeveloperData(preferences = {}) {
  return {
    projectType: preferences.projectType || 'residential',
    projectBudget: preferences.projectBudget || 0,
    landArea: preferences.landArea || 0,
    plannedUnits: preferences.plannedUnits || 0,
    locations: preferences.locations || [],
    developmentPhase: preferences.developmentPhase || 'planning',
    financingSecured: preferences.financingSecured || false,
    partnersRequired: preferences.partnersRequired || false,
    completionTimeline: preferences.completionTimeline || '24months',
    permitStatus: preferences.permitStatus || 'not_started'
  };
}

/**
 * Create property manager-specific data
 */
function createPropertyManagerData(preferences = {}) {
  return {
    numberOfProperties: preferences.numberOfProperties || 1,
    propertyTypes: preferences.propertyTypes || [],
    locations: preferences.locations || [],
    currentManagement: preferences.currentManagement || 'self',
    servicesRequired: preferences.servicesRequired || [],
    managementBudget: preferences.managementBudget || 0,
    contractTerm: preferences.contractTerm || '12months',
    maintenanceIncluded: preferences.maintenanceIncluded || true,
    accountingRequired: preferences.accountingRequired || false
  };
}

/**
 * Generate opportunity title
 */
function generateOpportunityTitle(clientName, type) {
  const year = new Date().getFullYear();
  const typeLabels = {
    buyer: 'Comprador',
    seller: 'Vendedor',
    landlord: 'Senhorio',
    tenant: 'Arrendatário',
    investor: 'Investidor',
    developer: 'Promotor',
    propertyManager: 'Gestão'
  };
  
  return `${clientName} - ${typeLabels[type] || type} ${year}`;
}

/**
 * Calculate expected close date based on urgency
 */
function calculateExpectedCloseDate(qualification) {
  const now = new Date();
  const urgency = qualification.preferences?.urgency || URGENCY_LEVELS.THREE_MONTHS;
  
  switch (urgency) {
    case URGENCY_LEVELS.IMMEDIATE:
      now.setMonth(now.getMonth() + 1);
      break;
    case URGENCY_LEVELS.THREE_MONTHS:
      now.setMonth(now.getMonth() + 3);
      break;
    case URGENCY_LEVELS.SIX_MONTHS:
      now.setMonth(now.getMonth() + 6);
      break;
    case URGENCY_LEVELS.ONE_YEAR:
      now.setFullYear(now.getFullYear() + 1);
      break;
    case URGENCY_LEVELS.EXPLORING:
      now.setFullYear(now.getFullYear() + 2);
      break;
    default:
      now.setMonth(now.getMonth() + 3);
  }
  
  return now.toISOString();
}

/**
 * Calculate initial probability based on qualification
 */
function calculateInitialProbability(qualification) {
  let probability = 20; // Base probability
  
  const preferences = qualification.preferences || {};
  
  // Increase probability based on urgency
  if (preferences.urgency === URGENCY_LEVELS.IMMEDIATE) {
    probability += 40;
  } else if (preferences.urgency === URGENCY_LEVELS.THREE_MONTHS) {
    probability += 25;
  } else if (preferences.urgency === URGENCY_LEVELS.SIX_MONTHS) {
    probability += 15;
  }
  
  // Increase probability if financing is secured
  if (preferences.financingApproved) {
    probability += 20;
  }
  
  // Increase probability for cash buyers
  if (preferences.financing === FINANCING_TYPES.CASH) {
    probability += 15;
  }
  
  return Math.min(probability, 90); // Cap at 90%
}

/**
 * Calculate opportunity score
 */
export function calculateOpportunityScore(qualification) {
  const scores = {
    urgency: 0,
    financial: 0,
    readiness: 0,
    engagement: 0
  };
  
  const preferences = qualification.preferences || {};
  
  // Urgency score
  switch (preferences.urgency) {
    case URGENCY_LEVELS.IMMEDIATE:
      scores.urgency = 100;
      break;
    case URGENCY_LEVELS.THREE_MONTHS:
      scores.urgency = 75;
      break;
    case URGENCY_LEVELS.SIX_MONTHS:
      scores.urgency = 50;
      break;
    case URGENCY_LEVELS.ONE_YEAR:
      scores.urgency = 25;
      break;
    default:
      scores.urgency = 10;
  }
  
  // Financial score
  if (preferences.financingApproved) {
    scores.financial = 80;
  } else if (preferences.financing === FINANCING_TYPES.CASH) {
    scores.financial = 100;
  } else {
    scores.financial = 40;
  }
  
  // Readiness score
  if (preferences.budgetMax && preferences.locations?.length > 0) {
    scores.readiness = 70;
  } else if (preferences.budgetMax || preferences.askingPrice) {
    scores.readiness = 50;
  } else {
    scores.readiness = 20;
  }
  
  // Engagement score (will be updated based on interactions)
  scores.engagement = 50; // Start at neutral
  
  // Calculate overall score
  const overall = Math.round(
    (scores.urgency * 0.3 +
     scores.financial * 0.3 +
     scores.readiness * 0.25 +
     scores.engagement * 0.15)
  );
  
  return {
    ...scores,
    overall
  };
}

/**
 * Get default commission percentage by type
 */
function getDefaultCommission(type) {
  const commissions = {
    buyer: 3,
    seller: 5,
    landlord: 100, // One month's rent
    tenant: 50, // Half month's rent
    investor: 2,
    developer: 3,
    propertyManager: 10 // Monthly percentage
  };
  
  return commissions[type] || 3;
}

/**
 * Calculate next follow-up date
 */
function calculateNextFollowUp() {
  const now = new Date();
  now.setDate(now.getDate() + 3); // Default 3 days
  return now.toISOString();
}

/**
 * Update opportunity stage
 */
export function updateOpportunityStage(opportunity, newStage) {
  const stages = OPPORTUNITY_STAGES[opportunity.qualificationType];
  const currentIndex = stages.indexOf(opportunity.stage);
  const newIndex = stages.indexOf(newStage);
  
  if (newIndex === -1) {
    throw new Error(`Invalid stage ${newStage} for ${opportunity.qualificationType}`);
  }
  
  // Update probability based on stage progression
  const stageProgress = ((newIndex + 1) / stages.length) * 100;
  const baseProbability = calculateInitialProbability({ preferences: opportunity.buyerData || opportunity.sellerData });
  const newProbability = Math.min(baseProbability + (stageProgress * 0.3), 95);
  
  return {
    ...opportunity,
    stage: newStage,
    probability: Math.round(newProbability),
    daysInStage: 0,
    lastActivity: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Check if opportunity is at risk
 */
export function isOpportunityAtRisk(opportunity) {
  const now = new Date();
  const lastActivity = new Date(opportunity.lastActivity);
  const daysSinceActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  // At risk if no activity for 7 days
  if (daysSinceActivity > 7) {
    return true;
  }
  
  // At risk if past expected close date
  if (opportunity.expectedCloseDate && new Date(opportunity.expectedCloseDate) < now) {
    return true;
  }
  
  // At risk if probability dropped below 20%
  if (opportunity.probability < 20) {
    return true;
  }
  
  return false;
}

/**
 * Calculate opportunity value
 */
export function calculateOpportunityValue(opportunity) {
  let value = 0;
  let commission = 0;
  
  switch (opportunity.qualificationType) {
    case 'buyer':
      value = opportunity.buyerData?.budgetMax || 0;
      commission = value * (opportunity.commissionPercentage / 100);
      break;
    
    case 'seller':
      value = opportunity.sellerData?.askingPrice || 0;
      commission = value * (opportunity.commissionPercentage / 100);
      break;
    
    case 'landlord':
      value = opportunity.landlordData?.monthlyRent || 0;
      commission = value; // One month's rent
      break;
    
    case 'tenant':
      value = opportunity.tenantData?.budgetMax || 0;
      commission = value * 0.5; // Half month's rent
      break;
    
    case 'investor':
      value = opportunity.investorData?.investmentBudget || 0;
      commission = value * (opportunity.commissionPercentage / 100);
      break;
    
    case 'developer':
      value = opportunity.developerData?.projectBudget || 0;
      commission = value * (opportunity.commissionPercentage / 100);
      break;
    
    case 'propertyManager':
      value = opportunity.propertyManagerData?.managementBudget || 0;
      commission = value * (opportunity.commissionPercentage / 100);
      break;
  }
  
  return {
    value,
    commission,
    weightedValue: value * (opportunity.probability / 100)
  };
}