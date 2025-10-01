// components/DealFormModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
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
  agents = [],
  existingDeal = null 
}) => {
  const [formData, setFormData] = useState({
    property: {
      address: '',
      type: 'apartment',
      bedrooms: '',
      bathrooms: '',
      area: '',
      listingUrl: '',
      reference: ''
    },
    pricing: {
      askingPrice: '',
      marketValue: '',
      expectedNegotiation: 5,
    },
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
    representation: {
      type: REPRESENTATION_TYPES.BUYER_ONLY.value,
    },
    scoring: {
      propertyMatchScore: 0,
      buyerInterestLevel: 0,
      competitionLevel: 'low',
      urgencyLevel: 'normal',
    },
    competition: {
      otherInterested: 0,
      otherOffers: 0,
      notes: ''
    },
    stage: 'lead',
    notes: '',
    internalNotes: ''
  });

  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isNewAgent, setIsNewAgent] = useState(false);

  useEffect(() => {
    if (existingDeal) {
      // Load all data from existing deal
      setFormData({
        property: {
          address: existingDeal.property?.address || '',
          type: existingDeal.property?.type || 'apartment',
          bedrooms: existingDeal.property?.bedrooms || '',
          bathrooms: existingDeal.property?.bathrooms || '',
          area: existingDeal.property?.area || '',
          listingUrl: existingDeal.property?.listingUrl || '',
          reference: existingDeal.property?.reference || ''
        },
        pricing: {
          askingPrice: existingDeal.pricing?.askingPrice || '',
          marketValue: existingDeal.pricing?.marketValue || '',
          expectedNegotiation: existingDeal.pricing?.expectedNegotiation || 5,
        },
        propertyAgent: {
          agentId: existingDeal.propertyAgent?.agentId || '',
          name: existingDeal.propertyAgent?.name || '',
          agency: existingDeal.propertyAgent?.agency || '',
          phone: existingDeal.propertyAgent?.phone || '',
          email: existingDeal.propertyAgent?.email || '',
          whatsapp: existingDeal.propertyAgent?.whatsapp || '',
          commission: existingDeal.propertyAgent?.commission || {
            type: 'percentage',
            value: 2.5
          }
        },
        representation: {
          type: existingDeal.representation?.type || REPRESENTATION_TYPES.BUYER_ONLY.value,
        },
        scoring: {
          propertyMatchScore: existingDeal.scoring?.propertyMatchScore || 0,
          buyerInterestLevel: existingDeal.scoring?.buyerInterestLevel || 0,
          competitionLevel: existingDeal.scoring?.competitionLevel || 'low',
          urgencyLevel: existingDeal.scoring?.urgencyLevel || 'normal',
        },
        competition: {
          otherInterested: existingDeal.competition?.otherInterested || 0,
          otherOffers: existingDeal.competition?.otherOffers || 0,
          notes: existingDeal.competition?.notes || ''
        },
        stage: existingDeal.stage || 'lead',
        notes: existingDeal.notes || '',
        internalNotes: existingDeal.internalNotes || ''
      });
      
      setSelectedAgentId(existingDeal.propertyAgent?.agentId || '');
      setIsNewAgent(!existingDeal.propertyAgent?.agentId);
    }
  }, [existingDeal]);

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
    // Convert numeric fields to numbers
    const numericFields = ['bedrooms', 'bathrooms', 'area', 'askingPrice', 'marketValue', 'expectedNegotiation', 
                           'propertyMatchScore', 'buyerInterestLevel', 'otherInterested', 'otherOffers'];
    
    let processedValue = value;
    if (numericFields.includes(field) && value !== '') {
      processedValue = Number(value);
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

  const handleSubmit = () => {
    if (!formData.property.address) {
      alert('Por favor, insira o endereço do imóvel');
      return;
    }
    if (!formData.pricing.askingPrice) {
      alert('Por favor, insira o preço pedido');
      return;
    }

    // Pass the dealId if editing
    if (existingDeal?.id) {
      onSave(formData, existingDeal.id);
    } else {
      onSave(formData, null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed at top */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl flex-shrink-0">
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
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
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
                  Casas de Banho
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

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Anúncio
                </label>
                <div className="flex items-center space-x-2">
                  <LinkIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.property.listingUrl}
                    onChange={(e) => handleInputChange('property', 'listingUrl', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
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
                  placeholder="REF-12345"
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CurrencyEuroIcon className="w-5 h-5 mr-2 text-green-600" />
              Preços
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Pedido *
                </label>
                <input
                  type="number"
                  value={formData.pricing.askingPrice}
                  onChange={(e) => handleInputChange('pricing', 'askingPrice', parseFloat(e.target.value) || '')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="350000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de Mercado (sua avaliação)
                </label>
                <input
                  type="number"
                  value={formData.pricing.marketValue}
                  onChange={(e) => handleInputChange('pricing', 'marketValue', parseFloat(e.target.value) || '')}
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
                  onChange={(e) => handleInputChange('pricing', 'expectedNegotiation', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="5"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Agent Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
              Agente do Imóvel
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecionar Agente
                </label>
                <select
                  value={selectedAgentId}
                  onChange={handleAgentSelect}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="self">Propriedade Interna (Nossa Agência)</option>
                  <option value="new">+ Novo Agente</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.agency}
                    </option>
                  ))}
                </select>
              </div>

              {(isNewAgent || selectedAgentId === 'new') && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-2">
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

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agência
                    </label>
                    <input
                      type="text"
                      value={formData.propertyAgent.agency}
                      onChange={(e) => handleInputChange('propertyAgent', 'agency', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="ERA Portugal"
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
                      placeholder="+351 912 345 678"
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
                      placeholder="joao@era.pt"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scoring Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-yellow-600" />
              Avaliação & Competição
            </h3>
            
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
                  <option value="low">Baixo</option>
                  <option value="medium">Médio</option>
                  <option value="high">Alto</option>
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

        {/* Footer Actions - Fixed at bottom */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t rounded-b-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {existingDeal ? 'Atualizar Negócio' : 'Criar Negócio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealFormModal;