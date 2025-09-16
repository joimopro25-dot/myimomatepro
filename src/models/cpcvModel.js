/**
 * CPCV MODEL - MyImoMatePro
 * Schema para gestão de Contratos Promessa Compra e Venda
 * 
 * Caminho: src/models/cpcvModel.js
 */

import { Timestamp } from 'firebase/firestore';

// ===== ESTADOS DO CPCV =====
export const CPCV_STATES = {
    DRAFT: 'rascunho',
    PENDING_REVIEW: 'revisao_pendente',
    PENDING_SIGNATURES: 'assinaturas_pendentes',
    SIGNED: 'assinado',
    DEPOSIT_PENDING: 'sinal_pendente',
    DEPOSIT_RECEIVED: 'sinal_recebido',
    IN_PROGRESS: 'em_progresso',
    DEED_SCHEDULED: 'escritura_agendada',
    COMPLETED: 'concluido',
    CANCELLED: 'cancelado',
    LITIGATION: 'litigio'
};

export const CPCV_STATE_LABELS = {
    [CPCV_STATES.DRAFT]: 'Rascunho',
    [CPCV_STATES.PENDING_REVIEW]: 'Revisão Pendente',
    [CPCV_STATES.PENDING_SIGNATURES]: 'Assinaturas Pendentes',
    [CPCV_STATES.SIGNED]: 'Assinado',
    [CPCV_STATES.DEPOSIT_PENDING]: 'Sinal Pendente',
    [CPCV_STATES.DEPOSIT_RECEIVED]: 'Sinal Recebido',
    [CPCV_STATES.IN_PROGRESS]: 'Em Progresso',
    [CPCV_STATES.DEED_SCHEDULED]: 'Escritura Agendada',
    [CPCV_STATES.COMPLETED]: 'Concluído',
    [CPCV_STATES.CANCELLED]: 'Cancelado',
    [CPCV_STATES.LITIGATION]: 'Litígio'
};

// ===== TIPOS DE FINANCIAMENTO =====
export const FINANCING_TYPES = {
    NONE: 'sem_financiamento',
    BANK_LOAN: 'credito_bancario',
    PRIVATE_LOAN: 'credito_privado',
    LEASE: 'leasing',
    MIXED: 'misto'
};

export const FINANCING_TYPE_LABELS = {
    [FINANCING_TYPES.NONE]: 'Sem Financiamento',
    [FINANCING_TYPES.BANK_LOAN]: 'Crédito Bancário',
    [FINANCING_TYPES.PRIVATE_LOAN]: 'Crédito Privado',
    [FINANCING_TYPES.LEASE]: 'Leasing',
    [FINANCING_TYPES.MIXED]: 'Misto'
};

// ===== SCHEMA DO CPCV =====
export const createCPCVSchema = (cpcvData = {}) => {
    return {
        // Metadados
        id: null,
        offerId: cpcvData.offerId || null, // ID da proposta aceite
        opportunityId: cpcvData.opportunityId || null,
        propertyId: cpcvData.propertyId || null,
        clientId: cpcvData.clientId || null,
        consultorId: cpcvData.consultorId || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),

        // Informações do Contrato
        numeroContrato: cpcvData.numeroContrato || generateContractNumber(),
        estado: cpcvData.estado || CPCV_STATES.DRAFT,
        dataAssinatura: cpcvData.dataAssinatura || null,
        localAssinatura: cpcvData.localAssinatura || '',

        // Partes Envolvidas
        partes: {
            // Comprador(es)
            compradores: cpcvData.partes?.compradores || [{
                nome: '',
                nif: '',
                bi_cc: '',
                estadoCivil: '',
                morada: '',
                telefone: '',
                email: '',
                representanteLegal: '',
                percentagemPropriedade: 100
            }],

            // Vendedor(es)
            vendedores: cpcvData.partes?.vendedores || [{
                nome: '',
                nif: '',
                bi_cc: '',
                estadoCivil: '',
                morada: '',
                telefone: '',
                email: '',
                representanteLegal: '',
                percentagemPropriedade: 100
            }],

            // Mediação
            mediacao: {
                agenciaCompradora: cpcvData.partes?.mediacao?.agenciaCompradora || '',
                licencaAMI_Compradora: cpcvData.partes?.mediacao?.licencaAMI_Compradora || '',
                agenteComprador: cpcvData.partes?.mediacao?.agenteComprador || '',

                agenciaVendedora: cpcvData.partes?.mediacao?.agenciaVendedora || '',
                licencaAMI_Vendedora: cpcvData.partes?.mediacao?.licencaAMI_Vendedora || '',
                agenteVendedor: cpcvData.partes?.mediacao?.agenteVendedor || ''
            }
        },

        // Dados do Imóvel
        imovel: {
            descricao: cpcvData.imovel?.descricao || '',
            tipologia: cpcvData.imovel?.tipologia || '',
            morada: cpcvData.imovel?.morada || '',
            freguesia: cpcvData.imovel?.freguesia || '',
            concelho: cpcvData.imovel?.concelho || '',
            distrito: cpcvData.imovel?.distrito || '',
            codigoPostal: cpcvData.imovel?.codigoPostal || '',

            // Dados registrais
            numeroMatricula: cpcvData.imovel?.numeroMatricula || '',
            conservatoria: cpcvData.imovel?.conservatoria || '',
            numeroFiscal: cpcvData.imovel?.numeroFiscal || '',

            // Características
            area: cpcvData.imovel?.area || 0,
            anoConstrucao: cpcvData.imovel?.anoConstrucao || '',
            licencaHabitacao: cpcvData.imovel?.licencaHabitacao || '',
            certificadoEnergetico: cpcvData.imovel?.certificadoEnergetico || '',

            // Situação
            livre: cpcvData.imovel?.livre || true,
            dataDesocupacao: cpcvData.imovel?.dataDesocupacao || null,
            onus: cpcvData.imovel?.onus || [],
            encargos: cpcvData.imovel?.encargos || []
        },

        // Valores e Pagamentos
        valores: {
            valorVenda: cpcvData.valores?.valorVenda || 0,

            // Sinal
            sinal: cpcvData.valores?.sinal || 0,
            sinalPercentagem: cpcvData.valores?.sinalPercentagem || 10,
            dataPagamentoSinal: cpcvData.valores?.dataPagamentoSinal || null,
            sinalPago: cpcvData.valores?.sinalPago || false,
            comprovativoSinal: cpcvData.valores?.comprovativoSinal || '',

            // Reforço de Sinal
            reforcoSinal: cpcvData.valores?.reforcoSinal || 0,
            dataReforcoSinal: cpcvData.valores?.dataReforcoSinal || null,
            reforcoSinalPago: cpcvData.valores?.reforcoSinalPago || false,

            // Valor na Escritura
            valorEscritura: cpcvData.valores?.valorEscritura || 0,

            // Comissões
            comissaoImobiliaria: cpcvData.valores?.comissaoImobiliaria || 0,
            comissaoPercentagem: cpcvData.valores?.comissaoPercentagem || 5,
            quemPagaComissao: cpcvData.valores?.quemPagaComissao || 'vendedor' // vendedor, comprador, ambos
        },

        // Financiamento
        financiamento: {
            tipo: cpcvData.financiamento?.tipo || FINANCING_TYPES.BANK_LOAN,
            necessitaCredito: cpcvData.financiamento?.necessitaCredito || false,

            // Crédito Bancário
            banco: cpcvData.financiamento?.banco || '',
            valorCredito: cpcvData.financiamento?.valorCredito || 0,
            prazoCredito: cpcvData.financiamento?.prazoCredito || 30, // anos
            taxaJuro: cpcvData.financiamento?.taxaJuro || 0,

            // Estado do Crédito
            creditoAprovado: cpcvData.financiamento?.creditoAprovado || false,
            dataAprovacao: cpcvData.financiamento?.dataAprovacao || null,
            numeroProcesso: cpcvData.financiamento?.numeroProcesso || '',
            gestorCredito: cpcvData.financiamento?.gestorCredito || '',

            // DIP - Documento de Instrução de Processo
            dipEmitido: cpcvData.financiamento?.dipEmitido || false,
            dataDIP: cpcvData.financiamento?.dataDIP || null,
            numeroDIP: cpcvData.financiamento?.numeroDIP || '',

            // Condições
            condicoesCredito: cpcvData.financiamento?.condicoesCredito || [],
            avaliacaoBancaria: cpcvData.financiamento?.avaliacaoBancaria || 0,
            dataAvaliacao: cpcvData.financiamento?.dataAvaliacao || null
        },

        // Prazos e Datas Importantes
        prazos: {
            dataEscritura: cpcvData.prazos?.dataEscritura || null,
            horaEscritura: cpcvData.prazos?.horaEscritura || '',
            localEscritura: cpcvData.prazos?.localEscritura || '',
            notario: cpcvData.prazos?.notario || '',

            // Prazos condicionais
            prazoAprovacaoCredito: cpcvData.prazos?.prazoAprovacaoCredito || 60, // dias
            prazoVendaImovel: cpcvData.prazos?.prazoVendaImovel || 90, // dias (se sujeito a venda)

            // Entrega
            dataEntregaChaves: cpcvData.prazos?.dataEntregaChaves || null,
            dataEntregaDocumentos: cpcvData.prazos?.dataEntregaDocumentos || null
        },

        // Cláusulas e Condições
        clausulas: {
            // Cláusulas padrão
            clausulaPenal: cpcvData.clausulas?.clausulaPenal || true,
            valorClausulaPenal: cpcvData.clausulas?.valorClausulaPenal || 0, // geralmente o dobro do sinal

            // Condições suspensivas
            sujeitoCredito: cpcvData.clausulas?.sujeitoCredito || true,
            sujeitoVenda: cpcvData.clausulas?.sujeitoVenda || false,
            imovelParaVenda: cpcvData.clausulas?.imovelParaVenda || '',

            // Outras condições
            incluiMobilia: cpcvData.clausulas?.incluiMobilia || false,
            listaMobilia: cpcvData.clausulas?.listaMobilia || [],
            incluiEquipamentos: cpcvData.clausulas?.incluiEquipamentos || false,
            listaEquipamentos: cpcvData.clausulas?.listaEquipamentos || [],

            // Obras e reparações
            obrasResponsabilidadeVendedor: cpcvData.clausulas?.obrasResponsabilidadeVendedor || [],
            obrasResponsabilidadeComprador: cpcvData.clausulas?.obrasResponsabilidadeComprador || [],

            // Cláusulas especiais
            clausulasEspeciais: cpcvData.clausulas?.clausulasEspeciais || []
        },

        // Documentação
        documentacao: {
            // Documentos do imóvel
            caderneta: cpcvData.documentacao?.caderneta || false,
            certidaoPermanente: cpcvData.documentacao?.certidaoPermanente || false,
            licencaUtilizacao: cpcvData.documentacao?.licencaUtilizacao || false,
            certificadoEnergetico: cpcvData.documentacao?.certificadoEnergetico || false,
            fichaTecnicaHabitacao: cpcvData.documentacao?.fichaTecnicaHabitacao || false,

            // Documentos das partes
            documentosCompradores: cpcvData.documentacao?.documentosCompradores || false,
            documentosVendedores: cpcvData.documentacao?.documentosVendedores || false,

            // Documentos financeiros
            comprovativos: cpcvData.documentacao?.comprovativos || [],
            simulacaoCredito: cpcvData.documentacao?.simulacaoCredito || false,

            // CPCV
            minutaCPCV: cpcvData.documentacao?.minutaCPCV || '',
            cpcvAssinado: cpcvData.documentacao?.cpcvAssinado || '',

            // Lista de documentos
            listaDocumentos: cpcvData.documentacao?.listaDocumentos || []
        },

        // Checklist de Tarefas
        checklist: {
            // Pré-CPCV
            propostaAceite: cpcvData.checklist?.propostaAceite || false,
            documentacaoCompleta: cpcvData.checklist?.documentacaoCompleta || false,
            minutaRevisada: cpcvData.checklist?.minutaRevisada || false,

            // CPCV
            contratoAssinado: cpcvData.checklist?.contratoAssinado || false,
            sinalRecebido: cpcvData.checklist?.sinalRecebido || false,
            copiasEntregues: cpcvData.checklist?.copiasEntregues || false,

            // Pós-CPCV
            creditoAprovado: cpcvData.checklist?.creditoAprovado || false,
            dipEmitido: cpcvData.checklist?.dipEmitido || false,
            escrituraAgendada: cpcvData.checklist?.escrituraAgendada || false,
            documentosEscritura: cpcvData.checklist?.documentosEscritura || false,

            // Customizadas
            tarefasCustomizadas: cpcvData.checklist?.tarefasCustomizadas || []
        },

        // Histórico e Timeline
        historico: cpcvData.historico || [],

        // Observações
        observacoes: cpcvData.observacoes || '',
        notasInternas: cpcvData.notasInternas || '',

        // Anexos
        anexos: cpcvData.anexos || [],

        // Controle
        isActive: true
    };
};

// ===== VALIDAÇÃO =====
export const validateCPCVData = (data) => {
    const errors = {};

    // Validar partes
    if (!data.partes?.compradores?.length || !data.partes.compradores[0]?.nome) {
        errors.comprador = 'Dados do comprador são obrigatórios';
    }

    if (!data.partes?.vendedores?.length || !data.partes.vendedores[0]?.nome) {
        errors.vendedor = 'Dados do vendedor são obrigatórios';
    }

    // Validar valores
    if (!data.valores?.valorVenda || data.valores.valorVenda <= 0) {
        errors.valorVenda = 'Valor de venda é obrigatório';
    }

    if (!data.valores?.sinal || data.valores.sinal <= 0) {
        errors.sinal = 'Valor do sinal é obrigatório';
    }

    if (data.valores?.sinal > data.valores?.valorVenda) {
        errors.sinal = 'Sinal não pode ser maior que o valor de venda';
    }

    // Validar imóvel
    if (!data.imovel?.morada) {
        errors.morada = 'Morada do imóvel é obrigatória';
    }

    if (!data.imovel?.numeroMatricula) {
        errors.matricula = 'Número de matrícula é obrigatório';
    }

    // Validar datas
    if (!data.prazos?.dataEscritura) {
        errors.dataEscritura = 'Data prevista para escritura é obrigatória';
    }

    const hoje = new Date();
    if (data.prazos?.dataEscritura && new Date(data.prazos.dataEscritura) < hoje) {
        errors.dataEscritura = 'Data da escritura não pode ser no passado';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== HELPERS =====

// Gerar número de contrato único
export function generateContractNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `CPCV-${year}${month}-${random}`;
}

// Calcular valores do CPCV
export const calculateCPCVValues = (valorVenda, percentagemSinal = 10, percentagemReforco = 0) => {
    const sinal = valorVenda * (percentagemSinal / 100);
    const reforcoSinal = valorVenda * (percentagemReforco / 100);
    const totalPago = sinal + reforcoSinal;
    const valorEscritura = valorVenda - totalPago;
    const clausulaPenal = sinal * 2; // Normalmente o dobro do sinal

    return {
        sinal,
        reforcoSinal,
        totalPago,
        valorEscritura,
        clausulaPenal
    };
};

// Calcular comissão
export const calculateCommission = (valorVenda, percentagemComissao = 5) => {
    return valorVenda * (percentagemComissao / 100);
};

// Verificar completude do checklist
export const getChecklistProgress = (checklist) => {
    const items = [
        'propostaAceite',
        'documentacaoCompleta',
        'minutaRevisada',
        'contratoAssinado',
        'sinalRecebido',
        'copiasEntregues',
        'creditoAprovado',
        'dipEmitido',
        'escrituraAgendada',
        'documentosEscritura'
    ];

    const completed = items.filter(item => checklist[item] === true).length;
    const total = items.length + (checklist.tarefasCustomizadas?.length || 0);
    const completedCustom = checklist.tarefasCustomizadas?.filter(t => t.completed).length || 0;

    return {
        percentage: Math.round(((completed + completedCustom) / total) * 100),
        completed: completed + completedCustom,
        total
    };
};

// Verificar documentação
export const getDocumentationStatus = (documentacao) => {
    const requiredDocs = [
        'caderneta',
        'certidaoPermanente',
        'licencaUtilizacao',
        'certificadoEnergetico',
        'documentosCompradores',
        'documentosVendedores'
    ];

    const completed = requiredDocs.filter(doc => documentacao[doc] === true).length;

    return {
        percentage: Math.round((completed / requiredDocs.length) * 100),
        completed,
        total: requiredDocs.length,
        isComplete: completed === requiredDocs.length
    };
};

// Calcular dias até escritura
export const daysUntilDeed = (dataEscritura) => {
    if (!dataEscritura) return null;
    const escritura = dataEscritura.toDate ? dataEscritura.toDate() : new Date(dataEscritura);
    const hoje = new Date();
    const diff = escritura - hoje;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Gerar timeline do CPCV
export const generateCPCVTimeline = (cpcv) => {
    const timeline = [];

    // Eventos automáticos baseados em datas
    if (cpcv.createdAt) {
        timeline.push({
            date: cpcv.createdAt,
            event: 'CPCV criado',
            type: 'info'
        });
    }

    if (cpcv.dataAssinatura) {
        timeline.push({
            date: cpcv.dataAssinatura,
            event: 'CPCV assinado',
            type: 'success'
        });
    }

    if (cpcv.valores?.dataPagamentoSinal && cpcv.valores?.sinalPago) {
        timeline.push({
            date: cpcv.valores.dataPagamentoSinal,
            event: `Sinal recebido: €${cpcv.valores.sinal}`,
            type: 'payment'
        });
    }

    if (cpcv.financiamento?.dataAprovacao && cpcv.financiamento?.creditoAprovado) {
        timeline.push({
            date: cpcv.financiamento.dataAprovacao,
            event: 'Crédito aprovado',
            type: 'success'
        });
    }

    if (cpcv.financiamento?.dataDIP && cpcv.financiamento?.dipEmitido) {
        timeline.push({
            date: cpcv.financiamento.dataDIP,
            event: 'DIP emitido',
            type: 'document'
        });
    }

    if (cpcv.prazos?.dataEscritura) {
        timeline.push({
            date: cpcv.prazos.dataEscritura,
            event: 'Escritura agendada',
            type: 'scheduled',
            future: true
        });
    }

    // Adicionar histórico manual
    if (cpcv.historico) {
        timeline.push(...cpcv.historico);
    }

    // Ordenar por data
    return timeline.sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateA - dateB;
    });
};

// Verificar alertas e pendências
export const getCPCVAlerts = (cpcv) => {
    const alerts = [];
    const hoje = new Date();

    // Sinal não pago
    if (!cpcv.valores?.sinalPago && cpcv.estado === CPCV_STATES.SIGNED) {
        alerts.push({
            type: 'warning',
            message: 'Sinal ainda não foi recebido',
            priority: 'high'
        });
    }

    // Crédito não aprovado próximo da escritura
    const diasAteEscritura = daysUntilDeed(cpcv.prazos?.dataEscritura);
    if (!cpcv.financiamento?.creditoAprovado && diasAteEscritura && diasAteEscritura < 30) {
        alerts.push({
            type: 'danger',
            message: `Crédito não aprovado - ${diasAteEscritura} dias até escritura`,
            priority: 'critical'
        });
    }

    // DIP não emitido
    if (cpcv.financiamento?.creditoAprovado && !cpcv.financiamento?.dipEmitido && diasAteEscritura && diasAteEscritura < 15) {
        alerts.push({
            type: 'warning',
            message: 'DIP ainda não emitido',
            priority: 'high'
        });
    }

    // Documentação incompleta
    const docStatus = getDocumentationStatus(cpcv.documentacao);
    if (!docStatus.isComplete && diasAteEscritura && diasAteEscritura < 7) {
        alerts.push({
            type: 'danger',
            message: `Documentação incompleta - ${docStatus.completed}/${docStatus.total} documentos`,
            priority: 'high'
        });
    }

    return alerts;
};

// Exportar estatísticas do CPCV
export const getCPCVStatistics = (cpcvs) => {
    const stats = {
        total: cpcvs.length,
        draft: cpcvs.filter(c => c.estado === CPCV_STATES.DRAFT).length,
        signed: cpcvs.filter(c => c.estado === CPCV_STATES.SIGNED).length,
        completed: cpcvs.filter(c => c.estado === CPCV_STATES.COMPLETED).length,
        cancelled: cpcvs.filter(c => c.estado === CPCV_STATES.CANCELLED).length,

        // Valores
        totalValue: 0,
        totalCommissions: 0,
        averageValue: 0,

        // Financiamento
        withFinancing: 0,
        creditApproved: 0,
        dipIssued: 0
    };

    cpcvs.forEach(cpcv => {
        stats.totalValue += cpcv.valores?.valorVenda || 0;
        stats.totalCommissions += cpcv.valores?.comissaoImobiliaria || 0;

        if (cpcv.financiamento?.necessitaCredito) {
            stats.withFinancing++;
            if (cpcv.financiamento?.creditoAprovado) {
                stats.creditApproved++;
            }
            if (cpcv.financiamento?.dipEmitido) {
                stats.dipIssued++;
            }
        }
    });

    if (cpcvs.length > 0) {
        stats.averageValue = stats.totalValue / cpcvs.length;
    }

    return stats;
};