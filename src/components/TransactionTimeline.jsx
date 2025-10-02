/**
 * TRANSACTION TIMELINE - MyImoMatePro (IMPROVED)
 * Visual progress with proper workflow control
 * Can edit/prepare multiple times before marking as signed/completed
 */

import React, { useState } from 'react';
import { CheckCircle, Circle, FileText, FileCheck, Clock, Euro, MapPin, Calendar, Edit, Check } from 'lucide-react';
import { TRANSACTION_STAGES } from '../models/transactionModel';
import CPCVModal from './CPCVModal';
import EscrituraModal from './EscrituraModal';

export default function TransactionTimeline({ transaction, onUpdateTransaction }) {
  const [showCPCVModal, setShowCPCVModal] = useState(false);
  const [cpcvMode, setCPCVMode] = useState('prepare'); // 'prepare' or 'sign'
  const [showEscrituraModal, setShowEscrituraModal] = useState(false);
  const [escrituraMode, setEscrituraMode] = useState('prepare'); // 'prepare' or 'complete'

  const stages = [
    {
      key: TRANSACTION_STAGES.OFFER_ACCEPTED,
      label: 'Proposta Aceite',
      icon: CheckCircle,
      color: 'green'
    },
    {
      key: TRANSACTION_STAGES.CPCV_SIGNED,
      label: 'CPCV Assinado',
      icon: FileText,
      color: 'purple'
    },
    {
      key: TRANSACTION_STAGES.ESCRITURA_SCHEDULED,
      label: 'Escritura Agendada',
      icon: Calendar,
      color: 'blue'
    },
    {
      key: TRANSACTION_STAGES.COMPLETED,
      label: 'Concluído',
      icon: FileCheck,
      color: 'emerald'
    }
  ];

  const getCurrentStageIndex = () => stages.findIndex(s => s.key === transaction.stage);

  const isStageCompleted = (stageKey) => {
    const stageIndex = stages.findIndex(s => s.key === stageKey);
    return stageIndex <= getCurrentStageIndex();
  };

  const handleCPCVSave = async (cpcvData, shouldMarkSigned) => {
    const updatedTransaction = {
      ...transaction,
      cpcv: {
        ...transaction.cpcv,
        ...cpcvData,
        status: shouldMarkSigned ? 'signed' : 'prepared',
        signedDate: shouldMarkSigned ? new Date() : transaction.cpcv?.signedDate
      },
      stage: shouldMarkSigned ? TRANSACTION_STAGES.CPCV_SIGNED : transaction.stage,
      updatedAt: new Date()
    };

    await onUpdateTransaction(updatedTransaction);
    setShowCPCVModal(false);
  };

  const handleEscrituraSave = async (escrituraData, shouldMarkCompleted) => {
    const updatedTransaction = {
      ...transaction,
      escritura: {
        ...transaction.escritura,
        ...escrituraData,
        status: shouldMarkCompleted ? 'completed' : 'scheduled',
        completedDate: shouldMarkCompleted ? new Date() : transaction.escritura?.completedDate
      },
      financing: escrituraData.hasFinancing
        ? { required: true, ...escrituraData.financingDetails }
        : transaction.financing,
      stage: shouldMarkCompleted ? TRANSACTION_STAGES.COMPLETED : TRANSACTION_STAGES.ESCRITURA_SCHEDULED,
      updatedAt: new Date()
    };

    await onUpdateTransaction(updatedTransaction);
    setShowEscrituraModal(false);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const currentIndex = Math.max(0, getCurrentStageIndex());

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-green-500 via-purple-500 to-blue-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative grid grid-cols-4 gap-2">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const completed = isStageCompleted(stage.key);
            const current = stage.key === transaction.stage;

            return (
              <div key={stage.key} className="flex flex-col items-center">
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${completed ? `bg-${stage.color}-100` : 'bg-gray-100'}
                  ${current ? `ring-4 ring-${stage.color}-200 scale-110` : ''}
                `}
                >
                  <Icon className={`w-6 h-6 ${completed ? `text-${stage.color}-600` : 'text-gray-400'}`} />
                </div>
                <span className={`mt-2 text-xs font-medium text-center ${completed ? 'text-gray-900' : 'text-gray-500'}`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPCV Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">CPCV</h3>
            </div>
            {transaction.cpcv?.status === 'signed' && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Assinado</span>
            )}
            {transaction.cpcv?.status === 'prepared' && (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">Preparado</span>
            )}
          </div>

          {transaction.cpcv?.scheduledDate || transaction.cpcv?.signedDate ? (
            <div className="space-y-2 text-sm mb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {transaction.cpcv?.status === 'signed'
                    ? formatDate(transaction.cpcv?.signedDate)
                    : formatDate(transaction.cpcv?.scheduledDate)}
                </span>
              </div>
              {transaction.cpcv?.signalAmount > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Euro className="w-4 h-4" />
                  <span>Sinal: €{Number(transaction.cpcv?.signalAmount || 0).toLocaleString('pt-PT')}</span>
                </div>
              )}
              {transaction.cpcv?.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{transaction.cpcv.location}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-3">CPCV por preparar</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {transaction.cpcv?.status !== 'signed' && (
              <>
                <button
                  onClick={() => {
                    setCPCVMode('prepare');
                    setShowCPCVModal(true);
                  }}
                  className="flex-1 text-sm px-3 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  {transaction.cpcv?.scheduledDate ? 'Editar' : 'Preparar'}
                </button>
                {transaction.cpcv?.scheduledDate && (
                  <button
                    onClick={() => {
                      setCPCVMode('sign');
                      setShowCPCVModal(true);
                    }}
                    className="flex-1 text-sm px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Assinar
                  </button>
                )}
              </>
            )}
            {transaction.cpcv?.status === 'signed' && (
              <button
                onClick={() => {
                  setCPCVMode('prepare');
                  setShowCPCVModal(true);
                }}
                className="flex-1 text-sm px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Ver Detalhes
              </button>
            )}
          </div>
        </div>

        {/* Escritura Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Escritura</h3>
            </div>
            {transaction.escritura?.status === 'completed' && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Concluída</span>
            )}
            {transaction.escritura?.status === 'scheduled' && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Agendada</span>
            )}
          </div>

          {transaction.escritura?.scheduledDate || transaction.escritura?.completedDate ? (
            <div className="space-y-2 text-sm mb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {transaction.escritura?.status === 'completed'
                    ? formatDate(transaction.escritura?.completedDate)
                    : formatDate(transaction.escritura?.scheduledDate)}
                </span>
              </div>
              {transaction.escritura?.notaryLocation && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{transaction.escritura.notaryLocation}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-3">
              {transaction.cpcv?.status === 'signed' ? 'Escritura por agendar' : 'Aguarda CPCV assinado'}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {transaction.cpcv?.status === 'signed' && transaction.escritura?.status !== 'completed' && (
              <>
                <button
                  onClick={() => {
                    setEscrituraMode('prepare');
                    setShowEscrituraModal(true);
                  }}
                  className="flex-1 text-sm px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  {transaction.escritura?.scheduledDate ? 'Editar' : 'Preparar'}
                </button>
                {transaction.escritura?.scheduledDate && (
                  <button
                    onClick={() => {
                      setEscrituraMode('complete');
                      setShowEscrituraModal(true);
                    }}
                    className="flex-1 text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Concluir
                  </button>
                )}
              </>
            )}
            {transaction.escritura?.status === 'completed' && (
              <button
                onClick={() => {
                  setEscrituraMode('prepare');
                  setShowEscrituraModal(true);
                }}
                className="flex-1 text-sm px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Ver Detalhes
              </button>
            )}
            {transaction.cpcv?.status !== 'signed' && (
              <button
                disabled
                className="flex-1 text-sm px-3 py-2 border border-gray-200 text-gray-400 rounded-lg cursor-not-allowed"
              >
                Aguarda CPCV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Financing Timeline (if applicable) */}
      {transaction.financing?.required && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Progresso do Financiamento
          </h3>
          <div className="space-y-2">
            {Object.entries(transaction.financing.milestones || {}).map(([key, milestone]) => (
              <div key={key} className="flex items-center gap-3">
                {milestone.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${milestone.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                {milestone.date && <span className="text-xs text-gray-500 ml-auto">{formatDate(milestone.date)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <CPCVModal
        isOpen={showCPCVModal}
        onClose={() => setShowCPCVModal(false)}
        onSave={handleCPCVSave}
        transaction={transaction}
        mode={cpcvMode}
      />

      <EscrituraModal
        isOpen={showEscrituraModal}
        onClose={() => setShowEscrituraModal(false)}
        onSave={handleEscrituraSave}
        transaction={transaction}
        mode={escrituraMode}
      />
    </div>
  );
}