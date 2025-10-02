/**
 * ESCRITURA MODAL - MyImoMatePro (IMPROVED)
 * Schedule/Complete Escritura Pública with proper workflow control
 * Can edit multiple times before marking as completed
 */

import React, { useState, useEffect } from 'react';
import { X, FileCheck, MapPin, Calendar, User, Hash, Euro, CheckCircle, Check } from 'lucide-react';
import { FINANCING_MILESTONES } from '../models/transactionModel';

export default function EscrituraModal({ 
  isOpen, 
  onClose, 
  onSave, 
  transaction,
  mode = 'prepare' // 'prepare' or 'complete'
}) {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    notaryName: '',
    notaryLocation: '',
    finalAmount: 0,
    registrationNumber: '',
    notes: '',
    hasFinancing: false,
    financingDetails: {
      bankName: '',
      approvalAmount: 0,
      milestones: {}
    }
  });

  const [errors, setErrors] = useState({});

  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen && transaction) {
      const existingFinancing = transaction.financing || {};
      const existingEscritura = transaction.escritura || {};
      
      setFormData({
        scheduledDate: existingEscritura.scheduledDate || '',
        notaryName: existingEscritura.notaryName || '',
        notaryLocation: existingEscritura.notaryLocation || '',
        finalAmount: existingEscritura.finalAmount || transaction.acceptedOffer?.amount || 0,
        registrationNumber: existingEscritura.registrationNumber || '',
        notes: existingEscritura.notes || '',
        hasFinancing: existingFinancing.required || false,
        financingDetails: {
          bankName: existingFinancing.bankName || '',
          approvalAmount: existingFinancing.approvalAmount || 0,
          milestones: existingFinancing.milestones || {
            [FINANCING_MILESTONES.BANK_APPROVAL]: { completed: false, date: null },
            [FINANCING_MILESTONES.EVALUATION_SCHEDULED]: { completed: false, date: null },
            [FINANCING_MILESTONES.EVALUATION_COMPLETED]: { completed: false, date: null },
            [FINANCING_MILESTONES.FINAL_APPROVAL]: { completed: false, date: null }
          }
        }
      });
    }
  }, [isOpen, transaction]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Data da escritura é obrigatória';
    }
    if (!formData.notaryName) {
      newErrors.notaryName = 'Nome do notário é obrigatório';
    }
    if (!formData.notaryLocation) {
      newErrors.notaryLocation = 'Local da escritura é obrigatório';
    }
    
    if (mode === 'complete') {
      if (!formData.registrationNumber) {
        newErrors.registrationNumber = 'Número de registo é obrigatório';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Pass flag indicating if should mark as completed
    onSave(formData, mode === 'complete');
  };

  const toggleFinancing = () => {
    setFormData(prev => ({
      ...prev,
      hasFinancing: !prev.hasFinancing
    }));
  };

  const toggleMilestone = (milestone) => {
    setFormData(prev => ({
      ...prev,
      financingDetails: {
        ...prev.financingDetails,
        milestones: {
          ...prev.financingDetails.milestones,
          [milestone]: {
            completed: !prev.financingDetails.milestones[milestone]?.completed,
            date: !prev.financingDetails.milestones[milestone]?.completed ? new Date() : null
          }
        }
      }
    }));
  };

  const getMilestoneLabel = (milestone) => {
    const labels = {
      [FINANCING_MILESTONES.BANK_APPROVAL]: 'Aprovação do Banco',
      [FINANCING_MILESTONES.EVALUATION_SCHEDULED]: 'Avaliação Agendada',
      [FINANCING_MILESTONES.EVALUATION_COMPLETED]: 'Avaliação Concluída',
      [FINANCING_MILESTONES.FINAL_APPROVAL]: 'Aprovação Final'
    };
    return labels[milestone] || milestone;
  };

  if (!isOpen) return null;

  const isCompleted = transaction?.escritura?.status === 'completed';
  const isReadOnly = mode === 'prepare' && isCompleted;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {mode === 'complete' ? <Check className="w-5 h-5 text-blue-600" /> : <FileCheck className="w-5 h-5 text-blue-600" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'complete' ? 'Concluir Escritura' : isReadOnly ? 'Detalhes da Escritura' : 'Preparar Escritura Pública'}
              </h2>
              <p className="text-sm text-gray-500">
                {mode === 'complete' 
                  ? 'Confirme a conclusão da escritura' 
                  : 'Contrato de compra e venda definitivo'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Complete Confirmation Message */}
          {mode === 'complete' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-900">
                  <strong>Confirmar Conclusão:</strong> Ao confirmar, a escritura será marcada como concluída e o negócio será finalizado.
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data da Escritura *
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              disabled={isReadOnly}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {errors.scheduledDate && (
              <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>
            )}
          </div>

          {/* Notary Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nome do Notário *
            </label>
            <input
              type="text"
              value={formData.notaryName}
              onChange={(e) => setFormData({ ...formData, notaryName: e.target.value })}
              placeholder="Ex: Dr. João Silva"
              disabled={isReadOnly}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.notaryName ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {errors.notaryName && (
              <p className="text-red-500 text-sm mt-1">{errors.notaryName}</p>
            )}
          </div>

          {/* Notary Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Local da Escritura *
            </label>
            <input
              type="text"
              value={formData.notaryLocation}
              onChange={(e) => setFormData({ ...formData, notaryLocation: e.target.value })}
              placeholder="Ex: Cartório Notarial do Porto"
              disabled={isReadOnly}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.notaryLocation ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {errors.notaryLocation && (
              <p className="text-red-500 text-sm mt-1">{errors.notaryLocation}</p>
            )}
          </div>

          {/* Final Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Euro className="w-4 h-4 inline mr-2" />
              Valor Final
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                value={formData.finalAmount}
                onChange={(e) => setFormData({ ...formData, finalAmount: Number(e.target.value) })}
                disabled={isReadOnly}
                className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                min="0"
                step="100"
              />
            </div>
          </div>

          {/* Financing Section */}
          <div className="border-t pt-6">
            <label className={`flex items-center gap-3 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={formData.hasFinancing}
                onChange={toggleFinancing}
                disabled={isReadOnly}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <span className="text-sm font-medium text-gray-900">
                Envolve Financiamento Bancário
              </span>
            </label>

            {formData.hasFinancing && (
              <div className="mt-4 space-y-4 bg-gray-50 rounded-lg p-4">
                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Banco
                  </label>
                  <input
                    type="text"
                    value={formData.financingDetails.bankName}
                    onChange={(e) => setFormData({
                      ...formData,
                      financingDetails: {
                        ...formData.financingDetails,
                        bankName: e.target.value
                      }
                    })}
                    placeholder="Ex: Banco BPI"
                    disabled={isReadOnly}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {/* Approval Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Aprovado
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    <input
                      type="number"
                      value={formData.financingDetails.approvalAmount}
                      onChange={(e) => setFormData({
                        ...formData,
                        financingDetails: {
                          ...formData.financingDetails,
                          approvalAmount: Number(e.target.value)
                        }
                      })}
                      disabled={isReadOnly}
                      className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Progresso do Financiamento
                  </label>
                  <div className="space-y-2">
                    {Object.values(FINANCING_MILESTONES).map((milestone) => {
                      const milestoneData = formData.financingDetails.milestones[milestone] || { completed: false };
                      return (
                        <label
                          key={milestone}
                          className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 transition-colors ${
                            isReadOnly ? 'cursor-default' : 'hover:border-blue-300 cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={milestoneData.completed}
                            onChange={() => !isReadOnly && toggleMilestone(milestone)}
                            disabled={isReadOnly}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                          />
                          <span className="text-sm font-medium text-gray-900 flex-1">
                            {getMilestoneLabel(milestone)}
                          </span>
                          {milestoneData.completed && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Registration Number (only in complete mode) */}
          {mode === 'complete' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-2" />
                Número de Registo *
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="Ex: 2024/001234"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.registrationNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.registrationNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionais
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              placeholder="Observações, custos adicionais, etc..."
              disabled={isReadOnly}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isReadOnly ? 'Fechar' : 'Cancelar'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {mode === 'complete' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmar Conclusão
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    Guardar Escritura
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}