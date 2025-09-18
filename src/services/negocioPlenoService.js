/**
 * NEGOCIO PLENO SERVICE - MyImoMatePro
 * Serviço para gestão de negócios plenos (ligação vendedor-comprador)
 * 
 * Caminho: src/services/negocioPlenoService.js
 * Estrutura: consultores/{consultorId}/negociosPlenos/{negocioPlenoId}
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
    serverTimestamp,
    runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    createNegocioPlenoSchema,
    validateNegocioPlenoData,
    NEGOCIO_PLENO_STATES,
    NEGOCIO_TIMELINE_EVENTS,
    createTimelineEvent,
    calculateBusinessValues,
    calculateCommissions,
    canTransitionToState,
    generateBusinessNumber
} from '../models/negocioPlenoModel';

// ===== CONFIGURAÇÕES =====
const NEGOCIOS_COLLECTION = 'negociosPlenos';
const CONSULTORES_COLLECTION = 'consultores';
const CLIENTES_COLLECTION = 'clientes';
const OPORTUNIDADES_COLLECTION = 'oportunidades';
const DEFAULT_PAGE_SIZE = 20;

// ===== HELPER FUNCTIONS =====

/**
 * Obter referência da coleção de negócios plenos
 */
const getNegociosCollection = (consultorId) => {
    return collection(
        db,
        CONSULTORES_COLLECTION,
        consultorId,
        NEGOCIOS_COLLECTION
    );
};

/**
 * Obter referência de um documento de negócio pleno
 */
const getNegocioDoc = (consultorId, negocioPlenoId) => {
    return doc(
        db,
        CONSULTORES_COLLECTION,
        consultorId,
        NEGOCIOS_COLLECTION,
        negocioPlenoId
    );
};

/**
 * Obter referência de uma oportunidade
 */
const getOpportunityDoc = (consultorId, clienteId, opportunityId) => {
    return doc(
        db,
        CONSULTORES_COLLECTION,
        consultorId,
        CLIENTES_COLLECTION,
        clienteId,
        OPORTUNIDADES_COLLECTION,
        opportunityId
    );
};

// ===== CREATE OPERATIONS =====

/**
 * Criar negócio pleno linkando duas oportunidades
 * @param {string} consultorId - ID do consultor
 * @param {Object} linkData - Dados das oportunidades a linkar
 * @returns {Promise<Object>} Negócio pleno criado
 */
export const createNegocioPleno = async (consultorId, linkData) => {
    try {
        console.log('NegocioPlenoService: Criando negócio pleno', { consultorId, linkData });

        // Validar dados básicos
        if (!linkData.oportunidadeVendedora || !linkData.oportunidadeCompradora) {
            throw new Error('Dados das oportunidades são obrigatórios');
        }

        // Buscar dados completos das duas oportunidades
        const [vendedorDoc, compradorDoc] = await Promise.all([
            getDoc(getOpportunityDoc(
                consultorId,
                linkData.oportunidadeVendedora.clienteId,
                linkData.oportunidadeVendedora.id
            )),
            getDoc(getOpportunityDoc(
                consultorId,
                linkData.oportunidadeCompradora.clienteId,
                linkData.oportunidadeCompradora.id
            ))
        ]);

        if (!vendedorDoc.exists() || !compradorDoc.exists()) {
            throw new Error('Uma ou ambas oportunidades não existem');
        }

        const vendedorData = vendedorDoc.data();
        const compradorData = compradorDoc.data();

        // Verificar tipos de oportunidade
        if (vendedorData.tipo !== 'vendedor' && vendedorData.tipo !== 'senhorio') {
            throw new Error('A oportunidade vendedora deve ser do tipo vendedor ou senhorio');
        }

        if (compradorData.tipo !== 'comprador' && compradorData.tipo !== 'inquilino') {
            throw new Error('A oportunidade compradora deve ser do tipo comprador ou inquilino');
        }

        // Verificar se já existe negócio pleno para essas oportunidades
        const existingQuery = query(
            getNegociosCollection(consultorId),
            where('oportunidades.vendedora.id', '==', linkData.oportunidadeVendedora.id),
            where('oportunidades.compradora.id', '==', linkData.oportunidadeCompradora.id),
            where('isActive', '==', true)
        );

        const existingDocs = await getDocs(existingQuery);
        if (!existingDocs.empty) {
            throw new Error('Já existe um negócio pleno ativo para estas oportunidades');
        }

        // Usar transação para garantir consistência
        const result = await runTransaction(db, async (transaction) => {
            // Preparar dados do negócio pleno
            const negocioPlenoData = {
                createdBy: linkData.userId || consultorId,
                consultorId,

                // Dados das oportunidades
                oportunidades: {
                    vendedora: {
                        id: linkData.oportunidadeVendedora.id,
                        clienteId: linkData.oportunidadeVendedora.clienteId,
                        clienteNome: linkData.oportunidadeVendedora.clienteNome || vendedorData.clienteNome || '',
                        clienteContacto: linkData.oportunidadeVendedora.clienteContacto || vendedorData.clienteContacto || '',
                        titulo: vendedorData.titulo || ''
                    },
                    compradora: {
                        id: linkData.oportunidadeCompradora.id,
                        clienteId: linkData.oportunidadeCompradora.clienteId,
                        clienteNome: linkData.oportunidadeCompradora.clienteNome || compradorData.clienteNome || '',
                        clienteContacto: linkData.oportunidadeCompradora.clienteContacto || compradorData.clienteContacto || '',
                        titulo: compradorData.titulo || ''
                    }
                },

                // Estado inicial
                estado: NEGOCIO_PLENO_STATES.PROSPECTING,
                numeroNegocio: generateBusinessNumber(),
                titulo: linkData.titulo || `Negócio: ${vendedorData.titulo || 'Vendedor'} - ${compradorData.titulo || 'Comprador'}`,
                descricao: linkData.descricao || '',

                // Migrar dados do imóvel (se existir)
                imovel: {
                    ...vendedorData.imovel,
                    ...linkData.imovel // Permite sobrescrever com dados novos
                },

                // Valores iniciais
                valores: {
                    valorPedido: vendedorData.valorEstimado || 0,
                    valorProposto: compradorData.valorMaximo || 0,
                    valorAcordado: linkData.valores?.valorAcordado || 0,
                    sinal: 0,
                    sinalPercentagem: 10,
                    ...linkData.valores
                },

                // Comissões
                comissoes: {
                    percentagemTotal: vendedorData.percentualComissao || 5,
                    percentagemVendedor: 50,
                    percentagemComprador: 50,
                    ...linkData.comissoes
                },

                // Timeline inicial
                timeline: [
                    createTimelineEvent(
                        NEGOCIO_TIMELINE_EVENTS.CREATED,
                        'Negócio pleno criado',
                        {
                            userId: linkData.userId || consultorId,
                            oportunidadeVendedora: linkData.oportunidadeVendedora.id,
                            oportunidadeCompradora: linkData.oportunidadeCompradora.id
                        }
                    )
                ]
            };

            // Criar schema validado
            const negocioPlenoSchema = createNegocioPlenoSchema(negocioPlenoData);

            // Validar dados
            const validation = validateNegocioPlenoData(negocioPlenoSchema);
            if (!validation.isValid) {
                throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
            }

            // Criar documento do negócio pleno
            const negocioRef = doc(getNegociosCollection(consultorId));
            transaction.set(negocioRef, {
                ...negocioPlenoSchema,
                id: negocioRef.id,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Atualizar oportunidade vendedora
            const vendedorRef = getOpportunityDoc(
                consultorId,
                linkData.oportunidadeVendedora.clienteId,
                linkData.oportunidadeVendedora.id
            );
            transaction.update(vendedorRef, {
                isNegocioPleno: true,
                negocioPlenoId: negocioRef.id,
                linkedOpportunityId: linkData.oportunidadeCompradora.id,
                linkedOpportunityClientId: linkData.oportunidadeCompradora.clienteId,
                linkedOpportunityClientName: linkData.oportunidadeCompradora.clienteNome || '',
                linkedType: 'vendedor_para_comprador',
                updatedAt: serverTimestamp()
            });

            // Atualizar oportunidade compradora
            const compradorRef = getOpportunityDoc(
                consultorId,
                linkData.oportunidadeCompradora.clienteId,
                linkData.oportunidadeCompradora.id
            );
            transaction.update(compradorRef, {
                isNegocioPleno: true,
                negocioPlenoId: negocioRef.id,
                linkedOpportunityId: linkData.oportunidadeVendedora.id,
                linkedOpportunityClientId: linkData.oportunidadeVendedora.clienteId,
                linkedOpportunityClientName: linkData.oportunidadeVendedora.clienteNome || '',
                linkedType: 'comprador_para_vendedor',
                updatedAt: serverTimestamp()
            });

            return {
                id: negocioRef.id,
                ...negocioPlenoSchema
            };
        });

        console.log('NegocioPlenoService: Negócio pleno criado com sucesso', result.id);
        return result;

    } catch (error) {
        console.error('NegocioPlenoService: Erro ao criar negócio pleno', error);
        throw error;
    }
};

// ===== READ OPERATIONS =====

/**
 * Obter negócio pleno por ID
 */
export const getNegocioPleno = async (consultorId, negocioPlenoId) => {
    try {
        const docRef = getNegocioDoc(consultorId, negocioPlenoId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Negócio pleno não encontrado');
        }

        return {
            id: docSnap.id,
            ...docSnap.data()
        };
    } catch (error) {
        console.error('NegocioPlenoService: Erro ao buscar negócio pleno', error);
        throw error;
    }
};

/**
 * Listar negócios plenos do consultor
 */
export const listNegociosPlenos = async (consultorId, filters = {}) => {
    try {
        let q = query(
            getNegociosCollection(consultorId),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc')
        );

        // Aplicar filtros
        if (filters.estado) {
            q = query(q, where('estado', '==', filters.estado));
        }

        if (filters.clienteId) {
            q = query(q,
                where('oportunidades.vendedora.clienteId', '==', filters.clienteId)
            );
        }

        // Paginação
        if (filters.pageSize) {
            q = query(q, limit(filters.pageSize));
        }

        if (filters.lastDoc) {
            q = query(q, startAfter(filters.lastDoc));
        }

        const querySnapshot = await getDocs(q);
        const negociosPlenos = [];

        querySnapshot.forEach((doc) => {
            negociosPlenos.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            negociosPlenos,
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
            hasMore: querySnapshot.docs.length === (filters.pageSize || DEFAULT_PAGE_SIZE)
        };

    } catch (error) {
        console.error('NegocioPlenoService: Erro ao listar negócios plenos', error);
        throw error;
    }
};

/**
 * Buscar negócio pleno por oportunidade
 */
export const getNegocioPlenoByOpportunity = async (consultorId, opportunityId) => {
    try {
        // Buscar como vendedora
        let q = query(
            getNegociosCollection(consultorId),
            where('oportunidades.vendedora.id', '==', opportunityId),
            where('isActive', '==', true),
            limit(1)
        );

        let querySnapshot = await getDocs(q);

        // Se não encontrar, buscar como compradora
        if (querySnapshot.empty) {
            q = query(
                getNegociosCollection(consultorId),
                where('oportunidades.compradora.id', '==', opportunityId),
                where('isActive', '==', true),
                limit(1)
            );
            querySnapshot = await getDocs(q);
        }

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };

    } catch (error) {
        console.error('NegocioPlenoService: Erro ao buscar negócio pleno por oportunidade', error);
        throw error;
    }
};

// ===== UPDATE OPERATIONS =====

/**
 * Atualizar dados do negócio pleno
 */
export const updateNegocioPleno = async (consultorId, negocioPlenoId, updateData) => {
    try {
        console.log('NegocioPlenoService: Atualizando negócio pleno', { negocioPlenoId, updateData });

        const docRef = getNegocioDoc(consultorId, negocioPlenoId);

        // Buscar documento atual
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error('Negócio pleno não encontrado');
        }

        const currentData = docSnap.data();

        // Preparar dados para atualização
        const updatedData = {
            ...updateData,
            updatedAt: serverTimestamp()
        };

        // Se estiver mudando o estado, verificar se é permitido
        if (updateData.estado && updateData.estado !== currentData.estado) {
            if (!canTransitionToState(currentData.estado, updateData.estado)) {
                throw new Error(`Não é possível mudar de ${currentData.estado} para ${updateData.estado}`);
            }

            // Adicionar evento à timeline
            if (!updatedData.timeline) {
                updatedData.timeline = currentData.timeline || [];
            }

            updatedData.timeline.push(
                createTimelineEvent(
                    NEGOCIO_TIMELINE_EVENTS.STATE_CHANGED,
                    `Estado alterado de ${currentData.estado} para ${updateData.estado}`,
                    {
                        userId: updateData.userId,
                        oldState: currentData.estado,
                        newState: updateData.estado
                    }
                )
            );
        }

        // Se estiver atualizando valores, recalcular
        if (updateData.valores) {
            const valorAcordado = updateData.valores.valorAcordado || currentData.valores.valorAcordado;
            const sinalPercentagem = updateData.valores.sinalPercentagem || currentData.valores.sinalPercentagem;
            const reforcoPercentagem = updateData.valores.reforcoPercentagem || currentData.valores.reforcoPercentagem;

            const calculatedValues = calculateBusinessValues(
                valorAcordado,
                sinalPercentagem,
                reforcoPercentagem
            );

            updatedData.valores = {
                ...currentData.valores,
                ...updateData.valores,
                ...calculatedValues
            };

            // Recalcular comissões
            if (valorAcordado) {
                const comissoes = calculateCommissions(
                    valorAcordado,
                    updateData.comissoes?.percentagemTotal || currentData.comissoes.percentagemTotal,
                    {
                        vendedor: updateData.comissoes?.percentagemVendedor || currentData.comissoes.percentagemVendedor,
                        comprador: updateData.comissoes?.percentagemComprador || currentData.comissoes.percentagemComprador
                    }
                );

                updatedData.comissoes = {
                    ...currentData.comissoes,
                    ...updateData.comissoes,
                    ...comissoes
                };
            }
        }

        // Validar dados atualizados
        const validation = validateNegocioPlenoData({
            ...currentData,
            ...updatedData
        });

        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
        }

        // Atualizar documento
        await updateDoc(docRef, updatedData);

        console.log('NegocioPlenoService: Negócio pleno atualizado com sucesso');
        return {
            id: negocioPlenoId,
            ...currentData,
            ...updatedData
        };

    } catch (error) {
        console.error('NegocioPlenoService: Erro ao atualizar negócio pleno', error);
        throw error;
    }
};

/**
 * Adicionar evento à timeline
 */
export const addTimelineEventToNegocio = async (consultorId, negocioPlenoId, eventData) => {
    try {
        const docRef = getNegocioDoc(consultorId, negocioPlenoId);

        // Buscar documento atual
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error('Negócio pleno não encontrado');
        }

        const currentData = docSnap.data();
        const timeline = currentData.timeline || [];

        // Criar novo evento
        const newEvent = createTimelineEvent(
            eventData.tipo,
            eventData.descricao,
            eventData.dados
        );

        timeline.push(newEvent);

        // Atualizar documento
        await updateDoc(docRef, {
            timeline,
            updatedAt: serverTimestamp()
        });

        return newEvent;

    } catch (error) {
        console.error('NegocioPlenoService: Erro ao adicionar evento à timeline', error);
        throw error;
    }
};

/**
 * Atualizar checklist
 */
export const updateChecklist = async (consultorId, negocioPlenoId, checklistItem, value) => {
    try {
        const docRef = getNegocioDoc(consultorId, negocioPlenoId);

        const updateData = {
            [`checklist.${checklistItem}`]: value,
            updatedAt: serverTimestamp()
        };

        await updateDoc(docRef, updateData);

        // Adicionar evento à timeline
        await addTimelineEventToNegocio(consultorId, negocioPlenoId, {
            tipo: NEGOCIO_TIMELINE_EVENTS.NOTE_ADDED,
            descricao: `Checklist atualizado: ${checklistItem} = ${value}`,
            dados: { checklistItem, value }
        });

        return true;

    } catch (error) {
        console.error('NegocioPlenoService: Erro ao atualizar checklist', error);
        throw error;
    }
};

// ===== DELETE/DEACTIVATE OPERATIONS =====

/**
 * Deslinkar oportunidades e desativar negócio pleno
 */
export const unlinkNegocioPleno = async (consultorId, negocioPlenoId) => {
    try {
        console.log('NegocioPlenoService: Deslinkando negócio pleno', negocioPlenoId);

        // Usar transação para garantir consistência
        await runTransaction(db, async (transaction) => {
            const docRef = getNegocioDoc(consultorId, negocioPlenoId);
            const docSnap = await transaction.get(docRef);

            if (!docSnap.exists()) {
                throw new Error('Negócio pleno não encontrado');
            }

            const negocioData = docSnap.data();

            // Desativar negócio pleno
            transaction.update(docRef, {
                isActive: false,
                estado: NEGOCIO_PLENO_STATES.CANCELLED,
                updatedAt: serverTimestamp(),
                timeline: [
                    ...(negocioData.timeline || []),
                    createTimelineEvent(
                        NEGOCIO_TIMELINE_EVENTS.UNLINKED,
                        'Oportunidades deslinkadas e negócio cancelado',
                        { userId: consultorId }
                    )
                ]
            });

            // Atualizar oportunidade vendedora
            const vendedorRef = getOpportunityDoc(
                consultorId,
                negocioData.oportunidades.vendedora.clienteId,
                negocioData.oportunidades.vendedora.id
            );
            transaction.update(vendedorRef, {
                isNegocioPleno: false,
                negocioPlenoId: null,
                linkedOpportunityId: null,
                linkedOpportunityClientId: null,
                linkedOpportunityClientName: null,
                linkedType: null,
                updatedAt: serverTimestamp()
            });

            // Atualizar oportunidade compradora
            const compradorRef = getOpportunityDoc(
                consultorId,
                negocioData.oportunidades.compradora.clienteId,
                negocioData.oportunidades.compradora.id
            );
            transaction.update(compradorRef, {
                isNegocioPleno: false,
                negocioPlenoId: null,
                linkedOpportunityId: null,
                linkedOpportunityClientId: null,
                linkedOpportunityClientName: null,
                linkedType: null,
                updatedAt: serverTimestamp()
            });
        });

        console.log('NegocioPlenoService: Negócio pleno deslinkado com sucesso');
        return true;

    } catch (error) {
        console.error('NegocioPlenoService: Erro ao deslinkar negócio pleno', error);
        throw error;
    }
};

/**
 * Arquivar negócio pleno
 */
export const archiveNegocioPleno = async (consultorId, negocioPlenoId, userId) => {
    try {
        const docRef = getNegocioDoc(consultorId, negocioPlenoId);

        await updateDoc(docRef, {
            isActive: false,
            isArchived: true,
            archivedAt: serverTimestamp(),
            archivedBy: userId,
            updatedAt: serverTimestamp()
        });

        return true;

    } catch (error) {
        console.error('NegocioPlenoService: Erro ao arquivar negócio pleno', error);
        throw error;
    }
};

// ===== UTILITY OPERATIONS =====

/**
 * Obter estatísticas dos negócios plenos
 */
export const getNegocioPlenoStats = async (consultorId) => {
    try {
        const q = query(
            getNegociosCollection(consultorId),
            where('isActive', '==', true)
        );

        const querySnapshot = await getDocs(q);

        const stats = {
            total: 0,
            porEstado: {},
            valorTotal: 0,
            comissaoTotal: 0,
            porMes: {}
        };

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Total
            stats.total++;

            // Por estado
            if (!stats.porEstado[data.estado]) {
                stats.porEstado[data.estado] = 0;
            }
            stats.porEstado[data.estado]++;

            // Valores
            stats.valorTotal += data.valores?.valorAcordado || 0;
            stats.comissaoTotal += data.comissoes?.valorTotal || 0;

            // Por mês
            if (data.createdAt) {
                const date = data.createdAt.toDate();
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!stats.porMes[monthKey]) {
                    stats.porMes[monthKey] = 0;
                }
                stats.porMes[monthKey]++;
            }
        });

        return stats;

    } catch (error) {
        console.error('NegocioPlenoService: Erro ao obter estatísticas', error);
        throw error;
    }
};

/**
 * Migrar dados de oportunidades existentes para negócio pleno
 */
export const migrateDataToNegocioPleno = async (consultorId, negocioPlenoId, sourceType, data) => {
    try {
        const docRef = getNegocioDoc(consultorId, negocioPlenoId);

        let updateData = {};

        switch (sourceType) {
            case 'cpcv':
                updateData = {
                    'cpcv': data,
                    'estado': NEGOCIO_PLENO_STATES.CPCV_SIGNED,
                    updatedAt: serverTimestamp()
                };
                break;

            case 'proposta':
                updateData = {
                    'valores.valorProposto': data.valorProposto,
                    'valores.sinal': data.sinal,
                    'estado': NEGOCIO_PLENO_STATES.PROPOSAL,
                    updatedAt: serverTimestamp()
                };
                break;

            case 'escritura':
                updateData = {
                    'escritura': data,
                    'estado': NEGOCIO_PLENO_STATES.DEED_SCHEDULED,
                    updatedAt: serverTimestamp()
                };
                break;

            default:
                throw new Error('Tipo de migração não suportado');
        }

        await updateDoc(docRef, updateData);

        // Adicionar evento à timeline
        await addTimelineEventToNegocio(consultorId, negocioPlenoId, {
            tipo: NEGOCIO_TIMELINE_EVENTS.NOTE_ADDED,
            descricao: `Dados migrados: ${sourceType}`,
            dados: { sourceType, migratedData: data }
        });

        return true;

    } catch (error) {
        console.error('NegocioPlenoService: Erro ao migrar dados', error);
        throw error;
    }
};

// ===== EXPORT ALL FUNCTIONS =====
export default {
    // Create
    createNegocioPleno,

    // Read
    getNegocioPleno,
    listNegociosPlenos,
    getNegocioPlenoByOpportunity,

    // Update
    updateNegocioPleno,
    addTimelineEventToNegocio,
    updateChecklist,

    // Delete/Deactivate
    unlinkNegocioPleno,
    archiveNegocioPleno,

    // Utility
    getNegocioPlenoStats,
    migrateDataToNegocioPleno
};