/**
 * DEAL FORM MODAL - MyImoMatePro
 * Clean form for creating/editing deals
 */

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  HomeIcon,
  CurrencyEuroIcon,
  UserIcon,
  StarIcon as StarOutline,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import {
  BUYER_DEAL_STAGES,
  REPRESENTATION_TYPES,
  URGENCY_LEVELS,
  COMPETITION_LEVELS
} from '../models/buyerDealModel';
import { PROPERTY_TYPES } from '../models/opportunityModel';

const DealFormModal = ({
  isOpen,
  onClose,
  onSave,
  opportunity,
  existingDeal = null
}) => {
  const [formData, setFormData] = useState({
    // Property
    property: {
      address: '',
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      area: 0,
      listingUrl: '',
      reference: ''
    },
    // Pricing
    pricing: {
      askingPrice: 0,
      marketValue: 0,
      expectedNegotiation: 5
    },
    // Agent
    propertyAgent: {
      name: '',
      agency: '',
      phone: '',
      email: '',
      whatsapp: ''
    },
    // Representation
    representation: {
      type: 'buyer_only',
      commission: {
        type: 'percentage',
        value: 2.5
      }
    },
    // Scoring
    scoring: {
      propertyMatchScore: 5,
      buyerInterestLevel: 5,
      urgencyLevel: 'normal',
      competitionLevel: 'low'
    },
    // Competition
    competition: {
      otherInterested: 0,
      otherOffers: 0,
      notes: ''
    },
    // Stage
    stage: 'lead',
    // Follow-up
    nextFollowUpDate: null,
    followUpNote: '',
    // Notes
    notes: '',
    internalNotes: ''
  });

  // Load existing deal data if editing
  useEffect(() => {
    if (existingDeal) {
      setFormData({
        property: existingDeal.property || formData.property,
        pricing: existingDeal.pricing || formData.pricing,
        propertyAgent: existingDeal.propertyAgent || formData.propertyAgent,
        representation: existingDeal.representation || formData.representation,
        scoring: existingDeal.scoring || formData.scoring,
        competition: existingDeal.competition || formData.competition,
        stage: existingDeal.stage || 'lead',
        nextFollowUpDate: existingDeal.nextFollowUpDate || null,
        followUpNote: existingDeal.followUpNote || '',
        notes: existingDeal.notes || '',
        internalNotes: existingDeal.internalNotes || ''
      });
    }
  }, [existingDeal]);

  // Handle input changes
  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle nested changes (like commission)
  const handleNestedChange = (section, subsection, field, value) => {
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

  // Prefer one place to coerce numeric fields
  const handleInputChange = (section, field, value) => {
    const numericFields = [
      'bedrooms','bathrooms','area',
      'askingPrice','marketValue','expectedNegotiation','comparablePrice',
      'propertyMatchScore','buyerInterestLevel',
      'otherInterested','otherOffers'
    ];

    let processedValue = value;
    if (numericFields.includes(field)) {
      processedValue = value === '' ? '' : Number(value);
    }

    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: processedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: processedValue
      }));
    }
  };

  // Handle submit
  const handleSubmit = () => {
    console.log('Form data before validation:', formData); // DEBUG

    const address = formData?.property?.address?.trim();
    const askingPrice = Number(formData?.pricing?.askingPrice);

    if (!address) {
      alert('Por favor, insira o endereço do imóvel');
      return;
    }
    if (!askingPrice || askingPrice <= 0) {
      alert('Por favor, insira o preço pedido (valor maior que zero)');
      return;
    }

    console.log('Validation passed, submitting:', formData); // DEBUG
    onSave(formData, existingDeal?.id);
  };

  // Rating component
  const RatingInput = ({ value, onChange, label }) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}: {value}/10
        </label>
        <div className="flex gap-1">
          {[...Array(10)].map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
              className="focus:outline-none"
            >
              {i < value ? (
                <StarSolid className="w-6 h-6 text-yellow-400" />
              ) : (
                <StarOutline className="w-6 h-6 text-gray-300" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {existingDeal ? 'Editar Negócio' : 'Novo Negócio'}
              </h2>
              <p className="text-blue-100 mt-1">
                {opportunity?.qualification?.requirements?.propertyTypes?.join(', ') || 'Tipo de propriedade'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* PROPERTY SECTION */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HomeIcon className="w-5 h-5 mr-2 text-blue-600" />
              Imóvel
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço *
                </label>
                <input
                  type="text"
                  value={formData.property.address}
                  onChange={(e) => handleChange('property', 'address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua Principal, 123, Lisboa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.property.type}
                  onChange={(e) => handleChange('property', 'type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referência
                </label>
                <input
                  type="text"
                  value={formData.property.reference}
                  onChange={(e) => handleChange('property', 'reference', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="REF-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quartos
                </label>
                <input
                  type="number"
                  value={formData.property.bedrooms}
                  onChange={(e) => handleChange('property', 'bedrooms', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Casas de Banho
                </label>
                <input
                  type="number"
                  value={formData.property.bathrooms}
                  onChange={(e) => handleChange('property', 'bathrooms', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área (m²)
                </label>
                <input
                  type="number"
                  value={formData.property.area}
                  onChange={(e) => handleChange('property', 'area', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link do Anúncio
                </label>
                <input
                  type="url"
                  value={formData.property.listingUrl}
                  onChange={(e) => handleChange('property', 'listingUrl', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* PRICING SECTION */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CurrencyEuroIcon className="w-5 h-5 mr-2 text-green-600" />
              Preços
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Pedido * (€)
                </label>
                <input
                  type="number"
                  value={formData.pricing.askingPrice}
                  onChange={(e) => handleChange('pricing', 'askingPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="350000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de Mercado (€)
                </label>
                <input
                  type="number"
                  value={formData.pricing.marketValue}
                  onChange={(e) => handleChange('pricing', 'marketValue', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="340000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Negociação Esperada (%)
                </label>
                <input
                  type="number"
                  value={formData.pricing.expectedNegotiation}
                  onChange={(e) => handleChange('pricing', 'expectedNegotiation', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* AGENT SECTION */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
              Agente do Imóvel
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.propertyAgent.name}
                  onChange={(e) => handleChange('propertyAgent', 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agência
                </label>
                <input
                  type="text"
                  value={formData.propertyAgent.agency}
                  onChange={(e) => handleChange('propertyAgent', 'agency', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ERA, RE/MAX, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.propertyAgent.phone}
                  onChange={(e) => handleChange('propertyAgent', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+351 ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.propertyAgent.email}
                  onChange={(e) => handleChange('propertyAgent', 'email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="agente@agencia.pt"
                />
              </div>
            </div>
          </div>

          {/* SCORING SECTION */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <StarOutline className="w-5 h-5 mr-2 text-yellow-600" />
              Avaliação
            </h3>

            <div className="space-y-4">
              <RatingInput
                value={formData.scoring.propertyMatchScore}
                onChange={(val) => handleChange('scoring', 'propertyMatchScore', val)}
                label="Compatibilidade do Imóvel"
              />

              <RatingInput
                value={formData.scoring.buyerInterestLevel}
                onChange={(val) => handleChange('scoring', 'buyerInterestLevel', val)}
                label="Nível de Interesse do Comprador"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgência
                  </label>
                  <select
                    value={formData.scoring.urgencyLevel}
                    onChange={(e) => handleChange('scoring', 'urgencyLevel', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(URGENCY_LEVELS).map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Competição
                  </label>
                  <select
                    value={formData.scoring.competitionLevel}
                    onChange={(e) => handleChange('scoring', 'competitionLevel', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(COMPETITION_LEVELS).map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* COMPETITION SECTION */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Competição
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outros Interessados
                </label>
                <input
                  type="number"
                  value={formData.competition.otherInterested}
                  onChange={(e) => handleChange('competition', 'otherInterested', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outras Propostas
                </label>
                <input
                  type="number"
                  value={formData.competition.otherOffers}
                  onChange={(e) => handleChange('competition', 'otherOffers', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas sobre Competição
                </label>
                <textarea
                  value={formData.competition.notes}
                  onChange={(e) => handleChange('competition', 'notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Detalhes sobre outros interessados..."
                />
              </div>
            </div>
          </div>

          {/* STAGE & FOLLOW-UP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etapa
              </label>
              <select
                value={formData.stage}
                onChange={(e) => handleChange(null, 'stage', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {BUYER_DEAL_STAGES.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Próximo Seguimento
              </label>
              <input
                type="date"
                value={formData.nextFollowUpDate || ''}
                onChange={(e) => handleChange(null, 'nextFollowUpDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* NOTES SECTION */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600" />
              Notas
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Gerais
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange(null, 'notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Observações sobre o imóvel, localização, etc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Internas (privadas)
                </label>
                <textarea
                  value={formData.internalNotes}
                  onChange={(e) => handleChange(null, 'internalNotes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Estratégias, observações internas..."
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t rounded-b-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {existingDeal ? 'Atualizar Negócio' : 'Criar Negócio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealFormModal;