/**
 * LEAD MODEL - MyImoMatePro
 * Schema para sistema de Leads - Versão Básica
 * Estrutura: consultores/{consultorId}/leads/{leadId}
 * 
 * Caminho: src/models/leadModel.js
 */

import { Timestamp } from 'firebase/firestore';

// ===== SCHEMA PRINCIPAL DA LEAD =====
export const createLeadSchema = (leadData) => {
    return {
        // ===== METADADOS =====
        id: null, // Será definido pelo Firestore
        consultorId: null, // ID do consultor
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'nova', // nova, qualificada, convertida, perdida

        // ===== DADOS DO PROSPECT (OBRIGATÓRIOS) =====
        prospect: {
            name: leadData.prospect?.name || '',
            phone: leadData.prospect?.phone || '',
            email: leadData.prospect?.email || '' // opcional
        },

        // ===== FONTE DA LEAD =====
        source: {
            origin: leadData.source?.origin || 'website', // website, escala, recomendacao, prospeccao, redesSociais, coldCall
            details: leadData.source?.details || '',
            capturedAt: leadData.source?.capturedAt || Timestamp.now()
        },

        // ===== QUALIFICAÇÃO IMOBILIÁRIA =====
        qualification: {
            type: leadData.qualification?.type || '', // comprador, vendedor, senhorio, inquilino, investidor

            // Campos específicos para COMPRADOR
            buyer: {
                looking: leadData.qualification?.buyer?.looking || '',
                budget: leadData.qualification?.buyer?.budget || '',
                preferredLocation: leadData.qualification?.buyer?.preferredLocation || '',
                urgency: leadData.qualification?.buyer?.urgency || 'normal', // baixa, normal, alta, urgente
                notes: leadData.qualification?.buyer?.notes || ''
            },

            // Campos específicos para VENDEDOR
            seller: {
                propertyType: leadData.qualification?.seller?.propertyType || '',
                value: leadData.qualification?.seller?.value || '',
                location: leadData.qualification?.seller?.location || '',
                urgency: leadData.qualification?.seller?.urgency || 'normal',
                notes: leadData.qualification?.seller?.notes || ''
            },

            // Campos específicos para INQUILINO
            tenant: {
                looking: leadData.qualification?.tenant?.looking || '',
                budget: leadData.qualification?.tenant?.budget || '',
                preferredLocation: leadData.qualification?.tenant?.preferredLocation || '',
                urgency: leadData.qualification?.tenant?.urgency || 'normal',
                notes: leadData.qualification?.tenant?.notes || ''
            },

            // Campos específicos para SENHORIO
            landlord: {
                propertyType: leadData.qualification?.landlord?.propertyType || '',
                rentValue: leadData.qualification?.landlord?.rentValue || '',
                location: leadData.qualification?.landlord?.location || '',
                urgency: leadData.qualification?.landlord?.urgency || 'normal',
                notes: leadData.qualification?.landlord?.notes || ''
            },

            // Campos específicos para INVESTIDOR
            investor: {
                investmentType: leadData.qualification?.investor?.investmentType || '', // buyToHoldAndSell, buyToRent, fixAndFlip
                budget: leadData.qualification?.investor?.budget || '',
                preferredLocation: leadData.qualification?.investor?.preferredLocation || '',
                expectedReturn: leadData.qualification?.investor?.expectedReturn || '',
                notes: leadData.qualification?.investor?.notes || ''
            }
        },

        // ===== FOLLOW-UP =====
        followUps: leadData.followUps || [],
        /* Estrutura de cada follow-up:
        {
            id: 'uuid',
            date: Timestamp,
            type: 'chamada' | 'visita' | 'email' | 'whatsapp',
            notes: 'string',
            createdAt: Timestamp,
            createdBy: 'userId'
        }
        */

        // ===== PRÓXIMO CONTACTO =====
        nextContact: {
            date: leadData.nextContact?.date || null,
            type: leadData.nextContact?.type || '', // chamada, visita, email, whatsapp
            notes: leadData.nextContact?.notes || ''
        },

        // ===== CONVERSÃO =====
        conversion: {
            converted: leadData.conversion?.converted || false,
            convertedAt: leadData.conversion?.convertedAt || null,
            clientId: leadData.conversion?.clientId || null
        },

        // ===== NOTAS GERAIS =====
        generalNotes: leadData.generalNotes || ''
    };
};

// ===== VALIDAÇÃO DE DADOS =====
export const validateLeadData = (leadData) => {
    const errors = [];

    // Validar dados obrigatórios do prospect
    if (!leadData.prospect?.name) {
        errors.push('Nome do prospect é obrigatório');
    }

    if (!leadData.prospect?.phone) {
        errors.push('Telefone do prospect é obrigatório');
    }

    // Validar formato do telefone (português)
    if (leadData.prospect?.phone) {
        const phoneRegex = /^[0-9]{9}$/;
        const cleanPhone = leadData.prospect.phone.replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            errors.push('Telefone deve ter 9 dígitos');
        }
    }

    // Validar email se fornecido
    if (leadData.prospect?.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(leadData.prospect.email)) {
            errors.push('Email inválido');
        }
    }

    // Validar tipo de qualificação
    const validTypes = ['comprador', 'vendedor', 'senhorio', 'inquilino', 'investidor'];
    if (leadData.qualification?.type && !validTypes.includes(leadData.qualification.type)) {
        errors.push('Tipo de qualificação inválido');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// ===== OPÇÕES DE ORIGEM =====
export const LEAD_SOURCES = [
    { value: 'website', label: 'Website' },
    { value: 'escala', label: 'Escala' },
    { value: 'recomendacao', label: 'Recomendação' },
    { value: 'prospeccao', label: 'Prospeção' },
    { value: 'redesSociais', label: 'Redes Sociais' },
    { value: 'coldCall', label: 'Cold Call' },
    { value: 'portalImobiliario', label: 'Portal Imobiliário' },
    { value: 'publicidadeExterior', label: 'Publicidade Exterior' },
    { value: 'outro', label: 'Outro' }
];

// ===== TIPOS DE QUALIFICAÇÃO =====
export const QUALIFICATION_TYPES = [
    { value: 'comprador', label: 'Comprador' },
    { value: 'vendedor', label: 'Vendedor' },
    { value: 'senhorio', label: 'Senhorio' },
    { value: 'inquilino', label: 'Inquilino' },
    { value: 'investidor', label: 'Investidor' }
];

// ===== NÍVEIS DE URGÊNCIA =====
export const URGENCY_LEVELS = [
    { value: 'baixa', label: 'Baixa' },
    { value: 'normal', label: 'Normal' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' }
];

// ===== TIPOS DE INVESTIMENTO =====
export const INVESTMENT_TYPES = [
    { value: 'buyToHoldAndSell', label: 'Buy to Hold and Sell' },
    { value: 'buyToRent', label: 'Buy to Rent' },
    { value: 'fixAndFlip', label: 'Fix and Flip' }
];

// ===== STATUS DA LEAD =====
export const LEAD_STATUS = [
    { value: 'nova', label: 'Nova' },
    { value: 'qualificada', label: 'Qualificada' },
    { value: 'emNegociacao', label: 'Em Negociação' },
    { value: 'convertida', label: 'Convertida' },
    { value: 'perdida', label: 'Perdida' }
];

// ===== TIPOS DE FOLLOW-UP =====
export const FOLLOWUP_TYPES = [
    { value: 'chamada', label: 'Chamada' },
    { value: 'visita', label: 'Visita' },
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' }
];