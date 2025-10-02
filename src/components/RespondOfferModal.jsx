// src/components/RespondOfferModal.jsx
import { useState } from 'react';
import { X, CheckCircle, XCircle, ArrowLeftRight, FileX, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDeal } from '../contexts/DealContext';
import { updateOffer } from '../models/buyerDealModel';
import { Timestamp } from 'firebase/firestore';

const RespondOfferModal = ({ 
  isOpen, 
  onClose, 
  clientId, 
  opportunityId, 
  dealId,
  offer,
  action, // 'accept', 'reject', 'counter', 'send'
  onSuccess 
}) => {
  const { currentUser } = useAuth();
  const { initializeTransaction } = useDeal();
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState({
    counterAmount: '',
    sellerResponse: '',
    counterNotes: ''
  });

  if (!isOpen || !offer) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let updateData = {};

      switch (action) {
        case 'accept':
          updateData = {
            status: 'accepted',
            sellerResponse: responseData.sellerResponse || 'Proposta aceite',
            respondedAt: Timestamp.now()
          };
          break;

        case 'reject':
          updateData = {
            status: 'rejected',
            sellerResponse: responseData.sellerResponse || 'Proposta recusada',
            respondedAt: Timestamp.now()
          };
          break;

        case 'counter':
          if (!responseData.counterAmount || parseFloat(responseData.counterAmount) <= 0) {
            alert('Por favor, insira um valor válido para a contraproposta');
            setLoading(false);
            return;
          }
          updateData = {
            status: 'countered',
            counterAmount: parseFloat(responseData.counterAmount),
            counterNotes: responseData.counterNotes,
            sellerResponse: responseData.sellerResponse || `Contraproposta: ${formatCurrency(parseFloat(responseData.counterAmount))}`,
            respondedAt: Timestamp.now()
          };
          break;

        case 'send':
          updateData = {
            status: 'sent',
            sentAt: Timestamp.now(),
            expiresAt: Timestamp.fromMillis(Date.now() + (offer.expiryHours * 60 * 60 * 1000))
          };
          break;

        case 'withdraw':
          updateData = {
            status: 'withdrawn',
            sellerResponse: responseData.sellerResponse || 'Proposta retirada pelo comprador',
            respondedAt: Timestamp.now()
          };
          break;

        default:
          setLoading(false);
          return;
      }

      await updateOffer(
        currentUser.uid,
        clientId,
        opportunityId,
        dealId,
        offer.id,
        updateData
      );

      // If accepted, initialize transaction
      if (action === 'accept') {
        const acceptedOffer = { ...offer, ...updateData, status: 'accepted' };
        await initializeTransaction(clientId, opportunityId, dealId, acceptedOffer);
      }

      // IMPORTANT: Close modal first
      onClose();

      // Then trigger success callback (will refresh parent)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error responding to offer:', error);
      alert('Erro ao processar resposta. Tente novamente.');
      setLoading(false); // Only reset loading on error
    }
    // Don't reset loading on success - modal will unmount
  };

  const getModalConfig = () => {
    switch (action) {
      case 'accept':
        return {
          title: '✅ Aceitar Proposta',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          color: 'green',
          description: offer.counterAmount > 0 
            ? `Aceitar contraproposta de ${formatCurrency(offer.counterAmount)}`
            : `Aceitar proposta de ${formatCurrency(offer.amount)}`,
          buttonText: 'Confirmar Aceitação',
          showCounterAmount: false,
          showCounterNotes: false
        };
      case 'reject':
        return {
          title: '❌ Recusar Proposta',
          icon: <XCircle className="w-6 h-6 text-red-600" />,
          color: 'red',
          description: offer.counterAmount > 0
            ? `Recusar contraproposta de ${formatCurrency(offer.counterAmount)}`
            : `Recusar proposta de ${formatCurrency(offer.amount)}`,
          buttonText: 'Confirmar Recusa',
          showCounterAmount: false,
          showCounterNotes: false
        };
      case 'counter':
        return {
          title: '↔️ Contraproposta',
          icon: <ArrowLeftRight className="w-6 h-6 text-yellow-600" />,
          color: 'yellow',
          description: `Proposta atual: ${formatCurrency(offer.counterAmount || offer.amount)}`,
          buttonText: 'Enviar Contraproposta',
          showCounterAmount: true,
          showCounterNotes: true
        };
      case 'send':
        return {
          title: '📤 Enviar Proposta',
          icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
          color: 'blue',
          description: `Enviar proposta de ${formatCurrency(offer.amount)} ao vendedor`,
          buttonText: 'Enviar Agora',
          showCounterAmount: false,
          showCounterNotes: false
        };
      case 'withdraw':
        return {
          title: '🚫 Retirar Proposta',
          icon: <FileX className="w-6 h-6 text-purple-600" />,
          color: 'purple',
          description: 'Retirar esta proposta permanentemente',
          buttonText: 'Confirmar Retirada',
          showCounterAmount: false,
          showCounterNotes: false
        };
      default:
        return {};
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b bg-gradient-to-r from-${config.color}-600 to-${config.color}-700`}>
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              {config.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {config.title}
              </h2>
              <p className="text-white text-opacity-90 text-sm mt-1">
                Proposta #{offer.offerNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Description */}
            <div className={`bg-${config.color}-50 rounded-lg p-4 border border-${config.color}-200`}>
              <p className={`text-${config.color}-900 font-medium`}>
                {config.description}
              </p>
            </div>

            {/* Current Offer Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Resumo da Proposta Atual:
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor original:</span>
                  <span className="font-semibold">{formatCurrency(offer.amount)}</span>
                </div>
                {offer.counterAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contraproposta:</span>
                    <span className="font-semibold text-yellow-600">
                      {formatCurrency(offer.counterAmount)}
                    </span>
                  </div>
                )}
                {offer.terms?.downPayment > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sinal:</span>
                    <span className="font-semibold">{formatCurrency(offer.terms.downPayment)}</span>
                  </div>
                )}
                {offer.buyerApproved && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Comprador aprovou</span>
                  </div>
                )}
              </div>
            </div>

            {/* Counter Amount (only for counter action) */}
            {config.showCounterAmount && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor da Contraproposta *
                </label>
                <input
                  type="number"
                  name="counterAmount"
                  value={responseData.counterAmount}
                  onChange={handleChange}
                  placeholder="195000"
                  step="1000"
                  min="0"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg font-semibold"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Novo valor proposto pelo vendedor
                </p>
              </div>
            )}

            {/* Counter Notes (only for counter action) */}
            {config.showCounterNotes && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Justificação da Contraproposta
                </label>
                <textarea
                  name="counterNotes"
                  value={responseData.counterNotes}
                  onChange={handleChange}
                  placeholder="Ex: Valor abaixo das expectativas, existem outras propostas, investimentos recentes na propriedade..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Razões do vendedor para a contraproposta
                </p>
              </div>
            )}

            {/* Seller Response / Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                {action === 'counter' ? 'Mensagem do Vendedor (opcional)' : 'Notas / Mensagem'}
              </label>
              <textarea
                name="sellerResponse"
                value={responseData.sellerResponse}
                onChange={handleChange}
                placeholder={
                  action === 'accept' ? 'Ex: Vendedor aceitou os termos propostos...' :
                  action === 'reject' ? 'Ex: Valor muito abaixo das expectativas do vendedor...' :
                  action === 'counter' ? 'Ex: Vendedor disponível para negociar mas precisa de valor mais próximo do pedido...' :
                  action === 'send' ? 'Mensagem opcional ao enviar...' :
                  'Razão para retirar a proposta...'
                }
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contexto adicional sobre esta resposta
              </p>
            </div>

            {/* Warning for irreversible actions */}
            {(action === 'accept' || action === 'reject' || action === 'withdraw') && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <strong>Atenção:</strong> Esta ação não pode ser desfeita. 
                    {action === 'accept' && ' O negócio será marcado como aceite.'}
                    {action === 'reject' && ' Poderá criar uma nova proposta posteriormente.'}
                    {action === 'withdraw' && ' A proposta será permanentemente retirada.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                A processar...
              </>
            ) : (
              config.buttonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// AlertCircle icon component
const AlertCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default RespondOfferModal;