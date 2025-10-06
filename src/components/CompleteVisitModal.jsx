import { useState } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CompleteVisitModal({ isOpen, onClose, onSave, visit }) {
  const [formData, setFormData] = useState({
    buyerShowedUp: true,
    buyerInterestLevel: 'medium',
    feedback: '',
    concerns: [],
    newConcern: '',
    likelyToOffer: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const concernOptions = [
    'price',
    'needs_renovation',
    'location',
    'size',
    'condition',
    'layout',
    'noise',
    'parking',
    'outdoor_space'
  ];

  const concernLabels = {
    price: 'Preço',
    needs_renovation: 'Necessita renovação',
    location: 'Localização',
    size: 'Tamanho',
    condition: 'Estado de conservação',
    layout: 'Disposição dos espaços',
    noise: 'Ruído',
    parking: 'Estacionamento',
    outdoor_space: 'Espaço exterior'
  };

  const handleAddConcern = (concern) => {
    if (!formData.concerns.includes(concern)) {
      setFormData({
        ...formData,
        concerns: [...formData.concerns, concern]
      });
    }
  };

  const handleRemoveConcern = (concern) => {
    setFormData({
      ...formData,
      concerns: formData.concerns.filter(c => c !== concern)
    });
  };

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (formData.buyerShowedUp && !formData.feedback.trim()) {
      setError('Por favor adicione um feedback sobre a visita');
      return;
    }

    setLoading(true);
    try {
      await onSave(visit.id, {
        buyerShowedUp: formData.buyerShowedUp,
        buyerInterestLevel: formData.buyerShowedUp ? formData.buyerInterestLevel : null,
        feedback: formData.feedback,
        concerns: formData.concerns,
        likelyToOffer: formData.likelyToOffer,
        status: 'completed'
      });
      
      onClose();
    } catch (err) {
      setError('Erro ao registar conclusão da visita. Por favor tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !visit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Concluir Visita</h2>
            <p className="text-sm text-gray-600 mt-1">
              {visit.buyerName} - {new Date(visit.date).toLocaleDateString('pt-PT')} às {visit.time}
            </p>
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Buyer Showed Up */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              O comprador compareceu à visita?
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setFormData({ ...formData, buyerShowedUp: true })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.buyerShowedUp
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Sim
              </button>
              <button
                onClick={() => setFormData({ ...formData, buyerShowedUp: false })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  !formData.buyerShowedUp
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Não
              </button>
            </div>
          </div>

          {formData.buyerShowedUp && (
            <>
              {/* Interest Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nível de Interesse do Comprador
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, buyerInterestLevel: 'high' })}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.buyerInterestLevel === 'high'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Alto
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, buyerInterestLevel: 'medium' })}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.buyerInterestLevel === 'medium'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Médio
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, buyerInterestLevel: 'low' })}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.buyerInterestLevel === 'low'
                        ? 'border-gray-500 bg-gray-50 text-gray-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Baixo
                  </button>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback da Visita <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva como correu a visita, reações do comprador, comentários..."
                />
              </div>

              {/* Concerns */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preocupações do Comprador
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {concernOptions.map(concern => (
                    <button
                      key={concern}
                      onClick={() => 
                        formData.concerns.includes(concern)
                          ? handleRemoveConcern(concern)
                          : handleAddConcern(concern)
                      }
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        formData.concerns.includes(concern)
                          ? 'bg-red-100 text-red-700 border-2 border-red-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {concernLabels[concern]}
                    </button>
                  ))}
                </div>
                {formData.concerns.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Selecionadas: {formData.concerns.map(c => concernLabels[c]).join(', ')}
                  </p>
                )}
              </div>

              {/* Likely to Offer */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="likelyToOffer"
                  checked={formData.likelyToOffer}
                  onChange={(e) => setFormData({ ...formData, likelyToOffer: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="likelyToOffer" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Comprador provavelmente fará uma proposta
                </label>
              </div>
            </>
          )}

          {!formData.buyerShowedUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Motivo da ausência, se conhecido..."
              />
            </div>
          )}
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            {loading ? 'A guardar...' : 'Concluir Visita'}
          </button>
        </div>
      </div>
    </div>
  );
}