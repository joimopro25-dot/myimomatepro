/**
 * OFFER MODEL - MyImoMatePro
 * Schema para Gestão de Ofertas e Propostas
 * 
 * Caminho: src/models/offerModel.js
 */

import { Timestamp } from 'firebase/firestore';

// ===== ENUMS E CONSTANTES =====

export const OFFER_STATUS = {
    DRAFT: 'rascunho',
    SUBMITTED: 'submetida',
    IN_NEGOTIATION: 'em_negociacao',
    ACCEPTED: 'aceite',
    REJECTED: 'rejeitada',
    COUNTERED: 'contraproposta',
    EXPIRED: 'expirada',
    WITHDRAWN: 'retirada'
};

export const OFFER_TYPES = {
    PURCHASE: 'compra',
    RENT: 'arrendamento',
    CPCV: 'cpcv', // Contrato Promessa Compra e Venda
    RESERVATION: 'reserva'
};

export const PAYMENT_METHODS = {
    BANK_TRANSFER: 'transferencia',
    BANK_LOAN: 'credito_habitacao',
    CASH: 'dinheiro',
    CHECK: 'cheque',
    MIXED: 'misto'
};

export const NEGOTIATION_POINTS = {
    PRICE: 'preco',
    PAYMENT_TERMS: 'condicoes_pagamento',
    CLOSING_DATE: 'data_escritura',
    INCLUSIONS: 'incluidos',
    REPAIRS: 'reparacoes',
    DEPOSIT: 'sinal',
    COMMISSION: 'comissao'
};

// ===== LABELS =====

export const OFFER_STATUS_LABELS = {
    [OFFER_STATUS.DRAFT]: 'Rascunho',
    [OFFER_STATUS.SUBMITTED]: 'Submetida',
    [OFFER_STATUS.IN_NEGOTIATION]: 'Em Negociação',
    [OFFER_STATUS.ACCEPTED]: 'Aceite',
    [OFFER_STATUS.REJECTED]: 'Rejeitada',
    [OFFER_STATUS.COUNTERED]: 'Contraproposta',
    [OFFER_STATUS.EXPIRED]: 'Expirada',
    [OFFER_STATUS.WITHDRAWN]: 'Retirada'
};

export const PAYMENT_METHOD_LABELS = {
    [PAYMENT_METHODS.BANK_TRANSFER]: 'Transferência Bancária',
    [PAYMENT_METHODS.BANK_LOAN]: 'Crédito Habitação',
    [PAYMENT_METHODS.CASH]: 'Dinheiro',
    [PAYMENT_METHODS.CHECK]: 'Cheque',
    [PAYMENT_METHODS.MIXED]: 'Misto'
};

// ===== SCHEMA DA OFERTA =====

export const createOfferSchema = (offerData) => {
    return {
        // Metadados
        id: null,
        opportunityId: offerData.opportunityId || null,
        clienteId: offerData.clienteId || null,
        consultorId: offerData.consultorId || null,
        propertyId: offerData.propertyId || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),

        // Informações da Oferta
        tipo: offerData.tipo || OFFER_TYPES.PURCHASE,
        status: offerData.status || OFFER_STATUS.DRAFT,
        numeroOferta: offerData.numeroOferta || generateOfferNumber(),

        // Valores
        valores: {
            valorProposto: offerData.valores?.valorProposto || 0,
            valorBase: offerData.valores?.valorBase || 0, // Preço pedido
            percentagemDesconto: offerData.valores?.percentagemDesconto || 0,

            // Sinal e Entrada
            sinal: offerData.valores?.sinal || 0,
            percentagemSinal: offerData.valores?.percentagemSinal || 10,
            dataPagamentoSinal: offerData.valores?.dataPagamentoSinal || null,

            // CPCV
            valorCPCV: offerData.valores?.valorCPCV || 0,
            percentagemCPCV: offerData.valores?.percentagemCPCV || 30,
            dataCPCV: offerData.valores?.dataCPCV || null,

            // Restante
            valorRestante: offerData.valores?.valorRestante || 0,
            dataEscritura: offerData.valores?.dataEscritura || null
        },

        // Condições de Pagamento
        condicoesPagamento: {
            metodoPagamento: offerData.condicoesPagamento?.metodoPagamento || PAYMENT_METHODS.BANK_LOAN,

            // Se for crédito
            creditoHabitacao: {
                necessita: offerData.condicoesPagamento?.creditoHabitacao?.necessita || false,
                banco: offerData.condicoesPagamento?.creditoHabitacao?.banco || '',
                valorCredito: offerData.condicoesPagamento?.creditoHabitacao?.valorCredito || 0,
                preAprovado: offerData.condicoesPagamento?.creditoHabitacao?.preAprovado || false,
                dataAprovacao: offerData.condicoesPagamento?.creditoHabitacao?.dataAprovacao || null,
                condicoesAprovacao: offerData.condicoesPagamento?.creditoHabitacao?.condicoesAprovacao || ''
            },

            // Outras condições
            entradaFundosProprios: offerData.condicoesPagamento?.entradaFundosProprios || 0,
            comprovativos: offerData.condicoesPagamento?.comprovativos || [],
            observacoes: offerData.condicoesPagamento?.observacoes || ''
        },

        // Condições Especiais
        condicoesEspeciais: {
            dependeVenda: offerData.condicoesEspeciais?.dependeVenda || false,
            imovelParaVender: offerData.condicoesEspeciais?.imovelParaVender || '',

            incluidos: offerData.condicoesEspeciais?.incluidos || [], // Móveis, eletrodomésticos, etc
            excluidos: offerData.condicoesEspeciais?.excluidos || [],

            reparacoes: offerData.condicoesEspeciais?.reparacoes || [],
            inspecoes: offerData.condicoesEspeciais?.inspecoes || [],

            clausulasAdicionais: offerData.condicoesEspeciais?.clausulasAdicionais || [],
            observacoes: offerData.condicoesEspeciais?.observacoes || ''
        },

        // Prazos
        prazos: {
            validadeOferta: offerData.prazos?.validadeOferta || 7, // dias
            dataExpiracao: offerData.prazos?.dataExpiracao || null,
            prazoResposta: offerData.prazos?.prazoResposta || 48, // horas
            dataLimiteResposta: offerData.prazos?.dataLimiteResposta || null,

            prazoCPCV: offerData.prazos?.prazoCPCV || 30, // dias após aceitação
            prazoEscritura: offerData.prazos?.prazoEscritura || 60, // dias após CPCV
            prazoEntregaChaves: offerData.prazos?.prazoEntregaChaves || 'na_escritura'
        },

        // Negociação
        negociacao: {
            pontosPrincipais: offerData.negociacao?.pontosPrincipais || [],
            margemNegociacao: {
                minimo: offerData.negociacao?.margemNegociacao?.minimo || 0,
                maximo: offerData.negociacao?.margemNegociacao?.maximo || 0,
                ideal: offerData.negociacao?.margemNegociacao?.ideal || 0
            },

            historico: offerData.negociacao?.historico || [], // Array de eventos de negociação

            contraproposta: {
                recebida: offerData.negociacao?.contraproposta?.recebida || false,
                valor: offerData.negociacao?.contraproposta?.valor || 0,
                condicoes: offerData.negociacao?.contraproposta?.condicoes || '',
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

            distribuicao: {
                agenciaCompradora: offerData.comissoes?.distribuicao?.agenciaCompradora || 50,
                agenciaVendedora: offerData.comissoes?.distribuicao?.agenciaVendedora || 50,
                agenteComprador: offerData.comissoes?.distribuicao?.agenteComprador || 0,
                agenteVendedor: offerData.comissoes?.distribuicao?.agenteVendedor || 0
            },

            pagamento: {
                naCPCV: offerData.comissoes?.pagamento?.naCPCV || false,
                naEscritura: offerData.comissoes?.pagamento?.naEscritura || true,
                valorCPCV: offerData.comissoes?.pagamento?.valorCPCV || 0,
                valorEscritura: offerData.comissoes?.pagamento?.valorEscritura || 0
            }
        },

        // Histórico
        historico: offerData.historico || [],

        // Notas
        notas: offerData.notas || '',
        notasInternas: offerData.notasInternas || '' // Não visível para o cliente
    };
};

// ===== VALIDAÇÃO =====

export const validateOfferData = (data) => {
    const errors = {};

    // Validações obrigatórias
    if (!data.valores?.valorProposto || data.valores.valorProposto <= 0) {
        errors.valorProposto = 'Valor da proposta é obrigatório e deve ser maior que zero';
    }

    if (!data.tipo) {
        errors.tipo = 'Tipo de oferta é obrigatório';
    }

    // Validar percentagens
    if (data.valores?.percentagemSinal && (data.valores.percentagemSinal < 0 || data.valores.percentagemSinal > 100)) {
        errors.percentagemSinal = 'Percentagem do sinal deve estar entre 0 e 100';
    }

    // Validar datas
    if (data.prazos?.dataExpiracao) {
        const expDate = new Date(data.prazos.dataExpiracao);
        if (expDate < new Date()) {
            errors.dataExpiracao = 'Data de expiração não pode ser no passado';
        }
    }

    // Validar intervenientes
    if (!data.intervenientes?.comprador?.nome) {
        errors.compradorNome = 'Nome do comprador é obrigatório';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== HELPERS =====

export const generateOfferNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000);
    return `OF-${year}${month}-${String(random).padStart(4, '0')}`;
};

export const calculateOfferPercentage = (offerValue, askingPrice) => {
    if (!askingPrice || askingPrice === 0) return 0;
    return ((offerValue / askingPrice) * 100).toFixed(2);
};

export const calculateCommission = (salePrice, percentage) => {
    return (salePrice * percentage / 100).toFixed(2);
};

export const getOfferStatusColor = (status) => {
    const colors = {
        [OFFER_STATUS.DRAFT]: 'gray',
        [OFFER_STATUS.SUBMITTED]: 'blue',
        [OFFER_STATUS.IN_NEGOTIATION]: 'yellow',
        [OFFER_STATUS.ACCEPTED]: 'green',
        [OFFER_STATUS.REJECTED]: 'red',
        [OFFER_STATUS.COUNTERED]: 'orange',
        [OFFER_STATUS.EXPIRED]: 'gray',
        [OFFER_STATUS.WITHDRAWN]: 'gray'
    };
    return colors[status] || 'gray';
};

// ===== TEMPLATES DE NEGOCIAÇÃO =====

export const NEGOTIATION_TEMPLATES = {
    condicoes: [
        'Sujeito a aprovação de crédito',
        'Sujeito a venda de imóvel próprio',
        'Inclusão de móveis e equipamentos',
        'Reparação de defeitos identificados',
        'Prazo de escritura flexível',
        'Entrada em data a acordar',
        'Dispensa de fiador',
        'Pagamento faseado do sinal'
    ],

    clausulas: [
        'Cláusula de arrependimento',
        'Cláusula de não concorrência',
        'Direito de preferência',
        'Penalização por atraso',
        'Condição suspensiva',
        'Condição resolutiva'
    ],

    respostasRejeicao: [
        'Valor proposto abaixo das expectativas',
        'Condições de pagamento inadequadas',
        'Prazo de escritura muito longo',
        'Oferta melhor de outro interessado',
        'Vendedor decidiu não vender',
        'Documentação incompleta'
    ]
};