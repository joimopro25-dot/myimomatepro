/**
 * SERVIÇO DE NEGÓCIO PLENO
 * Gestão de negócios plenos no Firebase
 * Caminho: src/services/negocioPlenoService.js
 */

import {
    doc,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp,
    writeBatch,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    createNegocioPlenoModel,
    addTimelineEvent,
    calculateCommissions,
    calculateDeedValues,
    validateNegocioPlenoData,
    NEGOCIO_PLENO_STATES
} from '../models/negocioPlenoModel';

// Nome da coleção no Firestore
const COLLECTION_NAME = 'negociosPlenos';

/**
 * Criar um novo negócio pleno linkando duas oportunidades
 */
export const createNegocioPleno = async (oportunidadeVendedora, oportunidadeCompradora, userId) => {
    try {
        // Validar que as oportunidades existem e são válidas
        if (!oportunidadeVendedora?.id || !oportunidadeCompradora?.id) {
            throw new Error('Oportunidades inválidas para criar negócio pleno');
        }

        if (oportunidadeVendedora.tipo !== 'vendedor' && oportunidadeVendedora.tipo !== 'seller') {
            throw new Error('Primeira oportunidade deve ser do tipo vendedor');
        }

        if (oportunidadeCompradora.tipo !== 'comprador' && oportunidadeCompradora.tipo !== 'buyer') {
            throw new Error('Segunda oportunidade deve ser do tipo comprador');
        }

        // Verificar se já não existe um negócio pleno para estas oportunidades
        const existingQuery = query(
            collection(db, COLLECTION_NAME),
            where('oportunidades.vendedora.id', '==', oportunidadeVendedora.id),
            where('oportunidades.compradora.id', '==', oportunidadeCompradora.id),
            where('isActive', '==', true)
        );

        const existingDocs = await getDocs(existingQuery);
        if (!existingDocs.empty) {
            throw new Error('Já existe um negócio pleno para estas oportunidades');
        }

        // Criar o modelo do negócio pleno
        const negocioPlenoData = createNegocioPlenoModel({
            titulo: `NP: ${oportunidadeVendedora.titulo} - ${oportunidadeCompradora.titulo}`,
            estado: NEGOCIO_PLENO_STATES.LINKED,
            createdBy: userId,

            // Dados das oportunidades
            oportunidades: {
                vendedora: {
                    id: oportunidadeVendedora.id,
                    clienteId: oportunidadeVendedora.clienteId,
                    clienteNome: oportunidadeVendedora.clienteName || 'Cliente Vendedor',
                    consultorId: oportunidadeVendedora.consultorId || userId,
                    consultorNome: oportunidadeVendedora.consultorName || '',
                    titulo: oportunidadeVendedora.titulo,
                    motivoVenda: oportunidadeVendedora.vendedor?.motivoVenda || '',
                    prazoVenda: oportunidadeVendedora.vendedor?.prazoVenda || ''
                },
                compradora: {
                    id: oportunidadeCompradora.id,
                    clienteId: oportunidadeCompradora.clienteId,
                    clienteNome: oportunidadeCompradora.clienteName || 'Cliente Comprador',
                    consultorId: oportunidadeCompradora.consultorId || userId,
                    consultorNome: oportunidadeCompradora.consultorName || '',
                    titulo: oportunidadeCompradora.titulo,
                    necessitaCredito: oportunidadeCompradora.comprador?.necessitaCredito || false,
                    valorCreditoAprovado: oportunidadeCompradora.comprador?.valorCredito || 0
                }
            },

            // Dados do imóvel (pegar da oportunidade vendedora)
            imovel: {
                referencia: oportunidadeVendedora.imovelVenda?.referencia || '',
                titulo: oportunidadeVendedora.imovelVenda?.titulo || oportunidadeVendedora.titulo,
                tipologia: oportunidadeVendedora.imovelVenda?.tipologia || '',
                morada: oportunidadeVendedora.imovelVenda?.morada || '',
                freguesia: oportunidadeVendedora.imovelVenda?.freguesia || '',
                concelho: oportunidadeVendedora.imovelVenda?.concelho || '',
                distrito: oportunidadeVendedora.imovelVenda?.distrito || '',
                codigoPostal: oportunidadeVendedora.imovelVenda?.codigoPostal || '',
                numeroMatricula: oportunidadeVendedora.imovelVenda?.numeroMatricula || '',
                conservatoria: oportunidadeVendedora.imovelVenda?.conservatoria || '',
                numeroFiscal: oportunidadeVendedora.imovelVenda?.numeroFiscal || '',
                area: oportunidadeVendedora.imovelVenda?.area || 0,
                quartos: oportunidadeVendedora.imovelVenda?.quartos || 0,
                casasBanho: oportunidadeVendedora.imovelVenda?.casasBanho || 0,
                anoConstrucao: oportunidadeVendedora.imovelVenda?.anoConstrucao || '',
                certificadoEnergetico: oportunidadeVendedora.imovelVenda?.certificadoEnergetico || ''
            },

            // Valores iniciais
            valores: {
                valorPedido: oportunidadeVendedora.vendedor?.valorPedido || oportunidadeVendedora.valorEstimado || 0,
                valorProposta: 0,
                valorAcordado: 0,
                valorFinal: 0,
                sinal: 0,
                sinalPago: false,
                reforcoSinal: 0,
                reforcoSinalPago: false,
                valorEscritura: 0
            },

            // Comissões iniciais
            comissoes: {
                percentagemTotal: 5,
                valorTotal: 0,
                agenciaVendedora: {
                    nome: oportunidadeVendedora.agenciaNome || '',
                    percentagem: 50,
                    valor: 0,
                    paga: false
                },
                agenciaCompradora: {
                    nome: oportunidadeCompradora.agenciaNome || '',
                    percentagem: 50,
                    valor: 0,
                    paga: false
                },
                consultorVendedor: {
                    nome: oportunidadeVendedora.consultorName || '',
                    percentagem: 0,
                    valor: 0,
                    paga: false
                },
                consultorComprador: {
                    nome: oportunidadeCompradora.consultorName || '',
                    percentagem: 0,
                    valor: 0,
                    paga: false
                }
            }
        });

        // Adicionar evento inicial à timeline
        negocioPlenoData.timeline = addTimelineEvent([], {
            tipo: 'criacao',
            titulo: 'Negócio Pleno Criado',
            descricao: `Oportunidades linkadas: ${oportunidadeVendedora.titulo} com ${oportunidadeCompradora.titulo}`,
            usuario: userId
        });

        // Criar documento no Firestore
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...negocioPlenoData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Usar batch para atualizar ambas oportunidades atomicamente
        const batch = writeBatch(db);

        // Atualizar oportunidade vendedora
        const vendedoraRef = doc(db, 'consultores', oportunidadeVendedora.consultorId || userId, 'clientes', oportunidadeVendedora.clienteId, 'oportunidades', oportunidadeVendedora.id);
        batch.update(vendedoraRef, {
            isNegocioPleno: true,
            negocioPlenoId: docRef.id,
            linkedOpportunityId: oportunidadeCompradora.id,
            linkedOpportunityClientId: oportunidadeCompradora.clienteId,
            linkedOpportunityClientName: oportunidadeCompradora.clienteName || 'Cliente',
            negocioPlenoStatus: NEGOCIO_PLENO_STATES.LINKED,
            updatedAt: serverTimestamp()
        });

        // Atualizar oportunidade compradora
        const compradoraRef = doc(db, 'consultores', oportunidadeCompradora.consultorId || userId, 'clientes', oportunidadeCompradora.clienteId, 'oportunidades', oportunidadeCompradora.id);
        batch.update(compradoraRef, {
            isNegocioPleno: true,
            negocioPlenoId: docRef.id,
            linkedOpportunityId: oportunidadeVendedora.id,
            linkedOpportunityClientId: oportunidadeVendedora.clienteId,
            linkedOpportunityClientName: oportunidadeVendedora.clienteName || 'Cliente',
            negocioPlenoStatus: NEGOCIO_PLENO_STATES.LINKED,
            updatedAt: serverTimestamp()
        });

        // Executar batch
        await batch.commit();

        return {
            id: docRef.id,
            ...negocioPlenoData
        };
    } catch (error) {
        console.error('Erro ao criar negócio pleno:', error);
        throw error;
    }
};

/**
 * Buscar um negócio pleno específico
 */
export const fetchNegocioPleno = async (negocioPlenoId) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, negocioPlenoId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Negócio pleno não encontrado');
        }

        return {
            id: docSnap.id,
            ...docSnap.data()
        };
    } catch (error) {
        console.error('Erro ao buscar negócio pleno:', error);
        throw error;
    }
};

/**
 * Buscar negócio pleno por oportunidade
 */
export const fetchNegocioPlenoByOpportunity = async (opportunityId) => {
    try {
        // Procurar como vendedora
        let q = query(
            collection(db, COLLECTION_NAME),
            where('oportunidades.vendedora.id', '==', opportunityId),
            where('isActive', '==', true)
        );

        let querySnapshot = await getDocs(q);

        // Se não encontrou como vendedora, procurar como compradora
        if (querySnapshot.empty) {
            q = query(
                collection(db, COLLECTION_NAME),
                where('oportunidades.compradora.id', '==', opportunityId),
                where('isActive', '==', true)
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
        console.error('Erro ao buscar negócio pleno por oportunidade:', error);
        throw error;
    }
};

/**
 * Listar todos os negócios plenos
 */
export const fetchAllNegociosPlenos = async (filters = {}) => {
    try {
        let q = query(
            collection(db, COLLECTION_NAME),
            where('isActive', '==', true)
        );

        // Aplicar filtros
        if (filters.estado) {
            q = query(q, where('estado', '==', filters.estado));
        }

        if (filters.consultorId) {
            q = query(q,
                where('oportunidades.vendedora.consultorId', '==', filters.consultorId)
            );
        }

        // Ordenar por data de criação (mais recentes primeiro)
        q = query(q, orderBy('createdAt', 'desc'));

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erro ao buscar negócios plenos:', error);
        throw error;
    }
};

/**
 * Atualizar negócio pleno
 */
export const updateNegocioPleno = async (negocioPlenoId, updates, userId) => {
    try {
        // Validar dados
        const validation = validateNegocioPlenoData(updates);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
        }

        const docRef = doc(db, COLLECTION_NAME, negocioPlenoId);

        // Buscar dados atuais para comparação
        const currentDoc = await getDoc(docRef);
        if (!currentDoc.exists()) {
            throw new Error('Negócio pleno não encontrado');
        }

        const currentData = currentDoc.data();

        // Adicionar evento à timeline se houve mudança de estado
        let timelineUpdate = updates.timeline || currentData.timeline || [];
        if (updates.estado && updates.estado !== currentData.estado) {
            timelineUpdate = addTimelineEvent(timelineUpdate, {
                tipo: 'mudanca_estado',
                titulo: 'Estado Alterado',
                descricao: `De ${currentData.estado} para ${updates.estado}`,
                usuario: userId,
                dados: {
                    estadoAnterior: currentData.estado,
                    estadoNovo: updates.estado
                }
            });
        }

        // Recalcular comissões se valor acordado mudou
        if (updates.valores?.valorAcordado && updates.valores.valorAcordado !== currentData.valores?.valorAcordado) {
            const comissoes = calculateCommissions(
                updates.valores.valorAcordado,
                currentData.comissoes?.percentagemTotal || 5,
                {
                    vendedora: currentData.comissoes?.agenciaVendedora?.percentagem || 50,
                    compradora: currentData.comissoes?.agenciaCompradora?.percentagem || 50
                }
            );

            updates.comissoes = {
                ...currentData.comissoes,
                ...updates.comissoes,
                valorTotal: comissoes.valorTotal,
                agenciaVendedora: {
                    ...currentData.comissoes?.agenciaVendedora,
                    valor: comissoes.valorAgenciaVendedora
                },
                agenciaCompradora: {
                    ...currentData.comissoes?.agenciaCompradora,
                    valor: comissoes.valorAgenciaCompradora
                }
            };

            // Adicionar evento à timeline
            timelineUpdate = addTimelineEvent(timelineUpdate, {
                tipo: 'valor_alterado',
                titulo: 'Valor Acordado Atualizado',
                descricao: `Novo valor: €${updates.valores.valorAcordado}`,
                usuario: userId,
                dados: {
                    valorAnterior: currentData.valores?.valorAcordado || 0,
                    valorNovo: updates.valores.valorAcordado
                }
            });
        }

        // Recalcular valor da escritura se sinal mudou
        if ((updates.valores?.sinal || updates.valores?.reforcoSinal) && updates.valores?.valorAcordado) {
            const deedValues = calculateDeedValues(
                updates.valores.valorAcordado || currentData.valores?.valorAcordado || 0,
                updates.valores.sinal || currentData.valores?.sinal || 0,
                updates.valores.reforcoSinal || currentData.valores?.reforcoSinal || 0
            );

            updates.valores = {
                ...updates.valores,
                valorEscritura: deedValues.valorEscritura
            };
        }

        // Incrementar versão
        const version = (currentData.version || 0) + 1;

        // Atualizar documento
        await updateDoc(docRef, {
            ...updates,
            timeline: timelineUpdate,
            lastModifiedBy: userId,
            version: version,
            updatedAt: serverTimestamp()
        });

        // Se mudou de estado, atualizar também as oportunidades
        if (updates.estado && updates.estado !== currentData.estado) {
            const batch = writeBatch(db);

            // Atualizar oportunidade vendedora
            const vendedoraRef = doc(
                db,
                'consultores',
                currentData.oportunidades.vendedora.consultorId,
                'clientes',
                currentData.oportunidades.vendedora.clienteId,
                'oportunidades',
                currentData.oportunidades.vendedora.id
            );
            batch.update(vendedoraRef, {
                negocioPlenoStatus: updates.estado,
                updatedAt: serverTimestamp()
            });

            // Atualizar oportunidade compradora
            const compradoraRef = doc(
                db,
                'consultores',
                currentData.oportunidades.compradora.consultorId,
                'clientes',
                currentData.oportunidades.compradora.clienteId,
                'oportunidades',
                currentData.oportunidades.compradora.id
            );
            batch.update(compradoraRef, {
                negocioPlenoStatus: updates.estado,
                updatedAt: serverTimestamp()
            });

            await batch.commit();
        }

        return {
            id: negocioPlenoId,
            ...currentData,
            ...updates,
            timeline: timelineUpdate,
            version,
            updatedAt: new Date()
        };
    } catch (error) {
        console.error('Erro ao atualizar negócio pleno:', error);
        throw error;
    }
};

/**
 * Deslinkar negócio pleno (soft delete)
 */
export const unlinkNegocioPleno = async (negocioPlenoId, userId, motivo = '') => {
    try {
        const docRef = doc(db, COLLECTION_NAME, negocioPlenoId);

        // Buscar dados atuais
        const currentDoc = await getDoc(docRef);
        if (!currentDoc.exists()) {
            throw new Error('Negócio pleno não encontrado');
        }

        const currentData = currentDoc.data();

        // Adicionar evento à timeline
        const timelineUpdate = addTimelineEvent(currentData.timeline || [], {
            tipo: 'desvinculacao',
            titulo: 'Negócio Pleno Desvinculado',
            descricao: motivo || 'Oportunidades desvinculadas',
            usuario: userId
        });

        // Usar batch para atualizar tudo atomicamente
        const batch = writeBatch(db);

        // Marcar negócio pleno como inativo
        batch.update(docRef, {
            isActive: false,
            estado: NEGOCIO_PLENO_STATES.CANCELLED,
            motivoCancelamento: motivo,
            canceladoPor: userId,
            canceladoEm: serverTimestamp(),
            timeline: timelineUpdate,
            updatedAt: serverTimestamp()
        });

        // Remover referências das oportunidades
        const vendedoraRef = doc(
            db,
            'consultores',
            currentData.oportunidades.vendedora.consultorId,
            'clientes',
            currentData.oportunidades.vendedora.clienteId,
            'oportunidades',
            currentData.oportunidades.vendedora.id
        );
        batch.update(vendedoraRef, {
            isNegocioPleno: false,
            negocioPlenoId: null,
            linkedOpportunityId: null,
            linkedOpportunityClientId: null,
            linkedOpportunityClientName: null,
            negocioPlenoStatus: null,
            updatedAt: serverTimestamp()
        });

        const compradoraRef = doc(
            db,
            'consultores',
            currentData.oportunidades.compradora.consultorId,
            'clientes',
            currentData.oportunidades.compradora.clienteId,
            'oportunidades',
            currentData.oportunidades.compradora.id
        );
        batch.update(compradoraRef, {
            isNegocioPleno: false,
            negocioPlenoId: null,
            linkedOpportunityId: null,
            linkedOpportunityClientId: null,
            linkedOpportunityClientName: null,
            negocioPlenoStatus: null,
            updatedAt: serverTimestamp()
        });

        // Executar batch
        await batch.commit();

        return true;
    } catch (error) {
        console.error('Erro ao deslinkar negócio pleno:', error);
        throw error;
    }
};

/**
 * Adicionar tarefa ao negócio pleno
 */
export const addTaskToNegocioPleno = async (negocioPlenoId, task, userId) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, negocioPlenoId);
        const currentDoc = await getDoc(docRef);

        if (!currentDoc.exists()) {
            throw new Error('Negócio pleno não encontrado');
        }

        const currentData = currentDoc.data();
        const tarefas = currentData.tarefas || [];

        const newTask = {
            id: `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            titulo: task.titulo,
            descricao: task.descricao || '',
            tipo: task.tipo || 'geral',
            prioridade: task.prioridade || 'media',
            dataLimite: task.dataLimite || null,
            responsavel: task.responsavel || userId,
            concluida: false,
            criadaPor: userId,
            criadaEm: Timestamp.now()
        };

        tarefas.push(newTask);

        // Adicionar evento à timeline
        const timelineUpdate = addTimelineEvent(currentData.timeline || [], {
            tipo: 'tarefa_criada',
            titulo: 'Nova Tarefa Adicionada',
            descricao: task.titulo,
            usuario: userId,
            dados: { tarefaId: newTask.id }
        });

        await updateDoc(docRef, {
            tarefas,
            timeline: timelineUpdate,
            updatedAt: serverTimestamp()
        });

        return newTask;
    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
        throw error;
    }
};

/**
 * Atualizar tarefa do negócio pleno
 */
export const updateTaskInNegocioPleno = async (negocioPlenoId, taskId, updates, userId) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, negocioPlenoId);
        const currentDoc = await getDoc(docRef);

        if (!currentDoc.exists()) {
            throw new Error('Negócio pleno não encontrado');
        }

        const currentData = currentDoc.data();
        const tarefas = currentData.tarefas || [];

        const taskIndex = tarefas.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            throw new Error('Tarefa não encontrada');
        }

        tarefas[taskIndex] = {
            ...tarefas[taskIndex],
            ...updates,
            atualizadaPor: userId,
            atualizadaEm: Timestamp.now()
        };

        // Adicionar evento à timeline se tarefa foi concluída
        let timelineUpdate = currentData.timeline || [];
        if (updates.concluida && !currentData.tarefas[taskIndex].concluida) {
            timelineUpdate = addTimelineEvent(timelineUpdate, {
                tipo: 'tarefa_concluida',
                titulo: 'Tarefa Concluída',
                descricao: tarefas[taskIndex].titulo,
                usuario: userId,
                dados: { tarefaId: taskId }
            });
        }

        await updateDoc(docRef, {
            tarefas,
            timeline: timelineUpdate,
            updatedAt: serverTimestamp()
        });

        return tarefas[taskIndex];
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        throw error;
    }
};

/**
 * Adicionar documento ao negócio pleno
 */
export const addDocumentToNegocioPleno = async (negocioPlenoId, documento, userId) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, negocioPlenoId);
        const currentDoc = await getDoc(docRef);

        if (!currentDoc.exists()) {
            throw new Error('Negócio pleno não encontrado');
        }

        const currentData = currentDoc.data();
        const outrosDocumentos = currentData.documentacao?.outrosDocumentos || [];

        const newDoc = {
            id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nome: documento.nome,
            tipo: documento.tipo,
            url: documento.url,
            tamanho: documento.tamanho || 0,
            uploadedBy: userId,
            uploadedAt: Timestamp.now()
        };

        outrosDocumentos.push(newDoc);

        // Adicionar evento à timeline
        const timelineUpdate = addTimelineEvent(currentData.timeline || [], {
            tipo: 'documento_adicionado',
            titulo: 'Documento Adicionado',
            descricao: documento.nome,
            usuario: userId,
            dados: { documentoId: newDoc.id, tipoDocumento: documento.tipo }
        });

        await updateDoc(docRef, {
            'documentacao.outrosDocumentos': outrosDocumentos,
            timeline: timelineUpdate,
            updatedAt: serverTimestamp()
        });

        return newDoc;
    } catch (error) {
        console.error('Erro ao adicionar documento:', error);
        throw error;
    }
};

/**
 * Subscrever a mudanças em tempo real de um negócio pleno
 */
export const subscribeToNegocioPleno = (negocioPlenoId, callback) => {
    const docRef = doc(db, COLLECTION_NAME, negocioPlenoId);

    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback({
                id: doc.id,
                ...doc.data()
            });
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('Erro ao subscrever negócio pleno:', error);
        callback(null, error);
    });
};

/**
 * Buscar estatísticas de negócios plenos
 */
export const fetchNegocioPlenoStats = async (consultorId = null) => {
    try {
        let q = query(
            collection(db, COLLECTION_NAME),
            where('isActive', '==', true)
        );

        if (consultorId) {
            // Filtrar por consultor (vendedor ou comprador)
            q = query(q,
                where('oportunidades.vendedora.consultorId', '==', consultorId)
            );
        }

        const querySnapshot = await getDocs(q);
        const negociosPlenos = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calcular estatísticas
        const stats = {
            total: negociosPlenos.length,
            porEstado: {},
            valorTotal: 0,
            comissaoTotal: 0,
            negociosConcluidos: 0,
            negociosAtivos: 0,
            tempoMedioConclusao: 0
        };

        // Contar por estado
        negociosPlenos.forEach(np => {
            const estado = np.estado || 'unknown';
            stats.porEstado[estado] = (stats.porEstado[estado] || 0) + 1;

            // Somar valores
            stats.valorTotal += np.valores?.valorAcordado || 0;
            stats.comissaoTotal += np.comissoes?.valorTotal || 0;

            // Contar concluídos e ativos
            if (np.estado === NEGOCIO_PLENO_STATES.COMPLETED) {
                stats.negociosConcluidos++;
            } else if (np.estado !== NEGOCIO_PLENO_STATES.CANCELLED) {
                stats.negociosAtivos++;
            }
        });

        // Calcular taxa de conversão
        stats.taxaConversao = stats.total > 0
            ? (stats.negociosConcluidos / stats.total) * 100
            : 0;

        return stats;
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
    }
};

export default {
    createNegocioPleno,
    fetchNegocioPleno,
    fetchNegocioPlenoByOpportunity,
    fetchAllNegociosPlenos,
    updateNegocioPleno,
    unlinkNegocioPleno,
    addTaskToNegocioPleno,
    updateTaskInNegocioPleno,
    addDocumentToNegocioPleno,
    subscribeToNegocioPleno,
    fetchNegocioPlenoStats
};