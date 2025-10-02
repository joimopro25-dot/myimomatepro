/**
 * CPCV MODAL - MyImoMatePro (IMPROVED)
 * Record CPCV details with separate prepare/sign workflow
 * Can edit multiple times before marking as signed
 */

import React, { useState, useEffect } from 'react';
import { X, FileText, MapPin, Euro, Calendar, Check } from 'lucide-react';
import { REQUIRED_DOCUMENTS } from '../models/transactionModel';

export default function CPCVModal({ isOpen, onClose, onSave, transaction, mode = 'prepare' }) {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    signalAmount: 0,
    location: '',
    notes: '',
    documentsChecklist: []
  });

  const [errors, setErrors] = useState({});

  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen && transaction) {
      const offerAmount = transaction.acceptedOffer?.amount || 0;
      setFormData({
        scheduledDate: transaction.cpcv?.scheduledDate || '',
        signalAmount: transaction.cpcv?.signalAmount || Math.round(offerAmount * 0.1),
        location: transaction.cpcv?.location || '',
        notes: transaction.cpcv?.notes || '',
        documentsChecklist: transaction.cpcv?.documentsChecklist?.length > 0
          ? transaction.cpcv.documentsChecklist
          : Object.values(REQUIRED_DOCUMENTS).map(doc => ({
              type: doc.type,
              label: doc.label,
              required: doc.required,
              checked: false,
              status: 'pending',
              notes: '',
              uploadedAt: null
            }))
      });
    }
  }, [isOpen, transaction]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Data do CPCV é obrigatória';
    }
    if (!formData.signalAmount || formData.signalAmount <= 0) {
      newErrors.signalAmount = 'Sinal deve ser maior que zero';
    }
    if (!formData.location) {
      newErrors.location = 'Local do CPCV é obrigatório';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Update document statuses based on checkboxes
    const updatedDocuments = formData.documentsChecklist.map(doc => ({
      ...doc,
      status: doc.checked ? 'received' : 'pending',
      uploadedAt: doc.checked && !doc.uploadedAt ? new Date() : doc.uploadedAt
    }));

    const dataToSave = {
      ...formData,
      documentsChecklist: updatedDocuments
    };

    // Pass flag indicating if should mark as signed
    onSave(dataToSave, mode === 'sign');
  };

  const handleDocumentCheck = (documentType) => {
    setFormData(prev => ({
      ...prev,
      documentsChecklist: prev.documentsChecklist.map(doc =>
        doc.type === documentType ? { ...doc, checked: !doc.checked } : doc
      )
    }));
  };

  const calculatePercentage = (amount) => {
    const offerAmount = transaction?.acceptedOffer?.amount || 0;
    if (!offerAmount) return '0';
    return ((amount / offerAmount) * 100).toFixed(1);
  };

  if (!isOpen) return null;

  const offerAmount = transaction?.acceptedOffer?.amount || 0;
  const isSigned = transaction?.cpcv?.status === 'signed';
  const isReadOnly = mode === 'prepare' && isSigned;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              {mode === 'sign' ? <Check className="w-5 h-5 text-purple-600" /> : <FileText className="w-5 h-5 text-purple-600" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'sign' ? 'Marcar CPCV como Assinado' : isReadOnly ? 'Detalhes do CPCV' : 'Preparar CPCV'}
              </h2>
              <p className="text-sm text-gray-500">
                {mode === 'sign'
                  ? 'Confirme que o CPCV foi assinado'
                  : 'Contrato Promessa de Compra e Venda'
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
          {/* Offer Amount Reference */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Valor da Proposta Aceite</span>
              <span className="text-lg font-bold text-blue-600">€{offerAmount.toLocaleString('pt-PT')}</span>
            </div>
          </div>

          {/* Sign Confirmation Message */}
          {mode === 'sign' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-900">
                  <strong>Confirmar Assinatura:</strong> Ao confirmar, o CPCV será marcado como assinado e poderá avançar para a preparação da Escritura.
                </div>
              </div>
            </div>
          )}

          {/* CPCV Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data {mode === 'sign' ? 'de Assinatura' : 'Agendada'} *
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              disabled={isReadOnly}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {errors.scheduledDate && (
              <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>
            )}
          </div>

          {/* Signal Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Euro className="w-4 h-4 inline mr-2" />
              Valor do Sinal *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                value={formData.signalAmount}
                onChange={(e) => setFormData({ ...formData, signalAmount: Number(e.target.value) })}
                disabled={isReadOnly}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.signalAmount ? 'border-red-500' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                min="0"
                step="100"
              />
            </div>
            {formData.signalAmount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {calculatePercentage(formData.signalAmount)}% do valor total
              </p>
            )}
            {errors.signalAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.signalAmount}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Local do CPCV *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Escritório, casa do cliente..."
              disabled={isReadOnly}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Documents Checklist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Documentos Disponíveis
            </label>
            <div className="space-y-2 bg-gray-50 rounded-lg p-4">
              {formData.documentsChecklist.map((doc) => (
                <label
                  key={doc.type}
                  className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 ${
                    isReadOnly ? 'cursor-default' : 'hover:border-purple-300 cursor-pointer'
                  } transition-colors`}
                >
                  <input
                    type="checkbox"
                    checked={doc.checked || doc.status === 'received' || doc.status === 'verified'}
                    onChange={() => !isReadOnly && handleDocumentCheck(doc.type)}
                    disabled={isReadOnly}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{doc.label}</span>
                    {doc.required && (
                      <span className="ml-2 text-xs text-red-500">*</span>
                    )}
                  </div>
                  {(doc.checked || doc.status === 'received' || doc.status === 'verified') && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </label>
              ))}
            </div>
            {!isReadOnly && (
              <p className="text-xs text-gray-500 mt-2">
                Marque os documentos que já possui. Pode atualizar depois.
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionais
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              placeholder="Condições especiais, observações..."
              disabled={isReadOnly}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
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
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                {mode === 'sign' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmar Assinatura
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Guardar CPCV
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