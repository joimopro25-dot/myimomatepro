import { useState } from 'react';
import { XMarkIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';

export default function AddOfferModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    amount: '',
    buyerName: '',
    buyerConsultant: '',
    buyerDealId: '',
    buyerScore: 'medium',
    financingStatus: 'pending',
    financingAmount: '',
    downPayment: '',
    conditions: [],
    validUntil: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const conditionOptions = [
    { value: 'financing_needed', label: 'Necessita Financiamento' },
    { value: 'inspection_contingency', label: 'Sujeito a Inspeção' },
    { value: 'sale_contingency', label: 'Dependente de Venda' },
    { value: 'appraisal_contingency', label: 'Sujeito a Avaliação' }
  ];

  const handleToggleCondition = (condition) => {
    if (formData.conditions.includes(condition)) {
      setFormData({
        ...formData,
        conditions: formData.conditions.filter(c => c !== condition)
      });
    } else {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, condition]
      });
    }
  };

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!formData.amount || !formData.buyerName) {
      setError('Por favor preencha os campos obrigatórios');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('O valor da proposta deve ser maior que zero');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        amount: parseFloat(formData.amount),
        financingAmount: formData.financingAmount ? parseFloat(formData.financingAmount) : 0,
        downPayment: formData.downPayment ? parseFloat(formData.downPayment) : 0,
        status: 'pending'
      });
      
      // Reset form
      setFormData({
        amount: '',
        buyerName: '',
        buyerConsultant: '',
        buyerDealId: '',
        buyerScore: 'medium',
        financingStatus: 'pending',
        financingAmount: '',
        downPayment: '',
        conditions: [],
        validUntil: '',
        notes: ''
      });
      onClose();
    } catch (err) {
      setError('Erro ao adicionar proposta. Por favor tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Adicionar Proposta</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Offer Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Proposta <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyEuroIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Buyer Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Comprador <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultor do Comprador
              </label>
              <input
                type="text"
                value={formData.buyerConsultant}
                onChange={(e) => setFormData({ ...formData, buyerConsultant: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome do consultor (opcional)"
              />
            </div>
          </div>

          {/* Buyer Deal Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID do Negócio do Comprador
            </label>
            <input
              type="text"
              value={formData.buyerDealId}
              onChange={(e) => setFormData({ ...formData, buyerDealId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Link para negócio existente (opcional)"
            />
          </div>

          {/* Buyer Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Qualidade do Comprador
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, buyerScore: 'high' })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.buyerScore === 'high'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Alta</div>
                <div className="text-xs">Forte e confiável</div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, buyerScore: 'medium' })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.buyerScore === 'medium'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Média</div>
                <div className="text-xs">Razoável</div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, buyerScore: 'low' })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.buyerScore === 'low'
                    ? 'border-gray-500 bg-gray-50 text-gray-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Baixa</div>
                <div className="text-xs">Incerto</div>
              </button>
            </div>
          </div>

          {/* Financing Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Estado do Financiamento
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFormData({ ...formData, financingStatus: 'cash' })}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.financingStatus === 'cash'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">À Vista</div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, financingStatus: 'pre-approved' })}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.financingStatus === 'pre-approved'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Pré-aprovado</div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, financingStatus: 'pending' })}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.financingStatus === 'pending'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Pendente</div>
              </button>
            </div>
          </div>

          {/* Financing Details */}
          {formData.financingStatus !== 'cash' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Financiamento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyEuroIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.financingAmount}
                    onChange={(e) => setFormData({ ...formData, financingAmount: e.target.value })}
                    className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entrada
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyEuroIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                    className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Condições da Proposta
            </label>
            <div className="space-y-2">
              {conditionOptions.map(condition => (
                <label
                  key={condition.value}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.conditions.includes(condition.value)}
                    onChange={() => handleToggleCondition(condition.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{condition.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Válida Até
            </label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações adicionais sobre a proposta..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A adicionar...' : 'Adicionar Proposta'}
          </button>
        </div>
      </div>
    </div>
  );
}