/**
 * ADD OFFER MODAL - MyImoMatePro
 * UPDATED: Supports both Option 1 (pre-filled from visit) and Option 2 (select visit dropdown)
 */

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CurrencyEuroIcon,
  EyeIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function AddOfferModal({ 
  isOpen, 
  onClose, 
  onSave,
  fromVisitData = null,  // Option 1: Pre-filled data from specific visit
  allVisits = []         // Option 2: All visits for dropdown selection
}) {
  const [formData, setFormData] = useState({
    amount: '',
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    buyerConsultant: '',
    buyerConsultantPhone: '',
    buyerConsultantEmail: '',
    buyerDealId: '',
    buyerScore: 'medium',
    financingStatus: 'pending',
    financingAmount: '',
    downPayment: '',
    conditions: [],
    validUntil: '',
    notes: '',
    visitId: '',
    visitDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState('');
  const [showVisitInfo, setShowVisitInfo] = useState(false);

  const conditionOptions = [
    { value: 'financing_needed', label: 'Necessita Financiamento' },
    { value: 'inspection_contingency', label: 'Sujeito a Inspeção' },
    { value: 'sale_contingency', label: 'Dependente de Venda' },
    { value: 'appraisal_contingency', label: 'Sujeito a Avaliação' }
  ];

  // Option 1: Load data from specific visit (when coming from ViewVisitModal)
  useEffect(() => {
    if (fromVisitData && isOpen) {
      console.log('Loading pre-filled data from visit:', fromVisitData);
      setFormData({
        amount: fromVisitData.amount || '',
        buyerName: fromVisitData.buyerName || '',
        buyerPhone: fromVisitData.buyerPhone || '',
        buyerEmail: fromVisitData.buyerEmail || '',
        buyerConsultant: fromVisitData.buyerConsultant || '',
        buyerConsultantPhone: fromVisitData.buyerConsultantPhone || '',
        buyerConsultantEmail: fromVisitData.buyerConsultantEmail || '',
        buyerDealId: '',
        buyerScore: fromVisitData.buyerScore || 'medium',
        financingStatus: 'pending',
        financingAmount: '',
        downPayment: '',
        conditions: [],
        validUntil: '',
        notes: fromVisitData.notes || '',
        visitId: fromVisitData.visitId || '',
        visitDate: fromVisitData.visitDate || ''
      });
      setShowVisitInfo(true);
      setSelectedVisitId(fromVisitData.visitId || '');
    }
  }, [fromVisitData, isOpen]);

  // Option 2: Load data when user selects a visit from dropdown
  const handleVisitSelection = (e) => {
    const visitId = e.target.value;
    setSelectedVisitId(visitId);

    if (visitId === '') {
      // Reset to empty form
      setFormData({
        amount: '',
        buyerName: '',
        buyerPhone: '',
        buyerEmail: '',
        buyerConsultant: '',
        buyerConsultantPhone: '',
        buyerConsultantEmail: '',
        buyerDealId: '',
        buyerScore: 'medium',
        financingStatus: 'pending',
        financingAmount: '',
        downPayment: '',
        conditions: [],
        validUntil: '',
        notes: '',
        visitId: '',
        visitDate: ''
      });
      setShowVisitInfo(false);
      return;
    }

    // Find selected visit
    const selectedVisit = allVisits.find(v => v.id === visitId);
    if (selectedVisit) {
      console.log('Loading data from selected visit:', selectedVisit);
      
      // Pre-fill form with visit data
      setFormData({
        amount: selectedVisit.feedback?.willingToPay || '',
        buyerName: selectedVisit.visitorName || '',
        buyerPhone: selectedVisit.visitorPhone || '',
        buyerEmail: selectedVisit.visitorEmail || '',
        buyerConsultant: selectedVisit.buyerAgent?.name || '',
        buyerConsultantPhone: selectedVisit.buyerAgent?.phone || '',
        buyerConsultantEmail: selectedVisit.buyerAgent?.email || '',
        buyerDealId: '',
        buyerScore: selectedVisit.feedback?.interestLevel || 'medium',
        financingStatus: 'pending',
        financingAmount: '',
        downPayment: '',
        conditions: [],
        validUntil: '',
        notes: [
          selectedVisit.feedback?.feedback ? `Feedback da Visita: ${selectedVisit.feedback.feedback}` : '',
          selectedVisit.feedback?.concerns ? `Preocupações: ${selectedVisit.feedback.concerns}` : '',
          selectedVisit.feedback?.nextSteps ? `Próximos Passos: ${selectedVisit.feedback.nextSteps}` : '',
          selectedVisit.notes ? `Notas da Visita: ${selectedVisit.notes}` : ''
        ].filter(Boolean).join('\n\n'),
        visitId: selectedVisit.id,
        visitDate: selectedVisit.scheduledDate || ''
      });
      setShowVisitInfo(true);
    }
  };

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
        buyerPhone: '',
        buyerEmail: '',
        buyerConsultant: '',
        buyerConsultantPhone: '',
        buyerConsultantEmail: '',
        buyerDealId: '',
        buyerScore: 'medium',
        financingStatus: 'pending',
        financingAmount: '',
        downPayment: '',
        conditions: [],
        validUntil: '',
        notes: '',
        visitId: '',
        visitDate: ''
      });
      setSelectedVisitId('');
      setShowVisitInfo(false);
      onClose();
    } catch (err) {
      setError('Erro ao adicionar proposta. Por favor tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter completed visits for dropdown (Option 2)
  const completedVisits = allVisits.filter(v => v.status === 'completed');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {fromVisitData ? 'Nova Proposta (da Visita)' : 'Adicionar Proposta'}
            </h2>
            {showVisitInfo && formData.visitDate && (
              <p className="text-sm text-gray-600 mt-1">
                Visita de {new Date(formData.visitDate).toLocaleDateString('pt-PT')}
              </p>
            )}
          </div>
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Option 2: Visit Selection Dropdown (only show if not pre-filled) */}
          {!fromVisitData && completedVisits.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <EyeIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Criar proposta de uma visita existente? (Opcional)
                  </label>
                  <select
                    value={selectedVisitId}
                    onChange={handleVisitSelection}
                    className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Selecione uma visita ou preencha manualmente</option>
                    {completedVisits.map((visit) => (
                      <option key={visit.id} value={visit.id}>
                        {visit.visitorName || 'Visitante'} - {new Date(visit.scheduledDate).toLocaleDateString('pt-PT')}
                        {visit.feedback?.interestLevel && ` (${visit.feedback.interestLevel === 'high' ? 'Alto' : visit.feedback.interestLevel === 'medium' ? 'Médio' : 'Baixo'} Interesse)`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-700 mt-1">
                    Selecione uma visita concluída para preencher automaticamente os dados do comprador
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Show info banner if data is from visit */}
          {showVisitInfo && formData.visitId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Dados preenchidos da visita
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Os campos foram preenchidos com informações da visita. Você pode editá-los conforme necessário.
                </p>
              </div>
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Comprador</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.buyerPhone}
                  onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+351 912 345 678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.buyerEmail}
                  onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Buyer's Consultant Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Consultor do Comprador (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Consultor
                </label>
                <input
                  type="text"
                  value={formData.buyerConsultant}
                  onChange={(e) => setFormData({ ...formData, buyerConsultant: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do consultor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.buyerConsultantPhone}
                  onChange={(e) => setFormData({ ...formData, buyerConsultantPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+351 912 345 678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.buyerConsultantEmail}
                  onChange={(e) => setFormData({ ...formData, buyerConsultantEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
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
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, buyerScore: 'high' })}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.buyerScore === 'high'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-medium">Alta</p>
                <p className="text-xs mt-1">Financiamento aprovado</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, buyerScore: 'medium' })}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.buyerScore === 'medium'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-medium">Média</p>
                <p className="text-xs mt-1">Em processo</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, buyerScore: 'low' })}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.buyerScore === 'low'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-medium">Baixa</p>
                <p className="text-xs mt-1">Necessita verificação</p>
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
                type="button"
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
                type="button"
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
                type="button"
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
              rows="4"
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'A adicionar...' : 'Adicionar Proposta'}
          </button>
        </div>
      </div>
    </div>
  );
}