import React from 'react';

// ============================================================================
// SELLER OPPORTUNITY MODELS & HELPERS
// ============================================================================

export const SELLER_PIPELINE_STAGES = [
  { value: 'lead', label: 'Lead', color: '#6366f1' },
  { value: 'qualified', label: 'Qualificado', color: '#0ea5e9' },
  { value: 'evaluation', label: 'Avaliação', color: '#06b6d4' },
  { value: 'exclusive', label: 'Exclusivo', color: '#10b981' },
  { value: 'marketing', label: 'Marketing', color: '#84cc16' },
  { value: 'active', label: 'Ativo', color: '#f59e0b' },
  { value: 'under_offer', label: 'Com Proposta', color: '#ec4899' },
  { value: 'reserved', label: 'Reservado', color: '#8b5cf6' },
  { value: 'sold', label: 'Vendido', color: '#14b8a6' },
  { value: 'lost', label: 'Perdido', color: '#ef4444' }
];

export const getQualificationColor = (qual) => {
  switch (qual) {
    case 'alta': return 'bg-green-100 text-green-700';
    case 'media': return 'bg-yellow-100 text-yellow-700';
    case 'baixa': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export const getStageColor = (stage) => {
  const stageObj = SELLER_PIPELINE_STAGES.find(s => s.value === stage);
  return stageObj?.color || '#94a3b8';
};