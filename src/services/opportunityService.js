/**
 * OPPORTUNITY SERVICE - MyImoMatePro
 * VERSÃO INTEGRADA com suporte completo para imóveis, visitas, ofertas e CPCV
 * 
 * Caminho: src/services/opportunityService.js
 * Estrutura: consultores/{consultorId}/clientes/{clienteId}/oportunidades/{oportunidadeId}
 */

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    writeBatch,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    createOpportunitySchema,
    validateOpportunityData,
    createTimelineEvent,
    TIMELINE_EVENT_TYPES,
    OPPORTUNITY_STATES,
    calculateDaysInPipeline
} from '../models/opportunityModel';

// ===== CONFIGURAÇÕES =====
const OPPORTUNITIES_COLLECTION = 'oportunidades';
const CLIENTS_COLLECTION = 'clientes';
const CONSULTOR_COLLECTION = 'consultores';
const DEFAULT_PAGE_SIZE = 20;

// ===== HELPER FUNCTIONS =====

/**
 * Obter referência da coleção de oportunidades
 */
const getOpportunityCollection = (consultorId, clienteId) => {
    return collection(
        db,
        CONSULTOR_COLLECTION,
        consultorId,
        CLIENTS_COLLECTION,
        clienteId,
        OPPORTUNITIES_COLLECTION
    );
};

/**
 * Obter referência de um documento de oportunidade
 */
const getOpportunityDoc = (consultorId, clienteId, opportunityId) => {
    return doc(
        db,
        CONSULTOR_COLLECTION,
        consultorId,
        CLIENTS_COLLECTION,
        clienteId,
        OPPORTUNITIES_COLLECTION,
        opportunityId
    );
};

// ===== CREATE OPERATIONS =====

/**
 * Criar nova oportunidade para um cliente
 * VERSÃO MELHORADA com suporte para imóveis
 */
export const createOpportunity = async (consultorId, clienteId, opportunityData) => {
    try {
        // Validar dados
        const validation = validateOpportunityData(opportunityData);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
        }

        // Criar schema com dados validados
        const opportunitySchema = createOpportunitySchema({
            ...opportunityData,
            consultorId,
            clienteId,
            // NOVO: Incluir estrutura de imóveis
            imoveis: opportunityData.imoveis || []
        });

        // Adicionar evento de criação ao timeline
        opportunitySchema.timeline = [
            createTimelineEvent(
                TIMELINE_EVENT_TYPES.CREATED,
                `Oportunidade criada como ${opportunityData.tipo}`,
                {
                    estado: opportunitySchema.estado,
                    numeroImoveis: opportunityData.imoveis?.length || 0
                }
            )
        ];

        // Se houver imóveis com visitas ou ofertas, adicionar ao timeline
        if (opportunityData.imoveis && opportunityData.imoveis.length > 0) {
            opportunityData.imoveis.forEach((imovel, index) => {
                if (imovel.visitas && imovel.visitas.length > 0) {
                    opportunitySchema.timeline.push(
                        createTimelineEvent(
                            TIMELINE_EVENT_TYPES.VISIT_SCHEDULED,
                            `${imovel.visitas.length} visita(s) agendada(s) para ${imovel.referencia}`,
                            { imovelId: imovel.id, numeroVisitas: imovel.visitas.length }
                        )
                    );
                }

                if (imovel.ofertas && imovel.ofertas.length > 0) {
                    opportunitySchema.timeline.push(
                        createTimelineEvent(
                            TIMELINE_EVENT_TYPES.PROPOSAL_SENT,
                            `${imovel.ofertas.length} oferta(s) para ${imovel.referencia}`,
                            { imovelId: imovel.id, numeroOfertas: imovel.ofertas.length }
                        )
                    );
                }
            });
        }

        // Adicionar ao Firestore
        const opportunityRef = await addDoc(
            getOpportunityCollection(consultorId, clienteId),
            opportunitySchema
        );

        // Atualizar contador no cliente
        await updateClientOpportunityCount(consultorId, clienteId, 1);

        // Buscar oportunidade criada para retornar com ID
        const createdOpportunity = await getDoc(opportunityRef);
        return {
            id: createdOpportunity.id,
            ...createdOpportunity.data()
        };

    } catch (error) {
        console.error('OpportunityService: Erro ao criar oportunidade:', error);
        throw new Error(`Erro ao criar oportunidade: ${error.message}`);
    }
};

// ===== READ OPERATIONS =====

/**
 * Buscar oportunidade por ID
 * VERSÃO MELHORADA com estrutura completa
 */
export const getOpportunity = async (consultorId, clienteId, opportunityId) => {
    try {
        const opportunityDoc = await getDoc(
            getOpportunityDoc(consultorId, clienteId, opportunityId)
        );

        if (!opportunityDoc.exists()) {
            return null;
        }

        const opportunityData = {
            id: opportunityDoc.id,
            ...opportunityDoc.data()
        };

        // Garantir que imoveis existe como array
        if (!opportunityData.imoveis) {
            opportunityData.imoveis = [];
        }

        // Processar dados dos imóveis para garantir estrutura consistente
        opportunityData.imoveis = opportunityData.imoveis.map(imovel => ({
            ...imovel,
            visitas: imovel.visitas || [],
            ofertas: imovel.ofertas || [],
            cpcv: imovel.cpcv || null
        }));

        return opportunityData;

    } catch (error) {
        console.error('OpportunityService: Erro ao buscar oportunidade:', error);
        throw new Error(`Erro ao buscar oportunidade: ${error.message}`);
    }
};

/**
 * Listar todas as oportunidades de um cliente
 * VERSÃO MELHORADA com estatísticas de imóveis
 */
export const listClientOpportunities = async (consultorId, clienteId, options = {}) => {
    try {
        const {
            tipo = null,
            estado = null,
            orderField = 'createdAt',
            orderDirection = 'desc',
            pageSize = DEFAULT_PAGE_SIZE,
            lastDoc = null
        } = options;

        // Query simplificada - apenas buscar documentos da coleção
        const opportunityQuery = query(
            getOpportunityCollection(consultorId, clienteId),
            limit(pageSize * 2)
        );

        // Executar query
        const snapshot = await getDocs(opportunityQuery);

        // Na função listClientOpportunities
        // SUBSTITUIR O BLOCO de processamento de oportunidades por este código definitivo:

        let opportunities = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Verificar se está ativo
            if (data.isActive !== false) {
                const { id: dataId, ...restData } = data;

                // Inicializar contadores
                let totalImoveis = 0;
                let totalVisitas = 0;
                let totalOfertas = 0;
                let totalPropostas = 0;
                let temCPCV = false;
                let temEscritura = false;

                // OPÇÃO 1: Dados no array 'imoveis' (estrutura para compradores e nova estrutura)
                if (restData.imoveis && Array.isArray(restData.imoveis) && restData.imoveis.length > 0) {
                    totalImoveis = restData.imoveis.length;

                    restData.imoveis.forEach(imovel => {
                        // Contar visitas
                        if (imovel.visitas && Array.isArray(imovel.visitas)) {
                            totalVisitas += imovel.visitas.length;
                        }

                        // Contar ofertas totais
                        if (imovel.ofertas && Array.isArray(imovel.ofertas)) {
                            totalOfertas += imovel.ofertas.length;

                            // Contar apenas propostas (não rascunhos)
                            totalPropostas += imovel.ofertas.filter(o =>
                                o.status && o.status !== 'rascunho' && o.status !== 'draft'
                            ).length;
                        }

                        // Verificar CPCV
                        if (imovel.cpcv && (typeof imovel.cpcv === 'object' || imovel.cpcv === true)) {
                            temCPCV = true;
                        }

                        // Verificar Escritura
                        if (imovel.escritura && (typeof imovel.escritura === 'object' || imovel.escritura === true)) {
                            temEscritura = true;
                        }
                    });
                }
                // OPÇÃO 2: Dados em 'imóvelVenda' (estrutura para vendedores)
                else if (restData.imóvelVenda || restData.imovelVenda) {
                    // Normalizar o nome (pode estar com ou sem acento)
                    const imovelVenda = restData.imóvelVenda || restData.imovelVenda;

                    // Para vendedores, considerar 1 imóvel
                    if (restData.tipo === 'vendedor') {
                        totalImoveis = 1;
                    }

                    // Contar visitas de compradores
                    if (imovelVenda.visitasCompradores && Array.isArray(imovelVenda.visitasCompradores)) {
                        totalVisitas = imovelVenda.visitasCompradores.length;
                    }

                    // Contar ofertas recebidas
                    if (imovelVenda.ofertasRecebidas && Array.isArray(imovelVenda.ofertasRecebidas)) {
                        totalOfertas = imovelVenda.ofertasRecebidas.length;

                        // Contar apenas propostas aceites ou em negociação
                        totalPropostas = imovelVenda.ofertasRecebidas.filter(o =>
                            o.status && o.status !== 'rascunho' && o.status !== 'draft'
                        ).length;
                    }

                    // Verificar CPCV
                    if (imovelVenda.cpcvAssinado === true || imovelVenda.cpcv) {
                        temCPCV = true;
                    }
                    // Também verificar no campo dataCPCV
                    else if (imovelVenda.dataCPCV && imovelVenda.dataCPCV !== '') {
                        temCPCV = true;
                    }

                    // Verificar Escritura
                    if (imovelVenda.escrituraRealizada === true || imovelVenda.escritura) {
                        temEscritura = true;
                    }
                    // Também verificar no campo dataEscritura
                    else if (imovelVenda.dataEscritura && imovelVenda.dataEscritura !== '') {
                        temEscritura = true;
                    }
                }
                // OPÇÃO 3: Dados em 'imóveisArrendar' (para senhorios/inquilinos)
                else if (restData.imóveisArrendar || restData.imoveisArrendar) {
                    const imoveisArrendar = restData.imóveisArrendar || restData.imoveisArrendar;

                    if (Array.isArray(imoveisArrendar)) {
                        totalImoveis = imoveisArrendar.length;

                        imoveisArrendar.forEach(imovel => {
                            // Processar visitas e ofertas para arrendamento
                            if (imovel.visitas && Array.isArray(imovel.visitas)) {
                                totalVisitas += imovel.visitas.length;
                            }

                            if (imovel.propostas && Array.isArray(imovel.propostas)) {
                                totalPropostas += imovel.propostas.length;
                            }

                            // Verificar contrato de arrendamento
                            if (imovel.contratoAssinado) {
                                temCPCV = true; // Usar CPCV como indicador de contrato
                            }
                        });
                    }
                }

                // Processar dados para incluir estatísticas
                const opportunityData = {
                    ...restData,
                    id: doc.id,
                    // Estatísticas calculadas
                    totalImoveis: totalImoveis,
                    totalVisitas: totalVisitas,
                    totalOfertas: totalOfertas,
                    totalPropostas: totalPropostas,
                    temCPCV: temCPCV,
                    temEscritura: temEscritura
                };

                opportunities.push(opportunityData);
            }
        });

        // Aplicar filtros em memória
        if (tipo) {
            opportunities = opportunities.filter(opp => opp.tipo === tipo);
        }

        if (estado) {
            opportunities = opportunities.filter(opp => opp.estado === estado);
        }

        // Ordenar em memória (resto do código continua igual...)

        // Ordenar em memória
        opportunities.sort((a, b) => {
            const aValue = a[orderField] || '';
            const bValue = b[orderField] || '';

            // Tratar Timestamps do Firestore
            const aDate = aValue?.seconds ? new Date(aValue.seconds * 1000) : new Date(aValue);
            const bDate = bValue?.seconds ? new Date(bValue.seconds * 1000) : new Date(bValue);

            if (orderDirection === 'desc') {
                return bDate - aDate;
            }
            return aDate - bDate;
        });

        // Paginar resultados
        const paginatedOpportunities = opportunities.slice(0, pageSize);

        // Calcular métricas adicionais
        const enrichedOpportunities = paginatedOpportunities.map(opp => ({
            ...opp,
            diasEmPipeline: calculateDaysInPipeline(opp.createdAt)
        }));

        return {
            opportunities: enrichedOpportunities,
            hasMore: opportunities.length > pageSize,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };

    } catch (error) {
        console.error('OpportunityService: Erro ao listar oportunidades:', error);

        // Se não houver oportunidades, retornar array vazio
        if (error.code === 'permission-denied' || error.message?.includes('index')) {
            return {
                opportunities: [],
                hasMore: false,
                lastDoc: null
            };
        }

        throw new Error(`Erro ao listar oportunidades: ${error.message}`);
    }
};

// ===== UPDATE OPERATIONS =====

/**
 * Atualizar oportunidade
 * VERSÃO MELHORADA com suporte completo para imóveis
 */
export const updateOpportunity = async (consultorId, clienteId, opportunityId, updates) => {
    try {
        const opportunityRef = getOpportunityDoc(consultorId, clienteId, opportunityId);

        // Buscar oportunidade atual
        const currentDoc = await getDoc(opportunityRef);
        if (!currentDoc.exists()) {
            throw new Error('Oportunidade não encontrada');
        }

        const currentData = currentDoc.data();

        // Preparar updates
        const updateData = {
            ...updates,
            updatedAt: serverTimestamp()
        };

        // Se estiver atualizando imóveis, garantir estrutura completa
        if (updates.imoveis) {
            updateData.imoveis = updates.imoveis.map(imovel => ({
                ...imovel,
                visitas: imovel.visitas || [],
                ofertas: imovel.ofertas || [],
                cpcv: imovel.cpcv || null
            }));
        }

        // Adicionar eventos ao timeline conforme necessário
        const newTimelineEvents = [];

        // Detectar mudança de estado
        if (updates.estado && updates.estado !== currentData.estado) {
            newTimelineEvents.push(
                createTimelineEvent(
                    TIMELINE_EVENT_TYPES.STATE_CHANGED,
                    `Estado alterado de ${currentData.estado} para ${updates.estado}`,
                    { estadoAnterior: currentData.estado, estadoNovo: updates.estado }
                )
            );

            // Se fechado com sucesso, registrar data de fecho
            if (updates.estado === OPPORTUNITY_STATES.CLOSED_WON) {
                updateData.dataFechoReal = Timestamp.now();
            }
        }

        // Detectar mudança de valor
        if (updates.valorEstimado && updates.valorEstimado !== currentData.valorEstimado) {
            newTimelineEvents.push(
                createTimelineEvent(
                    TIMELINE_EVENT_TYPES.VALUE_UPDATED,
                    `Valor atualizado de €${currentData.valorEstimado} para €${updates.valorEstimado}`,
                    { valorAnterior: currentData.valorEstimado, valorNovo: updates.valorEstimado }
                )
            );
        }

        // Detectar mudanças em imóveis
        if (updates.imoveis) {
            const currentImoveis = currentData.imoveis || [];
            const newImoveis = updates.imoveis || [];

            // Novos imóveis adicionados
            if (newImoveis.length > currentImoveis.length) {
                newTimelineEvents.push(
                    createTimelineEvent(
                        TIMELINE_EVENT_TYPES.NOTE_ADDED,
                        `${newImoveis.length - currentImoveis.length} imóvel(eis) adicionado(s)`,
                        { numeroImoveis: newImoveis.length }
                    )
                );
            }

            // Verificar novas visitas
            const totalVisitasAntes = currentImoveis.reduce((acc, im) =>
                acc + (im.visitas?.length || 0), 0);
            const totalVisitasDepois = newImoveis.reduce((acc, im) =>
                acc + (im.visitas?.length || 0), 0);

            if (totalVisitasDepois > totalVisitasAntes) {
                newTimelineEvents.push(
                    createTimelineEvent(
                        TIMELINE_EVENT_TYPES.VISIT_SCHEDULED,
                        `${totalVisitasDepois - totalVisitasAntes} nova(s) visita(s) agendada(s)`,
                        { totalVisitas: totalVisitasDepois }
                    )
                );
            }

            // Verificar visitas efetuadas
            const visitasEfetuadas = newImoveis.reduce((acc, im) =>
                acc + (im.visitas?.filter(v => v.estado === 'efetuada').length || 0), 0);
            const visitasEfetuadasAntes = currentImoveis.reduce((acc, im) =>
                acc + (im.visitas?.filter(v => v.estado === 'efetuada').length || 0), 0);

            if (visitasEfetuadas > visitasEfetuadasAntes) {
                newTimelineEvents.push(
                    createTimelineEvent(
                        TIMELINE_EVENT_TYPES.VISIT_COMPLETED,
                        `${visitasEfetuadas - visitasEfetuadasAntes} visita(s) realizada(s)`,
                        { visitasRealizadas: visitasEfetuadas }
                    )
                );
            }

            // Verificar novas ofertas
            const totalOfertasAntes = currentImoveis.reduce((acc, im) =>
                acc + (im.ofertas?.length || 0), 0);
            const totalOfertasDepois = newImoveis.reduce((acc, im) =>
                acc + (im.ofertas?.length || 0), 0);

            if (totalOfertasDepois > totalOfertasAntes) {
                newTimelineEvents.push(
                    createTimelineEvent(
                        TIMELINE_EVENT_TYPES.PROPOSAL_SENT,
                        `${totalOfertasDepois - totalOfertasAntes} nova(s) oferta(s) submetida(s)`,
                        { totalOfertas: totalOfertasDepois }
                    )
                );
            }

            // Verificar ofertas aceites
            const ofertasAceites = newImoveis.reduce((acc, im) =>
                acc + (im.ofertas?.filter(o => o.status === 'aceite').length || 0), 0);
            const ofertasAceitesAntes = currentImoveis.reduce((acc, im) =>
                acc + (im.ofertas?.filter(o => o.status === 'aceite').length || 0), 0);

            if (ofertasAceites > ofertasAceitesAntes) {
                newTimelineEvents.push(
                    createTimelineEvent(
                        TIMELINE_EVENT_TYPES.PROPOSAL_ACCEPTED,
                        'Proposta aceite!',
                        { ofertasAceites }
                    )
                );
            }

            // Verificar CPCVs
            const temCPCV = newImoveis.some(im => im.cpcv);
            const tinhaCPCV = currentImoveis.some(im => im.cpcv);

            if (temCPCV && !tinhaCPCV) {
                newTimelineEvents.push(
                    createTimelineEvent(
                        TIMELINE_EVENT_TYPES.DOCUMENT_ADDED,
                        'CPCV criado',
                        { tipo: 'CPCV' }
                    )
                );
            }
        }

        // Adicionar novos eventos ao timeline existente
        if (newTimelineEvents.length > 0) {
            updateData.timeline = [...(currentData.timeline || []), ...newTimelineEvents];
        }

        // Atualizar métricas
        if (updateData.timeline) {
            updateData['metricas.numeroContactos'] = updateData.timeline.filter(
                e => e.tipo === TIMELINE_EVENT_TYPES.CONTACT_MADE
            ).length;

            // NOVO: Métricas de visitas
            if (updateData.imoveis) {
                updateData['metricas.numeroVisitas'] = updateData.imoveis.reduce(
                    (acc, im) => acc + (im.visitas?.length || 0), 0
                );
                updateData['metricas.visitasRealizadas'] = updateData.imoveis.reduce(
                    (acc, im) => acc + (im.visitas?.filter(v => v.estado === 'efetuada').length || 0), 0
                );
                updateData['metricas.numeroPropostas'] = updateData.imoveis.reduce(
                    (acc, im) => acc + (im.ofertas?.length || 0), 0
                );
            }
        }

        // Executar update
        await updateDoc(opportunityRef, updateData);

        // Retornar oportunidade atualizada
        const updatedDoc = await getDoc(opportunityRef);
        return {
            id: updatedDoc.id,
            ...updatedDoc.data()
        };

    } catch (error) {
        console.error('OpportunityService: Erro ao atualizar oportunidade:', error);
        throw new Error(`Erro ao atualizar oportunidade: ${error.message}`);
    }
};

// ===== NOVAS FUNÇÕES PARA GESTÃO DE IMÓVEIS =====

/**
 * Adicionar imóvel a uma oportunidade
 */
export const addPropertyToOpportunity = async (consultorId, clienteId, opportunityId, propertyData) => {
    try {
        const opportunity = await getOpportunity(consultorId, clienteId, opportunityId);

        if (!opportunity) {
            throw new Error('Oportunidade não encontrada');
        }

        const newProperty = {
            ...propertyData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            visitas: [],
            ofertas: [],
            cpcv: null
        };

        const updatedImoveis = [...(opportunity.imoveis || []), newProperty];

        await updateOpportunity(consultorId, clienteId, opportunityId, {
            imoveis: updatedImoveis
        });

        return newProperty;
    } catch (error) {
        console.error('OpportunityService: Erro ao adicionar imóvel:', error);
        throw error;
    }
};

/**
 * Atualizar imóvel específico
 */
export const updatePropertyInOpportunity = async (consultorId, clienteId, opportunityId, propertyId, propertyUpdates) => {
    try {
        const opportunity = await getOpportunity(consultorId, clienteId, opportunityId);

        if (!opportunity) {
            throw new Error('Oportunidade não encontrada');
        }

        const updatedImoveis = (opportunity.imoveis || []).map(imovel =>
            imovel.id === propertyId
                ? { ...imovel, ...propertyUpdates, updatedAt: new Date().toISOString() }
                : imovel
        );

        await updateOpportunity(consultorId, clienteId, opportunityId, {
            imoveis: updatedImoveis
        });

        return true;
    } catch (error) {
        console.error('OpportunityService: Erro ao atualizar imóvel:', error);
        throw error;
    }
};

/**
 * Adicionar visita a um imóvel
 */
export const addVisitToProperty = async (consultorId, clienteId, opportunityId, propertyId, visitData) => {
    try {
        const opportunity = await getOpportunity(consultorId, clienteId, opportunityId);

        if (!opportunity) {
            throw new Error('Oportunidade não encontrada');
        }

        const newVisit = {
            ...visitData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        const updatedImoveis = (opportunity.imoveis || []).map(imovel => {
            if (imovel.id === propertyId) {
                return {
                    ...imovel,
                    visitas: [...(imovel.visitas || []), newVisit],
                    estadoNegocio: visitData.estado === 'efetuada' ? 'visitado' : imovel.estadoNegocio
                };
            }
            return imovel;
        });

        await updateOpportunity(consultorId, clienteId, opportunityId, {
            imoveis: updatedImoveis
        });

        return newVisit;
    } catch (error) {
        console.error('OpportunityService: Erro ao adicionar visita:', error);
        throw error;
    }
};

/**
 * Adicionar oferta a um imóvel
 */
export const addOfferToProperty = async (consultorId, clienteId, opportunityId, propertyId, offerData) => {
    try {
        const opportunity = await getOpportunity(consultorId, clienteId, opportunityId);

        if (!opportunity) {
            throw new Error('Oportunidade não encontrada');
        }

        const newOffer = {
            ...offerData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        const updatedImoveis = (opportunity.imoveis || []).map(imovel => {
            if (imovel.id === propertyId) {
                let estadoNegocio = imovel.estadoNegocio;

                if (offerData.status === 'aceite') {
                    estadoNegocio = 'aceite';
                } else if (offerData.status === 'submetida') {
                    estadoNegocio = 'proposta';
                } else if (offerData.status === 'negociacao' || offerData.status === 'contraproposta') {
                    estadoNegocio = 'negociação';
                }

                return {
                    ...imovel,
                    ofertas: [...(imovel.ofertas || []), newOffer],
                    estadoNegocio
                };
            }
            return imovel;
        });

        await updateOpportunity(consultorId, clienteId, opportunityId, {
            imoveis: updatedImoveis
        });

        return newOffer;
    } catch (error) {
        console.error('OpportunityService: Erro ao adicionar oferta:', error);
        throw error;
    }
};

/**
 * Adicionar CPCV a um imóvel
 */
export const addCPCVToProperty = async (consultorId, clienteId, opportunityId, propertyId, cpcvData) => {
    try {
        const opportunity = await getOpportunity(consultorId, clienteId, opportunityId);

        if (!opportunity) {
            throw new Error('Oportunidade não encontrada');
        }

        const updatedImoveis = (opportunity.imoveis || []).map(imovel => {
            if (imovel.id === propertyId) {
                return {
                    ...imovel,
                    cpcv: cpcvData,
                    estadoNegocio: 'cpcv'
                };
            }
            return imovel;
        });

        await updateOpportunity(consultorId, clienteId, opportunityId, {
            imoveis: updatedImoveis
        });

        return cpcvData;
    } catch (error) {
        console.error('OpportunityService: Erro ao adicionar CPCV:', error);
        throw error;
    }
};

// ===== DELETE OPERATIONS =====

/**
 * Desativar oportunidade (soft delete)
 */
export const deactivateOpportunity = async (consultorId, clienteId, opportunityId) => {
    try {
        const opportunityRef = getOpportunityDoc(consultorId, clienteId, opportunityId);

        await updateDoc(opportunityRef, {
            isActive: false,
            deactivatedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Atualizar contador no cliente
        await updateClientOpportunityCount(consultorId, clienteId, -1);

        return { success: true };

    } catch (error) {
        console.error('OpportunityService: Erro ao desativar oportunidade:', error);
        throw new Error(`Erro ao desativar oportunidade: ${error.message}`);
    }
};

/**
 * Deletar oportunidade permanentemente
 */
export const deleteOpportunity = async (consultorId, clienteId, opportunityId) => {
    try {
        const opportunityRef = getOpportunityDoc(consultorId, clienteId, opportunityId);
        await deleteDoc(opportunityRef);

        // Atualizar contador no cliente
        await updateClientOpportunityCount(consultorId, clienteId, -1);

        return { success: true };

    } catch (error) {
        console.error('OpportunityService: Erro ao deletar oportunidade:', error);
        throw new Error(`Erro ao deletar oportunidade: ${error.message}`);
    }
};

// ===== STATISTICS & ANALYTICS =====

/**
 * Obter estatísticas das oportunidades de um cliente
 * VERSÃO MELHORADA com estatísticas de imóveis
 */
export const getClientOpportunityStats = async (consultorId, clienteId) => {
    try {
        const { opportunities } = await listClientOpportunities(consultorId, clienteId, {
            pageSize: 1000 // Buscar todas
        });

        const stats = {
            total: opportunities.length,
            porTipo: {},
            porEstado: {},
            valorTotal: 0,
            comissaoEstimada: 0,
            taxaConversao: 0,
            tempoMedioPipeline: 0,
            // NOVO: Estatísticas de imóveis
            totalImoveis: 0,
            totalVisitas: 0,
            visitasEfetuadas: 0,
            totalOfertas: 0,
            ofertasAceites: 0,
            totalCPCVs: 0
        };

        // Calcular estatísticas
        opportunities.forEach(opp => {
            // Por tipo
            stats.porTipo[opp.tipo] = (stats.porTipo[opp.tipo] || 0) + 1;

            // Por estado
            stats.porEstado[opp.estado] = (stats.porEstado[opp.estado] || 0) + 1;

            // Valores
            stats.valorTotal += opp.valorEstimado || 0;
            stats.comissaoEstimada += opp.comissaoEstimada || 0;

            // Estatísticas de imóveis
            if (opp.imoveis) {
                stats.totalImoveis += opp.imoveis.length;

                opp.imoveis.forEach(imovel => {
                    // Visitas
                    if (imovel.visitas) {
                        stats.totalVisitas += imovel.visitas.length;
                        stats.visitasEfetuadas += imovel.visitas.filter(v => v.estado === 'efetuada').length;
                    }

                    // Ofertas
                    if (imovel.ofertas) {
                        stats.totalOfertas += imovel.ofertas.length;
                        stats.ofertasAceites += imovel.ofertas.filter(o => o.status === 'aceite').length;
                    }

                    // CPCVs
                    if (imovel.cpcv) {
                        stats.totalCPCVs++;
                    }
                });
            }
        });

        // Taxa de conversão
        const fechadas = stats.porEstado[OPPORTUNITY_STATES.CLOSED_WON] || 0;
        const total = stats.total || 1;
        stats.taxaConversao = Math.round((fechadas / total) * 100);

        // Taxa de conversão de visitas em ofertas
        if (stats.totalVisitas > 0) {
            stats.taxaConversaoVisitas = Math.round((stats.totalOfertas / stats.totalVisitas) * 100);
        }

        // Taxa de sucesso de ofertas
        if (stats.totalOfertas > 0) {
            stats.taxaSucessoOfertas = Math.round((stats.ofertasAceites / stats.totalOfertas) * 100);
        }

        // Tempo médio no pipeline
        const tempoTotal = opportunities.reduce((acc, opp) => {
            return acc + (opp.diasEmPipeline || 0);
        }, 0);
        stats.tempoMedioPipeline = Math.round(tempoTotal / (total || 1));

        return stats;

    } catch (error) {
        console.error('OpportunityService: Erro ao calcular estatísticas:', error);
        throw new Error(`Erro ao calcular estatísticas: ${error.message}`);
    }
};

/**
 * Obter estatísticas globais do consultor
 * VERSÃO MELHORADA com métricas de performance
 */
export const getConsultorOpportunityStats = async (consultorId) => {
    try {
        const { opportunities } = await listAllOpportunities(consultorId, {
            pageSize: 1000 // Buscar todas
        });

        const stats = {
            total: opportunities.length,
            abertas: 0,
            fechadasGanhas: 0,
            fechadasPerdidas: 0,
            valorTotalPipeline: 0,
            valorTotalFechado: 0,
            comissaoEstimada: 0,
            comissaoRealizada: 0,
            taxaConversao: 0,
            oportunidadesPorCliente: {},
            topClientes: [],
            // NOVO: Métricas de performance
            totalVisitasRealizadas: 0,
            totalPropostasSubmetidas: 0,
            totalCPCVsAssinados: 0,
            mediaVisitasPorNegocio: 0
        };

        // Calcular estatísticas
        opportunities.forEach(opp => {
            // Estados
            if (opp.estado === OPPORTUNITY_STATES.CLOSED_WON) {
                stats.fechadasGanhas++;
                stats.valorTotalFechado += opp.valorEstimado || 0;
                stats.comissaoRealizada += opp.comissaoEstimada || 0;
            } else if (opp.estado === OPPORTUNITY_STATES.CLOSED_LOST) {
                stats.fechadasPerdidas++;
            } else {
                stats.abertas++;
                stats.valorTotalPipeline += opp.valorEstimado || 0;
                stats.comissaoEstimada += opp.comissaoEstimada || 0;
            }

            // Por cliente
            if (!stats.oportunidadesPorCliente[opp.clienteId]) {
                stats.oportunidadesPorCliente[opp.clienteId] = {
                    nome: opp.clienteNome,
                    total: 0,
                    valor: 0
                };
            }
            stats.oportunidadesPorCliente[opp.clienteId].total++;
            stats.oportunidadesPorCliente[opp.clienteId].valor += opp.valorEstimado || 0;

            // Métricas de performance
            if (opp.imoveis) {
                opp.imoveis.forEach(imovel => {
                    if (imovel.visitas) {
                        stats.totalVisitasRealizadas += imovel.visitas.filter(v => v.estado === 'efetuada').length;
                    }
                    if (imovel.ofertas) {
                        stats.totalPropostasSubmetidas += imovel.ofertas.filter(o => o.status === 'submetida').length;
                    }
                    if (imovel.cpcv) {
                        stats.totalCPCVsAssinados++;
                    }
                });
            }
        });

        // Taxa de conversão
        const totalFechadas = stats.fechadasGanhas + stats.fechadasPerdidas;
        if (totalFechadas > 0) {
            stats.taxaConversao = Math.round((stats.fechadasGanhas / totalFechadas) * 100);
        }

        // Média de visitas por negócio fechado
        if (stats.fechadasGanhas > 0) {
            stats.mediaVisitasPorNegocio = Math.round(stats.totalVisitasRealizadas / stats.fechadasGanhas);
        }

        // Top clientes
        stats.topClientes = Object.values(stats.oportunidadesPorCliente)
            .sort((a, b) => b.valor - a.valor)
            .slice(0, 5);

        return stats;

    } catch (error) {
        console.error('OpportunityService: Erro ao calcular estatísticas globais:', error);
        throw new Error(`Erro ao calcular estatísticas: ${error.message}`);
    }
};

// ===== BATCH OPERATIONS (mantém igual) =====
export const batchUpdateOpportunities = async (consultorId, clienteId, updates) => {
    try {
        const batch = writeBatch(db);

        for (const update of updates) {
            const { opportunityId, ...updateData } = update;
            const opportunityRef = getOpportunityDoc(consultorId, clienteId, opportunityId);

            batch.update(opportunityRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            });
        }

        await batch.commit();
        return { success: true, updatedCount: updates.length };

    } catch (error) {
        console.error('OpportunityService: Erro no batch update:', error);
        throw new Error(`Erro ao atualizar oportunidades: ${error.message}`);
    }
};

// ===== HELPER FUNCTIONS PRIVADAS =====

/**
 * Atualizar contador de oportunidades no cliente
 */
const updateClientOpportunityCount = async (consultorId, clienteId, increment) => {
    try {
        const clientRef = doc(db, CONSULTOR_COLLECTION, consultorId, CLIENTS_COLLECTION, clienteId);
        const clientDoc = await getDoc(clientRef);

        if (clientDoc.exists()) {
            const currentCount = clientDoc.data().opportunityCount || 0;
            await updateDoc(clientRef, {
                opportunityCount: currentCount + increment,
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('OpportunityService: Erro ao atualizar contador do cliente:', error);
        // Não lançar erro para não interromper a operação principal
    }
};

// ===== ALIAS PARA COMPATIBILIDADE =====
export const listAllOpportunities = async (consultorId, options = {}) => {
    try {
        const {
            tipo = null,
            estado = null,
            prioridade = null,
            orderField = 'updatedAt',
            orderDirection = 'desc',
            pageSize = DEFAULT_PAGE_SIZE
        } = options;

        // Buscar todos os clientes primeiro
        const clientsRef = collection(db, CONSULTOR_COLLECTION, consultorId, CLIENTS_COLLECTION);
        const clientsSnapshot = await getDocs(clientsRef);

        const allOpportunities = [];

        // Para cada cliente, buscar suas oportunidades
        for (const clientDoc of clientsSnapshot.docs) {
            const clientId = clientDoc.id;
            const clientData = clientDoc.data();

            const oppQuery = query(
                getOpportunityCollection(consultorId, clientId)
            );

            const oppSnapshot = await getDocs(oppQuery);

            oppSnapshot.forEach((oppDoc) => {
                const oppData = oppDoc.data();

                // Aplicar filtros em memória
                if (oppData.isActive === false) return;
                if (tipo && oppData.tipo !== tipo) return;
                if (estado && oppData.estado !== estado) return;
                if (prioridade && oppData.prioridade !== prioridade) return;

                allOpportunities.push({
                    id: oppDoc.id,
                    ...oppData,
                    clienteNome: clientData.name,
                    clienteEmail: clientData.email,
                    clienteTelefone: clientData.phone
                });
            });
        }

        // Ordenar resultados
        allOpportunities.sort((a, b) => {
            const aValue = a[orderField];
            const bValue = b[orderField];

            if (orderDirection === 'desc') {
                return bValue > aValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
        });

        // Paginar resultados
        const paginatedOpportunities = allOpportunities.slice(0, pageSize);

        return {
            opportunities: paginatedOpportunities,
            total: allOpportunities.length,
            hasMore: allOpportunities.length > pageSize
        };

    } catch (error) {
        console.error('OpportunityService: Erro ao listar todas as oportunidades:', error);
        return {
            opportunities: [],
            total: 0,
            hasMore: false
        };
    }
};

// ===== TIMELINE OPERATIONS =====

export const addTimelineEvent = async (consultorId, clienteId, opportunityId, eventData) => {
    try {
        const opportunity = await getOpportunity(consultorId, clienteId, opportunityId);

        if (!opportunity) {
            throw new Error('Oportunidade não encontrada');
        }

        const newEvent = {
            ...eventData,
            data: eventData.data || new Date().toISOString(),
            usuario: eventData.usuario || 'Sistema',
            id: Date.now().toString()
        };

        const updatedTimeline = [...(opportunity.timeline || []), newEvent];

        await updateOpportunity(consultorId, clienteId, opportunityId, {
            timeline: updatedTimeline
        });

        return newEvent;
    } catch (error) {
        console.error('OpportunityService: Erro ao adicionar evento ao timeline:', error);
        throw error;
    }
};

// ===== EXPORTS PARA MANTER COMPATIBILIDADE =====
export const createNewOpportunity = createOpportunity;
export const updateExistingOpportunity = updateOpportunity;