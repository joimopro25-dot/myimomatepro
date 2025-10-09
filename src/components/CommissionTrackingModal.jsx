import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CurrencyEuroIcon, 
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const CommissionTrackingModal = ({ 
  isOpen, 
  onClose, 
  commissionData,
  onSave 
}) => {
  const [trackingData, setTrackingData] = useState({
    status: 'pending', // 'pending' or 'received'
    amountReceived: 0,
    paymentDate: '',
    paymentNotes: ''
  });

  useEffect(() => {
    if (isOpen && commissionData) {
      // Load existing tracking data if available
      setTrackingData({
        status: commissionData.status || 'pending',
        amountReceived: commissionData.amountReceived || commissionData.netCommission || 0,
        paymentDate: commissionData.paymentDate || '',
        paymentNotes: commissionData.paymentNotes || ''
      });
    }
  }, [isOpen, commissionData]);

  if (!isOpen || !commissionData) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrackingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (status) => {
    setTrackingData(prev => ({
      ...prev,
      status,
      // If marking as received, default to full amount and today's date
      ...(status === 'received' && !prev.amountReceived ? {
        amountReceived: commissionData.netCommission,
        paymentDate: new Date().toISOString().split('T')[0]
      } : {})
    }));
  };

  const handleSave = () => {
    const updatedData = {
      ...commissionData,
      ...trackingData,
      updatedAt: new Date().toISOString()
    };
    onSave(updatedData);
    onClose();
  };

  const pendingAmount = commissionData.netCommission - (parseFloat(trackingData.amountReceived) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CurrencyEuroIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestão de Comissão</h2>
              <p className="text-sm text-gray-600">Registo de pagamento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Commission Summary */}
          <section className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-5 border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Resumo da Comissão</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600">Produção Total</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(commissionData.productionValue)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {commissionData.mySplitPercentage}% da venda
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-600">Minha Comissão</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(commissionData.netCommission)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {commissionData.agencySplitPercentage}% da produção
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-600">Parte Agência</p>
                <p className="text-lg font-bold text-gray-700">{formatCurrency(commissionData.agencyShare)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {100 - commissionData.agencySplitPercentage}% da produção
                </p>
              </div>
            </div>
          </section>

          {/* Payment Status */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              Estado da Comissão
            </h3>

            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                trackingData.status === 'pending' 
                  ? 'border-yellow-300 bg-yellow-50' 
                  : 'border-gray-200 bg-white hover:border-yellow-200'
              }`}>
                <input
                  type="radio"
                  name="status"
                  checked={trackingData.status === 'pending'}
                  onChange={() => handleStatusChange('pending')}
                  className="w-4 h-4 text-yellow-600"
                />
                <ClockIcon className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Por Receber (Pendente)</p>
                  <p className="text-sm text-gray-600">Aguardando pagamento da comissão</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                trackingData.status === 'received' 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-green-200'
              }`}>
                <input
                  type="radio"
                  name="status"
                  checked={trackingData.status === 'received'}
                  onChange={() => handleStatusChange('received')}
                  className="w-4 h-4 text-green-600"
                />
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Recebida</p>
                  <p className="text-sm text-gray-600">Comissão foi paga</p>
                </div>
              </label>
            </div>
          </section>

          {/* Payment Details */}
          {trackingData.status === 'received' && (
            <section className="space-y-4 p-5 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-sm font-semibold text-gray-700">Detalhes do Pagamento</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Recebido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amountReceived"
                    value={trackingData.amountReceived}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="€"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Esperado: {formatCurrency(commissionData.netCommission)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Recebimento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={trackingData.paymentDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Payment difference alert */}
              {parseFloat(trackingData.amountReceived) !== commissionData.netCommission && (
                <div className={`p-3 rounded-lg border ${
                  parseFloat(trackingData.amountReceived) < commissionData.netCommission
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className="text-sm font-medium text-gray-800">
                    {parseFloat(trackingData.amountReceived) < commissionData.netCommission 
                      ? '⚠️ Pagamento Parcial' 
                      : 'ℹ️ Valor Diferente'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Diferença: {formatCurrency(Math.abs(commissionData.netCommission - parseFloat(trackingData.amountReceived)))}
                    {parseFloat(trackingData.amountReceived) < commissionData.netCommission && 
                      ` (falta receber)`}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Payment Notes */}
          <section>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-gray-400" />
              Notas sobre Comissão
            </label>
            <textarea
              name="paymentNotes"
              value={trackingData.paymentNotes}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Adicione observações sobre o pagamento da comissão...&#10;&#10;Exemplos:&#10;- Pagamento dividido em 2 parcelas&#10;- Desconto aplicado por X motivo&#10;- Data de pagamento acordada&#10;- Método de pagamento (transferência, cheque, etc.)"
            />
          </section>

          {/* Summary Box */}
          <div className={`rounded-lg p-5 border-2 ${
            trackingData.status === 'received' 
              ? 'bg-green-50 border-green-300' 
              : 'bg-yellow-50 border-yellow-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {trackingData.status === 'received' ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                ) : (
                  <ClockIcon className="w-8 h-8 text-yellow-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {trackingData.status === 'received' ? 'Comissão Recebida' : 'Comissão Pendente'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {trackingData.status === 'received' 
                      ? formatCurrency(trackingData.amountReceived) 
                      : formatCurrency(commissionData.netCommission)}
                  </p>
                </div>
              </div>
            </div>

            {trackingData.status === 'received' && pendingAmount > 0 && (
              <div className="pt-3 border-t border-green-200">
                <p className="text-sm text-gray-700">
                  Valor em falta: <span className="font-semibold">{formatCurrency(pendingAmount)}</span>
                </p>
              </div>
            )}

            {trackingData.status === 'received' && trackingData.paymentDate && (
              <div className="pt-3 border-t border-green-200 flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4" />
                Recebido em: {new Date(trackingData.paymentDate).toLocaleDateString('pt-PT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2 text-white rounded-lg transition-colors font-medium flex items-center gap-2 ${
              trackingData.status === 'received'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <CheckCircleIcon className="w-5 h-5" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionTrackingModal;