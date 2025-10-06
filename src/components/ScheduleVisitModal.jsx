import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ScheduleVisitModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    buyerName: '',
    buyerConsultant: '',
    buyerDealId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!formData.date || !formData.time || !formData.buyerName) {
      setError('Por favor preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        status: 'scheduled'
      });
      
      // Reset form
      setFormData({
        date: '',
        time: '',
        buyerName: '',
        buyerConsultant: '',
        buyerDealId: '',
        notes: ''
      });
      onClose();
    } catch (err) {
      setError('Erro ao agendar visita. Por favor tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Agendar Visita</h2>
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

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Buyer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Comprador <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.buyerName}
              onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome completo do comprador"
            />
          </div>

          {/* Buyer Consultant */}
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

          {/* Buyer Deal ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID do Negócio do Comprador
            </label>
            <input
              type="text"
              value={formData.buyerDealId}
              onChange={(e) => setFormData({ ...formData, buyerDealId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Link para oportunidade existente (opcional)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Cole o ID do negócio do comprador se já existir no sistema
            </p>
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
              placeholder="Observações adicionais sobre a visita..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            type="button"
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
            {loading ? 'Agendando...' : 'Agendar Visita'}
          </button>
        </div>
      </div>
    </div>
  );
}