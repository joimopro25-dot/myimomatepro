// src/components/MakeOfferModal.jsx
import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText, Clock, CheckSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createOffer, updateOffer } from '../models/buyerDealModel';
import { Timestamp } from 'firebase/firestore';

const MakeOfferModal = ({ 
  isOpen, 
  onClose, 
  clientId, 
  opportunityId, 
  dealId,
  propertyPrice, // This is already pricing.askingPrice from parent
  existingOffer = null,
  onSuccess 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    downPayment: '',
    financingAmount: '',
    closingDate: '',
    conditions: '',
    contingencies: '',
    expiryHours: 48,
    buyerApproved: false,
    notes: ''
  });

  useEffect(() => {
    if (existingOffer) {
      // Load existing offer data for editing
      setFormData({
        amount: existingOffer.amount || '',
        downPayment: existingOffer.terms?.downPayment || '',
        financingAmount: existingOffer.terms?.financingAmount || '',
        closingDate: existingOffer.terms?.closingDate || '',
        conditions: existingOffer.terms?.conditions || '',
        contingencies: existingOffer.terms?.contingencies || '',
        expiryHours: existingOffer.expiryHours || 48,
        buyerApproved: existingOffer.buyerApproved || false,
        notes: existingOffer.notes || ''
      });
    } else {
      // Reset form for new offer
      setFormData({
        amount: '',
        downPayment: '',
        financingAmount: '',
        closingDate: '',
        conditions: '',
        contingencies: '',
        expiryHours: 48,
        buyerApproved: false,
        notes: ''
      });
    }
  }, [existingOffer, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateFinancing = () => {
    const amount = parseFloat(formData.amount) || 0;
    const downPayment = parseFloat(formData.downPayment) || 0;
    const financing = amount - downPayment;
    setFormData(prev => ({
      ...prev,
      financingAmount: financing > 0 ? financing.toString() : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Por favor, insira um valor válido para a proposta');
      return;
    }

    try {
      setLoading(true);

      const offerData = {
        amount: parseFloat(formData.amount),
        counterAmount: 0,
        status: 'draft',
        buyerApproved: formData.buyerApproved,
        expiryHours: parseInt(formData.expiryHours),
        terms: {
          downPayment: parseFloat(formData.downPayment) || 0,
          financingAmount: parseFloat(formData.financingAmount) || 0,
          closingDate: formData.closingDate || null,
          conditions: formData.conditions,
          contingencies: formData.contingencies
        },
        notes: formData.notes,
        sellerResponse: '',
        counterNotes: ''
      };

      if (existingOffer) {
        // Update existing draft offer
        await updateOffer(
          user.uid,
          clientId,
          opportunityId,
          dealId,
          existingOffer.id,
          offerData
        );
      } else {
        // Create new offer
        await createOffer(
          user.uid,
          clientId,
          opportunityId,
          dealId,
          offerData
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Erro ao guardar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const percentageOfAskingPrice = formData.amount && propertyPrice 
    ? ((parseFloat(formData.amount) / propertyPrice) * 100).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {existingOffer ? '✏️ Editar Proposta' : '📝 Nova Proposta'}
            </h2>
            {existingOffer && (
              <p className="text-blue-100 text-sm mt-1">
                Proposta #{existingOffer.offerNumber}
              </p>
            )}
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
            {/* Amount Section */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Valor da Proposta *
              </label>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="190000"
                    step="1000"
                    min="0"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                  />
                </div>
                {percentageOfAskingPrice && (
                  <div className="text-sm font-medium text-gray-600 pb-3">
                    {percentageOfAskingPrice}% do preço pedido
                    {propertyPrice && (
                      <div className="text-xs text-gray-500">
                        (€{propertyPrice.toLocaleString('pt-PT')})
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Financial Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sinal (€)
                </label>
                <input
                  type="number"
                  name="downPayment"
                  value={formData.downPayment}
                  onChange={handleChange}
                  onBlur={calculateFinancing}
                  placeholder="20000"
                  step="1000"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Financiamento (€)
                </label>
                <input
                  type="number"
                  name="financingAmount"
                  value={formData.financingAmount}
                  onChange={handleChange}
                  placeholder="170000"
                  step="1000"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Calculado automaticamente
                </p>
              </div>
            </div>

            {/* Closing Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data de Fecho Prevista
              </label>
              <input
                type="date"
                name="closingDate"
                value={formData.closingDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Condições
              </label>
              <textarea
                name="conditions"
                value={formData.conditions}
                onChange={handleChange}
                placeholder="Ex: Sujeito a aprovação de financiamento, venda de imóvel atual..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Condições que devem ser satisfeitas para fechar o negócio
              </p>
            </div>

            {/* Contingencies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contingências
              </label>
              <textarea
                name="contingencies"
                value={formData.contingencies}
                onChange={handleChange}
                placeholder="Ex: Inspeção estrutural favorável, avaliação bancária, análise jurídica..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Verificações necessárias antes de finalizar
              </p>
            </div>

            {/* Expiry Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Validade da Proposta (horas)
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  name="expiryHours"
                  value={formData.expiryHours}
                  onChange={handleChange}
                  min="1"
                  max="168"
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  {[24, 48, 72].map(hours => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, expiryHours: hours }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.expiryHours === hours
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                A contagem começa quando a proposta for enviada
              </p>
            </div>

            {/* Buyer Approval */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="buyerApproved"
                  checked={formData.buyerApproved}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                />
                <div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-green-600" />
                    Comprador aprovou esta proposta
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Confirmar que o comprador reviu e autorizou os termos desta proposta
                  </p>
                </div>
              </label>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Internas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notas privadas sobre esta proposta (não visíveis para o cliente)..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Apenas visível para o agente
              </p>
            </div>
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                A guardar...
              </>
            ) : (
              <>
                {existingOffer ? '💾 Guardar Alterações' : '📝 Criar Rascunho'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MakeOfferModal;