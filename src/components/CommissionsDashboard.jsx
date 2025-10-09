import { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import CommissionTrackingModal from './CommissionTrackingModal';

const CommissionsDashboard = ({ commissions = [], onUpdateCommission }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly'); // 'monthly', 'quarterly', 'annual'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3)); // 0-3
  
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterLabels = [
    'Q1 (Jan-Mar)', 'Q2 (Abr-Jun)', 'Q3 (Jul-Set)', 'Q4 (Out-Dez)'
  ];

  // Filter commissions by period
  const getFilteredCommissions = () => {
    return commissions.filter(comm => {
      const commDate = new Date(comm.calculatedAt || comm.createdAt);
      const commYear = commDate.getFullYear();
      const commMonth = commDate.getMonth();
      const commQuarter = Math.floor(commMonth / 3);

      if (commYear !== selectedYear) return false;

      if (selectedPeriod === 'monthly') {
        return commMonth === selectedMonth;
      } else if (selectedPeriod === 'quarterly') {
        return commQuarter === selectedQuarter;
      } else {
        return true; // annual - all months in selected year
      }
    });
  };

  // Calculate totals
  const calculateTotals = (filteredComms) => {
    return filteredComms.reduce((acc, comm) => {
      acc.production += comm.productionValue || 0;
      acc.netCommission += comm.netCommission || 0;
      acc.agencyShare += comm.agencyShare || 0;
      acc.received += (comm.status === 'received' ? (comm.amountReceived || comm.netCommission) : 0);
      acc.pending += (comm.status === 'pending' ? comm.netCommission : 0);
      return acc;
    }, { production: 0, netCommission: 0, agencyShare: 0, received: 0, pending: 0 });
  };

  const filteredCommissions = getFilteredCommissions();
  const totals = calculateTotals(filteredCommissions);

  // Get available years from commissions
  const availableYears = [...new Set(commissions.map(c => 
    new Date(c.calculatedAt || c.createdAt).getFullYear()
  ))].sort((a, b) => b - a);

  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear());
  }

  const handleOpenTracking = (commission) => {
    setSelectedCommission(commission);
    setIsTrackingModalOpen(true);
  };

  const handleCloseTracking = () => {
    setIsTrackingModalOpen(false);
    setSelectedCommission(null);
  };

  const handleSaveTracking = (updatedData) => {
    onUpdateCommission(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard de Comissões</h2>
            <p className="text-sm text-gray-600 mt-1">Acompanhe suas comissões e produções</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <DocumentArrowDownIcon className="w-5 h-5" />
            Exportar
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Period Type */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('monthly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setSelectedPeriod('quarterly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === 'quarterly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Trimestral
            </button>
            <button
              onClick={() => setSelectedPeriod('annual')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Anual
            </button>
          </div>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Month Selector (only for monthly) */}
          {selectedPeriod === 'monthly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
          )}

          {/* Quarter Selector (only for quarterly) */}
          {selectedPeriod === 'quarterly' && (
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {quarterLabels.map((label, idx) => (
                <option key={idx} value={idx}>{label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Production */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Produção Total</p>
            <ChartBarIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.production)}</p>
          <p className="text-xs text-gray-500 mt-1">{filteredCommissions.length} operações</p>
        </div>

        {/* Net Commission */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Minha Comissão</p>
            <CurrencyEuroIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(totals.netCommission)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totals.production > 0 ? ((totals.netCommission / totals.production) * 100).toFixed(1) : 0}% da produção
          </p>
        </div>

        {/* Agency Share */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Parte Agência</p>
            <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.agencyShare)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totals.production > 0 ? ((totals.agencyShare / totals.production) * 100).toFixed(1) : 0}% da produção
          </p>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Estado</p>
            <ClockIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Recebido:</span>
              <span className="text-sm font-semibold text-green-900">{formatCurrency(totals.received)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Pendente:</span>
              <span className="text-sm font-semibold text-yellow-900">{formatCurrency(totals.pending)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Commissions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Comissões Detalhadas
            {selectedPeriod === 'monthly' && ` - ${months[selectedMonth]} ${selectedYear}`}
            {selectedPeriod === 'quarterly' && ` - ${quarterLabels[selectedQuarter]} ${selectedYear}`}
            {selectedPeriod === 'annual' && ` - ${selectedYear}`}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredCommissions.length} {filteredCommissions.length === 1 ? 'comissão encontrada' : 'comissões encontradas'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {filteredCommissions.length === 0 ? (
            <div className="text-center py-12">
              <CurrencyEuroIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma comissão neste período</p>
              <p className="text-sm text-gray-500 mt-1">
                Selecione um período diferente ou aguarde novos negócios
              </p>
            </div>
          ) : (
            filteredCommissions.map((commission) => (
              <div
                key={commission.id}
                className={`border-2 rounded-lg p-5 transition-all hover:shadow-md cursor-pointer ${
                  commission.status === 'received' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-yellow-200 bg-yellow-50'
                }`}
                onClick={() => handleOpenTracking(commission)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {commission.propertyAddress || commission.buyerName || 'Comissão'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {commission.clientName || 'Cliente não especificado'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {formatDate(commission.calculatedAt || commission.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      commission.status === 'received'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {commission.status === 'received' ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          Recebida
                        </>
                      ) : (
                        <>
                          <ClockIcon className="w-4 h-4" />
                          Pendente
                        </>
                      )}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Taxa: {commission.commissionRate}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">Venda</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(commission.salePrice)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">Produção</p>
                    <p className="text-sm font-semibold text-blue-900">
                      {formatCurrency(commission.productionValue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {commission.mySplitPercentage}% split
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600">Minha Comissão</p>
                    <p className="text-sm font-semibold text-green-900">
                      {formatCurrency(commission.netCommission)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {commission.agencySplitPercentage}% da produção
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600">Agência</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {formatCurrency(commission.agencyShare)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {100 - commission.agencySplitPercentage}% da produção
                    </p>
                  </div>
                </div>

                {commission.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Notas:</p>
                    <p className="text-sm text-gray-700">{commission.notes}</p>
                  </div>
                )}

                {commission.paymentNotes && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 mb-1">Notas de Pagamento:</p>
                    <p className="text-sm text-blue-800">{commission.paymentNotes}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenTracking(commission);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {commission.status === 'received' ? 'Ver Detalhes →' : 'Registar Pagamento →'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tracking Modal */}
      <CommissionTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={handleCloseTracking}
        commissionData={selectedCommission}
        onSave={handleSaveTracking}
      />
    </div>
  );
};

export default CommissionsDashboard;