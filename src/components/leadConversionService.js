/**
 * LEAD CONVERSION SERVICE - MyImoMatePro
 * Serviço especializado para conversão Lead → Cliente + Oportunidade
 * Garante integridade e sincronização dos dados
 * 
 * Caminho: src/services/leadConversionService.js
 */

import { Timestamp } from 'firebase/firestore';
import { createClient } from './clientService';
import { createOpportunity } from './opportunityService';
import { updateLead } from './leadService';
import { createOpportunityFromLead } from '../models/opportunityModel';

/**
 * Converter Lead completa em Cliente + Oportunidade
 * @param {string} consultorId - ID do consultor
 * @param {object} leadData - Dados completos da lead
 * @returns {object} Resultado da conversão com IDs criados
 */
export const convertLeadToClientAndOpportunity = async (consultorId, leadData) => {
    console.log('=== INICIANDO CONVERSÃO LEAD → CLIENTE + OPORTUNIDADE ===');
    console.log('Lead ID:', leadData.id);
    console.log('Tipo de qualificação:', leadData.qualification?.type);

    try {
        // ===== PASSO 1: CRIAR CLIENTE =====
        const clientData = buildClientFromLead(leadData);
        console.log('Dados do cliente preparados:', clientData);

        const clientResult = await createClient(consultorId, clientData);

        if (!clientResult.success) {
            throw new Error(`Falha ao criar cliente: ${clientResult.error}`);
        }

        console.log('✅ Cliente criado com sucesso:', clientResult.data.id);

        // ===== PASSO 2: CRIAR OPORTUNIDADE =====
        const opportunityData = createOpportunityFromLead(leadData, clientResult.data.id);
        console.log('Dados da oportunidade preparados:', opportunityData);

        const opportunityResult = await createOpportunity(consultorId, opportunityData);

        if (!opportunityResult.success) {
            // TODO: Rollback do cliente criado?
            throw new Error(`Falha ao criar oportunidade: ${opportunityResult.error}`);
        }

        console.log('✅ Oportunidade criada com sucesso:', opportunityResult.data.id);

        // ===== PASSO 3: ATUALIZAR LEAD =====
        const updateResult = await updateLead(consultorId, leadData.id, {
            status: 'convertida',
            convertedAt: Timestamp.now(),
            convertedToClientId: clientResult.data.id,
            convertedToOpportunityId: opportunityResult.data.id,
            updatedAt: Timestamp.now()
        });

        if (!updateResult.success) {
            console.warn('⚠️ Lead convertida mas não foi possível atualizar status:', updateResult.error);
        } else {
            console.log('✅ Lead marcada como convertida');
        }

        // ===== RETORNAR RESULTADO =====
        return {
            success: true,
            data: {
                clientId: clientResult.data.id,
                client: clientResult.data,
                opportunityId: opportunityResult.data.id,
                opportunity: opportunityResult.data,
                leadId: leadData.id
            },
            message: 'Lead convertida com sucesso em Cliente e Oportunidade'
        };

    } catch (error) {
        console.error('❌ Erro na conversão:', error);
        return {
            success: false,
            error: error.message || 'Erro ao converter lead'
        };
    }
};

/**
 * Construir dados do cliente a partir da Lead
 */
function buildClientFromLead(leadData) {
    const prospect = leadData.prospect || {};
    const source = leadData.source || {};
    const qualification = leadData.qualification || {};

    // Determinar tags baseadas no tipo de qualificação
    const tags = [];
    switch (qualification.type) {
        case 'buyer':
        case 'comprador':
            tags.push('Comprador');
            if (qualification.buyer?.urgency === 'urgente' || qualification.buyer?.urgency === 'alta') {
                tags.push('Urgente');
            }
            break;
        case 'seller':
        case 'vendedor':
            tags.push('Vendedor');
            if (qualification.seller?.urgency === 'urgente') {
                tags.push('Urgente');
            }
            break;
        case 'investor':
        case 'investidor':
            tags.push('Investidor');
            if (qualification.investor?.budget > 500000) {
                tags.push('VIP');
            }
            break;
        case 'landlord':
        case 'senhorio':
            tags.push('Senhorio');
            break;
        case 'tenant':
        case 'inquilino':
            tags.push('Inquilino');
            break;
    }

    // Adicionar tag da fonte se relevante
    if (source.origin === 'website') tags.push('Online');
    if (source.origin === 'recomendacao') tags.push('Recomendação');

    return {
        // ===== DADOS BÁSICOS (OBRIGATÓRIOS) =====
        nome: prospect.name || 'Cliente sem nome',
        telefone: prospect.phone || '',
        email: prospect.email || '',

        // ===== DADOS ADICIONAIS =====
        // Fonte da lead
        leadSource: mapLeadSource(source.origin),
        leadSourceDetails: source.details || '',

        // ===== INFORMAÇÕES FINANCEIRAS (se disponível) =====
        financialInfo: extractFinancialInfo(qualification),

        // ===== DOCUMENTAÇÃO E TAGS =====
        tags: tags,

        // ===== OBSERVAÇÕES =====
        observacoes: buildClientNotes(leadData),

        // ===== METADADOS =====
        status: 'ativo',
        createdFrom: 'lead_conversion',
        originalLeadId: leadData.id || null,

        // ===== GDPR =====
        consentimentos: {
            dadosPessoais: true, // Assumir consentimento da lead
            comunicacoesMarketing: false // Ser conservador
        },

        // Data do próximo contacto (se definido na lead)
        dataProximoContacto: leadData.nextContact?.date || null
    };
}

/**
 * Mapear fonte da lead para fonte do cliente
 */
function mapLeadSource(leadSource) {
    const sourceMap = {
        'website': 'Website',
        'escala': 'Portal Imobiliário',
        'recomendacao': 'Recomendação',
        'prospeccao': 'Prospecção',
        'redesSociais': 'Facebook',
        'coldCall': 'Cold Call',
        'facebook': 'Facebook',
        'instagram': 'Instagram',
        'google': 'Google'
    };

    return sourceMap[leadSource] || 'Outro';
}

/**
 * Extrair informações financeiras da qualificação
 */
function extractFinancialInfo(qualification) {
    const financialInfo = {};

    switch (qualification.type) {
        case 'buyer':
        case 'comprador':
            if (qualification.buyer?.budget) {
                financialInfo.capitalDisponivel = qualification.buyer.budget;
            }
            break;

        case 'investor':
        case 'investidor':
            if (qualification.investor?.budget) {
                financialInfo.capitalDisponivel = qualification.investor.budget;
            }
            break;

        case 'tenant':
        case 'inquilino':
            if (qualification.tenant?.budget) {
                financialInfo.rendimentoMensal = qualification.tenant.budget;
            }
            break;
    }

    return financialInfo;
}

/**
 * Construir notas do cliente com histórico da lead
 */
function buildClientNotes(leadData) {
    const parts = [];

    // Cabeçalho
    parts.push(`=== CLIENTE CRIADO A PARTIR DE LEAD ===`);
    parts.push(`Data conversão: ${new Date().toLocaleDateString('pt-PT')}`);
    parts.push(`Lead ID: ${leadData.id || 'N/A'}`);

    // Fonte
    if (leadData.source) {
        parts.push(`\nFONTE:`);
        parts.push(`- Origem: ${leadData.source.origin || 'N/A'}`);
        if (leadData.source.details) {
            parts.push(`- Detalhes: ${leadData.source.details}`);
        }
    }

    // Qualificação
    if (leadData.qualification) {
        parts.push(`\nQUALIFICAÇÃO INICIAL:`);
        parts.push(`- Tipo: ${leadData.qualification.type}`);

        // Detalhes específicos do tipo
        const qual = leadData.qualification;
        switch (qual.type) {
            case 'buyer':
            case 'comprador':
                if (qual.buyer?.looking) parts.push(`- Procura: ${qual.buyer.looking}`);
                if (qual.buyer?.budget) parts.push(`- Orçamento: €${qual.buyer.budget}`);
                if (qual.buyer?.preferredLocation) parts.push(`- Localização: ${qual.buyer.preferredLocation}`);
                if (qual.buyer?.urgency) parts.push(`- Urgência: ${qual.buyer.urgency}`);
                break;

            case 'seller':
            case 'vendedor':
                if (qual.seller?.propertyType) parts.push(`- Tipo imóvel: ${qual.seller.propertyType}`);
                if (qual.seller?.value) parts.push(`- Valor pretendido: €${qual.seller.value}`);
                if (qual.seller?.location) parts.push(`- Localização: ${qual.seller.location}`);
                break;

            case 'investor':
            case 'investidor':
                if (qual.investor?.investmentType) parts.push(`- Estratégia: ${qual.investor.investmentType}`);
                if (qual.investor?.budget) parts.push(`- Capital: €${qual.investor.budget}`);
                if (qual.investor?.expectedReturn) parts.push(`- Retorno esperado: ${qual.investor.expectedReturn}%`);
                break;
        }
    }

    // Notas gerais da lead
    if (leadData.generalNotes) {
        parts.push(`\nNOTAS DA LEAD:`);
        parts.push(leadData.generalNotes);
    }

    // Follow-ups agendados
    if (leadData.followUps && leadData.followUps.length > 0) {
        parts.push(`\nHISTÓRICO DE FOLLOW-UPS:`);
        leadData.followUps.forEach(fu => {
            const date = fu.date?.toDate ? fu.date.toDate() : new Date(fu.date);
            parts.push(`- ${date.toLocaleDateString('pt-PT')}: ${fu.type} - ${fu.notes || 'Sem notas'}`);
        });
    }

    return parts.join('\n');
}

/**
 * Validar se uma lead pode ser convertida
 */
export const validateLeadForConversion = (leadData) => {
    const errors = [];

    // Verificar dados obrigatórios
    if (!leadData.prospect?.name) {
        errors.push('Nome do prospect é obrigatório');
    }

    if (!leadData.prospect?.phone) {
        errors.push('Telefone do prospect é obrigatório');
    }

    if (!leadData.qualification?.type) {
        errors.push('Tipo de qualificação é obrigatório');
    }

    // Verificar se já foi convertida
    if (leadData.status === 'convertida') {
        errors.push('Esta lead já foi convertida');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};