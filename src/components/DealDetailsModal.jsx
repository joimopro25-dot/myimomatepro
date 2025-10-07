/**
 * UPDATED DEALDETAILSMODAL COMPONENT
 * Add this to your DealBoard.jsx to include PropertyMatching
 */

// Add this import at the top of DealBoard.jsx:
import PropertyMatching from '../components/PropertyMatching';

// Update the DealDetailsModal component in your DealBoard.jsx:
const DealDetailsModal = ({
  deal,
  client,
  opportunity,
  onClose,
  onAddViewing,
  onScheduleViewing,
  onRecordViewing,
  onEditViewing,
  onCompleteViewing,
  onUpdate,
  footer
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const [showRespondOfferModal, setShowRespondOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerAction, setOfferAction] = useState(null);

  const { updateTransaction } = useDeal();

  const handleMakeOffer = (offer = null) => {
    setSelectedOffer(offer);
    setShowMakeOfferModal(true);
  };

  const handleRespondOffer = (offer, action) => {
    setSelectedOffer(offer);
    setOfferAction(action);
    setShowRespondOfferModal(true);
  };

  const handleOfferSuccess = () => {
    if (onUpdate) onUpdate();
    setShowMakeOfferModal(false);
    setShowRespondOfferModal(false);
    setSelectedOffer(null);
    setOfferAction(null);
  };

  const handlePropertyLinked = (match) => {
    // Update the deal with linked property info
    console.log('Property linked:', match);
    if (onUpdate) onUpdate();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
          <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold">{deal.property?.address || deal.propertyAddress}</h2>
              <p className="text-sm text-gray-600 mt-1">{client?.name}</p>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-lg font-bold text-indigo-600">
                  €{(deal.price || deal.pricing?.askingPrice || 0).toLocaleString('pt-PT')}
                </p>
                {deal.linkedProperty?.sellerOpportunityId && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <HomeIcon className="w-3 h-3 mr-1" />
                    Conectado a Vendedor
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose}>
              <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="border-b flex-shrink-0">
            <div className="flex space-x-6 px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('matching')}
                className={`py-3 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'matching'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <SparklesIcon className="w-4 h-4 mr-1" />
                Imóveis Compatíveis
              </button>
              <button
                onClick={() => setActiveTab('viewings')}
                className={`py-3 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'viewings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                Visitas ({deal.viewings?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('propostas')}
                className={`py-3 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'propostas'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                Propostas ({deal.offerCount || 0})
              </button>
              <button
                onClick={() => setActiveTab('commission')}
                className={`py-3 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'commission'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <CurrencyEuroIcon className="w-4 h-4 mr-1" />
                Comissão
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'notes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Notas
              </button>
              {deal.transaction && (
                <button
                  onClick={() => setActiveTab('transaction')}
                  className={`py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'transaction'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Transação
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Linked Property Alert */}
                {deal.linkedProperty?.sellerOpportunityId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <HomeIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900">Imóvel Conectado</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Este negócio está conectado ao vendedor: {deal.linkedProperty.sellerName}
                        </p>
                        <p className="text-sm text-green-700">
                          Morada: {deal.linkedProperty.propertyAddress}
                        </p>
                        <button
                          onClick={() => window.open(`/clients/${deal.linkedProperty.sellerClientId}/seller-opportunities/${deal.linkedProperty.sellerOpportunityId}`, '_blank')}
                          className="mt-2 text-sm font-medium text-green-600 hover:text-green-700"
                        >
                          Ver detalhes do vendedor →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Detalhes do Imóvel</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600">Tipo</dt>
                      <dd className="text-sm font-medium">{deal.property?.type || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Quartos</dt>
                      <dd className="text-sm font-medium">{deal.property?.bedrooms || 0}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Casas de Banho</dt>
                      <dd className="text-sm font-medium">{deal.property?.bathrooms || 0}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Área</dt>
                      <dd className="text-sm font-medium">{deal.property?.area || 0}m²</dd>
                    </div>
                  </dl>
                </div>

                {deal.propertyAgent?.name && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Agente do Imóvel</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-600">Nome</dt>
                        <dd className="text-sm font-medium">{deal.propertyAgent.name}</dd>
                      </div>
                      {deal.propertyAgent.agency && (
                        <div>
                          <dt className="text-sm text-gray-600">Agência</dt>
                          <dd className="text-sm font-medium">{deal.propertyAgent.agency}</dd>
                        </div>
                      )}
                      {deal.propertyAgent.phone && (
                        <div>
                          <dt className="text-sm text-gray-600">Telefone</dt>
                          <dd className="text-sm font-medium">{deal.propertyAgent.phone}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'matching' && (
              <div>
                {deal.linkedProperty?.sellerOpportunityId ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">Este negócio já está conectado a um vendedor</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Vendedor: {deal.linkedProperty.sellerName}
                    </p>
                  </div>
                ) : (
                  <PropertyMatching 
                    mode="buyer"
                    sourceData={{
                      requirements: deal.requirements || {
                        maxBudget: deal.price || deal.pricing?.askingPrice || 300000,
                        minBudget: ((deal.price || deal.pricing?.askingPrice || 300000) * 0.8),
                        propertyTypes: [deal.property?.type || 'apartamento'],
                        minBedrooms: deal.property?.bedrooms || 2,
                        minArea: deal.property?.area || 80,
                        desiredLocations: deal.property?.location ? [deal.property.location] : [],
                        requiredFeatures: deal.property?.features || []
                      }
                    }}
                    clientId={client.id}
                    documentId={deal.id}
                    onLink={handlePropertyLinked}
                  />
                )}
              </div>
            )}

            {activeTab === 'viewings' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Histórico de Visitas</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={onScheduleViewing}
                      className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Agendar Visita
                    </button>
                    <button
                      onClick={onRecordViewing || onAddViewing}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Registar Visita
                    </button>
                  </div>
                </div>
                <ViewingHistory
                  viewings={deal.viewings || []}
                  onEdit={(viewing) => onEditViewing(viewing)}
                  onComplete={(viewing) => onCompleteViewing(viewing)}
                />
              </div>
            )}

            {activeTab === 'propostas' && (
              <OfferTimeline
                clientId={client.id}
                opportunityId={opportunity?.id}
                dealId={deal.id}
                onMakeOffer={handleMakeOffer}
                onRespondOffer={handleRespondOffer}
              />
            )}

            {activeTab === 'commission' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Detalhes da Comissão</h3>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Lado Comprador</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Percentagem:</span>
                          <span className="font-medium">{deal.commission?.buyerSide?.percentage || 2.5}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Valor Estimado:</span>
                          <span className="font-medium text-green-600">
                            €{((deal.price || deal.pricing?.askingPrice || 0) * (deal.commission?.buyerSide?.percentage || 2.5) / 100).toLocaleString('pt-PT')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {deal.linkedProperty?.sellerOpportunityId && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Lado Vendedor</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Percentagem:</span>
                            <span className="font-medium">{deal.commission?.sellerSide?.percentage || 2.5}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Valor Estimado:</span>
                            <span className="font-medium text-green-600">
                              €{((deal.price || deal.pricing?.askingPrice || 0) * (deal.commission?.sellerSide?.percentage || 2.5) / 100).toLocaleString('pt-PT')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-700">Comissão Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        €{((deal.price || deal.pricing?.askingPrice || 0) * 
                          ((deal.commission?.buyerSide?.percentage || 2.5) + 
                           (deal.linkedProperty?.sellerOpportunityId ? (deal.commission?.sellerSide?.percentage || 2.5) : 0)) / 100
                        ).toLocaleString('pt-PT')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {deal.linkedProperty?.sellerOpportunityId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 Este negócio está conectado a ambos os lados (comprador e vendedor), 
                      permitindo comissão dupla.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                {deal.notes && (
                  <div>
                    <h3 className="font-medium mb-2">Notas Gerais</h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {deal.notes}
                    </p>
                  </div>
                )}
                {deal.internalNotes && (
                  <div>
                    <h3 className="font-medium mb-2">Notas Internas</h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      {deal.internalNotes}
                    </p>
                  </div>
                )}
                {!deal.notes && !deal.internalNotes && (
                  <p className="text-gray-500 text-center py-8">Sem notas</p>
                )}
              </div>
            )}

            {activeTab === 'transaction' && deal.transaction && (
              <TransactionTimeline
                transaction={deal.transaction}
                onUpdateTransaction={async (updated) => {
                  await updateTransaction(client.id, opportunity?.id, deal.id, updated);
                  if (onUpdate) onUpdate();
                }}
              />
            )}
          </div>

          {footer && (
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>

      {showMakeOfferModal && (
        <MakeOfferModal
          isOpen={showMakeOfferModal}
          onClose={() => {
            setShowMakeOfferModal(false);
            setSelectedOffer(null);
          }}
          clientId={client.id}
          opportunityId={opportunity?.id}
          dealId={deal.id}
          propertyPrice={deal.pricing?.askingPrice || deal.price}
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
          opportunityId={opportunity?.id}
          dealId={deal.id}
          offer={selectedOffer}
          action={offerAction}
          onSuccess={handleOfferSuccess}
        />
      )}
    </>
  );
};