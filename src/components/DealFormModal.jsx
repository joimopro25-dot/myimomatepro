// components/DealFormModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,      // CHANGED from XIcon
  HomeIcon, 
  CurrencyEuroIcon, 
  UserIcon,
  LinkIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { 
  BUYER_DEAL_STAGES, 
  INTEREST_LEVELS,
  REPRESENTATION_TYPES
} from '../models/buyerDealModel';
import { PROPERTY_TYPES } from '../models/opportunityModel';

const DealFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  opportunity,
  client,
  agents = [], // List of agents from context
  existingDeal = null 
}) => {
  const [formData, setFormData] = useState({
    // Property Basic Info
    property: {
      address: '',
      type: 'apartment',
      bedrooms: '',
      bathrooms: '',
      area: '',
      listingUrl: '',
      reference: ''
    },
    
    // Pricing
    pricing: {
      askingPrice: '',
      marketValue: '',
      expectedNegotiation: 5, // Default 5% negotiation expected
    },
    
    // Agent (can select existing or add new)
    propertyAgent: {
      agentId: '',
      name: '',
      agency: '',
      phone: '',
      email: '',
      whatsapp: '',
      commission: {
        type: 'percentage',
        value: 2.5
      }
    },
    
    // Representation
    representation: {
      type: REPRESENTATION_TYPES.BUYER_ONLY.value,
    },
    
    // Initial Scoring
    scoring: {
      propertyMatchScore: 0,
      buyerInterestLevel: 0,
      competitionLevel: 'low',
      urgencyLevel: 'normal',
    },
    
    // Competition
    competition: {
      otherInterested: 0,
      otherOffers: 0,
      notes: ''
    },
    
    // Stage
    stage: 'lead',
    
    // Notes
    notes: '',
    internalNotes: ''
  });

  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isNewAgent, setIsNewAgent] = useState(false);

  useEffect(() => {
    if (existingDeal) {
      setFormData(existingDeal);
      setSelectedAgentId(existingDeal.propertyAgent?.agentId || '');
    }
  }, [existingDeal]);

  // Handle agent selection
  const handleAgentSelect = (e) => {
    const agentId = e.target.value;
    setSelectedAgentId(agentId);
    
    if (agentId === 'new') {
      setIsNewAgent(true);
      setFormData(prev => ({
        ...prev,
        propertyAgent: {
          ...prev.propertyAgent,
          agentId: '',
          name: '',
          agency: '',
          phone: '',
          email: '',
          whatsapp: ''
        }
      }));
    } else if (agentId === 'self') {
      setIsNewAgent(false);
      setFormData(prev => ({
        ...prev,
        propertyAgent: {
          ...prev.propertyAgent,
          agentId: 'self',
          name: 'Propriedade Interna',
          agency: 'Nossa Agência',
          phone: '',
          email: '',
          whatsapp: ''
        }
      }));
    } else if (agentId) {
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        setIsNewAgent(false);
        setFormData(prev => ({
          ...prev,
          propertyAgent: {
            ...prev.propertyAgent,
            agentId: agent.id,
            name: agent.name,
            agency: agent.agency,
            phone: agent.contactInfo?.phonePrimary || '',
            email: agent.contactInfo?.email || '',
            whatsapp: agent.contactInfo?.whatsapp || ''
          }
        }));
      }
    }
  };

  const handleInputChange = (section, field, value) => {
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

  const handleSubmit = () => {
    // Basic validation
    if (!formData.property.address) {
      alert('Por favor, insira o endereço do imóvel');
      return;
    }
    if (!formData.pricing.askingPrice) {
      alert('Por favor, insira o preço pedido');
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {existingDeal ? 'Editar Negócio' : 'Novo Negócio'}
              </h2>
              <p className="text-blue-100 mt-1">
                Cliente: {client?.name} | Oportunidade: Comprador
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <XMarkIcon className="w-6 h-6" />  {/* CHANGED from XIcon */}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Property Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HomeIcon className="w-5 h-5 mr-2 text-blue-600" />
              Informação do Imóvel
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço *
                </label>
                <input
                  type="text"
                  value={formData.property.address}
                  onChange={(e) => handleInputChange('property', 'address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua Augusta, 123, Lisboa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Imóvel
                </label>
                <select
                  value={formData.property.type}
                  onChange={(e) => handleInputChange('property', 'type', e.target.value)}
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
                  onChange={(e) => handleInputChange('property', 'reference', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="REF123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quartos
                </label>
                <input
                  type="number"
                  value={formData.property.bedrooms}
                  onChange={(e) => handleInputChange('property', 'bedrooms', parseInt(e.target.value) || '')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WCs
                </label>
                <input
                  type="number"
                  value={formData.property.bathrooms}
                  onChange={(e) => handleInputChange('property', 'bathrooms', parseInt(e.target.value) || '')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área (m²)
                </label>
                <input
                  type="number"
                  value={formData.property.area}
                  onChange={(e) => handleInputChange('property', 'area', parseInt(e.target.value) || '')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link do Anúncio
                </label>
                <input
                  type="url"
                  value={formData.property.listingUrl}
                  onChange={(e) => handleInputChange('property', 'listingUrl', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.idealista.pt/..."
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CurrencyEuroIcon className="w-5 h-5 mr-2 text-green-600" />
              Informação de Preço
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Pedido (€) *
                </label>
                <input
                  type="number"
                  value={formData.pricing.askingPrice}
                  onChange={(e) => handleInputChange('pricing', 'askingPrice', parseInt(e.target.value) || '')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="350000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de Mercado (€)
                </label>
                <input
                  type="number"
                  value={formData.pricing.marketValue}
                  onChange={(e) => handleInputChange('pricing', 'marketValue', parseInt(e.target.value) || '')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="340000"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Negociação Esperada: {formData.pricing.expectedNegotiation}%
                </label>
                <input
                  type="range"
                  value={formData.pricing.expectedNegotiation}
                  onChange={(e) => handleInputChange('pricing', 'expectedNegotiation', parseInt(e.target.value))}
                  className="w-full"
                  min="0"
                  max="20"
                  step="1"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>10%</span>
                  <span>20%</span>
                </div>
              </div>
            </div>

            {/* Budget Info from Opportunity */}
            {opportunity?.qualification?.budget && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Orçamento do cliente: €{opportunity.qualification.budget.minPrice?.toLocaleString('pt-PT')} - €{opportunity.qualification.budget.maxPrice?.toLocaleString('pt-PT')}
                </p>
              </div>
            )}
          </div>

          {/* Agent Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
              Agente do Imóvel
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecionar Agente
              </label>
              <select
                value={selectedAgentId}
                onChange={handleAgentSelect}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecionar...</option>
                <option value="self">🏠 Propriedade Interna (Nossa Agência)</option>
                <optgroup label="Agentes Cadastrados">
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.agency}
                    </option>
                  ))}
                </optgroup>
                <option value="new">➕ Adicionar Novo Agente</option>
              </select>
            </div>

            {(isNewAgent || selectedAgentId === 'new') && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Agente
                  </label>
                  <input
                    type="text"
                    value={formData.propertyAgent.name}
                    onChange={(e) => handleInputChange('propertyAgent', 'name', e.target.value)}
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
                    onChange={(e) => handleInputChange('propertyAgent', 'agency', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="RE/MAX Lisboa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.propertyAgent.phone}
                    onChange={(e) => handleInputChange('propertyAgent', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="912 345 678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.propertyAgent.email}
                    onChange={(e) => handleInputChange('propertyAgent', 'email', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="agente@remax.pt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.propertyAgent.whatsapp}
                    onChange={(e) => handleInputChange('propertyAgent', 'whatsapp', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="912 345 678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comissão (%)
                  </label>
                  <input
                    type="number"
                    value={formData.propertyAgent.commission.value}
                    onChange={(e) => handleInputChange('propertyAgent', 'commission', {
                      ...formData.propertyAgent.commission,
                      value: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2.5"
                    step="0.1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Initial Assessment */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-yellow-600" />
              Avaliação Inicial
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Interesse Inicial
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleInputChange('scoring', 'buyerInterestLevel', level)}
                      className={`p-2 rounded ${
                        formData.scoring.buyerInterestLevel >= level
                          ? 'text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    >
                      <StarIcon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {INTEREST_LEVELS.find(i => 
                    formData.scoring.buyerInterestLevel >= i.value && 
                    formData.scoring.buyerInterestLevel < (INTEREST_LEVELS[INTEREST_LEVELS.indexOf(i) - 1]?.value || 11)
                  )?.label || 'Selecione o nível de interesse'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nível de Competição
                  </label>
                  <select
                    value={formData.scoring.competitionLevel}
                    onChange={(e) => handleInputChange('scoring', 'competitionLevel', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgência
                  </label>
                  <select
                    value={formData.scoring.urgencyLevel}
                    onChange={(e) => handleInputChange('scoring', 'urgencyLevel', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Outros Interessados
                  </label>
                  <input
                    type="number"
                    value={formData.competition.otherInterested}
                    onChange={(e) => handleInputChange('competition', 'otherInterested', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Outras Propostas
                  </label>
                  <input
                    type="number"
                    value={formData.competition.otherOffers}
                    onChange={(e) => handleInputChange('competition', 'otherOffers', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stage Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fase do Negócio
            </h3>
            <select
              value={formData.stage}
              onChange={(e) => handleInputChange(null, 'stage', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {BUYER_DEAL_STAGES.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="mb-6">
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
                  onChange={(e) => handleInputChange(null, 'notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Observações sobre o imóvel, localização, etc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Internas (não visíveis ao cliente)
                </label>
                <textarea
                  value={formData.internalNotes}
                  onChange={(e) => handleInputChange(null, 'internalNotes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Estratégias, observações internas..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {existingDeal ? 'Atualizar Negócio' : 'Criar Negócio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealFormModal;