/**
 * TRANSACTION MODEL - MyImoMatePro
 * Simplified post-offer transaction tracking (CPCV → Escritura)
 */

// Transaction stages
export const TRANSACTION_STAGES = {
  OFFER_ACCEPTED: 'offer_accepted',
  CPCV_SIGNED: 'cpcv_signed',
  ESCRITURA_SCHEDULED: 'escritura_scheduled',
  COMPLETED: 'completed'
};

// Document types required for transaction
export const REQUIRED_DOCUMENTS = {
  BUYER_ID: { type: 'buyer_id', label: 'ID do Comprador', required: true },
  NIF: { type: 'nif', label: 'NIF', required: true },
  PROOF_OF_FUNDS: { type: 'proof_of_funds', label: 'Comprovativo de Fundos', required: true },
  FINANCING_APPROVAL: { type: 'financing_approval', label: 'Aprovação Financiamento', required: false }
};

// Financing milestones (optional, only if financing involved)
export const FINANCING_MILESTONES = {
  BANK_APPROVAL: 'bank_approval',
  EVALUATION_SCHEDULED: 'evaluation_scheduled',
  EVALUATION_COMPLETED: 'evaluation_completed',
  FINAL_APPROVAL: 'final_approval'
};

/**
 * Create initial transaction data after offer acceptance
 */
export function createTransactionData(acceptedOffer) {
  return {
    stage: TRANSACTION_STAGES.OFFER_ACCEPTED,
    acceptedOffer: {
      amount: acceptedOffer.amount,
      acceptedAt: new Date(),
      offerId: acceptedOffer.id
    },
    cpcv: {
      status: 'pending',
      scheduledDate: null,
      signedDate: null,
      signalAmount: 0,
      location: '',
      notes: '',
      documentsChecklist: initializeDocumentChecklist()
    },
    escritura: {
      status: 'pending',
      scheduledDate: null,
      completedDate: null,
      notaryName: '',
      notaryLocation: '',
      finalAmount: acceptedOffer.amount,
      registrationNumber: '',
      notes: ''
    },
    financing: {
      required: false,
      bankName: '',
      approvalAmount: 0,
      milestones: {}
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Initialize document checklist
 */
function initializeDocumentChecklist() {
  return Object.values(REQUIRED_DOCUMENTS).map(doc => ({
    type: doc.type,
    label: doc.label,
    required: doc.required,
    status: 'pending', // pending | received | verified
    uploadedAt: null,
    notes: ''
  }));
}

/**
 * Update CPCV data
 */
export function updateCPCVData(transaction, cpcvData) {
  return {
    ...transaction,
    stage: TRANSACTION_STAGES.CPCV_SIGNED,
    cpcv: {
      ...transaction.cpcv,
      status: 'signed',
      signedDate: new Date(),
      ...cpcvData
    },
    updatedAt: new Date()
  };
}

/**
 * Update Escritura data
 */
export function updateEscrituraData(transaction, escrituraData) {
  return {
    ...transaction,
    stage: TRANSACTION_STAGES.ESCRITURA_SCHEDULED,
    escritura: {
      ...transaction.escritura,
      status: 'scheduled',
      ...escrituraData
    },
    updatedAt: new Date()
  };
}

/**
 * Complete transaction
 */
export function completeTransaction(transaction) {
  return {
    ...transaction,
    stage: TRANSACTION_STAGES.COMPLETED,
    escritura: {
      ...transaction.escritura,
      status: 'completed',
      completedDate: new Date()
    },
    updatedAt: new Date()
  };
}

/**
 * Update document status
 */
export function updateDocumentStatus(transaction, documentType, status, notes = '') {
  const updatedChecklist = transaction.cpcv.documentsChecklist.map(doc => {
    if (doc.type === documentType) {
      return {
        ...doc,
        status,
        uploadedAt: status === 'received' || status === 'verified' ? new Date() : doc.uploadedAt,
        notes
      };
    }
    return doc;
  });

  return {
    ...transaction,
    cpcv: {
      ...transaction.cpcv,
      documentsChecklist: updatedChecklist
    },
    updatedAt: new Date()
  };
}

/**
 * Add financing tracking
 */
export function addFinancingTracking(transaction, financingData) {
  return {
    ...transaction,
    financing: {
      required: true,
      bankName: financingData.bankName || '',
      approvalAmount: financingData.approvalAmount || 0,
      milestones: {
        [FINANCING_MILESTONES.BANK_APPROVAL]: { completed: false, date: null },
        [FINANCING_MILESTONES.EVALUATION_SCHEDULED]: { completed: false, date: null },
        [FINANCING_MILESTONES.EVALUATION_COMPLETED]: { completed: false, date: null },
        [FINANCING_MILESTONES.FINAL_APPROVAL]: { completed: false, date: null }
      }
    },
    updatedAt: new Date()
  };
}

/**
 * Update financing milestone
 */
export function updateFinancingMilestone(transaction, milestone, completed = true) {
  return {
    ...transaction,
    financing: {
      ...transaction.financing,
      milestones: {
        ...transaction.financing.milestones,
        [milestone]: {
          completed,
          date: completed ? new Date() : null
        }
      }
    },
    updatedAt: new Date()
  };
}

/**
 * Validate transaction data
 */
export function validateTransactionData(transaction) {
  const errors = [];

  // Validate CPCV if signed
  if (transaction.stage === TRANSACTION_STAGES.CPCV_SIGNED) {
    if (!transaction.cpcv.signalAmount || transaction.cpcv.signalAmount <= 0) {
      errors.push('Signal amount is required for CPCV');
    }
    if (!transaction.cpcv.signedDate) {
      errors.push('CPCV signed date is required');
    }
  }

  // Validate Escritura if scheduled
  if (transaction.stage === TRANSACTION_STAGES.ESCRITURA_SCHEDULED) {
    if (!transaction.escritura.scheduledDate) {
      errors.push('Escritura scheduled date is required');
    }
    if (!transaction.escritura.notaryName) {
      errors.push('Notary name is required');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get transaction progress percentage
 */
export function getTransactionProgress(transaction) {
  const stages = Object.values(TRANSACTION_STAGES);
  const currentIndex = stages.indexOf(transaction.stage);
  return Math.round(((currentIndex + 1) / stages.length) * 100);
}

/**
 * Get document completion percentage
 */
export function getDocumentCompletion(transaction) {
  const documents = transaction.cpcv.documentsChecklist;
  const completed = documents.filter(doc => doc.status === 'verified').length;
  return Math.round((completed / documents.length) * 100);
}