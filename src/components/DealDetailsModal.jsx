// src/components/DealDetailsModal.jsx
import { useState } from 'react';
import { 
  XMarkIcon, 
  EyeIcon, 
  DocumentTextIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import ViewingHistory from './ViewingHistory';
import OfferTimeline from './OfferTimeline';
import MakeOfferModal from './MakeOfferModal';
import RespondOfferModal from './RespondOfferModal';

const DealDetailsModal = ({ 
  deal, 
  client, 
  opportunity,
  onClose, 
  onAddViewing, 
  onEditViewing, 
  onCompleteViewing, 
  onUpdate, 
  footer 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [offerRefreshKey, setOfferRefreshKey] = useState(0); // ensure present
  
  // Offer modal states
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const [showRespondOfferModal, setShowRespondOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerAction, setOfferAction] = useState(null);

  // UPDATED: Prevent actions when an offer is accepted
  const handleMakeOffer = (offer = null) => {
    const hasAccepted = deal.latestOfferStatus === 'accepted';
    if (hasAccepted && !offer) {
      alert('Não é possível criar novas propostas. Uma oferta já foi aceite.');
      return;
    }
    setSelectedOffer(offer);
    setShowMakeOfferModal(true);
  };

  const handleRespondOffer = (offer, action) => {
    const locked = deal.latestOfferStatus === 'accepted' && offer.status !== 'accepted';
    if (locked) {
      alert('Não é possível modificar propostas. Uma oferta já foi aceite.');
      return;
    }
    setSelectedOffer(offer);
    setOfferAction(action);
    setShowRespondOfferModal(true);
  };

  const handleOfferSuccess = () => {
    // 1) Force OfferTimeline remount
    setOfferRefreshKey(prev => prev + 1);

    // 2) Clear modal states (modals close themselves too)
    setShowMakeOfferModal(false);
    setShowRespondOfferModal(false);
    setSelectedOffer(null);
    setOfferAction(null);

    // 3) Refresh parent deal data
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold">{deal.propertyAddress || 'Sem endereço'}</h2>
              <p className="text-sm text-gray-600 mt-1">{client?.name}</p>
              <p className="text-lg font-bold text-indigo-600 mt-1">
                €{deal.propertyPrice?.toLocaleString('pt-PT') || '0'}
              </p>
            </div>
            <button onClick={onClose}>
              <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b flex-shrink-0">
            <div className="flex space-x-6 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Visão Geral
              </button>
              
              <button
                onClick={() => setActiveTab('viewings')}
                className={`py-3 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'viewings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                Visitas ({deal.viewingCount || 0})
              </button>

              <button
                onClick={() => setActiveTab('propostas')}
                className={`py-3 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'propostas'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                Propostas ({deal.offerCount || 0})
              </button>
              
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'notes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Notas
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Buyer Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Detalhes do Comprador</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600">Nome</dt>
                      <dd className="text-sm font-medium">{deal.buyerName || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Email</dt>
                      <dd className="text-sm font-medium">{deal.buyerEmail || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Telefone</dt>
                      <dd className="text-sm font-medium">{deal.buyerPhone || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Status</dt>
                      <dd className="text-sm font-medium capitalize">{deal.status || 'lead'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Deal Stats */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Estatísticas</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {deal.viewingCount || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Visitas</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {deal.offerCount || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Propostas</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {deal.probability || 50}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Probabilidade</div>
                    </div>
                  </div>
                </div>

                {/* Latest Offer */}
                {deal.offerCount > 0 && deal.latestOfferAmount > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Última Proposta</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            €{deal.latestOfferAmount.toLocaleString('pt-PT')}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Status: <span className="font-medium">{deal.latestOfferStatus}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('propostas')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Ver todas →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {deal.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Notas</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'viewings' && (
              <ViewingHistory
                viewings={deal.viewings || []}
                onAddViewing={onAddViewing}
                onEditViewing={onEditViewing}
                onCompleteViewing={onCompleteViewing}
              />
            )}

            {activeTab === 'propostas' && (
              <OfferTimeline
                key={`offers-${deal.id}-${offerRefreshKey}`}
                clientId={client.id}
                opportunityId={opportunity.id}
                dealId={deal.id}
                onMakeOffer={handleMakeOffer}
                onRespondOffer={handleRespondOffer}
              />
            )}

            {activeTab === 'notes' && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas do Negócio
                  </label>
                  <textarea
                    value={deal.notes || ''}
                    onChange={(e) => {
                      // Handle note update here
                    }}
                    rows="8"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Adicione notas sobre este negócio..."
                  />
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Guardar Notas
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-6 border-t bg-gray-50 flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Offer Modals */}
      {showMakeOfferModal && (
        <MakeOfferModal
          isOpen={showMakeOfferModal}
          onClose={() => {
            setShowMakeOfferModal(false);
            setSelectedOffer(null);
          }}
          clientId={client.id}
          opportunityId={opportunity.id}
          dealId={deal.id}
          propertyPrice={deal.propertyPrice}
          existingOffer={selectedOffer}
          onSuccess={handleOfferSuccess}
        />
      )}

      {showRespondOfferModal && selectedOffer && (
        <RespondOfferModal
          isOpen={showRespondOfferModal}
          onClose={() => {
            setShowRespondOfferModal(false);
            setSelectedOffer(null);
            setOfferAction(null);
          }}
          clientId={client.id}
          opportunityId={opportunity.id}
          dealId={deal.id}
          offer={selectedOffer}
          action={offerAction}
          onSuccess={handleOfferSuccess}
        />
      )}
    </>
  );
};

export default DealDetailsModal;