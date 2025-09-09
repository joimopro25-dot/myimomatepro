/**
 * CLIENT MODEL - MyImoMatePro - VERSÃO CORRIGIDA
 * Schema completo para Cliente em PERFEITA SINTONIA com ClientForm.js
 * Estrutura: consultores/{consultorId}/clientes/{clienteId}
 */

import { Timestamp } from 'firebase/firestore';

// ===== SCHEMA PRINCIPAL DO CLIENTE (CORRIGIDO) =====
export const createClientSchema = (clientData) => {
    return {
        // ===== METADADOS =====
        id: null, // Será definido pelo Firestore
        consultorId: null, // ID do consultor (corrigido de tenantId)
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true,

        // ===== DADOS PESSOAIS (OBRIGATÓRIOS) =====
        name: clientData.name || '',
        phone: clientData.phone || '',

        // ===== DADOS PESSOAIS (OPCIONAIS) =====
        email: clientData.email || '',
        contactPreference: clientData.contactPreference || 'phone',
        bestContactTime: clientData.bestContactTime || '',
        cc: clientData.cc || '',
        ccValidity: clientData.ccValidity || '',
        nif: clientData.nif || '',
        birthDate: clientData.birthDate || '',
        birthPlace: clientData.birthPlace || '',
        parish: clientData.parish || '',
        municipality: clientData.municipality || '',
        district: clientData.district || '',
        profession: clientData.profession || '',
        maritalStatus: clientData.maritalStatus || 'single',
        marriageRegime: clientData.marriageRegime || '',

        // ===== DADOS DO CÔNJUGE (CORRIGIDO - COMPLETO) =====
        spouse: {
            name: clientData.spouse?.name || '',
            phone: clientData.spouse?.phone || '',
            email: clientData.spouse?.email || '',
            cc: clientData.spouse?.cc || '',
            ccValidity: clientData.spouse?.ccValidity || '',
            profession: clientData.spouse?.profession || '',
            nif: clientData.spouse?.nif || '',
            birthDate: clientData.spouse?.birthDate || '', // ✅ ADICIONADO
            birthPlace: clientData.spouse?.birthPlace || '', // ✅ ADICIONADO
            parish: clientData.spouse?.parish || '', // ✅ ADICIONADO
            municipality: clientData.spouse?.municipality || '', // ✅ ADICIONADO
            district: clientData.spouse?.district || '' // ✅ ADICIONADO
        },

        // ===== MORADA DE RESIDÊNCIA (CORRIGIDA) =====
        address: {
            street: clientData.address?.street || '',
            number: clientData.address?.number || '',
            floor: clientData.address?.floor || '', // ✅ ADICIONADO
            postalCode: clientData.address?.postalCode || '',
            city: clientData.address?.city || '',
            parish: clientData.address?.parish || '', // ✅ ADICIONADO
            municipality: clientData.address?.municipality || '', // ✅ ADICIONADO
            district: clientData.address?.district || '', // ✅ ADICIONADO
            country: clientData.address?.country || 'Portugal'
        },

        // ===== INFORMAÇÕES FINANCEIRAS (CORRIGIDAS) =====
        financial: {
            monthlyIncome: clientData.financial?.monthlyIncome || '',
            spouseMonthlyIncome: clientData.financial?.spouseMonthlyIncome || '',
            totalHouseholdIncome: clientData.financial?.totalHouseholdIncome || '',
            availableCapital: clientData.financial?.availableCapital || '',

            // ✅ ESTRUTURA DE CRÉDITOS CORRIGIDA
            credits: {
                mortgage: {
                    active: clientData.financial?.credits?.mortgage?.active || false,
                    amount: clientData.financial?.credits?.mortgage?.amount || '',
                    entity: clientData.financial?.credits?.mortgage?.entity || '',
                    monthlyPayment: clientData.financial?.credits?.mortgage?.monthlyPayment || '' // ✅ ADICIONADO
                },
                personal: {
                    active: clientData.financial?.credits?.personal?.active || false,
                    amount: clientData.financial?.credits?.personal?.amount || '',
                    entity: clientData.financial?.credits?.personal?.entity || '',
                    monthlyPayment: clientData.financial?.credits?.personal?.monthlyPayment || '' // ✅ ADICIONADO
                },
                auto: {
                    active: clientData.financial?.credits?.auto?.active || false,
                    amount: clientData.financial?.credits?.auto?.amount || '',
                    entity: clientData.financial?.credits?.auto?.entity || '',
                    monthlyPayment: clientData.financial?.credits?.auto?.monthlyPayment || '' // ✅ ADICIONADO
                },
                credit_card: {
                    active: clientData.financial?.credits?.credit_card?.active || false,
                    amount: clientData.financial?.credits?.credit_card?.amount || '',
                    entity: clientData.financial?.credits?.credit_card?.entity || '',
                    monthlyPayment: clientData.financial?.credits?.credit_card?.monthlyPayment || '' // ✅ ADICIONADO
                },
                other: {
                    active: clientData.financial?.credits?.other?.active || false,
                    amount: clientData.financial?.credits?.other?.amount || '',
                    entity: clientData.financial?.credits?.other?.entity || '',
                    monthlyPayment: clientData.financial?.credits?.other?.monthlyPayment || '', // ✅ ADICIONADO
                    description: clientData.financial?.credits?.other?.description || ''
                }
            },

            relationshipBank: clientData.financial?.relationshipBank || '',

            // ✅ PRÉ-APROVAÇÃO CORRIGIDA (nomes do formulário)
            hasPreApproval: clientData.financial?.hasPreApproval || false,
            bankApprovalWhere: clientData.financial?.bankApprovalWhere || '',
            bankApprovalAmount: clientData.financial?.bankApprovalAmount || '',
            bankApprovalConditions: clientData.financial?.bankApprovalConditions || '', // ✅ CORRIGIDO
            bankApprovalValidity: clientData.financial?.bankApprovalValidity || '' // ✅ ADICIONADO
        },

        // ===== DOCUMENTAÇÃO (CORRIGIDA E COMPLETA) =====
        documents: {
            ccFront: clientData.documents?.ccFront || false,
            ccBack: clientData.documents?.ccBack || false,
            ibanProof: clientData.documents?.ibanProof || false,
            irsDeclaration: clientData.documents?.irsDeclaration || false,
            salaryReceipts: clientData.documents?.salaryReceipts || false,
            birthCertificate: clientData.documents?.birthCertificate || false,
            marriageCertificate: clientData.documents?.marriageCertificate || false,
            propertyRegistry: clientData.documents?.propertyRegistry || false,
            residenceCertificate: clientData.documents?.residenceCertificate || false,
            workContract: clientData.documents?.workContract || false,
            bankStatement: clientData.documents?.bankStatement || false, // ✅ ADICIONADO
            divorceDecree: clientData.documents?.divorceDecree || false, // ✅ ADICIONADO
            pensionProof: clientData.documents?.pensionProof || false // ✅ ADICIONADO
        },

        // ===== GESTÃO DE RELACIONAMENTO (CORRIGIDO) =====
        tags: clientData.tags || [],
        leadSource: clientData.leadSource || 'website', // ✅ CORRIGIDO (era howDidYouFindUs)
        referralSource: clientData.referralSource || '', // ✅ ADICIONADO
        consultorObservations: clientData.consultorObservations || '',
        nextContactDate: clientData.nextContactDate || '',

        // ===== CONSENTIMENTOS GDPR (CORRIGIDOS E COMPLETOS) =====
        gdprConsent: clientData.gdprConsent || false, // ✅ OBRIGATÓRIO
        marketingConsent: clientData.marketingConsent || false, // ✅ ADICIONADO
        dataProcessingConsent: clientData.dataProcessingConsent || false, // ✅ ADICIONADO
        thirdPartyConsent: clientData.thirdPartyConsent || false, // ✅ ADICIONADO

        // ===== ESTATÍSTICAS (CALCULADAS) =====
        stats: {
            totalOpportunities: 0,
            totalDeals: 0,
            totalWonDeals: 0,
            totalCommissions: 0,
            lastContactDate: null,
            avgDealValue: 0
        }
    };
};

// ===== VALIDAÇÕES (CORRIGIDAS) =====
export const validateClientData = (clientData) => {
    const errors = {};

    // Campos obrigatórios - APENAS NOME E TELEFONE
    if (!clientData.name || clientData.name.trim().length < 2) {
        errors.name = 'Nome é obrigatório (mínimo 2 caracteres)';
    }

    if (!clientData.phone || clientData.phone.trim().length < 9) {
        errors.phone = 'Telefone é obrigatório (mínimo 9 dígitos)';
    }

    // Email (OPCIONAL - só valida se preenchido)
    if (clientData.email && clientData.email.trim() && !isValidEmail(clientData.email)) {
        errors.email = 'Email inválido';
    }

    // NIF (se preenchido)
    if (clientData.nif && !isValidNIF(clientData.nif)) {
        errors.nif = 'NIF inválido';
    }

    // Código postal (se preenchido)
    if (clientData.address?.postalCode && !isValidPostalCode(clientData.address.postalCode)) {
        errors.postalCode = 'Código postal inválido (ex: 1234-567)';
    }

    // ✅ GDPR OBRIGATÓRIO
    if (!clientData.gdprConsent) {
        errors.gdprConsent = 'Consentimento GDPR é obrigatório';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

const isValidNIF = (nif) => {
    const cleanNIF = nif.replace(/\s/g, '');
    if (!/^\d{9}$/.test(cleanNIF)) return false;

    const digits = cleanNIF.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 8; i++) {
        sum += digits[i] * (9 - i);
    }
    const checkDigit = 11 - (sum % 11);
    const finalDigit = checkDigit >= 10 ? 0 : checkDigit;

    return finalDigit === digits[8];
};

const isValidPostalCode = (code) => {
    const re = /^\d{4}-\d{3}$/;
    return re.test(code);
};

// ===== CONSTANTES (CORRIGIDAS) =====
export const CLIENT_CONTACT_PREFERENCES = [
    { value: 'phone', label: 'Telefone' },
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'any', label: 'Qualquer meio' }
];

export const CLIENT_MARITAL_STATUS = [
    { value: 'single', label: 'Solteiro(a)' },
    { value: 'married', label: 'Casado(a)' },
    { value: 'union', label: 'União de Facto' },
    { value: 'divorced', label: 'Divorciado(a)' },
    { value: 'widowed', label: 'Viúvo(a)' }
];

export const CLIENT_MARRIAGE_REGIMES = [
    { value: 'community_assets', label: 'Comunhão de Adquiridos' },
    { value: 'general_community', label: 'Comunhão Geral' },
    { value: 'separate_property', label: 'Separação de Bens' },
    { value: 'other', label: 'Outro' }
];

export const CLIENT_CREDIT_TYPES = [
    { key: 'mortgage', label: 'Crédito Habitação', icon: '🏠' },
    { key: 'personal', label: 'Crédito Pessoal', icon: '💤' },
    { key: 'auto', label: 'Crédito Automóvel', icon: '🚗' },
    { key: 'credit_card', label: 'Cartão de Crédito', icon: '💳' },
    { key: 'other', label: 'Outro Crédito', icon: '📋' }
];

export const CLIENT_LEAD_SOURCES = [
    { value: 'website', label: 'Website' },
    { value: 'google', label: 'Google' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'recommendation', label: 'Recomendação' },
    { value: 'property_portal', label: 'Portal Imobiliário' },
    { value: 'outdoor_ads', label: 'Publicidade Exterior' },
    { value: 'radio', label: 'Rádio' },
    { value: 'newspaper', label: 'Jornal' },
    { value: 'other', label: 'Outro' }
];

export const CLIENT_AVAILABLE_TAGS = [
    'VIP', 'Urgente', 'Investidor', 'Primeira habitação',
    'Financiamento aprovado', 'Sem pressa', 'Exigente',
    'Flexível localização', 'Budget alto', 'Recomendação'
];

// ✅ CONSTANTE CORRIGIDA - DOCUMENTOS COMPLETOS
export const CLIENT_DOCUMENT_TYPES = [
    { key: 'ccFront', label: 'CC Frente' },
    { key: 'ccBack', label: 'CC Verso' },
    { key: 'ibanProof', label: 'Comprovativo IBAN' },
    { key: 'irsDeclaration', label: 'Declaração IRS' },
    { key: 'salaryReceipts', label: 'Recibos Vencimento' },
    { key: 'birthCertificate', label: 'Certidão Nascimento' },
    { key: 'marriageCertificate', label: 'Certidão Casamento' },
    { key: 'propertyRegistry', label: 'Caderneta Predial' },
    { key: 'residenceCertificate', label: 'Cert. Permanência' },
    { key: 'workContract', label: 'Contrato Trabalho' },
    { key: 'bankStatement', label: 'Extrato Bancário' }, // ✅ ADICIONADO
    { key: 'divorceDecree', label: 'Certidão Divórcio' }, // ✅ ADICIONADO
    { key: 'pensionProof', label: 'Comp. Pensão' } // ✅ ADICIONADO
];