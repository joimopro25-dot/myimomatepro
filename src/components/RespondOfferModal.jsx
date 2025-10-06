// src/components/RespondSellerOfferModal.jsx
import { useState } from 'react';
import { X, CheckCircle, XCircle, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { updateOfferStatus, updateSellerStage } from '../utils/sellerOpportunityFirebase';
import { useAuth } from '../contexts/AuthContext';

const RespondSellerOfferModal = ({ 
  isOpen, 
  onClose, 
  clientId, 
  opportunityId, 
  offer,
  action, // 'accept', 'reject', 'counter'
  onSuccess 
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState({
    counterAmount: '',
    counterConditions: [],
    rejectReason: '',
    notes: ''
  });

  if (!isOpen || !offer) return null;

  const conditionOptions = [
    { value: 'financing_needed', label: 'Necessita Financiamento' },
    { value: 'inspection_contingency', label: 'Sujeito a Inspeção' },
    { value: 'sale_contingency', label: 'Dependente de Venda' },
    { value: 'appraisal_contingency', label: 'Sujeito a Avaliação' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleCondition = (condition) => {
    setResponseData(prev => ({
      ...prev,
      counterConditions: prev.counterConditions.includes(condition)
        ? prev.counterConditions.filter(c => c !== condition)
        : [...prev.counterConditions, condition]
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

    // Validation based on action
    if (action === 'counter') {
      if (!responseData.counterAmount) {
        alert('Por favor insira o valor da contra-proposta');
        return;
      }
      if (parseFloat(responseData.counterAmount) <= 0) {
        alert('O valor da contra-proposta deve ser maior que zero');
        return;
      }
    }

    if (action === 'reject' && !responseData.rejectReason.trim()) {
      alert('Por favor indique o motivo da rejeição');
      return;
    }

    try {
      setLoading(true);

      let updateData = {};

      switch (action) {
        case 'accept':
          updateData = {
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            notes: responseData.notes
          };
          // Move opportunity to "proposta_aceite" stage
          await updateSellerStage(
            currentUser.uid,
            clientId,
            opportunityId,
            'proposta_aceite'
          );
          break;

        case 'reject':
          updateData = {
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejectReason: responseData.rejectReason,
            notes: responseData.notes
          };
          break;

        case 'counter':
          updateData = {
            status: 'countered',
            counteredAt: new Date().toISOString(),
            counterAmount: parseFloat(responseData.counterAmount),
            counterConditions: responseData.counterConditions,
            notes: responseData.notes
          };
          break;

        default:
          setLoading(false);
          return;
      }

      await updateOfferStatus(
        currentUser.uid,
        clientId,
        opportunityId,
        offer.id,
        updateData
      );

      // Close modal first
      onClose();

      // Then trigger success callback (will refresh parent)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error responding to offer:', error);
      alert('Erro ao processar resposta. Tente novamente.');
      setLoading(false);
    }
  };

  const getModalConfig = () => {
    switch (action) {
      case 'accept':
        return {
          title: 'Aceitar Proposta',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          color: 'green',
          bgColor: 'bg-green-600',
          hoverColor: 'hover:bg-green-700',
          description: `Aceitar proposta de ${formatCurrency(offer.amount)}`,
          buttonText: 'Confirmar Aceitação'
        };
      case 'reject':
        return {
          title: 'Rejeitar Proposta',
          icon: <XCircle className="w-6 h-6 text-red-600" />,
          color: 'red',
          bgColor: 'bg-red-600',
          hoverColor: 'hover:bg-red-700',
          description: `Rejeitar proposta de ${formatCurrency(offer.amount)}`,
          buttonText: 'Confirmar Rejeição'
        };
      case 'counter':
        return {
          title: 'Contra-proposta',
          icon: <ArrowLeftRight className="w-6 h-6 text-blue-600" />,
          color: 'blue',
          bgColor: 'bg-blue-600',
          hoverColor: 'hover:bg-blue-700',
          description: `Proposta atual: ${formatCurrency(offer.amount)}`,
          buttonText: 'Enviar Contra-proposta'
        };
      default:
        return {
          title: 'Responder Proposta',
          icon: null,
          color: 'gray',
          bgColor: 'bg-gray-600',
          hoverColor: 'hover:bg-gray-700',
          description: '',
          buttonText: 'Confirmar'
        };
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {config.icon}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {offer.buyerName} - {formatCurrency(offer.amount)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Offer Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Resumo da Proposta</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Comprador:</span>
                  <span className="font-medium text-gray-900">{offer.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Proposto:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(offer.amount)}</span>
                </div>
                {offer.downPayment > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entrada:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(offer.downPayment)}</span>
                  </div>
                )}
                {offer.financingStatus && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Financiamento:</span>
                    <span className="font-medium text-gray-900">
                      {offer.financingStatus === 'cash' ? '💰 À Vista' : 
                       offer.financingStatus === 'pre-approved' ? '✓ Pré-aprovado' : 
                       '⏳ Pendente'}
                    </span>
                  </div>
                )}
                {offer.buyerScore && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Qualidade:</span>
                    <span className="font-medium text-gray-900">
                      {offer.buyerScore === 'high' ? '⭐ Alta' :
                       offer.buyerScore === 'medium' ? '➖ Média' :
                       '⬇️ Baixa'}
                    </span>
                  </div>
                )}
                {offer.conditions && offer.conditions.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condições:</span>
                    <span className="font-medium text-gray-900">{offer.conditions.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Accept - Confirmation */}
            {action === 'accept' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 mb-2 font-medium">
                  Ao aceitar esta proposta:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                  <li>A oportunidade avançará para o estágio "Proposta Aceite"</li>
                  <li>O vendedor será notificado da aceitação</li>
                  <li>Outras propostas permanecerão visíveis mas esta será marcada como aceite</li>
                </ul>
              </div>
            )}

            {/* Counter - Form */}
            {action === 'counter' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor da Contra-proposta <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    <input
                      type="number"
                      name="counterAmount"
                      value={responseData.counterAmount}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="1000"
                      min="0"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Proposta original: {formatCurrency(offer.amount)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Condições da Contra-proposta
                  </label>
                  <div className="space-y-2">
                    {conditionOptions.map(condition => (
                      <label
                        key={condition.value}
                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={responseData.counterConditions.includes(condition.value)}
                          onChange={() => handleToggleCondition(condition.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{condition.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Reject - Reason */}
            {action === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da Rejeição <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="rejectReason"
                  value={responseData.rejectReason}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Explique o motivo da rejeição desta proposta..."
                />
              </div>
            )}

            {/* Notes (for all actions) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionais {action === 'accept' ? '(opcional)' : ''}
              </label>
              <textarea
                name="notes"
                value={responseData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Observações adicionais sobre esta resposta..."
              />
            </div>

            {/* Warning for irreversible actions */}
            {(action === 'accept' || action === 'reject') && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <strong>Atenção:</strong> Esta ação não pode ser desfeita.
                    {action === 'accept' && ' A oportunidade será marcada como "Proposta Aceite".'}
                    {action === 'reject' && ' O comprador poderá fazer uma nova proposta posteriormente.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.bgColor} ${config.hoverColor}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                A processar...
              </span>
            ) : (
              config.buttonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RespondSellerOfferModal;