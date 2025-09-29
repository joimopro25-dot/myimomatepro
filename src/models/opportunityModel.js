/**
 * OPPORTUNITY MODEL - MyImoMatePro
 * Schema for Buyer and Seller Opportunities
 * Structure: clients/{clientId}/opportunities/{opportunityId}
 */

import { Timestamp } from 'firebase/firestore';

// ===== OPPORTUNITY TYPES =====
export const OPPORTUNITY_TYPES = {
  BUYER: 'buyer',
  SELLER: 'seller'
};

// ===== OPPORTUNITY STATUS =====
export const OPPORTUNITY_STATUS = [
  { value: 'active', label: 'Ativo', color: 'green' },
  { value: 'qualified', label: 'Qualificado', color: 'blue' },
  { value: 'viewing', label: 'Em Visitas', color: 'yellow' },
  { value: 'negotiating', label: 'Em Negociação', color: 'orange' },
  { value: 'closed_won', label: 'Fechado (Ganho)', color: 'green' },
  { value: 'closed_lost', label: 'Fechado (Perdido)', color: 'red' },
  { value: 'on_hold', label: 'Em Pausa', color: 'gray' }
];

// ===== BUYER SPECIFIC CONSTANTS =====
export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartamento', icon: '🏢' },
  { value: 'house', label: 'Moradia', icon: '🏠' },
  { value: 'villa', label: 'Villa', icon: '🏡' },
  { value: 'townhouse', label: 'Moradia em Banda', icon: '🏘️' },
  { value: 'penthouse', label: 'Penthouse', icon: '🌇' },
  { value: 'duplex', label: 'Duplex', icon: '🏗️' },
  { value: 'studio', label: 'Estúdio', icon: '🏨' },
  { value: 'land', label: 'Terreno', icon: '🌍' },
  { value: 'commercial', label: 'Comercial', icon: '🏪' }
];

export const PROPERTY_PURPOSE = [
  { value: 'primary_residence', label: 'Habitação Própria' },
  { value: 'investment', label: 'Investimento' },
  { value: 'vacation_home', label: 'Casa de Férias' },
  { value: 'rental', label: 'Para Arrendar' }
];

export const URGENCY_LEVELS = [
  { value: 'immediate', label: 'Imediato', color: 'red' },
  { value: '1_month', label: 'Até 1 mês', color: 'orange' },
  { value: '3_months', label: 'Até 3 meses', color: 'yellow' },
  { value: '6_months', label: 'Até 6 meses', color: 'blue' },
  { value: 'flexible', label: 'Flexível', color: 'gray' }
];

export const CURRENT_SITUATION = [
  { value: 'renting', label: 'Arrendatário' },
  { value: 'owner_selling', label: 'Proprietário (vendendo atual)' },
  { value: 'owner_keeping', label: 'Proprietário (mantendo atual)' },
  { value: 'with_family', label: 'Com Família' },
  { value: 'first_time', label: 'Primeira Habitação' },
  { value: 'other', label: 'Outra Situação' }
];

export const PROPERTY_FEATURES = [
  // Essential
  { value: 'garage', label: 'Garagem', category: 'essential' },
  { value: 'elevator', label: 'Elevador', category: 'essential' },
  { value: 'balcony', label: 'Varanda', category: 'essential' },
  { value: 'terrace', label: 'Terraço', category: 'essential' },
  { value: 'storage', label: 'Arrecadação', category: 'essential' },
  
  // Comfort
  { value: 'garden', label: 'Jardim', category: 'comfort' },
  { value: 'pool', label: 'Piscina', category: 'comfort' },
  { value: 'air_conditioning', label: 'Ar Condicionado', category: 'comfort' },
  { value: 'central_heating', label: 'Aquecimento Central', category: 'comfort' },
  { value: 'fireplace', label: 'Lareira', category: 'comfort' },
  
  // Location
  { value: 'sea_view', label: 'Vista Mar', category: 'location' },
  { value: 'mountain_view', label: 'Vista Montanha', category: 'location' },
  { value: 'city_center', label: 'Centro Cidade', category: 'location' },
  { value: 'quiet_area', label: 'Zona Calma', category: 'location' },
  { value: 'near_schools', label: 'Perto de Escolas', category: 'location' },
  { value: 'near_transport', label: 'Perto de Transportes', category: 'location' },
  { value: 'near_shopping', label: 'Perto de Comércio', category: 'location' }
];

export const BUYER_SCORE_CRITERIA = {
  A: {
    label: 'Comprador A - Pronto',
    description: 'Financiamento aprovado, urgente, decisivo',
    color: 'green'
  },
  B: {
    label: 'Comprador B - Qualificado',
    description: 'Boa capacidade, timeline médio',
    color: 'blue'
  },
  C: {
    label: 'Comprador C - Em Preparação',
    description: 'Necessita qualificação, timeline longo',
    color: 'yellow'
  }
};

// ===== CREATE BUYER OPPORTUNITY SCHEMA =====
export const createBuyerOpportunitySchema = (data = {}) => {
  return {
    // Core
    id: null, // Auto-generated
    clientId: data.clientId || null,
    consultantId: data.consultantId || null,
    type: OPPORTUNITY_TYPES.BUYER,
    title: data.title || 'Nova Oportunidade de Compra', // NEW: Descriptive title
    status: data.status || 'active',
    
    // Buyer Qualification
    qualification: {
      // Budget Section
      budget: {
        minPrice: data.qualification?.budget?.minPrice || 0,
        maxPrice: data.qualification?.budget?.maxPrice || 0,
        idealPrice: data.qualification?.budget?.idealPrice || 0,
        hasFinancing: data.qualification?.budget?.hasFinancing || false,
        financingApproved: data.qualification?.budget?.financingApproved || false,
        financingAmount: data.qualification?.budget?.financingAmount || 0,
        bankName: data.qualification?.budget?.bankName || '',
        downPaymentAvailable: data.qualification?.budget?.downPaymentAvailable || 0,
        monthlyPaymentCapacity: data.qualification?.budget?.monthlyPaymentCapacity || 0,
        needsSaleProceeds: data.qualification?.budget?.needsSaleProceeds || false
      },
      
      // Requirements Section
      requirements: {
        propertyTypes: data.qualification?.requirements?.propertyTypes || [],
        purpose: data.qualification?.requirements?.purpose || 'primary_residence',
        
        // Size requirements
        bedrooms: {
          min: data.qualification?.requirements?.bedrooms?.min || 1,
          max: data.qualification?.requirements?.bedrooms?.max || null
        },
        bathrooms: {
          min: data.qualification?.requirements?.bathrooms?.min || 1,
          max: data.qualification?.requirements?.bathrooms?.max || null
        },
        area: {
          min: data.qualification?.requirements?.area?.min || null,
          max: data.qualification?.requirements?.area?.max || null
        },
        
        // Location preferences
        preferredLocations: data.qualification?.requirements?.preferredLocations || [],
        excludedLocations: data.qualification?.requirements?.excludedLocations || [],
        maxDistanceToWork: data.qualification?.requirements?.maxDistanceToWork || '',
        workAddress: data.qualification?.requirements?.workAddress || '',
        
        // Features
        mustHaveFeatures: data.qualification?.requirements?.mustHaveFeatures || [],
        niceToHaveFeatures: data.qualification?.requirements?.niceToHaveFeatures || [],
        dealBreakers: data.qualification?.requirements?.dealBreakers || [],
        
        // Building preferences
        maxFloor: data.qualification?.requirements?.maxFloor || null,
        minFloor: data.qualification?.requirements?.minFloor || null,
        maxBuildingAge: data.qualification?.requirements?.maxBuildingAge || null,
        renovationNeeded: data.qualification?.requirements?.renovationNeeded || 'any' // 'yes', 'no', 'any'
      },
      
      // Timeline Section
      timeline: {
        urgency: data.qualification?.timeline?.urgency || 'flexible',
        idealMoveDate: data.qualification?.timeline?.idealMoveDate || '',
        currentSituation: data.qualification?.timeline?.currentSituation || '',
        currentSituationDetails: data.qualification?.timeline?.currentSituationDetails || '',
        motivationToBuy: data.qualification?.timeline?.motivationToBuy || '',
        viewingAvailability: data.qualification?.timeline?.viewingAvailability || [], // ['weekdays', 'weekends', 'evenings']
        decisionMakers: data.qualification?.timeline?.decisionMakers || '',
        preApprovedForViewing: data.qualification?.timeline?.preApprovedForViewing || false
      }
    },
    
    // Scoring and Priority
    buyerScore: data.buyerScore || null, // 'A', 'B', 'C' - calculated
    priority: data.priority || 'medium', // 'high', 'medium', 'low'
    
    // Notes and Observations
    internalNotes: data.internalNotes || '',
    clientExpectations: data.clientExpectations || '',
    consultantStrategy: data.consultantStrategy || '',
    
    // Metadata
    createdAt: data.createdAt || Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastActivityAt: data.lastActivityAt || Timestamp.now(),
    lastContactedAt: data.lastContactedAt || null,
    nextFollowUpDate: data.nextFollowUpDate || null,
    
    // Statistics (updated as deals progress)
    stats: {
      totalDeals: 0,
      propertiesViewed: 0,
      offersMade: 0,
      activeDeals: 0
    }
  };
};

// ===== CALCULATE BUYER SCORE =====
export const calculateBuyerScore = (qualification) => {
  let points = 0;
  
  // Budget scoring (40 points max)
  if (qualification.budget.financingApproved) points += 20;
  else if (qualification.budget.hasFinancing) points += 10;
  
  if (qualification.budget.downPaymentAvailable >= qualification.budget.maxPrice * 0.2) {
    points += 20;
  } else if (qualification.budget.downPaymentAvailable >= qualification.budget.maxPrice * 0.1) {
    points += 10;
  }
  
  // Timeline scoring (30 points max)
  switch (qualification.timeline.urgency) {
    case 'immediate': points += 30; break;
    case '1_month': points += 25; break;
    case '3_months': points += 20; break;
    case '6_months': points += 10; break;
    case 'flexible': points += 5; break;
  }
  
  // Clarity scoring (30 points max)
  if (qualification.requirements.propertyTypes.length > 0) points += 10;
  if (qualification.requirements.preferredLocations.length > 0) points += 10;
  if (qualification.timeline.motivationToBuy) points += 10;
  
  // Calculate final score
  if (points >= 70) return 'A';
  if (points >= 40) return 'B';
  return 'C';
};

// ===== VALIDATION =====
export const validateBuyerOpportunity = (data) => {
  const errors = {};
  
  // Budget validation
  if (!data.qualification?.budget?.maxPrice || data.qualification.budget.maxPrice <= 0) {
    errors['budget.maxPrice'] = 'Preço máximo é obrigatório';
  }
  
  if (data.qualification?.budget?.minPrice >= data.qualification?.budget?.maxPrice) {
    errors['budget.minPrice'] = 'Preço mínimo deve ser menor que o máximo';
  }
  
  // Requirements validation
  if (!data.qualification?.requirements?.propertyTypes?.length) {
    errors['requirements.propertyTypes'] = 'Selecione pelo menos um tipo de imóvel';
  }
  
  if (!data.qualification?.requirements?.preferredLocations?.length) {
    errors['requirements.preferredLocations'] = 'Selecione pelo menos uma localização';
  }
  
  // Timeline validation
  if (!data.qualification?.timeline?.urgency) {
    errors['timeline.urgency'] = 'Urgência é obrigatória';
  }
  
  if (!data.qualification?.timeline?.currentSituation) {
    errors['timeline.currentSituation'] = 'Situação atual é obrigatória';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== FORMATTING HELPERS =====
export const formatPrice = (price) => {
  if (!price) return '€0';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatPriceRange = (min, max) => {
  if (!min && !max) return 'Não definido';
  if (!min) return `Até ${formatPrice(max)}`;
  if (!max) return `A partir de ${formatPrice(min)}`;
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

export const getStatusColor = (status) => {
  const statusObj = OPPORTUNITY_STATUS.find(s => s.value === status);
  return statusObj?.color || 'gray';
};

export const getScoreColor = (score) => {
  return BUYER_SCORE_CRITERIA[score]?.color || 'gray';
};