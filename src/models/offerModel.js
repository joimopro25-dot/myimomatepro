/**
 * OFFER MODEL - MyImoMatePro
 * Schema para gestão de propostas/ofertas
 * 
 * Caminho: src/models/offerModel.js
 */

import { Timestamp } from 'firebase/firestore';

// ===== ESTADOS DE PROPOSTA =====
export const OFFER_STATES = {
    DRAFT: 'rascunho',
    SUBMITTED: 'submetida',
    UNDER_REVIEW: 'em_analise',
    COUNTER_OFFER: 'contraproposta',
    ACCEPTED: 'aceite',
    REJECTED: 'recusada',
    EXPIRED: 'expirada',
    WITHDRAWN: 'retirada',
    CPCV_PENDING: 'cpcv_pendente',
    CPCV_SIGNED: 'cpcv_assinado'
};

export const OFFER_STATE_LABELS = {
    [OFFER_STATES.DRAFT]: 'Rascunho',
    [OFFER_STATES.SUBMITTED]: 'Submetida',
    [OFFER_STATES.UNDER_REVIEW]: 'Em Análise',
    [OFFER_STATES.COUNTER_OFFER]: 'Contraproposta',
    [OFFER_STATES.ACCEPTED]: 'Aceite',
    [OFFER_STATES.REJECTED]: 'Recusada',
    [OFFER_STATES.EXPIRED]: 'Expirada',
    [OFFER_STATES.WITHDRAWN]: 'Retirada',
    [OFFER_STATES.CPCV_PENDING]: 'CPCV Pendente',
    [OFFER_STATES.CPCV_SIGNED]: 'CPCV Assinado'
};

// ===== TIPOS DE PROPOSTA =====
export const OFFER_TYPES = {
    PURCHASE: 'compra',
    SALE: 'venda',
    RENT: 'arrendamento',
    RENT_TO_OWN: 'arrendamento_com_opcao'
};

export const OFFER_TYPE_LABELS = {
    [OFFER_TYPES.PURCHASE]: 'Proposta de Compra',
    [OFFER_TYPES.SALE]: 'Proposta de Venda',
    [OFFER_TYPES.RENT]: 'Proposta de Arrendamento',
    [OFFER_TYPES.RENT_TO_OWN]: 'Arrendamento com Opção de Compra'
};

// ===== CONDIÇÕES DE PAGAMENTO =====
export const PAYMENT_CONDITIONS = {
    CASH: 'pronto_pagamento',
    BANK_LOAN: 'credito_bancario',
    MIXED: 'misto',
    INSTALLMENTS: 'prestacoes'
};

export const PAYMENT_CONDITION_LABELS = {
    [PAYMENT_CONDITIONS.CASH]: 'Pronto Pagamento',
    [PAYMENT_CONDITIONS.BANK_LOAN]: 'Crédito Bancário',
    [PAYMENT_CONDITIONS.MIXED]: 'Misto',
    [PAYMENT_CONDITIONS.INSTALLMENTS]: 'Prestações'
};

// ===== SCHEMA DA PROPOSTA =====
export const createOfferSchema = (offerData = {}) => {
    return {
        // Metadados
        id: null,
        opportunityId: offerData.opportunityId || null,
        propertyId: offerData.propertyId || null,
        clientId: offerData.clientId || null,
        consultorId: offerData.consultorId || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),

        // Informações da Proposta
        tipo: offerData.tipo || OFFER_TYPES.PURCHASE,
        estado: offerData.estado || OFFER_STATES.DRAFT,
        numeroProposta: offerData.numeroProposta || generateProposalNumber(),
        dataSubmissao: offerData.dataSubmissao || null,
        dataValidade: offerData.dataValidade || null,
        dataResposta: offerData.dataResposta || null,

        // Valores
        valores: {
            valorProposto: offerData.valores?.valorProposto || 0,
            valorOriginal: offerData.valores?.valorOriginal || 0, // Valor pedido inicial
            percentagemDesconto: offerData.valores?.percentagemDesconto || 0,

            // Detalhamento
            sinal: offerData.valores?.sinal || 0,
            sinalPercentagem: offerData.valores?.sinalPercentagem || 10,
            reforcoSinal: offerData.valores?.reforcoSinal || 0,
            valorCPCV: offerData.valores?.valorCPCV || 0,
            valorEscritura: offerData.valores?.valorEscritura || 0,

            // Custos adicionais
            comissaoImobiliaria: offerData.valores?.comissaoImobiliaria || 0,
            impostosEstimados: offerData.valores?.impostosEstimados || 0,
            outrosCustos: offerData.valores?.outrosCustos || 0,
            valorTotalComCustos: offerData.valores?.valorTotalComCustos || 0
        },

        // Condições de Pagamento
        pagamento: {
            condicao: offerData.pagamento?.condicao || PAYMENT_CONDITIONS.BANK_LOAN,

            // Crédito Bancário
            creditoAprovado: offerData.pagamento?.creditoAprovado || false,
            bancoCredito: offerData.pagamento?.bancoCredito || '',
            valorCredito: offerData.pagamento?.valorCredito || 0,
            prazoCredito: offerData.pagamento?.prazoCredito || 30, // anos
            taxaJuro: offerData.pagamento?.taxaJuro || 0,
            preAprovacao: offerData.pagamento?.preAprovacao || false,
            dataPreAprovacao: offerData.pagamento?.dataPreAprovacao || null,

            // Entrada/Fundos Próprios
            fundosProprios: offerData.pagamento?.fundosProprios || 0,
            comprovativos: offerData.pagamento?.comprovativos || []
        },

        // Condições Especiais
        condicoes: {
            sujeitoVenda: offerData.condicoes?.sujeitoVenda || false, // Sujeito à venda de outro imóvel
            imovelVenda: offerData.condicoes?.imovelVenda || '',
            sujeitoCredito: offerData.condicoes?.sujeitoCredito || true,
            prazoCredito: offerData.condicoes?.prazoCredito || 60, // dias
            incluiMobilia: offerData.condicoes?.incluiMobilia || false,
            incluiEquipamentos: offerData.condicoes?.incluiEquipamentos || false,
            obrasNecessarias: offerData.condicoes?.obrasNecessarias || false,
            descricaoObras: offerData.condicoes?.descricaoObras || '',
            dataMudanca: offerData.condicoes?.dataMudanca || null,
            clausulasEspeciais: offerData.condicoes?.clausulasEspeciais || []
        },

        // Prazos
        prazos: {
            respostaAte: offerData.prazos?.respostaAte || null,
            assinaturaCPCV: offerData.prazos?.assinaturaCPCV || null,
            escritura: offerData.prazos?.escritura || null,
            entregaChaves: offerData.prazos?.entregaChaves || null
        },

        // Negociação (para contrapropostas)
        negociacao: {
            isContraproposta: offerData.negociacao?.isContraproposta || false,
            propostaOriginalId: offerData.negociacao?.propostaOriginalId || null,
            numeroRonda: offerData.negociacao?.numeroRonda || 1,
            historico: offerData.negociacao?.historico || [],

            // Pontos de negociação
            pontosNegociacao: offerData.negociacao?.pontosNegociacao || [],
            concessoes: offerData.negociacao?.concessoes || [],

            // Contraproposta
            contraproposta: {
                valor: offerData.negociacao?.contraproposta?.valor || 0,
                condicoes: offerData.negociacao?.contraproposta?.condicoes || '',
                justificacao: offerData.negociacao?.contraproposta?.justificacao || '',
                dataContraproposta: offerData.negociacao?.contraproposta?.dataContraproposta || null,
                resposta: offerData.negociacao?.contraproposta?.resposta || ''
            }
        },

        // Documentação
        documentacao: {
            propostaAssinada: offerData.documentacao?.propostaAssinada || false,
            comprovativos: offerData.documentacao?.comprovativos || [],
            preAprovacaoCredito: offerData.documentacao?.preAprovacaoCredito || false,
            declaracoesIRS: offerData.documentacao?.declaracoesIRS || false,
            recibosVencimento: offerData.documentacao?.recibosVencimento || false,
            extratosBancarios: offerData.documentacao?.extratosBancarios || false,
            outros: offerData.documentacao?.outros || []
        },

        // Intervenientes
        intervenientes: {
            comprador: {
                nome: offerData.intervenientes?.comprador?.nome || '',
                nif: offerData.intervenientes?.comprador?.nif || '',
                telefone: offerData.intervenientes?.comprador?.telefone || '',
                email: offerData.intervenientes?.comprador?.email || '',
                representanteLegal: offerData.intervenientes?.comprador?.representanteLegal || ''
            },
            vendedor: {
                nome: offerData.intervenientes?.vendedor?.nome || '',
                nif: offerData.intervenientes?.vendedor?.nif || '',
                telefone: offerData.intervenientes?.vendedor?.telefone || '',
                email: offerData.intervenientes?.vendedor?.email || '',
                representanteLegal: offerData.intervenientes?.vendedor?.representanteLegal || ''
            },
            mediacao: {
                agenciaCompradora: offerData.intervenientes?.mediacao?.agenciaCompradora || '',
                agenteComprador: offerData.intervenientes?.mediacao?.agenteComprador || '',
                agenciaVendedora: offerData.intervenientes?.mediacao?.agenciaVendedora || '',
                agenteVendedor: offerData.intervenientes?.mediacao?.agenteVendedor || '',
                partilhaComissao: offerData.intervenientes?.mediacao?.partilhaComissao || 50 // percentagem
            }
        },

        // Comissões
        comissoes: {
            percentagemTotal: offerData.comissoes?.percentagemTotal || 5,
            valorTotal: offerData.comissoes?.valorTotal || 0,

            // Partilha
            agenciaCompradora: offerData.comissoes?.agenciaCompradora || 0,
            agenciaVendedora: offerData.comissoes?.agenciaVendedora || 0,
            agenteComprador: offerData.comissoes?.agenteComprador || 0,
            agenteVendedor: offerData.comissoes?.agenteVendedor || 0,

            // Pagamento
            quandoPaga: offerData.comissoes?.quandoPaga || 'escritura', // cpcv, escritura
            condicoesPagamento: offerData.comissoes?.condicoesPagamento || ''
        },

        // Observações
        observacoes: offerData.observacoes || '',
        notasInternas: offerData.notasInternas || '',
        motivoRejeicao: offerData.motivoRejeicao || '',

        // Anexos
        anexos: offerData.anexos || [],

        // Controle
        isActive: true
    };
};

// ===== VALIDAÇÃO =====
export const validateOfferData = (data) => {
    const errors = {};

    if (!data.valores?.valorProposto || data.valores.valorProposto <= 0) {
        errors.valorProposto = 'Valor da proposta é obrigatório';
    }

    if (!data.dataValidade) {
        errors.dataValidade = 'Data de validade é obrigatória';
    }

    if (!data.intervenientes?.comprador?.nome) {
        errors.compradorNome = 'Nome do comprador é obrigatório';
    }

    if (!data.intervenientes?.vendedor?.nome) {
        errors.vendedorNome = 'Nome do vendedor é obrigatório';
    }

    // Validar percentagem de sinal
    if (data.valores?.sinalPercentagem < 0 || data.valores?.sinalPercentagem > 100) {
        errors.sinalPercentagem = 'Percentagem do sinal deve estar entre 0 e 100';
    }

    // Validar datas
    const hoje = new Date();
    if (data.dataValidade && new Date(data.dataValidade) < hoje) {
        errors.dataValidade = 'Data de validade não pode ser no passado';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== HELPERS =====

// Gerar número de proposta único
export function generateProposalNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `PROP-${year}${month}-${random}`;
}

// Calcular valores
export const calculateOfferValues = (valorProposto, percentagemSinal = 10, percentagemReforco = 0) => {
    const sinal = valorProposto * (percentagemSinal / 100);
    const reforco = valorProposto * (percentagemReforco / 100);
    const valorCPCV = sinal + reforco;
    const valorEscritura = valorProposto - valorCPCV;

    return {
        sinal,
        reforco,
        valorCPCV,
        valorEscritura
    };
};

// Calcular comissões
export const calculateCommissions = (valorVenda, percentagemComissao = 5, partilha = { comprador: 50, vendedor: 50 }) => {
    const valorTotal = valorVenda * (percentagemComissao / 100);
    const agenciaCompradora = valorTotal * (partilha.comprador / 100);
    const agenciaVendedora = valorTotal * (partilha.vendedor / 100);

    return {
        valorTotal,
        agenciaCompradora,
        agenciaVendedora
    };
};

// Verificar se proposta expirou
export const isOfferExpired = (dataValidade) => {
    if (!dataValidade) return false;
    const validade = dataValidade.toDate ? dataValidade.toDate() : new Date(dataValidade);
    return validade < new Date();
};

// Calcular dias até expiração
export const daysUntilExpiration = (dataValidade) => {
    if (!dataValidade) return null;
    const validade = dataValidade.toDate ? dataValidade.toDate() : new Date(dataValidade);
    const hoje = new Date();
    const diff = validade - hoje;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Formatar valor monetário
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

// Calcular percentagem de desconto
export const calculateDiscountPercentage = (valorOriginal, valorProposto) => {
    if (!valorOriginal || valorOriginal === 0) return 0;
    return ((valorOriginal - valorProposto) / valorOriginal * 100).toFixed(2);
};

// Gerar timeline de negociação
export const generateNegotiationTimeline = (offer) => {
    const timeline = [];

    if (offer.createdAt) {
        timeline.push({
            date: offer.createdAt,
            event: 'Proposta criada',
            value: offer.valores?.valorProposto
        });
    }

    if (offer.dataSubmissao) {
        timeline.push({
            date: offer.dataSubmissao,
            event: 'Proposta submetida',
            value: offer.valores?.valorProposto
        });
    }

    if (offer.negociacao?.historico) {
        offer.negociacao.historico.forEach(item => {
            timeline.push(item);
        });
    }

    if (offer.dataResposta) {
        timeline.push({
            date: offer.dataResposta,
            event: `Proposta ${offer.estado}`,
            value: offer.valores?.valorProposto
        });
    }

    return timeline.sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateA - dateB;
    });
};

// Verificar documentação completa
export const isDocumentationComplete = (documentacao) => {
    const requiredDocs = [
        'propostaAssinada',
        'preAprovacaoCredito',
        'declaracoesIRS',
        'recibosVencimento'
    ];

    return requiredDocs.every(doc => documentacao[doc] === true);
};

// Exportar estatísticas de propostas
export const getOfferStatistics = (offers) => {
    const stats = {
        total: offers.length,
        draft: offers.filter(o => o.estado === OFFER_STATES.DRAFT).length,
        submitted: offers.filter(o => o.estado === OFFER_STATES.SUBMITTED).length,
        accepted: offers.filter(o => o.estado === OFFER_STATES.ACCEPTED).length,
        rejected: offers.filter(o => o.estado === OFFER_STATES.REJECTED).length,
        inNegotiation: offers.filter(o => o.estado === OFFER_STATES.COUNTER_OFFER).length,

        // Valores
        averageValue: 0,
        totalValue: 0,
        highestOffer: 0,
        lowestOffer: Infinity,

        // Taxa de sucesso
        successRate: 0
    };

    // Calcular valores
    const activeOffers = offers.filter(o => o.estado !== OFFER_STATES.DRAFT);

    if (activeOffers.length > 0) {
        activeOffers.forEach(offer => {
            const value = offer.valores?.valorProposto || 0;
            stats.totalValue += value;
            stats.highestOffer = Math.max(stats.highestOffer, value);
            stats.lowestOffer = Math.min(stats.lowestOffer, value);
        });

        stats.averageValue = stats.totalValue / activeOffers.length;

        // Taxa de sucesso
        const completed = offers.filter(o =>
            o.estado === OFFER_STATES.ACCEPTED ||
            o.estado === OFFER_STATES.REJECTED
        );

        if (completed.length > 0) {
            stats.successRate = Math.round((stats.accepted / completed.length) * 100);
        }
    }

    if (stats.lowestOffer === Infinity) {
        stats.lowestOffer = 0;
    }

    return stats;
};