/**
 * MODELO DE NEGÓCIO PLENO
 * Entidade centralizada para gestão de negócios completos (vendedor + comprador)
 * Caminho: src/models/negocioPlenoModel.js
 */

import { Timestamp } from 'firebase/firestore';

// ===== ESTADOS DO NEGÓCIO PLENO =====

export const NEGOCIO_PLENO_STATES = {
    LINKED: 'linked',              // Acabou de ser linkado
    NEGOTIATION: 'negotiation',    // Em negociação
    PROPOSAL: 'proposal',          // Proposta submetida
    ACCEPTED: 'accepted',          // Proposta aceite
    CPCV_DRAFT: 'cpcv_draft',      // CPCV em preparação
    CPCV_SIGNED: 'cpcv_signed',    // CPCV assinado
    DEED_SCHEDULED: 'deed_scheduled', // Escritura agendada
    COMPLETED: 'completed',        // Negócio concluído
    CANCELLED: 'cancelled'         // Negócio cancelado
};

export const NEGOCIO_PLENO_STATE_LABELS = {
    [NEGOCIO_PLENO_STATES.LINKED]: '🔗 Linkado',
    [NEGOCIO_PLENO_STATES.NEGOTIATION]: '💬 Em Negociação',
    [NEGOCIO_PLENO_STATES.PROPOSAL]: '📝 Proposta Submetida',
    [NEGOCIO_PLENO_STATES.ACCEPTED]: '✅ Proposta Aceite',
    [NEGOCIO_PLENO_STATES.CPCV_DRAFT]: '📋 CPCV em Preparação',
    [NEGOCIO_PLENO_STATES.CPCV_SIGNED]: '✍️ CPCV Assinado',
    [NEGOCIO_PLENO_STATES.DEED_SCHEDULED]: '📅 Escritura Agendada',
    [NEGOCIO_PLENO_STATES.COMPLETED]: '🎉 Concluído',
    [NEGOCIO_PLENO_STATES.CANCELLED]: '❌ Cancelado'
};

// ===== ESTRUTURA DO NEGÓCIO PLENO =====

export const createNegocioPlenoModel = (negocioData = {}) => {
    return {
        // Identificação
        id: negocioData.id || '',
        numero: negocioData.numero || generateNegocioPlenoNumber(),
        titulo: negocioData.titulo || 'Negócio Pleno',

        // Estado e Timestamps
        estado: negocioData.estado || NEGOCIO_PLENO_STATES.LINKED,
        createdAt: negocioData.createdAt || Timestamp.now(),
        updatedAt: negocioData.updatedAt || Timestamp.now(),
        createdBy: negocioData.createdBy || '',

        // Oportunidades Linkadas
        oportunidades: {
            vendedora: {
                id: negocioData.oportunidades?.vendedora?.id || '',
                clienteId: negocioData.oportunidades?.vendedora?.clienteId || '',
                clienteNome: negocioData.oportunidades?.vendedora?.clienteNome || '',
                consultorId: negocioData.oportunidades?.vendedora?.consultorId || '',
                consultorNome: negocioData.oportunidades?.vendedora?.consultorNome || '',
                titulo: negocioData.oportunidades?.vendedora?.titulo || '',
                // Dados específicos do vendedor que não mudam
                motivoVenda: negocioData.oportunidades?.vendedora?.motivoVenda || '',
                prazoVenda: negocioData.oportunidades?.vendedora?.prazoVenda || ''
            },
            compradora: {
                id: negocioData.oportunidades?.compradora?.id || '',
                clienteId: negocioData.oportunidades?.compradora?.clienteId || '',
                clienteNome: negocioData.oportunidades?.compradora?.clienteNome || '',
                consultorId: negocioData.oportunidades?.compradora?.consultorId || '',
                consultorNome: negocioData.oportunidades?.compradora?.consultorNome || '',
                titulo: negocioData.oportunidades?.compradora?.titulo || '',
                // Dados específicos do comprador que não mudam
                necessitaCredito: negocioData.oportunidades?.compradora?.necessitaCredito || false,
                valorCreditoAprovado: negocioData.oportunidades?.compradora?.valorCreditoAprovado || 0
            }
        },

        // Imóvel (dados unificados)
        imovel: {
            // Identificação
            referencia: negocioData.imovel?.referencia || '',
            titulo: negocioData.imovel?.titulo || '',
            tipologia: negocioData.imovel?.tipologia || '',

            // Localização
            morada: negocioData.imovel?.morada || '',
            freguesia: negocioData.imovel?.freguesia || '',
            concelho: negocioData.imovel?.concelho || '',
            distrito: negocioData.imovel?.distrito || '',
            codigoPostal: negocioData.imovel?.codigoPostal || '',

            // Dados Registrais
            numeroMatricula: negocioData.imovel?.numeroMatricula || '',
            conservatoria: negocioData.imovel?.conservatoria || '',
            numeroFiscal: negocioData.imovel?.numeroFiscal || '',

            // Características
            area: negocioData.imovel?.area || 0,
            quartos: negocioData.imovel?.quartos || 0,
            casasBanho: negocioData.imovel?.casasBanho || 0,
            anoConstrucao: negocioData.imovel?.anoConstrucao || '',
            certificadoEnergetico: negocioData.imovel?.certificadoEnergetico || '',

            // Fotos e documentos do imóvel
            fotos: negocioData.imovel?.fotos || [],
            documentos: negocioData.imovel?.documentos || []
        },

        // Valores do Negócio (fonte única de verdade)
        valores: {
            // Valores base
            valorPedido: negocioData.valores?.valorPedido || 0,
            valorProposta: negocioData.valores?.valorProposta || 0,
            valorAcordado: negocioData.valores?.valorAcordado || 0,
            valorFinal: negocioData.valores?.valorFinal || 0,

            // CPCV
            sinal: negocioData.valores?.sinal || 0,
            sinalPago: negocioData.valores?.sinalPago || false,
            dataPagamentoSinal: negocioData.valores?.dataPagamentoSinal || null,
            reforcoSinal: negocioData.valores?.reforcoSinal || 0,
            reforcoSinalPago: negocioData.valores?.reforcoSinalPago || false,

            // Escritura
            valorEscritura: negocioData.valores?.valorEscritura || 0,

            // Impostos e taxas
            imt: negocioData.valores?.imt || 0,
            impostostimbres: negocioData.valores?.impostostimbres || 0,
            registoPredial: negocioData.valores?.registoPredial || 0,

            // Outros custos
            custosCertificados: negocioData.valores?.custosCertificados || 0,
            custosAdvogado: negocioData.valores?.custosAdvogado || 0,
            outrosCustos: negocioData.valores?.outrosCustos || 0
        },

        // Comissões (gestão unificada)
        comissoes: {
            // Valores totais
            percentagemTotal: negocioData.comissoes?.percentagemTotal || 5,
            valorTotal: negocioData.comissoes?.valorTotal || 0,

            // Divisão entre agências
            agenciaVendedora: {
                nome: negocioData.comissoes?.agenciaVendedora?.nome || '',
                percentagem: negocioData.comissoes?.agenciaVendedora?.percentagem || 50,
                valor: negocioData.comissoes?.agenciaVendedora?.valor || 0,
                paga: negocioData.comissoes?.agenciaVendedora?.paga || false,
                dataPagamento: negocioData.comissoes?.agenciaVendedora?.dataPagamento || null
            },
            agenciaCompradora: {
                nome: negocioData.comissoes?.agenciaCompradora?.nome || '',
                percentagem: negocioData.comissoes?.agenciaCompradora?.percentagem || 50,
                valor: negocioData.comissoes?.agenciaCompradora?.valor || 0,
                paga: negocioData.comissoes?.agenciaCompradora?.paga || false,
                dataPagamento: negocioData.comissoes?.agenciaCompradora?.dataPagamento || null
            },

            // Divisão entre consultores
            consultorVendedor: {
                nome: negocioData.comissoes?.consultorVendedor?.nome || '',
                percentagem: negocioData.comissoes?.consultorVendedor?.percentagem || 0,
                valor: negocioData.comissoes?.consultorVendedor?.valor || 0,
                paga: negocioData.comissoes?.consultorVendedor?.paga || false
            },
            consultorComprador: {
                nome: negocioData.comissoes?.consultorComprador?.nome || '',
                percentagem: negocioData.comissoes?.consultorComprador?.percentagem || 0,
                valor: negocioData.comissoes?.consultorComprador?.valor || 0,
                paga: negocioData.comissoes?.consultorComprador?.paga || false
            },

            // Condições de pagamento
            quandoPaga: negocioData.comissoes?.quandoPaga || 'escritura', // cpcv, escritura, misto
            observacoes: negocioData.comissoes?.observacoes || ''
        },

        // CPCV (dados centralizados)
        cpcv: {
            // Estado e datas
            estado: negocioData.cpcv?.estado || 'nao_iniciado', // nao_iniciado, em_preparacao, assinado
            numeroContrato: negocioData.cpcv?.numeroContrato || '',
            dataAssinatura: negocioData.cpcv?.dataAssinatura || null,
            localAssinatura: negocioData.cpcv?.localAssinatura || '',

            // Partes (referências aos dados completos nas oportunidades)
            compradorNome: negocioData.cpcv?.compradorNome || '',
            compradorNIF: negocioData.cpcv?.compradorNIF || '',
            vendedorNome: negocioData.cpcv?.vendedorNome || '',
            vendedorNIF: negocioData.cpcv?.vendedorNIF || '',

            // Cláusulas principais
            clausulas: negocioData.cpcv?.clausulas || [],
            clausulasEspeciais: negocioData.cpcv?.clausulasEspeciais || '',

            // Documentos
            minutaCPCV: negocioData.cpcv?.minutaCPCV || '',
            cpcvAssinado: negocioData.cpcv?.cpcvAssinado || '',

            // Checklist
            checklist: {
                minutaRevisada: negocioData.cpcv?.checklist?.minutaRevisada || false,
                documentacaoCompleta: negocioData.cpcv?.checklist?.documentacaoCompleta || false,
                sinalRecebido: negocioData.cpcv?.checklist?.sinalRecebido || false,
                copiasEntregues: negocioData.cpcv?.checklist?.copiasEntregues || false
            }
        },

        // Escritura (dados centralizados)
        escritura: {
            // Estado e agendamento
            estado: negocioData.escritura?.estado || 'nao_agendada', // nao_agendada, agendada, realizada
            dataAgendada: negocioData.escritura?.dataAgendada || null,
            horaAgendada: negocioData.escritura?.horaAgendada || '',
            dataRealizada: negocioData.escritura?.dataRealizada || null,

            // Local
            notario: negocioData.escritura?.notario || '',
            moradaNotario: negocioData.escritura?.moradaNotario || '',
            telefoneNotario: negocioData.escritura?.telefoneNotario || '',

            // Financiamento
            necessitaCredito: negocioData.escritura?.necessitaCredito || false,
            banco: negocioData.escritura?.banco || '',
            valorCredito: negocioData.escritura?.valorCredito || 0,
            creditoAprovado: negocioData.escritura?.creditoAprovado || false,
            dipEmitido: negocioData.escritura?.dipEmitido || false,
            numeroDIP: negocioData.escritura?.numeroDIP || '',

            // Checklist
            checklist: {
                creditoAprovado: negocioData.escritura?.checklist?.creditoAprovado || false,
                dipEmitido: negocioData.escritura?.checklist?.dipEmitido || false,
                imtPago: negocioData.escritura?.checklist?.imtPago || false,
                documentosCompletos: negocioData.escritura?.checklist?.documentosCompletos || false,
                chequesPreparados: negocioData.escritura?.checklist?.chequesPreparados || false,
                chavesPreparadas: negocioData.escritura?.checklist?.chavesPreparadas || false
            }
        },

        // Documentação Central
        documentacao: {
            // Documentos do imóvel
            caderneta: negocioData.documentacao?.caderneta || { existe: false, url: '', validado: false },
            certidaoPermanente: negocioData.documentacao?.certidaoPermanente || { existe: false, url: '', validado: false },
            licencaUtilizacao: negocioData.documentacao?.licencaUtilizacao || { existe: false, url: '', validado: false },
            certificadoEnergetico: negocioData.documentacao?.certificadoEnergetico || { existe: false, url: '', validado: false },
            fichaTecnica: negocioData.documentacao?.fichaTecnica || { existe: false, url: '', validado: false },
            plantaImovel: negocioData.documentacao?.plantaImovel || { existe: false, url: '', validado: false },

            // Documentos das partes
            documentosVendedor: negocioData.documentacao?.documentosVendedor || [],
            documentosComprador: negocioData.documentacao?.documentosComprador || [],

            // Documentos do negócio
            proposta: negocioData.documentacao?.proposta || { existe: false, url: '', data: null },
            cpcv: negocioData.documentacao?.cpcv || { existe: false, url: '', data: null },
            escritura: negocioData.documentacao?.escritura || { existe: false, url: '', data: null },

            // Outros documentos
            outrosDocumentos: negocioData.documentacao?.outrosDocumentos || []
        },

        // Timeline Unificada
        timeline: negocioData.timeline || [],

        // Tarefas Centralizadas
        tarefas: negocioData.tarefas || [],

        // Notas e Observações
        notas: {
            notasInternas: negocioData.notas?.notasInternas || '',
            observacoesVendedor: negocioData.notas?.observacoesVendedor || '',
            observacoesComprador: negocioData.notas?.observacoesComprador || '',
            alertas: negocioData.notas?.alertas || []
        },

        // Controlo e Audit
        isActive: negocioData.isActive !== undefined ? negocioData.isActive : true,
        lastModifiedBy: negocioData.lastModifiedBy || '',
        version: negocioData.version || 1,

        // Métricas
        metricas: {
            diasDesdeLink: negocioData.metricas?.diasDesdeLink || 0,
            diasAteCPCV: negocioData.metricas?.diasAteCPCV || null,
            diasAteEscritura: negocioData.metricas?.diasAteEscritura || null,
            tempoTotalNegocio: negocioData.metricas?.tempoTotalNegocio || null,
            numeroRevisoes: negocioData.metricas?.numeroRevisoes || 0,
            numeroVisitas: negocioData.metricas?.numeroVisitas || 0
        }
    };
};

// ===== FUNÇÕES AUXILIARES =====

/**
 * Gera número único para o negócio pleno
 */
export function generateNegocioPlenoNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `NP-${year}${month}-${random}`;
}

/**
 * Calcula comissões automaticamente
 */
export const calculateCommissions = (valorAcordado, percentagemTotal = 5, divisaoAgencias = { vendedora: 50, compradora: 50 }) => {
    const valorTotal = valorAcordado * (percentagemTotal / 100);
    const valorAgenciaVendedora = valorTotal * (divisaoAgencias.vendedora / 100);
    const valorAgenciaCompradora = valorTotal * (divisaoAgencias.compradora / 100);

    return {
        valorTotal,
        valorAgenciaVendedora,
        valorAgenciaCompradora
    };
};

/**
 * Calcula valores da escritura
 */
export const calculateDeedValues = (valorAcordado, sinal = 0, reforcoSinal = 0) => {
    const totalPago = sinal + reforcoSinal;
    const valorEscritura = valorAcordado - totalPago;

    return {
        totalPago,
        valorEscritura
    };
};

/**
 * Adiciona evento à timeline
 */
export const addTimelineEvent = (timeline = [], evento) => {
    const newEvent = {
        id: generateTimelineId(),
        timestamp: Timestamp.now(),
        tipo: evento.tipo || 'info',
        titulo: evento.titulo || '',
        descricao: evento.descricao || '',
        usuario: evento.usuario || '',
        dados: evento.dados || {}
    };

    return [...timeline, newEvent];
};

/**
 * Gera ID único para evento da timeline
 */
function generateTimelineId() {
    return `TL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Verifica estado do negócio e sugere próximo passo
 */
export const getNextStep = (negocioPleno) => {
    const estado = negocioPleno.estado;

    switch (estado) {
        case NEGOCIO_PLENO_STATES.LINKED:
            return {
                acao: 'Iniciar Negociação',
                descricao: 'Começar a negociação de valores e condições',
                proximoEstado: NEGOCIO_PLENO_STATES.NEGOTIATION
            };

        case NEGOCIO_PLENO_STATES.NEGOTIATION:
            return {
                acao: 'Submeter Proposta',
                descricao: 'Formalizar proposta de compra',
                proximoEstado: NEGOCIO_PLENO_STATES.PROPOSAL
            };

        case NEGOCIO_PLENO_STATES.PROPOSAL:
            return {
                acao: 'Aceitar Proposta',
                descricao: 'Confirmar aceitação da proposta',
                proximoEstado: NEGOCIO_PLENO_STATES.ACCEPTED
            };

        case NEGOCIO_PLENO_STATES.ACCEPTED:
            return {
                acao: 'Preparar CPCV',
                descricao: 'Elaborar contrato promessa compra e venda',
                proximoEstado: NEGOCIO_PLENO_STATES.CPCV_DRAFT
            };

        case NEGOCIO_PLENO_STATES.CPCV_DRAFT:
            return {
                acao: 'Assinar CPCV',
                descricao: 'Proceder à assinatura do CPCV',
                proximoEstado: NEGOCIO_PLENO_STATES.CPCV_SIGNED
            };

        case NEGOCIO_PLENO_STATES.CPCV_SIGNED:
            return {
                acao: 'Agendar Escritura',
                descricao: 'Marcar data para escritura',
                proximoEstado: NEGOCIO_PLENO_STATES.DEED_SCHEDULED
            };

        case NEGOCIO_PLENO_STATES.DEED_SCHEDULED:
            return {
                acao: 'Realizar Escritura',
                descricao: 'Concluir o negócio com a escritura',
                proximoEstado: NEGOCIO_PLENO_STATES.COMPLETED
            };

        default:
            return null;
    }
};

/**
 * Valida dados do negócio pleno
 */
export const validateNegocioPlenoData = (data) => {
    const errors = {};

    // Validar oportunidades linkadas
    if (!data.oportunidades?.vendedora?.id) {
        errors.oportunidadeVendedora = 'Oportunidade vendedora é obrigatória';
    }

    if (!data.oportunidades?.compradora?.id) {
        errors.oportunidadeCompradora = 'Oportunidade compradora é obrigatória';
    }

    // Validar valores quando em estados avançados
    if ([NEGOCIO_PLENO_STATES.ACCEPTED, NEGOCIO_PLENO_STATES.CPCV_DRAFT, NEGOCIO_PLENO_STATES.CPCV_SIGNED].includes(data.estado)) {
        if (!data.valores?.valorAcordado || data.valores.valorAcordado <= 0) {
            errors.valorAcordado = 'Valor acordado é obrigatório';
        }
    }

    // Validar CPCV quando assinado
    if (data.estado === NEGOCIO_PLENO_STATES.CPCV_SIGNED) {
        if (!data.cpcv?.dataAssinatura) {
            errors.dataCPCV = 'Data de assinatura do CPCV é obrigatória';
        }

        if (!data.valores?.sinal || data.valores.sinal <= 0) {
            errors.sinal = 'Valor do sinal é obrigatório';
        }
    }

    // Validar escritura quando agendada
    if (data.estado === NEGOCIO_PLENO_STATES.DEED_SCHEDULED) {
        if (!data.escritura?.dataAgendada) {
            errors.dataEscritura = 'Data da escritura é obrigatória';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Calcula métricas do negócio
 */
export const calculateMetrics = (negocioPleno) => {
    const metrics = { ...negocioPleno.metricas };
    const now = new Date();
    const createdDate = negocioPleno.createdAt?.toDate ? negocioPleno.createdAt.toDate() : new Date(negocioPleno.createdAt);

    // Dias desde o link
    metrics.diasDesdeLink = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

    // Dias até CPCV (se agendado)
    if (negocioPleno.cpcv?.dataAssinatura && !negocioPleno.cpcv?.estado === 'assinado') {
        const cpcvDate = negocioPleno.cpcv.dataAssinatura.toDate ? negocioPleno.cpcv.dataAssinatura.toDate() : new Date(negocioPleno.cpcv.dataAssinatura);
        metrics.diasAteCPCV = Math.floor((cpcvDate - now) / (1000 * 60 * 60 * 24));
    }

    // Dias até Escritura (se agendada)
    if (negocioPleno.escritura?.dataAgendada) {
        const escrituraDate = negocioPleno.escritura.dataAgendada.toDate ? negocioPleno.escritura.dataAgendada.toDate() : new Date(negocioPleno.escritura.dataAgendada);
        metrics.diasAteEscritura = Math.floor((escrituraDate - now) / (1000 * 60 * 60 * 24));
    }

    // Tempo total do negócio (se concluído)
    if (negocioPleno.estado === NEGOCIO_PLENO_STATES.COMPLETED && negocioPleno.escritura?.dataRealizada) {
        const completedDate = negocioPleno.escritura.dataRealizada.toDate ? negocioPleno.escritura.dataRealizada.toDate() : new Date(negocioPleno.escritura.dataRealizada);
        metrics.tempoTotalNegocio = Math.floor((completedDate - createdDate) / (1000 * 60 * 60 * 24));
    }

    return metrics;
};

/**
 * Verifica alertas e pendências
 */
export const checkAlerts = (negocioPleno) => {
    const alerts = [];

    // Verificar documentação em falta
    const docs = negocioPleno.documentacao;
    const requiredDocs = ['caderneta', 'certidaoPermanente', 'licencaUtilizacao', 'certificadoEnergetico'];

    requiredDocs.forEach(doc => {
        if (!docs[doc]?.existe) {
            alerts.push({
                tipo: 'documento',
                nivel: 'warning',
                mensagem: `Documento em falta: ${doc}`,
                campo: doc
            });
        }
    });

    // Verificar sinal não pago
    if (negocioPleno.cpcv?.estado === 'assinado' && !negocioPleno.valores?.sinalPago) {
        alerts.push({
            tipo: 'pagamento',
            nivel: 'danger',
            mensagem: 'Sinal ainda não foi pago',
            campo: 'sinalPago'
        });
    }

    // Verificar crédito para escritura
    if (negocioPleno.escritura?.necessitaCredito && !negocioPleno.escritura?.creditoAprovado) {
        const diasAteEscritura = negocioPleno.metricas?.diasAteEscritura;
        if (diasAteEscritura && diasAteEscritura < 30) {
            alerts.push({
                tipo: 'financiamento',
                nivel: 'danger',
                mensagem: `Crédito não aprovado - ${diasAteEscritura} dias até escritura`,
                campo: 'creditoAprovado'
            });
        }
    }

    // Verificar DIP
    if (negocioPleno.escritura?.creditoAprovado && !negocioPleno.escritura?.dipEmitido) {
        const diasAteEscritura = negocioPleno.metricas?.diasAteEscritura;
        if (diasAteEscritura && diasAteEscritura < 15) {
            alerts.push({
                tipo: 'financiamento',
                nivel: 'warning',
                mensagem: 'DIP ainda não emitido',
                campo: 'dipEmitido'
            });
        }
    }

    return alerts;
};

/**
 * Exportar estatísticas de negócios plenos
 */
export const getNegocioPlenoStats = (negociosPlenos = []) => {
    const stats = {
        total: negociosPlenos.length,
        porEstado: {},
        valorTotal: 0,
        comissaoTotal: 0,
        tempoMedio: 0,
        taxaConversao: 0
    };

    // Contar por estado
    Object.keys(NEGOCIO_PLENO_STATES).forEach(key => {
        const estado = NEGOCIO_PLENO_STATES[key];
        stats.porEstado[estado] = negociosPlenos.filter(n => n.estado === estado).length;
    });

    // Calcular valores
    let negociosConcluidos = 0;
    let tempoTotal = 0;

    negociosPlenos.forEach(negocio => {
        stats.valorTotal += negocio.valores?.valorAcordado || 0;
        stats.comissaoTotal += negocio.comissoes?.valorTotal || 0;

        if (negocio.estado === NEGOCIO_PLENO_STATES.COMPLETED) {
            negociosConcluidos++;
            if (negocio.metricas?.tempoTotalNegocio) {
                tempoTotal += negocio.metricas.tempoTotalNegocio;
            }
        }
    });

    // Calcular médias
    if (negociosConcluidos > 0) {
        stats.tempoMedio = Math.round(tempoTotal / negociosConcluidos);
        stats.taxaConversao = (negociosConcluidos / stats.total) * 100;
    }

    return stats;
};