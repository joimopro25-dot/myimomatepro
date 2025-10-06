/**
 * COMPLETE VISIT MODAL - MyImoMatePro
 * Modal for adding feedback when completing a visit
 */

import React, { useState } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function CompleteVisitModal({ isOpen, onClose, onSave, visit }) {
  const [formData, setFormData] = useState({
    status: 'completed',
    feedback: {
      interestLevel: 'medium',
      feedback: '',
      nextSteps: '',
      willingToPay: '',
      concerns: '',
      followUpDate: ''
    }
  });

  if (!isOpen || !visit) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Pass visitId, status, and feedback object matching your updateViewingStatus signature
    onSave(visit.id, formData.status, formData.feedback);
    
    // Reset form
    setFormData({
      status: 'completed',
      feedback: {
        interestLevel: 'medium',
        feedback: '',
        nextSteps: '',
        willingToPay: '',
        concerns: '',
        followUpDate: ''
      }
    });
  };

  const handleStatusChange = (status) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Concluir Visita
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Visita de {formatDate(visit.scheduledDate)} {visit.scheduledTime && `às ${visit.scheduledTime}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Visit Status Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status da Visita
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange('completed')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.status === 'completed'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CheckCircleIcon className={`w-5 h-5 mx-auto mb-1 ${
                    formData.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium">Realizada</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('no_show')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.status === 'no_show'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserIcon className={`w-5 h-5 mx-auto mb-1 ${
                    formData.status === 'no_show' ? 'text-orange-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium">Não Compareceu</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('cancelled')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.status === 'cancelled'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <XMarkIcon className={`w-5 h-5 mx-auto mb-1 ${
                    formData.status === 'cancelled' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium">Cancelada</p>
                </button>
              </div>
            </div>

            {/* Show feedback fields only if status is 'completed' */}
            {formData.status === 'completed' && (
              <>
                {/* Interest Level */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Nível de Interesse do Cliente
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['low', 'medium', 'high'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          feedback: { ...prev.feedback, interestLevel: level }
                        }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.feedback.interestLevel === level
                            ? level === 'high' ? 'border-green-500 bg-green-50' :
                              level === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                              'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className={`text-sm font-medium ${
                          formData.feedback.interestLevel === level
                            ? level === 'high' ? 'text-green-700' :
                              level === 'medium' ? 'text-yellow-700' :
                              'text-red-700'
                            : 'text-gray-700'
                        }`}>
                          {level === 'high' ? '😍 Alto' : level === 'medium' ? '🤔 Médio' : '😐 Baixo'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback do Cliente
                  </label>
                  <textarea
                    value={formData.feedback.feedback}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      feedback: { ...prev.feedback, feedback: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="O que o cliente achou? Quais foram os pontos positivos e negativos?"
                  />
                </div>

                {/* Willing to Pay */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor que o Cliente Está Disposto a Pagar
                  </label>
                  <input
                    type="text"
                    value={formData.feedback.willingToPay}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      feedback: { ...prev.feedback, willingToPay: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="€ 0,00"
                  />
                </div>

                {/* Concerns */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preocupações ou Objeções
                  </label>
                  <textarea
                    value={formData.feedback.concerns}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      feedback: { ...prev.feedback, concerns: e.target.value }
                    }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Que preocupações o cliente mencionou?"
                  />
                </div>

                {/* Next Steps */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Próximos Passos
                  </label>
                  <textarea
                    value={formData.feedback.nextSteps}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      feedback: { ...prev.feedback, nextSteps: e.target.value }
                    }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Qual é o próximo passo com este cliente?"
                  />
                </div>

                {/* Follow-up Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Follow-up
                  </label>
                  <input
                    type="date"
                    value={formData.feedback.followUpDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      feedback: { ...prev.feedback, followUpDate: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>Guardar Feedback</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}