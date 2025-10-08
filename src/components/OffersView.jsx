import { useState } from 'react';
import { 
  ViewColumnsIcon, 
  Squares2X2Icon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function OffersView({ offers = [], askingPrice, onRespond }) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      countered: 'bg-blue-100 text-blue-800 border-blue-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const labels = {
      pending: 'Pendente',
      accepted: 'Aceite',
      rejected: 'Rejeitada',
      countered: 'Contra-proposta',
      expired: 'Expirada'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getScoreBadge = (score) => {
    const styles = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      high: 'Alta Qualidade',
      medium: 'Qualidade Média',
      low: 'Baixa Qualidade'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[score]}`}>
        {labels[score]}
      </span>
    );
  };

  const getFinancingBadge = (status) => {
    const styles = {
      cash: 'bg-green-100 text-green-800',
      'pre-approved': 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      cash: '💰 À Vista',
      'pre-approved': '✓ Pré-aprovado',
      pending: '⏳ Pendente'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getOfferBadges = (offer) => {
    const badges = [];
    
    // Use counter amount if exists, otherwise use original amount
    const effectiveAmount = offer.status === 'countered' && offer.counterAmount 
      ? offer.counterAmount 
      : offer.amount;
    
    // Best overall (highest price + best conditions)
    const highestOffer = Math.max(...offers.map(o => {
      return o.status === 'countered' && o.counterAmount ? o.counterAmount : o.amount;
    }));
    
    if (effectiveAmount === highestOffer && offer.buyerScore === 'high') {
      badges.push({ label: '🏆 Melhor Geral', color: 'bg-purple-100 text-purple-800' });
    }
    
    // Highest price
    if (effectiveAmount === highestOffer) {
      badges.push({ label: '💎 Maior Valor', color: 'bg-blue-100 text-blue-800' });
    }
    
    // Cash offer
    if (offer.financingStatus === 'cash') {
      badges.push({ label: '💵 À Vista', color: 'bg-green-100 text-green-800' });
    }
    
    // Pre-approved
    if (offer.financingStatus === 'pre-approved') {
      badges.push({ label: '✅ Pré-aprovado', color: 'bg-teal-100 text-teal-800' });
    }
    
    return badges;
  };

  const conditionLabels = {
    financing_needed: 'Necessita Financiamento',
    inspection_contingency: 'Sujeito a Inspeção',
    sale_contingency: 'Dependente de Venda',
    appraisal_contingency: 'Sujeito a Avaliação'
  };

  // Check if offer needs response
  const canRespond = (offer) => {
    return offer.status === 'pending' || offer.status === 'countered';
  };

  // Card View
  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {offers.map(offer => {
        const badges = getOfferBadges(offer);
        const showActions = canRespond(offer);
        
        return (
          <div
            key={offer.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-5 transition-all hover:shadow-md ${
              offer.status === 'accepted' ? 'border-green-500 bg-green-50' :
              offer.status === 'countered' ? 'border-blue-500 bg-blue-50' :
              offer.status === 'pending' ? 'border-yellow-500' : 'border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{offer.buyerName}</h3>
                {offer.buyerConsultant && (
                  <p className="text-sm text-gray-600">Consultor: {offer.buyerConsultant}</p>
                )}
              </div>
              {getStatusBadge(offer.status)}
            </div>

            {/* Counter-offer warning banner */}
            {offer.status === 'countered' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <ClockIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Aguardando Resposta do Comprador</p>
                  <p className="text-blue-700 text-xs mt-1">
                    O vendedor fez uma contra-proposta. Aguardando resposta do comprador.
                  </p>
                </div>
              </div>
            )}

            {/* Amount - UPDATED TO SHOW COUNTER-OFFERS */}
            <div className="mb-4">
              {offer.status === 'countered' && offer.counterAmount ? (
                <div className="space-y-3">
                  {/* Original Buyer Offer */}
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CurrencyEuroIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Proposta Original (Comprador):</span>
                    </div>
                    <div className="text-xl font-semibold text-gray-700 line-through">
                      {formatCurrency(offer.amount)}
                    </div>
                  </div>
                  
                  {/* Seller Counter-Offer */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowPathIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Contra-proposta (Vendedor):</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(offer.counterAmount)}
                    </div>
                    {askingPrice && (
                      <div className="text-sm text-gray-600 mt-1">
                        {((offer.counterAmount / askingPrice) * 100).toFixed(1)}% do preço pedido
                      </div>
                    )}
                  </div>
                  
                  {/* Counter Conditions */}
                  {offer.counterConditions && offer.counterConditions.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Condições da Contra-proposta:</p>
                      <div className="flex flex-wrap gap-1">
                        {offer.counterConditions.map(condition => (
                          <span key={condition} className="text-xs bg-blue-50 border border-blue-200 rounded px-2 py-1 text-blue-800">
                            {conditionLabels[condition]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Regular offer display (not countered) */
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(offer.amount)}
                    </span>
                  </div>
                  {askingPrice && (
                    <div className="text-sm text-gray-600">
                      {((offer.amount / askingPrice) * 100).toFixed(1)}% do preço pedido
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {badges.map((badge, idx) => (
                  <span key={idx} className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Qualidade:</span>
                {getScoreBadge(offer.buyerScore)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Financiamento:</span>
                {getFinancingBadge(offer.financingStatus)}
              </div>
              
              {offer.financingStatus !== 'cash' && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Entrada:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(offer.downPayment)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Financiamento:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(offer.financingAmount)}</span>
                  </div>
                </>
              )}
              
              {offer.validUntil && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Válida até:</span>
                  <span className="font-medium text-gray-900">{formatDate(offer.validUntil)}</span>
                </div>
              )}
            </div>

            {/* Conditions (Original Buyer Conditions) */}
            {offer.conditions && offer.conditions.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Condições (Comprador):</p>
                <div className="flex flex-wrap gap-1">
                  {offer.conditions.map(condition => (
                    <span key={condition} className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-700">
                      {conditionLabels[condition]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {offer.notes && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-1">Notas:</p>
                <p className="text-sm text-gray-700">{offer.notes}</p>
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onRespond(offer.id, 'accept')}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Aceitar
                </button>
                <button
                  onClick={() => onRespond(offer.id, 'counter')}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  {offer.status === 'countered' ? 'Nova Contra-proposta' : 'Contra-propor'}
                </button>
                <button
                  onClick={() => onRespond(offer.id, 'reject')}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Rejeitar
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Table View
  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Comprador</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Valor</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Entrada</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Financiamento</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Condições</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Qualidade</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Estado</th>
            {offers.some(o => canRespond(o)) && (
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Ações</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {offers.map(offer => (
            <tr key={offer.id} className={`hover:bg-gray-50 ${
              offer.status === 'countered' ? 'bg-blue-50' : ''
            }`}>
              <td className="px-4 py-4">
                <div className="font-medium text-gray-900">{offer.buyerName}</div>
                {offer.buyerConsultant && (
                  <div className="text-sm text-gray-600">{offer.buyerConsultant}</div>
                )}
                {offer.status === 'countered' && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    Aguarda resposta
                  </div>
                )}
              </td>
              <td className="px-4 py-4 text-right">
                {offer.status === 'countered' && offer.counterAmount ? (
                  <div>
                    <div className="text-xs text-gray-500 line-through">
                      {formatCurrency(offer.amount)}
                    </div>
                    <div className="font-semibold text-blue-900 flex items-center justify-end gap-1">
                      <ArrowPathIcon className="w-3 h-3" />
                      {formatCurrency(offer.counterAmount)}
                    </div>
                    {askingPrice && (
                      <div className="text-xs text-gray-600">
                        {((offer.counterAmount / askingPrice) * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="font-semibold text-gray-900">{formatCurrency(offer.amount)}</div>
                    {askingPrice && (
                      <div className="text-xs text-gray-600">
                        {((offer.amount / askingPrice) * 100).toFixed(1)}%
                      </div>
                    )}
                  </>
                )}
              </td>
              <td className="px-4 py-4 text-right text-gray-900">
                {formatCurrency(offer.downPayment || 0)}
              </td>
              <td className="px-4 py-4 text-center">
                {getFinancingBadge(offer.financingStatus)}
              </td>
              <td className="px-4 py-4 text-center">
                <span className="text-sm text-gray-700">
                  {offer.conditions?.length || 0}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                {getScoreBadge(offer.buyerScore)}
              </td>
              <td className="px-4 py-4 text-center">
                {getStatusBadge(offer.status)}
              </td>
              {offers.some(o => canRespond(o)) && (
                <td className="px-4 py-4">
                  {canRespond(offer) ? (
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => onRespond(offer.id, 'accept')}
                        className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        title="Aceitar"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRespond(offer.id, 'counter')}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title={offer.status === 'countered' ? 'Nova Contra-proposta' : 'Contra-propor'}
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRespond(offer.id, 'reject')}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        title="Rejeitar"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (offers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <BanknotesIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Nenhuma proposta recebida ainda</p>
        <p className="text-sm text-gray-500 mt-1">
          Adicione propostas à medida que forem recebidas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Propostas Recebidas ({offers.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              viewMode === 'cards'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Squares2X2Icon className="w-5 h-5" />
            Cartões
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ViewColumnsIcon className="w-5 h-5" />
            Tabela
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? <CardView /> : <TableView />}
    </div>
  );
}