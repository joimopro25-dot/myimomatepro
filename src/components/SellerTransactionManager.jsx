/**
 * SELLER TRANSACTION MANAGER - MyImoMatePro
 * Manages the post-offer transaction flow for sellers
 * Integrates with existing TransactionTimeline, CPCVModal, and EscrituraModal
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, FileText, AlertCircle, TrendingUp, Euro, Calendar } from 'lucide-react';
import TransactionTimeline from './TransactionTimeline';
import { createTransactionData, TRANSACTION_STAGES } from '../models/transactionModel';
import { SELLER_DEAL_STAGES } from '../models/sellerDealModel';

export default function SellerTransactionManager({ 
  deal, 
  onUpdateDeal,
  onStageChange 
}) {
  const [showTransactionStart, setShowTransactionStart] = useState(false);

  // Check if we should show transaction timeline
  const shouldShowTransaction = deal.acceptedOffer && (
    deal.stage === 'accepted' || 
    deal.stage === 'cpcv_preparation' ||
    deal.stage === 'cpcv_signed' ||
    deal.stage === 'escritura_scheduled' ||
    deal.stage === 'completed'
  );

  // Initialize transaction data when offer is accepted
  const handleStartTransaction = async () => {
    if (!deal.acceptedOffer) return;

    // Create transaction data from accepted offer
    const transactionData = createTransactionData(deal.acceptedOffer);
    
    // Update deal with transaction data and move to CPCV preparation stage
    const updatedDeal = {
      ...deal,
      transaction: transactionData,
      stage: 'cpcv_preparation',
      updatedAt: new Date()
    };

    await onUpdateDeal(updatedDeal);
    
    // Notify parent about stage change if needed
    if (onStageChange) {
      onStageChange('cpcv_preparation');
    }

    setShowTransactionStart(false);
  };

  // Handle transaction updates from timeline
  const handleTransactionUpdate = async (updatedTransaction) => {
    // Map transaction stages to deal stages
    let newStage = deal.stage;
    
    switch (updatedTransaction.stage) {
      case TRANSACTION_STAGES.CPCV_SIGNED:
        newStage = 'cpcv_signed';
        break;
      case TRANSACTION_STAGES.ESCRITURA_SCHEDULED:
        newStage = 'escritura_scheduled';
        break;
      case TRANSACTION_STAGES.COMPLETED:
        newStage = 'completed';
        break;
      default:
        // Keep current stage if still in preparation
        if (updatedTransaction.stage === TRANSACTION_STAGES.OFFER_ACCEPTED) {
          newStage = 'cpcv_preparation';
        }
        break;
    }

    // Update deal with new transaction data and stage
    const updatedDeal = {
      ...deal,
      transaction: updatedTransaction,
      stage: newStage,
      updatedAt: new Date()
    };

    await onUpdateDeal(updatedDeal);

    // Notify parent about stage change
    if (onStageChange && newStage !== deal.stage) {
      onStageChange(newStage);
    }
  };

  // Show prompt to start transaction if offer accepted but no transaction
  if (deal.acceptedOffer && !deal.transaction && deal.stage === 'accepted') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Proposta Aceite! 🎉
            </h3>
            <p className="text-green-700 mb-4">
              A proposta de <strong>{deal.acceptedOffer.buyer?.name || 'Comprador'}</strong> foi aceite 
              no valor de <strong>€{deal.acceptedOffer.amount?.toLocaleString('pt-PT') || deal.acceptedOffer.proposedPrice?.toLocaleString('pt-PT')}</strong>.
              Pode agora iniciar o processo de transação.
            </p>
            
            {/* Offer summary */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Comprador:</span>
                <span className="font-medium">{deal.acceptedOffer.buyer?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor Aceite:</span>
                <span className="font-medium text-green-600">
                  €{(deal.acceptedOffer.amount || deal.acceptedOffer.proposedPrice)?.toLocaleString('pt-PT')}
                </span>
              </div>
              {deal.acceptedOffer.terms?.financingStatus && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Financiamento:</span>
                  <span className="font-medium">
                    {deal.acceptedOffer.terms.financingStatus === 'cash' ? 'Pronto Pagamento' : 
                     deal.acceptedOffer.terms.financingStatus === 'pre_approved' ? 'Pré-aprovado' : 'Pendente'}
                  </span>
                </div>
              )}
              {deal.acceptedOffer.terms?.closingDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Data Prevista:</span>
                  <span className="font-medium">
                    {new Date(deal.acceptedOffer.terms.closingDate).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleStartTransaction}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Iniciar Processo de Transação (CPCV)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show transaction timeline if transaction exists
  if (shouldShowTransaction && deal.transaction) {
    return (
      <div className="space-y-6">
        {/* Transaction Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Processo de Transação</h3>
              <p className="text-sm text-gray-600 mt-1">
                Gestão do CPCV e Escritura para {deal.property?.address}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Valor da Transação</div>
              <div className="text-2xl font-bold text-purple-600">
                €{deal.transaction.acceptedOffer?.amount?.toLocaleString('pt-PT')}
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-gray-700">
              Fase atual: <strong>{getStageLabel(deal.transaction.stage)}</strong>
            </span>
          </div>
        </div>

        {/* Transaction Timeline Component */}
        <TransactionTimeline
          transaction={deal.transaction}
          onUpdateTransaction={handleTransactionUpdate}
        />

        {/* Quick Actions */}
        {deal.stage !== 'completed' && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Ações Rápidas</h4>
            <div className="grid grid-cols-2 gap-3">
              {getQuickActions(deal).map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm text-gray-700 hover:text-blue-700"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Important Notes */}
        {deal.transaction.cpcv?.notes || deal.transaction.escritura?.notes ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                {deal.transaction.cpcv?.notes && (
                  <div>
                    <span className="font-medium text-yellow-900">Notas CPCV:</span>
                    <p className="text-sm text-yellow-800 mt-1">{deal.transaction.cpcv.notes}</p>
                  </div>
                )}
                {deal.transaction.escritura?.notes && (
                  <div>
                    <span className="font-medium text-yellow-900">Notas Escritura:</span>
                    <p className="text-sm text-yellow-800 mt-1">{deal.transaction.escritura.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // Show nothing if no accepted offer
  return null;
}

// Helper function to get stage label
function getStageLabel(stage) {
  const labels = {
    [TRANSACTION_STAGES.OFFER_ACCEPTED]: 'Proposta Aceite',
    [TRANSACTION_STAGES.CPCV_SIGNED]: 'CPCV Assinado',
    [TRANSACTION_STAGES.ESCRITURA_SCHEDULED]: 'Escritura Agendada',
    [TRANSACTION_STAGES.COMPLETED]: 'Transação Concluída'
  };
  return labels[stage] || stage;
}

// Helper function to get quick actions based on current stage
function getQuickActions(deal) {
  const actions = [];

  // Add actions based on transaction stage
  if (deal.transaction?.stage === TRANSACTION_STAGES.OFFER_ACCEPTED) {
    actions.push({
      label: 'Verificar Documentos',
      icon: <FileText className="w-4 h-4" />,
      onClick: () => console.log('Check documents')
    });
    actions.push({
      label: 'Contactar Comprador',
      icon: <Calendar className="w-4 h-4" />,
      onClick: () => console.log('Contact buyer')
    });
  } else if (deal.transaction?.stage === TRANSACTION_STAGES.CPCV_SIGNED) {
    actions.push({
      label: 'Confirmar Notário',
      icon: <FileText className="w-4 h-4" />,
      onClick: () => console.log('Confirm notary')
    });
    actions.push({
      label: 'Verificar Financiamento',
      icon: <Euro className="w-4 h-4" />,
      onClick: () => console.log('Check financing')
    });
  }

  return actions;
}