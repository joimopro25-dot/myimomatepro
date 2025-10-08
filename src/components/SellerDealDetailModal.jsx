/**
 * SELLER DEAL DETAIL MODAL - MyImoMatePro
 * Complete seller deal view with offer management and transaction flow
 */

import React, { useState } from 'react';
import { 
  X, Home, Euro, Calendar, User, FileText, MapPin, 
  TrendingUp, Clock, CheckCircle, AlertCircle, Edit,
  Phone, Mail, Tag, ChevronRight, Eye, MessageSquare,
  BarChart, Camera, Share2, DollarSign
} from 'lucide-react';
import SellerTransactionManager from './SellerTransactionManager';
import { SELLER_DEAL_STAGES, OFFER_RESPONSES, formatDealSummary, getNextAction } from '../models/sellerDealModel';

export default function SellerDealDetailModal({ 
  isOpen, 
  onClose, 
  deal, 
  onUpdateDeal,
  onDeleteDeal 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showOfferResponse, setShowOfferResponse] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  if (!isOpen || !deal) return null;

  // Check if in transaction phase
  const isInTransaction = ['accepted', 'cpcv_preparation', 'cpcv_signed', 'escritura_scheduled', 'completed'].includes(deal.stage);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'property', label: 'Imóvel', icon: MapPin },
    { id: 'offers', label: `Propostas (${deal.offers?.length || 0})`, icon: Euro },
    { id: 'marketing', label: 'Marketing', icon: BarChart },
    { id: 'documents', label: 'Documentos', icon: FileText },
    ...(isInTransaction ? [{ id: 'transaction', label: 'Transação', icon: TrendingUp }] : []),
    { id: 'activity', label: 'Atividade', icon: Clock }
  ];

  const handleStageChange = async (newStage) => {
    const updatedDeal = {
      ...deal,
      stage: newStage,
      updatedAt: new Date()
    };
    await onUpdateDeal(updatedDeal);
  };

  const handleOfferResponse = async (offer, response) => {
    const updatedOffer = {
      ...offer,
      status: response === 'accept' ? 'accepted' : 
              response === 'counter' ? 'countered' : 
              response === 'reject' ? 'rejected' : 'pending',
      response,
      responseDate: new Date()
    };

    const updatedOffers = deal.offers.map(o => 
      o.id === offer.id ? updatedOffer : o
    );

    const updatedDeal = {
      ...deal,
      offers: updatedOffers,
      ...(response === 'accept' ? {
        acceptedOffer: updatedOffer,
        stage: 'accepted'
      } : {}),
      updatedAt: new Date()
    };

    await onUpdateDeal(updatedDeal);
    setShowOfferResponse(false);
    setSelectedOffer(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {formatDealSummary(deal)}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    getStageColor(deal.stage)
                  }`}>
                    {getStageLabel(deal.stage)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {deal.seller?.name}
                  </span>
                  {deal.listing?.exclusive && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Exclusivo
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-t -mb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  icon={<Euro className="w-5 h-5 text-blue-600" />}
                  label="Preço Pedido"
                  value={`€${deal.pricing?.askingPrice?.toLocaleString('pt-PT')}`}
                  subvalue={`€${deal.pricing?.pricePerM2}/m²`}
                />
                <MetricCard
                  icon={<Eye className="w-5 h-5 text-green-600" />}
                  label="Visualizações"
                  value={deal.marketing?.viewCount || 0}
                  subvalue={`${deal.marketing?.inquiryCount || 0} contactos`}
                />
                <MetricCard
                  icon={<Calendar className="w-5 h-5 text-purple-600" />}
                  label="Dias no Mercado"
                  value={deal.marketing?.daysOnMarket || 0}
                  subvalue="dias"
                />
                <MetricCard
                  icon={<Tag className="w-5 h-5 text-orange-600" />}
                  label="Propostas"
                  value={deal.offers?.length || 0}
                  subvalue={deal.acceptedOffer ? 'Aceite' : 'Recebidas'}
                />
              </div>

              {/* Next Action Suggestion */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Próxima Ação Recomendada</h4>
                    <p className="text-sm text-blue-700 mt-1">{getNextAction(deal)}</p>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Informação do Vendedor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-medium">{deal.seller?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="font-medium">{deal.seller?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{deal.seller?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Timeline</p>
                      <p className="font-medium">{deal.seller?.timeline || 'Flexível'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Property Tab */}
          {activeTab === 'property' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Detalhes do Imóvel</h3>
                  <PropertyDetail label="Endereço" value={deal.property?.address} />
                  <PropertyDetail label="Tipo" value={deal.property?.type} />
                  <PropertyDetail label="Tipologia" value={deal.property?.typology} />
                  <PropertyDetail label="Área" value={`${deal.property?.area} m²`} />
                  <PropertyDetail label="Ano" value={deal.property?.year} />
                  <PropertyDetail label="Andar" value={deal.property?.floor} />
                  <PropertyDetail label="Quartos" value={deal.property?.bedrooms} />
                  <PropertyDetail label="Casas de Banho" value={deal.property?.bathrooms} />
                  <PropertyDetail label="Lugares Estacionamento" value={deal.property?.parkingSpaces} />
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Características</h3>
                  <div className="flex flex-wrap gap-2">
                    {deal.property?.features?.map((feature, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <PropertyDetail label="Estado" value={deal.property?.condition} />
                  <PropertyDetail label="Certificado Energético" value={deal.property?.energyRating} />
                </div>
              </div>
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div className="p-6 space-y-4">
              {deal.offers?.length > 0 ? (
                <div className="space-y-4">
                  {deal.offers.map((offer, index) => (
                    <OfferCard
                      key={offer.id || index}
                      offer={offer}
                      isAccepted={offer.id === deal.acceptedOffer?.id}
                      onRespond={() => {
                        setSelectedOffer(offer);
                        setShowOfferResponse(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Euro className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Ainda não foram recebidas propostas</p>
                </div>
              )}
            </div>
          )}

          {/* Transaction Tab */}
          {activeTab === 'transaction' && isInTransaction && (
            <div className="p-6">
              <SellerTransactionManager
                deal={deal}
                onUpdateDeal={onUpdateDeal}
                onStageChange={handleStageChange}
              />
            </div>
          )}

          {/* Marketing Tab */}
          {activeTab === 'marketing' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <MetricCard
                  icon={<Eye className="w-5 h-5 text-blue-600" />}
                  label="Visualizações"
                  value={deal.marketing?.viewCount || 0}
                  subvalue="total"
                />
                <MetricCard
                  icon={<MessageSquare className="w-5 h-5 text-green-600" />}
                  label="Contactos"
                  value={deal.marketing?.inquiryCount || 0}
                  subvalue="recebidos"
                />
                <MetricCard
                  icon={<Calendar className="w-5 h-5 text-purple-600" />}
                  label="Visitas"
                  value={deal.marketing?.showingCount || 0}
                  subvalue="agendadas"
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Canais de Marketing</h3>
                <div className="flex flex-wrap gap-2">
                  {deal.listing?.marketingChannels?.map((channel, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Checklist de Documentos</h3>
              <div className="space-y-2">
                {deal.documents?.checklist?.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {doc.status === 'verified' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : doc.status === 'received' ? (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-medium">{doc.label}</span>
                    </div>
                    <span className={`text-sm ${
                      doc.status === 'verified' ? 'text-green-600' :
                      doc.status === 'received' ? 'text-yellow-600' :
                      'text-gray-500'
                    }`}>
                      {doc.status === 'verified' ? 'Verificado' :
                       doc.status === 'received' ? 'Recebido' :
                       'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={() => console.log('Edit deal')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Response Modal */}
      {showOfferResponse && selectedOffer && (
        <OfferResponseModal
          offer={selectedOffer}
          onClose={() => {
            setShowOfferResponse(false);
            setSelectedOffer(null);
          }}
          onRespond={handleOfferResponse}
        />
      )}
    </div>
  );
}

// Helper Components
function MetricCard({ icon, label, value, subvalue }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-gray-900">{value}</p>
            {subvalue && <span className="text-sm text-gray-500">{subvalue}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyDetail({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value || 'N/A'}</span>
    </div>
  );
}

function OfferCard({ offer, isAccepted, onRespond }) {
  return (
    <div className={`border rounded-lg p-4 ${
      isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900">
              €{offer.amount?.toLocaleString('pt-PT')}
            </span>
            {isAccepted && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Aceite
              </span>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              offer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              offer.status === 'countered' ? 'bg-orange-100 text-orange-700' :
              offer.status === 'rejected' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {offer.status === 'pending' ? 'Pendente' :
               offer.status === 'countered' ? 'Contraproposta' :
               offer.status === 'rejected' ? 'Rejeitada' :
               offer.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            De: <strong>{offer.buyer?.name}</strong> 
            {offer.buyer?.agent && ` (Agente: ${offer.buyer.agent})`}
          </p>
          <p className="text-sm text-gray-600">
            Financiamento: {offer.terms?.financingStatus === 'cash' ? 'Pronto Pagamento' :
                           offer.terms?.financingStatus === 'pre_approved' ? 'Pré-aprovado' :
                           'Pendente'}
          </p>
        </div>
        {offer.status === 'pending' && !isAccepted && (
          <button
            onClick={onRespond}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Responder
          </button>
        )}
      </div>
    </div>
  );
}

function OfferResponseModal({ offer, onClose, onRespond }) {
  const [response, setResponse] = useState('');
  const [counterAmount, setCounterAmount] = useState(offer.amount);
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h3 className="text-xl font-bold mb-4">Responder à Proposta</h3>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Proposta de:</span>
            <span className="font-medium">{offer.buyer?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Valor:</span>
            <span className="font-bold text-lg">€{offer.amount?.toLocaleString('pt-PT')}</span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {Object.values(OFFER_RESPONSES).map(option => (
            <button
              key={option.value}
              onClick={() => setResponse(option.value)}
              className={`w-full p-3 border-2 rounded-lg transition-all ${
                response === option.value
                  ? `border-${option.color}-500 bg-${option.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        {response === 'counter' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Valor da Contraproposta</label>
            <input
              type="number"
              value={counterAmount}
              onChange={(e) => setCounterAmount(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onRespond(offer, response, { counterAmount, notes });
            }}
            disabled={!response}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getStageColor(stage) {
  const stageObj = SELLER_DEAL_STAGES.find(s => s.value === stage);
  return `bg-${stageObj?.color || 'gray'}-100 text-${stageObj?.color || 'gray'}-700`;
}

function getStageLabel(stage) {
  const stageObj = SELLER_DEAL_STAGES.find(s => s.value === stage);
  return stageObj?.label || stage;
}