// src/components/RespondSellerOfferModal.jsx
import { useState } from 'react';
import { X, CheckCircle, XCircle, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { updateOfferStatus, updateSellerStage, saveCommissionData } from '../utils/sellerOpportunityFirebase';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import CommissionCalculatorModal from './CommissionCalculatorModal';

const RespondSellerOfferModal = ({ 
  isOpen, 
  onClose, 
  clientId, 
  opportunityId, 
  offer,
  action, // 'accept', 'reject', 'counter'
  onSuccess,
  askingPrice
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCommissionCalculator, setShowCommissionCalculator] = useState(false);
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

      let status = '';
      let extraData = {};

      switch (action) {
        case 'accept':
          status = 'accepted';
          extraData = {
            acceptedAt: new Date().toISOString(),
            notes: responseData.notes
          };
          
          console.log('🔍 Calling updateSellerStage with:', {
            db: db ? 'exists' : 'MISSING',
            consultantId: currentUser.uid,
            clientId,
            opportunityId,
            newStage: 'com_proposta'
          });
          
          await updateSellerStage(
            db,
            currentUser.uid,
            clientId,
            opportunityId,
            'com_proposta'
          );

          // Update offer status
          await updateOfferStatus(
            db,
            currentUser.uid,
            clientId,
            opportunityId,
            offer.id,
            status,
            extraData
          );

          // Close this modal
          onClose();
          
          // Open commission calculator
          setShowCommissionCalculator(true);
          return; // Don't call onSuccess yet - wait for commission calculator

        case 'reject':
          status = 'rejected';
          extraData = {
            rejectedAt: new Date().toISOString(),
            rejectReason: responseData.rejectReason,
            notes: responseData.notes
          };
          break;

        case 'counter':
          status = 'countered';
          extraData = {
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

      console.log('🔍 Calling updateOfferStatus with:', {
        db: db ? 'exists' : 'MISSING',
        consultantId: currentUser.uid,
        clientId,
        opportunityId,
        offerId: offer.id,
        status,
        extraData
      });

      await updateOfferStatus(
        db,
        currentUser.uid,
        clientId,
        opportunityId,
        offer.id,
        status,
        extraData
      );

      // Close modal
      onClose();

      // Trigger success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error responding to offer:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`Erro ao processar resposta: ${error.message || 'Erro desconhecido'}. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCommission = async (commissionData) => {
    try {
      await saveCommissionData(
        db,
        currentUser.uid,
        clientId,
        opportunityId,
        commissionData
      );
      
      // Now trigger success callback to refresh parent
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving commission:', error);
      alert('Erro ao guardar comissão. Por favor, tente novamente.');
    }
  };

  // Configuration based on action
  const config = {
    accept: {
      title: 'Aceitar Proposta',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      buttonText: 'Confirmar Aceitação'
    },
    reject: {
      title: 'Rejeitar Proposta',
      icon: XCircle,
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      buttonText: 'Confirmar Rejeição'
    },
    counter: {
      title: 'Fazer Contra-Proposta',
      icon: ArrowLeftRight,
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      buttonText: 'Enviar Contra-Proposta'
    }
  }[action];

  const IconComponent = config.icon;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${config.borderColor}`}>
            <div className="flex items-center gap-3">
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
              <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Offer Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Resumo da Proposta</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Comprador:</span>
                  <span className="ml-2 font-medium text-gray-900">{offer.buyerName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Valor Proposto:</span>
                  <span className="ml-2 font-medium text-gray-900">{formatCurrency(offer.amount)}</span>
                </div>
                {offer.downPayment && (
                  <div>
                    <span className="text-gray-600">Entrada:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatCurrency(offer.downPayment)}</span>
                  </div>
                )}
                {offer.conditions && offer.conditions.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Condições:</span>
                    <ul className="ml-2 mt-1 space-y-1">
                      {offer.conditions.map((cond, idx) => (
                        <li key={idx} className="text-xs text-gray-700">• {cond}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Action-specific inputs */}
            <div className="space-y-4">
              {/* Counter - Amount & Conditions */}
              {action === 'counter' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor da Contra-Proposta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="counterAmount"
                      value={responseData.counterAmount}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="€"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Proposta original: {formatCurrency(offer.amount)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condições da Contra-Proposta
                    </label>
                    <div className="space-y-2">
                      {conditionOptions.map((condition) => (
                        <label key={condition.value} className="flex items-center gap-2">
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
                      {action === 'accept' && ' A oportunidade será marcada como "Com Proposta" e será aberto o calculador de comissão.'}
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

      {/* Commission Calculator Modal */}
      <CommissionCalculatorModal
        isOpen={showCommissionCalculator}
        onClose={() => setShowCommissionCalculator(false)}
        offer={offer}
        opportunityData={{
          commissionRate: 5, // TODO: Get from user settings or opportunity data
          askingPrice: askingPrice
        }}
        onSave={handleSaveCommission}
      />
    </>
  );
};

export default RespondSellerOfferModal;