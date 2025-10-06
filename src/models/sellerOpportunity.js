import React from 'react';

// ============================================================================
// SELLER OPPORTUNITY MODELS & CONSTANTS
// ============================================================================

// Property Types
export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Moradia' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'land', label: 'Terreno' }
];

// Property Conditions
export const PROPERTY_CONDITIONS = [
  { value: 'excellent', label: 'Excelente', score: 2 },
  { value: 'good', label: 'Bom', score: 1 },
  { value: 'needs_renovation', label: 'Necessita Renovação', score: 0 }
];

// Property Features
export const PROPERTY_FEATURES = [
  { value: 'parking', label: 'Estacionamento' },
  { value: 'elevator', label: 'Elevador' },
  { value: 'balcony', label: 'Varanda' },
  { value: 'garden', label: 'Jardim' },
  { value: 'pool', label: 'Piscina' },
  { value: 'storage', label: 'Arrecadação' },
  { value: 'terrace', label: 'Terraço' },
  { value: 'air_conditioning', label: 'Ar Condicionado' }
];

// Price Flexibility
export const PRICE_FLEXIBILITY = [
  { value: 'rigid', label: 'Rígido' },
  { value: 'somewhat_flexible', label: 'Algo Flexível' },
  { value: 'very_flexible', label: 'Muito Flexível' }
];

// Selling Reasons
export const SELLING_REASONS = [
  { value: 'upgrade', label: 'Upgrade' },
  { value: 'downsize', label: 'Reduzir Tamanho' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'divorce', label: 'Divórcio' },
  { value: 'inheritance', label: 'Herança' },
  { value: 'relocation', label: 'Relocação' },
  { value: 'investment', label: 'Investimento' }
];

// Urgency Levels
export const URGENCY_LEVELS = [
  { value: 'no_rush', label: 'Sem Pressa', score: 1 },
  { value: 'within_6_months', label: 'Dentro de 6 Meses', score: 2 },
  { value: 'within_3_months', label: 'Dentro de 3 Meses', score: 2 },
  { value: 'urgent', label: 'Urgente', score: 3 }
];

// Current Situations
export const CURRENT_SITUATIONS = [
  { value: 'owner_occupied', label: 'Ocupado pelo Proprietário' },
  { value: 'vacant', label: 'Vago' },
  { value: 'rented', label: 'Arrendado' }
];

// Pipeline Stages
export const SELLER_PIPELINE_STAGES = [
  { value: 'lead', label: 'Lead', color: '#94a3b8' },
  { value: 'em_avaliacao', label: 'Em Avaliação', color: '#60a5fa' },
  { value: 'em_preparacao', label: 'Em Preparação', color: '#a78bfa' },
  { value: 'ativo', label: 'Ativo', color: '#34d399' },
  { value: 'visitas_agendadas', label: 'Visitas Agendadas', color: '#fbbf24' },
  { value: 'proposta_recebida', label: 'Proposta Recebida', color: '#fb923c' },
  { value: 'em_negociacao', label: 'Em Negociação', color: '#f472b6' },
  { value: 'proposta_aceite', label: 'Proposta Aceite', color: '#22c55e' },
  { value: 'cpcv_assinado', label: 'CPCV Assinado', color: '#10b981' },
  { value: 'escritura_agendada', label: 'Escritura Agendada', color: '#06b6d4' },
  { value: 'concluido', label: 'Concluído', color: '#059669' }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique property ID
 * @param {string} customId - Optional custom agency ID
 * @returns {string} Property ID
 */
export const generatePropertyId = (customId = null) => {
  if (customId && customId.trim()) {
    return `PROP_${customId.trim().replace(/\s+/g, '_')}`;
  }
  
  // Generate UUID-like ID
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `PROP_${timestamp}_${randomPart}`;
};

/**
 * Calculate seller qualification score (0-10)
 * @param {Object} opportunity - Seller opportunity data
 * @returns {Object} Score details
 */
export const calculateSellerScore = (opportunity) => {
  let score = 0;
  const breakdown = {};

  // Motivation level (0-3 points)
  const urgency = URGENCY_LEVELS.find(u => u.value === opportunity.motivation?.urgency);
  const motivationScore = urgency?.score || 0;
  score += motivationScore;
  breakdown.motivation = motivationScore;

  // Price realism (0-3 points)
  // This would ideally compare to market data, but for now we use flexibility as proxy
  let priceScore = 0;
  if (opportunity.pricing?.flexibility === 'very_flexible') priceScore = 3;
  else if (opportunity.pricing?.flexibility === 'somewhat_flexible') priceScore = 2;
  else if (opportunity.pricing?.flexibility === 'rigid') priceScore = 1;
  score += priceScore;
  breakdown.priceRealism = priceScore;

  // Timeline clarity (0-2 points)
  let timelineScore = 0;
  if (opportunity.motivation?.idealDate) timelineScore = 2;
  else if (opportunity.motivation?.urgency && opportunity.motivation.urgency !== 'no_rush') timelineScore = 1;
  score += timelineScore;
  breakdown.timeline = timelineScore;

  // Property condition (0-2 points)
  const condition = PROPERTY_CONDITIONS.find(c => c.value === opportunity.property?.condition);
  const conditionScore = condition?.score || 0;
  score += conditionScore;
  breakdown.condition = conditionScore;

  // Calculate qualification level
  let qualification = 'low';
  if (score >= 7) qualification = 'high';
  else if (score >= 4) qualification = 'medium';

  return {
    total: score,
    maxScore: 10,
    qualification,
    breakdown
  };
};

/**
 * Get qualification color
 * @param {string} qualification - low/medium/high
 * @returns {string} Tailwind color class
 */
export const getQualificationColor = (qualification) => {
  const colors = {
    high: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-red-100 text-red-800 border-red-300'
  };
  return colors[qualification] || colors.low;
};

/**
 * Get stage color
 * @param {string} stage - Stage value
 * @returns {string} Hex color
 */
export const getStageColor = (stage) => {
  const stageObj = SELLER_PIPELINE_STAGES.find(s => s.value === stage);
  return stageObj?.color || '#94a3b8';
};

// ============================================================================
// DEMO COMPONENT
// ============================================================================

export default function SellerModelsDemo() {
  const [testOpportunity, setTestOpportunity] = React.useState({
    property: {
      condition: 'good'
    },
    pricing: {
      flexibility: 'somewhat_flexible'
    },
    motivation: {
      urgency: 'within_3_months',
      idealDate: '2025-12-01'
    }
  });

  const score = calculateSellerScore(testOpportunity);
  const generatedId = generatePropertyId();
  const customId = generatePropertyId('rua_pisco_265');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Seller Opportunity System
          </h1>
          <p className="text-slate-600 mb-8">Phase 1: Models & Constants</p>

          {/* Property ID Generation */}
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Property ID Generation
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Auto-generated:</span>
                <code className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-mono">
                  {generatedId}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Custom Agency ID:</span>
                <code className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-mono">
                  {customId}
                </code>
              </div>
            </div>
          </div>

          {/* Seller Score Calculation */}
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Seller Qualification Score
            </h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-slate-800">
                  {score.total}/{score.maxScore}
                </div>
                <div className={`inline-block px-3 py-1 rounded-full border text-sm font-semibold mt-2 ${getQualificationColor(score.qualification)}`}>
                  {score.qualification.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Motivation Level:</span>
                <span className="font-semibold">{score.breakdown.motivation}/3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Price Realism:</span>
                <span className="font-semibold">{score.breakdown.priceRealism}/3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Timeline Clarity:</span>
                <span className="font-semibold">{score.breakdown.timeline}/2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Property Condition:</span>
                <span className="font-semibold">{score.breakdown.condition}/2</span>
              </div>
            </div>
          </div>

          {/* Pipeline Stages */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Pipeline Stages
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {SELLER_PIPELINE_STAGES.map((stage) => (
                <div
                  key={stage.value}
                  className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Constants Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-2">Property Types</h3>
              <div className="text-sm text-slate-600">
                {PROPERTY_TYPES.length} types defined
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-2">Features</h3>
              <div className="text-sm text-slate-600">
                {PROPERTY_FEATURES.length} features available
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-2">Selling Reasons</h3>
              <div className="text-sm text-slate-600">
                {SELLING_REASONS.length} reasons defined
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-2">Urgency Levels</h3>
              <div className="text-sm text-slate-600">
                {URGENCY_LEVELS.length} levels with scoring
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}