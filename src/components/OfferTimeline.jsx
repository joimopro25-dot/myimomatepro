// src/components/OfferTimeline.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOffers, OFFER_STATUS } from '../models/buyerDealModel';
import { Clock, CheckCircle, XCircle, ArrowLeftRight, AlertCircle, FileX, Edit } from 'lucide-react';

const OfferTimeline = ({ clientId, opportunityId, dealId, onMakeOffer, onRespondOffer }) => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, [dealId]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await getOffers(user.uid, clientId, opportunityId, dealId);
      setOffers(data);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'countered':
        return <ArrowLeftRight className="w-5 h-5 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'withdrawn':
        return <FileX className="w-5 h-5 text-purple-600" />;
      case 'sent':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'draft':
        return <Edit className="w-5 h-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusConfig = (status) => {
    return OFFER_STATUS.find(s => s.value === status) || OFFER_STATUS[0];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const ExpiryTimer = ({ expiresAt }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
      if (!expiresAt) return;

      const updateTimer = () => {
        const now = Date.now();
        const expiry = expiresAt.toMillis ? expiresAt.toMillis() : expiresAt;
        const diff = expiry - now;

        if (diff <= 0) {
          setIsExpired(true);
          setTimeLeft('Expirada');
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
          const days = Math.floor(hours / 24);
          setTimeLeft(`${days}d ${hours % 24}h`);
        } else {
          setTimeLeft(`${hours}h ${minutes}min`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute

      return () => clearInterval(interval);
    }, [expiresAt]);

    if (!expiresAt) return null;

    return (
      <div className={`flex items-center gap-1 text-sm ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
        <Clock className="w-4 h-4" />
        <span>{isExpired ? '⚠️ Expirada' : `⏱️ Expira em: ${timeLeft}`}</span>
      </div>
    );
  };

  const OfferCard = ({ offer }) => {
    const statusConfig = getStatusConfig(offer.status);
    const showActions = offer.status === 'countered' || offer.status === 'sent';
    const hasCounter = offer.counterAmount > 0;

    return (
      <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(offer.status)}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  Proposta #{offer.offerNumber}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
                  {statusConfig.label}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                {formatDate(offer.createdAt)}
              </div>
            </div>
          </div>

          {/* Buyer Approval Badge */}
          {offer.buyerApproved && (
            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
              ✓ Comprador aprovou
            </span>
          )}
        </div>

        {/* Amount Display */}
        <div className="mb-3">
          {hasCounter ? (
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="text-gray-500 line-through">{formatCurrency(offer.amount)}</span>
              <ArrowLeftRight className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-600">{formatCurrency(offer.counterAmount)}</span>
            </div>
          ) : (
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(offer.amount)}
            </div>
          )}
        </div>

        {/* Terms Summary */}
        {offer.terms && (offer.terms.downPayment > 0 || offer.terms.closingDate) && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm space-y-1">
            {offer.terms.downPayment > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Sinal:</span>
                <span className="font-medium">{formatCurrency(offer.terms.downPayment)}</span>
              </div>
            )}
            {offer.terms.financingAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Financiamento:</span>
                <span className="font-medium">{formatCurrency(offer.terms.financingAmount)}</span>
              </div>
            )}
            {offer.terms.closingDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Data de fecho:</span>
                <span className="font-medium">
                  {new Date(offer.terms.closingDate).toLocaleDateString('pt-PT')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Conditions & Contingencies */}
        {(offer.terms?.conditions || offer.terms?.contingencies) && (
          <div className="mb-3 text-sm space-y-1">
            {offer.terms.conditions && (
              <div>
                <span className="text-gray-600">Condições:</span>
                <span className="ml-2 text-gray-900">{offer.terms.conditions}</span>
              </div>
            )}
            {offer.terms.contingencies && (
              <div>
                <span className="text-gray-600">Contingências:</span>
                <span className="ml-2 text-gray-900">{offer.terms.contingencies}</span>
              </div>
            )}
          </div>
        )}

        {/* Expiry Timer */}
        {(offer.status === 'sent' || offer.status === 'countered') && offer.expiresAt && (
          <div className="mb-3">
            <ExpiryTimer expiresAt={offer.expiresAt} />
          </div>
        )}

        {/* Seller Response */}
        {offer.sellerResponse && (
          <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
            <div className="font-medium text-blue-900 mb-1">Resposta do vendedor:</div>
            <div className="text-blue-800">{offer.sellerResponse}</div>
          </div>
        )}

        {/* Counter Notes */}
        {offer.counterNotes && (
          <div className="mb-3 p-2 bg-yellow-50 rounded text-sm">
            <div className="font-medium text-yellow-900 mb-1">Justificação da contraproposta:</div>
            <div className="text-yellow-800">{offer.counterNotes}</div>
          </div>
        )}

        {/* Internal Notes */}
        {offer.notes && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
            <div className="font-medium text-gray-700 mb-1">Notas internas:</div>
            <div className="text-gray-600">{offer.notes}</div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <button
              onClick={() => onRespondOffer(offer, 'accept')}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Aceitar
            </button>
            <button
              onClick={() => onRespondOffer(offer, 'reject')}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Recusar
            </button>
            <button
              onClick={() => onRespondOffer(offer, 'counter')}
              className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Contrapor
            </button>
          </div>
        )}

        {/* Draft Actions */}
        {offer.status === 'draft' && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <button
              onClick={() => onMakeOffer(offer)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Editar
            </button>
            <button
              onClick={() => onRespondOffer(offer, 'send')}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Enviar
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <Clock className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-600 mb-4">Ainda não existem propostas</p>
        <button
          onClick={() => onMakeOffer(null)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Criar Primeira Proposta
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📋 Histórico de Propostas ({offers.length})
        </h3>
        <button
          onClick={() => onMakeOffer(null)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Nova Proposta
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
};

export default OfferTimeline;