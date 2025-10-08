import { 
  XMarkIcon as X, 
  CurrencyEuroIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  ClockIcon, 
  UserIcon, 
  CalendarIcon, 
  ExclamationCircleIcon as AlertCircle 
} from '@heroicons/react/24/outline';

const ViewOfferDetailsModal = ({ isOpen, onClose, offer, askingPrice, onRespond }) => {
  if (!isOpen || !offer) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { 
        label: 'Pendente', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon 
      },
      accepted: { 
        label: 'Aceite', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon 
      },
      rejected: { 
        label: 'Rejeitada', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircleIcon 
      },
      countered: { 
        label: 'Contra-proposta', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: ArrowPathIcon 
      },
      expired: { 
        label: 'Expirada', 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertCircle 
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  const getScoreBadge = (score) => {
    const styles = {
      high: { color: 'bg-green-100 text-green-800', label: 'Alta Qualidade' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Qualidade Média' },
      low: { color: 'bg-gray-100 text-gray-800', label: 'Baixa Qualidade' }
    };
    return styles[score] || styles.medium;
  };

  const getFinancingBadge = (status) => {
    const styles = {
      cash: { color: 'bg-green-100 text-green-800', label: '💰 À Vista', emoji: '💵' },
      'pre-approved': { color: 'bg-blue-100 text-blue-800', label: '✓ Pré-aprovado', emoji: '✅' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: '⏳ Pendente', emoji: '⏳' }
    };
    return styles[status] || styles.pending;
  };

  const conditionLabels = {
    financing_needed: 'Necessita Financiamento',
    inspection_contingency: 'Sujeito a Inspeção',
    sale_contingency: 'Dependente de Venda',
    appraisal_contingency: 'Sujeito a Avaliação'
  };

  const statusInfo = getStatusInfo(offer.status);
  const StatusIcon = statusInfo.icon;
  const scoreBadge = getScoreBadge(offer.buyerScore);
  const financingBadge = getFinancingBadge(offer.financingStatus);

  const canRespond = offer.status === 'pending' || offer.status === 'countered';

  // Build negotiation timeline
  const timeline = [
    {
      date: offer.receivedAt || offer.createdAt,
      type: 'received',
      label: 'Proposta Recebida',
      amount: offer.amount,
      from: 'Comprador'
    }
  ];

  if (offer.status === 'countered' && offer.counteredAt) {
    timeline.push({
      date: offer.counteredAt,
      type: 'countered',
      label: 'Contra-proposta Enviada',
      amount: offer.counterAmount,
      from: 'Vendedor'
    });
  }

  if (offer.status === 'accepted' && offer.acceptedAt) {
    timeline.push({
      date: offer.acceptedAt,
      type: 'accepted',
      label: 'Proposta Aceite',
      from: 'Vendedor'
    });
  }

  if (offer.status === 'rejected' && offer.rejectedAt) {
    timeline.push({
      date: offer.rejectedAt,
      type: 'rejected',
      label: 'Proposta Rejeitada',
      from: 'Vendedor'
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Detalhes da Proposta - {offer.buyerName}
              </h2>
              <p className="text-sm text-gray-600">
                {offer.buyerConsultant || 'Consultor não especificado'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.label}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* VALUES & NEGOTIATION */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CurrencyEuroIcon className="w-5 h-5 text-blue-600" />
              Valores e Negociação
            </h3>
            <div className="bg-gray-50 rounded-lg p-5 space-y-4">
              {offer.status === 'countered' && offer.counterAmount ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Offer */}
                  <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Proposta Original (Comprador)</p>
                    <p className="text-2xl font-bold text-gray-700 line-through">{formatCurrency(offer.amount)}</p>
                    {askingPrice && (
                      <p className="text-xs text-gray-500 mt-1">
                        {((offer.amount / askingPrice) * 100).toFixed(1)}% do preço pedido
                      </p>
                    )}
                  </div>
                  
                  {/* Counter Offer */}
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
                    <p className="text-sm text-blue-900 font-medium mb-2 flex items-center gap-2">
                      <ArrowPathIcon className="w-4 h-4" />
                      Contra-proposta (Vendedor)
                    </p>
                    <p className="text-3xl font-bold text-blue-900">{formatCurrency(offer.counterAmount)}</p>
                    {askingPrice && (
                      <p className="text-xs text-blue-700 mt-1">
                        {((offer.counterAmount / askingPrice) * 100).toFixed(1)}% do preço pedido
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Valor Proposto</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(offer.amount)}</p>
                  {askingPrice && (
                    <p className="text-xs text-gray-500 mt-1">
                      {((offer.amount / askingPrice) * 100).toFixed(1)}% do preço pedido (€{formatCurrency(askingPrice)})
                    </p>
                  )}
                </div>
              )}

              {/* Financial Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                {askingPrice && (
                  <div>
                    <p className="text-sm text-gray-600">Preço Pedido</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(askingPrice)}</p>
                  </div>
                )}
                {offer.downPayment && (
                  <div>
                    <p className="text-sm text-gray-600">Entrada</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(offer.downPayment)}</p>
                  </div>
                )}
                {offer.financingAmount && (
                  <div>
                    <p className="text-sm text-gray-600">Financiamento</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(offer.financingAmount)}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* NEGOTIATION TIMELINE */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-blue-600" />
              Histórico de Negociação
            </h3>
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="space-y-4">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        item.type === 'received' ? 'bg-blue-500' :
                        item.type === 'countered' ? 'bg-blue-600' :
                        item.type === 'accepted' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}></div>
                      {idx < timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 flex-1 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                      </div>
                      <p className="text-sm text-gray-600">Por: {item.from}</p>
                      {item.amount && (
                        <p className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(item.amount)}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Waiting status */}
                {offer.status === 'countered' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-yellow-700">Aguardando Resposta do Comprador</p>
                      <p className="text-sm text-gray-600">A contra-proposta foi enviada e está aguardando resposta</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* NOTES & AGREEMENTS */}
          {(offer.notes || offer.rejectReason) && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                📋 Notas e Acordos
              </h3>
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                {offer.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Observações:</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{offer.notes}</p>
                  </div>
                )}
                {offer.rejectReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-900 mb-2">Motivo da Rejeição:</p>
                    <p className="text-red-800 whitespace-pre-wrap">{offer.rejectReason}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* CONDITIONS */}
          {((offer.conditions && offer.conditions.length > 0) || 
            (offer.counterConditions && offer.counterConditions.length > 0)) && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                ⚠️ Condições
              </h3>
              <div className="space-y-4">
                {offer.conditions && offer.conditions.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">Condições do Comprador:</p>
                    <div className="flex flex-wrap gap-2">
                      {offer.conditions.map(condition => (
                        <span key={condition} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700">
                          {conditionLabels[condition]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {offer.counterConditions && offer.counterConditions.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-3">Condições da Contra-proposta (Vendedor):</p>
                    <div className="flex flex-wrap gap-2">
                      {offer.counterConditions.map(condition => (
                        <span key={condition} className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm text-blue-800">
                          {conditionLabels[condition]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* BUYER INFORMATION */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              👤 Informações do Comprador
            </h3>
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nome</p>
                  <p className="font-medium text-gray-900">{offer.buyerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Consultor</p>
                  <p className="font-medium text-gray-900">{offer.buyerConsultant || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Qualidade do Comprador</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${scoreBadge.color}`}>
                    {scoreBadge.label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Financiamento</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${financingBadge.color}`}>
                    {financingBadge.label}
                  </span>
                </div>
                {offer.validUntil && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Válida Até</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      {formatDateShort(offer.validUntil)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer - Action Buttons */}
        {canRespond && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onClose();
                onRespond(offer.id, 'reject');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <XCircleIcon className="w-4 h-4" />
              Rejeitar
            </button>
            <button
              onClick={() => {
                onClose();
                onRespond(offer.id, 'counter');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              {offer.status === 'countered' ? 'Nova Contra-proposta' : 'Contra-propor'}
            </button>
            <button
              onClick={() => {
                onClose();
                onRespond(offer.id, 'accept');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Aceitar Proposta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewOfferDetailsModal;