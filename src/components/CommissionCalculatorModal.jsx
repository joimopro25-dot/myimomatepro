import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CurrencyEuroIcon, 
  CheckCircleIcon,
  CalculatorIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const CommissionCalculatorModal = ({ 
  isOpen, 
  onClose, 
  offer,
  opportunityData,
  onSave 
}) => {
  const [calculationData, setCalculationData] = useState({
    salePrice: offer?.amount || 0,
    commissionRate: opportunityData?.commissionRate || 5, // Default 5%
    splitType: 'full', // 'full' or 'split'
    mySplitPercentage: 100, // Default 100% (full)
    otherAgentPercentage: 0,
    agencySplitPercentage: 55, // Agent's cut from production
    notes: ''
  });

  const [calculated, setCalculated] = useState({
    totalCommission: 0,
    productionValue: 0,
    netCommission: 0,
    agencyShare: 0
  });

  useEffect(() => {
    if (isOpen && offer) {
      // Calculate on load and whenever values change
      calculateCommission();
    }
  }, [calculationData, isOpen]);

  if (!isOpen || !offer) return null;

  const calculateCommission = () => {
    const salePrice = parseFloat(calculationData.salePrice) || 0;
    const commissionRate = parseFloat(calculationData.commissionRate) || 0;
    const mySplit = parseFloat(calculationData.mySplitPercentage) || 0;
    const agencySplit = parseFloat(calculationData.agencySplitPercentage) || 0;

    // Total commission from sale
    const totalCommission = (salePrice * commissionRate) / 100;

    // Production value (after split with other agent)
    const productionValue = (totalCommission * mySplit) / 100;

    // Net commission (what agent receives from agency)
    const netCommission = (productionValue * agencySplit) / 100;

    // Agency's share
    const agencyShare = productionValue - netCommission;

    setCalculated({
      totalCommission,
      productionValue,
      netCommission,
      agencyShare
    });
  };

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
    setCalculationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSplitTypeChange = (type) => {
    if (type === 'full') {
      setCalculationData(prev => ({
        ...prev,
        splitType: 'full',
        mySplitPercentage: 100,
        otherAgentPercentage: 0
      }));
    } else {
      setCalculationData(prev => ({
        ...prev,
        splitType: 'split',
        mySplitPercentage: 50,
        otherAgentPercentage: 50
      }));
    }
  };

  const handleMySplitChange = (value) => {
    const mySplit = parseFloat(value) || 0;
    const otherSplit = 100 - mySplit;
    setCalculationData(prev => ({
      ...prev,
      mySplitPercentage: mySplit,
      otherAgentPercentage: otherSplit
    }));
  };

  const handleSave = () => {
    const commissionData = {
      ...calculationData,
      ...calculated,
      calculatedAt: new Date().toISOString(),
      status: 'pending' // Will be updated after escritura
    };
    onSave(commissionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CalculatorIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Calcular Comissão</h2>
              <p className="text-sm text-gray-600">Proposta de {offer.buyerName}</p>
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
          {/* Sale Details */}
          <section className="bg-gray-50 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CurrencyEuroIcon className="w-5 h-5 text-blue-600" />
              Detalhes da Venda
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da Venda
                </label>
                <input
                  type="number"
                  name="salePrice"
                  value={calculationData.salePrice}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="€"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taxa de Comissão (%)
                </label>
                <input
                  type="number"
                  name="commissionRate"
                  value={calculationData.commissionRate}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="%"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">Comissão Total da Venda</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(calculated.totalCommission)}</p>
            </div>
          </section>

          {/* Split with Other Agent */}
          <section className="bg-gray-50 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-blue-600" />
              Divisão com Outro Agente
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                <input
                  type="radio"
                  name="splitType"
                  checked={calculationData.splitType === 'full'}
                  onChange={() => handleSplitTypeChange('full')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="font-medium text-gray-900">Tenho comprador e vendedor (100%)</p>
                  <p className="text-sm text-gray-600">Toda a comissão é sua</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                <input
                  type="radio"
                  name="splitType"
                  checked={calculationData.splitType === 'split'}
                  onChange={() => handleSplitTypeChange('split')}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Outro agente trouxe o comprador</p>
                  <p className="text-sm text-gray-600">Dividir comissão com outro agente</p>
                </div>
              </label>

              {calculationData.splitType === 'split' && (
                <div className="ml-7 space-y-3 mt-3 p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minha Parte (%)
                      </label>
                      <input
                        type="number"
                        value={calculationData.mySplitPercentage}
                        onChange={(e) => handleMySplitChange(e.target.value)}
                        min="0"
                        max="100"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency((calculated.totalCommission * calculationData.mySplitPercentage) / 100)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outro Agente (%)
                      </label>
                      <input
                        type="number"
                        value={calculationData.otherAgentPercentage}
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency((calculated.totalCommission * calculationData.otherAgentPercentage) / 100)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">Valor de Produção (sua parte)</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(calculated.productionValue)}</p>
              <p className="text-xs text-gray-600 mt-1">
                {calculationData.mySplitPercentage}% da comissão total
              </p>
            </div>
          </section>

          {/* Agency Split */}
          <section className="bg-gray-50 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
              Divisão com a Agência
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentagem que Recebo da Agência (%)
              </label>
              <input
                type="number"
                name="agencySplitPercentage"
                value={calculationData.agencySplitPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                A agência fica com {100 - calculationData.agencySplitPercentage}%
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">Minha Comissão</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(calculated.netCommission)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {calculationData.agencySplitPercentage}% de {formatCurrency(calculated.productionValue)}
                </p>
              </div>

              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <p className="text-sm text-gray-700">Parte da Agência</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(calculated.agencyShare)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {100 - calculationData.agencySplitPercentage}% de {formatCurrency(calculated.productionValue)}
                </p>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas sobre Comissão (opcional)
            </label>
            <textarea
              name="notes"
              value={calculationData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Detalhes adicionais sobre esta comissão..."
            />
          </section>

          {/* Final Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Comissão Líquida Final</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(calculated.netCommission)}</p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
            <div className="mt-4 pt-4 border-t border-green-200 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Produção Total:</p>
                <p className="font-semibold text-gray-900">{formatCurrency(calculated.productionValue)}</p>
              </div>
              <div>
                <p className="text-gray-600">Taxa Efetiva:</p>
                <p className="font-semibold text-gray-900">
                  {((calculated.netCommission / calculationData.salePrice) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Confirmar e Registar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionCalculatorModal;