import React, { useState, useEffect } from 'react';
import { Home, DollarSign, Calendar, TrendingUp, Save, X } from 'lucide-react';

// Import constants (in real app, these would be imported from the models file)
const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Moradia' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'land', label: 'Terreno' }
];

const PROPERTY_CONDITIONS = [
  { value: 'excellent', label: 'Excelente', score: 2 },
  { value: 'good', label: 'Bom', score: 1 },
  { value: 'needs_renovation', label: 'Necessita Renovação', score: 0 }
];

const PROPERTY_FEATURES = [
  { value: 'parking', label: 'Estacionamento' },
  { value: 'elevator', label: 'Elevador' },
  { value: 'balcony', label: 'Varanda' },
  { value: 'garden', label: 'Jardim' },
  { value: 'pool', label: 'Piscina' },
  { value: 'storage', label: 'Arrecadação' },
  { value: 'terrace', label: 'Terraço' },
  { value: 'air_conditioning', label: 'Ar Condicionado' }
];

const PRICE_FLEXIBILITY = [
  { value: 'rigid', label: 'Rígido' },
  { value: 'somewhat_flexible', label: 'Algo Flexível' },
  { value: 'very_flexible', label: 'Muito Flexível' }
];

const SELLING_REASONS = [
  { value: 'upgrade', label: 'Upgrade' },
  { value: 'downsize', label: 'Reduzir Tamanho' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'divorce', label: 'Divórcio' },
  { value: 'inheritance', label: 'Herança' },
  { value: 'relocation', label: 'Relocação' },
  { value: 'investment', label: 'Investimento' }
];

const URGENCY_LEVELS = [
  { value: 'no_rush', label: 'Sem Pressa', score: 1 },
  { value: 'within_6_months', label: 'Dentro de 6 Meses', score: 2 },
  { value: 'within_3_months', label: 'Dentro de 3 Meses', score: 2 },
  { value: 'urgent', label: 'Urgente', score: 3 }
];

const CURRENT_SITUATIONS = [
  { value: 'owner_occupied', label: 'Ocupado pelo Proprietário' },
  { value: 'vacant', label: 'Vago' },
  { value: 'rented', label: 'Arrendado' }
];

// Utility functions
const generatePropertyId = (customId = null) => {
  if (customId && customId.trim()) {
    return `PROP_${customId.trim().replace(/\s+/g, '_')}`;
  }
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `PROP_${timestamp}_${randomPart}`;
};

const calculateSellerScore = (opportunity) => {
  let score = 0;
  const breakdown = {};

  const urgency = URGENCY_LEVELS.find(u => u.value === opportunity.motivation?.urgency);
  const motivationScore = urgency?.score || 0;
  score += motivationScore;
  breakdown.motivation = motivationScore;

  let priceScore = 0;
  if (opportunity.pricing?.flexibility === 'very_flexible') priceScore = 3;
  else if (opportunity.pricing?.flexibility === 'somewhat_flexible') priceScore = 2;
  else if (opportunity.pricing?.flexibility === 'rigid') priceScore = 1;
  score += priceScore;
  breakdown.priceRealism = priceScore;

  let timelineScore = 0;
  if (opportunity.motivation?.idealDate) timelineScore = 2;
  else if (opportunity.motivation?.urgency && opportunity.motivation.urgency !== 'no_rush') timelineScore = 1;
  score += timelineScore;
  breakdown.timeline = timelineScore;

  const condition = PROPERTY_CONDITIONS.find(c => c.value === opportunity.property?.condition);
  const conditionScore = condition?.score || 0;
  score += conditionScore;
  breakdown.condition = conditionScore;

  let qualification = 'low';
  if (score >= 7) qualification = 'high';
  else if (score >= 4) qualification = 'medium';

  return { total: score, maxScore: 10, qualification, breakdown };
};

const getQualificationColor = (qualification) => {
  const colors = {
    high: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-red-100 text-red-800 border-red-300'
  };
  return colors[qualification] || colors.low;
};

// Main Form Component
export default function SellerQualificationForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    propertyId: initialData?.propertyId || generatePropertyId(),
    customPropertyId: initialData?.customPropertyId || '',
    property: {
      address: initialData?.property?.address || '',
      type: initialData?.property?.type || '',
      bedrooms: initialData?.property?.bedrooms || '',
      bathrooms: initialData?.property?.bathrooms || '',
      area: initialData?.property?.area || '',
      condition: initialData?.property?.condition || '',
      features: initialData?.property?.features || [],
      legalStatus: {
        mortgage: initialData?.property?.legalStatus?.mortgage || '',
        liens: initialData?.property?.legalStatus?.liens || false,
        ownershipClear: initialData?.property?.legalStatus?.ownershipClear || true
      },
      availabilityDate: initialData?.property?.availabilityDate || ''
    },
    pricing: {
      askingPrice: initialData?.pricing?.askingPrice || '',
      minimumPrice: initialData?.pricing?.minimumPrice || '',
      mortgageBalance: initialData?.pricing?.mortgageBalance || '',
      flexibility: initialData?.pricing?.flexibility || '',
      renovationBudget: initialData?.pricing?.renovationBudget || ''
    },
    motivation: {
      reason: initialData?.motivation?.reason || '',
      urgency: initialData?.motivation?.urgency || '',
      idealDate: initialData?.motivation?.idealDate || '',
      mustSellDeadline: initialData?.motivation?.mustSellDeadline || '',
      currentSituation: initialData?.motivation?.currentSituation || ''
    }
  });

  const [score, setScore] = useState({ total: 0, qualification: 'low' });

  useEffect(() => {
    const newScore = calculateSellerScore(formData);
    setScore(newScore);
  }, [formData]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      property: {
        ...prev.property,
        features: prev.property.features.includes(feature)
          ? prev.property.features.filter(f => f !== feature)
          : [...prev.property.features, feature]
      }
    }));
  };

  const handleCustomIdChange = (value) => {
    setFormData(prev => ({
      ...prev,
      customPropertyId: value,
      propertyId: generatePropertyId(value)
    }));
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.property.address || !formData.property.type || !formData.property.area) {
      alert('Por favor, preencha todos os campos obrigatórios do imóvel.');
      return;
    }
    if (!formData.pricing.askingPrice || !formData.pricing.minimumPrice || !formData.pricing.flexibility) {
      alert('Por favor, preencha todos os campos obrigatórios de preço.');
      return;
    }
    if (!formData.motivation.reason || !formData.motivation.urgency || !formData.motivation.currentSituation) {
      alert('Por favor, preencha todos os campos obrigatórios de motivação.');
      return;
    }

    const scoreData = calculateSellerScore(formData);
    const submissionData = {
      ...formData,
      sellerScore: scoreData.total,
      sellerQualification: scoreData.qualification,
      stage: 'lead',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Seller Opportunity Data:', submissionData);
    onSubmit?.(submissionData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Nova Oportunidade de Venda
                </h1>
                <p className="text-slate-600 mt-1">
                  Qualificação de Vendedor
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600 mb-2">Pontuação de Qualificação</div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-slate-800">
                    {score.total}/10
                  </div>
                  <div className={`px-4 py-2 rounded-full border font-semibold text-sm ${getQualificationColor(score.qualification)}`}>
                    {score.qualification.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Property ID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  ID Personalizado da Agência (opcional)
                </label>
                <input
                  type="text"
                  value={formData.customPropertyId}
                  onChange={(e) => handleCustomIdChange(e.target.value)}
                  placeholder="ex: rua_pisco_265"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  ID do Imóvel (Gerado)
                </label>
                <div className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono text-sm text-slate-700">
                  {formData.propertyId}
                </div>
              </div>
            </div>
          </div>

          {/* Property Details Section */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Home className="text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-800">
                Detalhes do Imóvel
              </h2>
            </div>

            <div className="space-y-4">
              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Morada Completa *
                </label>
                <input
                  type="text"
                  value={formData.property.address}
                  onChange={(e) => handleInputChange('property', 'address', e.target.value)}
                  placeholder="Rua, número, andar, código postal, cidade"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Property Type and Area */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo de Imóvel *
                  </label>
                  <select
                    value={formData.property.type}
                    onChange={(e) => handleInputChange('property', 'type', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecionar...</option>
                    {PROPERTY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Quartos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.property.bedrooms}
                    onChange={(e) => handleInputChange('property', 'bedrooms', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Casas de Banho
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.property.bathrooms}
                    onChange={(e) => handleInputChange('property', 'bathrooms', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Area and Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Área (m²) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.property.area}
                    onChange={(e) => handleInputChange('property', 'area', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Condição *
                  </label>
                  <select
                    value={formData.property.condition}
                    onChange={(e) => handleInputChange('property', 'condition', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecionar...</option>
                    {PROPERTY_CONDITIONS.map(cond => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Características
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {PROPERTY_FEATURES.map(feature => (
                    <button
                      key={feature.value}
                      type="button"
                      onClick={() => toggleFeature(feature.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.property.features.includes(feature.value)
                          ? 'bg-blue-100 border-blue-500 text-blue-700 font-semibold'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {feature.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legal Status */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Estado Legal
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Saldo da Hipoteca (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.property.legalStatus.mortgage}
                      onChange={(e) => handleNestedInputChange('property', 'legalStatus', 'mortgage', e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Data de Disponibilidade
                    </label>
                    <input
                      type="date"
                      value={formData.property.availabilityDate}
                      onChange={(e) => handleInputChange('property', 'availabilityDate', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.property.legalStatus.liens}
                      onChange={(e) => handleNestedInputChange('property', 'legalStatus', 'liens', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Possui Penhoras
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.property.legalStatus.ownershipClear}
                      onChange={(e) => handleNestedInputChange('property', 'legalStatus', 'ownershipClear', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Propriedade Livre
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Financials Section */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="text-green-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-800">
                Preços e Financeiro
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preço Pedido (€) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.askingPrice}
                    onChange={(e) => handleInputChange('pricing', 'askingPrice', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preço Mínimo Aceitável (€) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.minimumPrice}
                    onChange={(e) => handleInputChange('pricing', 'minimumPrice', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Flexibilidade de Preço *
                  </label>
                  <select
                    value={formData.pricing.flexibility}
                    onChange={(e) => handleInputChange('pricing', 'flexibility', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecionar...</option>
                    {PRICE_FLEXIBILITY.map(flex => (
                      <option key={flex.value} value={flex.value}>
                        {flex.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Orçamento de Renovação (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.renovationBudget}
                    onChange={(e) => handleInputChange('pricing', 'renovationBudget', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Motivation & Timeline Section */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="text-purple-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-800">
                Motivação e Cronograma
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Motivo de Venda *
                  </label>
                  <select
                    value={formData.motivation.reason}
                    onChange={(e) => handleInputChange('motivation', 'reason', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecionar...</option>
                    {SELLING_REASONS.map(reason => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nível de Urgência *
                  </label>
                  <select
                    value={formData.motivation.urgency}
                    onChange={(e) => handleInputChange('motivation', 'urgency', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecionar...</option>
                    {URGENCY_LEVELS.map(urgency => (
                      <option key={urgency.value} value={urgency.value}>
                        {urgency.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Data de Fechamento Ideal
                  </label>
                  <input
                    type="date"
                    value={formData.motivation.idealDate}
                    onChange={(e) => handleInputChange('motivation', 'idealDate', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Prazo Máximo de Venda
                  </label>
                  <input
                    type="date"
                    value={formData.motivation.mustSellDeadline}
                    onChange={(e) => handleInputChange('motivation', 'mustSellDeadline', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Situação Atual *
                </label>
                <select
                  value={formData.motivation.currentSituation}
                  onChange={(e) => handleInputChange('motivation', 'currentSituation', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecionar...</option>
                  {CURRENT_SITUATIONS.map(situation => (
                    <option key={situation.value} value={situation.value}>
                      {situation.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                * Campos obrigatórios
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <X size={20} />
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Save size={20} />
                  Guardar Oportunidade
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}