import { useState, useEffect } from 'react';
import { 
  CogIcon, 
  CurrencyEuroIcon, 
  CheckCircleIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const CommissionSettings = ({ currentSettings, onSave }) => {
  const [settings, setSettings] = useState({
    defaultCommissionRate: 5,
    defaultAgencySplit: 55,
    currency: 'EUR'
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseFloat(value) || value
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao guardar definições');
    } finally {
      setSaving(false);
    }
  };

  const exampleSale = 500000;
  const exampleCommission = (exampleSale * settings.defaultCommissionRate) / 100;
  const exampleNetCommission = (exampleCommission * settings.defaultAgencySplit) / 100;
  const exampleAgencyShare = exampleCommission - exampleNetCommission;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <CogIcon className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Definições de Comissão</h3>
          <p className="text-sm text-gray-600">Configure os valores padrão para suas comissões</p>
        </div>
      </div>

      {/* Settings Form */}
      <div className="space-y-6">
        {/* Default Commission Rate */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <ChartBarIcon className="w-5 h-5 text-blue-600" />
            Taxa de Comissão Padrão
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              name="defaultCommissionRate"
              value={settings.defaultCommissionRate}
              onChange={handleChange}
              min="1"
              max="10"
              step="0.5"
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex items-center gap-2 min-w-[100px]">
              <input
                type="number"
                name="defaultCommissionRate"
                value={settings.defaultCommissionRate}
                onChange={handleChange}
                min="1"
                max="10"
                step="0.5"
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Esta taxa será usada como padrão ao criar novas oportunidades
          </p>
        </div>

        {/* Agency Split */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
            Minha Percentagem da Agência
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              name="defaultAgencySplit"
              value={settings.defaultAgencySplit}
              onChange={handleChange}
              min="40"
              max="100"
              step="5"
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex items-center gap-2 min-w-[100px]">
              <input
                type="number"
                name="defaultAgencySplit"
                value={settings.defaultAgencySplit}
                onChange={handleChange}
                min="40"
                max="100"
                step="5"
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-700 font-medium">%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            A agência fica com {100 - settings.defaultAgencySplit}% da sua produção
          </p>
        </div>

        {/* Currency (for future use) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <CurrencyEuroIcon className="w-5 h-5 text-blue-600" />
            Moeda
          </label>
          <select
            name="currency"
            value={settings.currency}
            onChange={handleChange}
            className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {/* Example Calculation */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-5 border border-blue-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">📊 Exemplo de Cálculo</h4>
        <p className="text-xs text-gray-600 mb-3">
          Venda de {formatCurrency(exampleSale)} com as suas definições:
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Comissão Total:</span>
            <span className="text-lg font-bold text-blue-900">{formatCurrency(exampleCommission)}</span>
          </div>
          
          <div className="pt-2 border-t border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Minha Comissão ({settings.defaultAgencySplit}%):</span>
              <span className="text-lg font-bold text-green-900">{formatCurrency(exampleNetCommission)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Parte da Agência ({100 - settings.defaultAgencySplit}%):</span>
              <span className="text-lg font-bold text-gray-700">{formatCurrency(exampleAgencyShare)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {saved && (
          <span className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircleIcon className="w-5 h-5" />
            Definições guardadas!
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              A guardar...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Guardar Definições
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Nota:</strong> Estas são apenas definições padrão. Pode sempre ajustar os valores 
          individualmente para cada negócio ao calcular a comissão.
        </p>
      </div>
    </div>
  );
};

export default CommissionSettings;