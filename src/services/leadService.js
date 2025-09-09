/**
 * LEAD SERVICE - MyImoMatePro
 * CRUD completo para gestão de leads no Firestore
 * 
 * Caminho: src/services/leadService.js
 * Estrutura: consultores/{consultorId}/leads/{leadId}
 * 
 * ✅ CORRIGIDO: Validação de IDs na função getLeads
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
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    createLeadSchema,
    createTaskSchema,
    createContactoSchema,
    validateLeadData,
    validateTaskData,
    calculateLeadTemperature,
    calculateLeadScore,
    getNextRecommendedAction,
    needsAlert,
    LEAD_STATUS,
    TASK_STATUS
} from '../models/leadModel';

// ===== CONFIGURAÇÕES =====
const COLLECTION_NAME = 'leads';
const TASKS_COLLECTION = 'tasks';
const CONTACTS_COLLECTION = 'contacts';
const CONSULTOR_COLLECTION = 'consultores';
const CLIENTS_COLLECTION = 'clientes';
const DEFAULT_PAGE_SIZE = 20;

// ===== HELPER FUNCTIONS =====
const getLeadCollection = (consultorId) => {
    return collection(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME);
};

const getLeadDoc = (consultorId, leadId) => {
    return doc(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME, leadId);
};

const getTaskCollection = (consultorId, leadId) => {
    return collection(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME, leadId, TASKS_COLLECTION);
};

const getContactCollection = (consultorId, leadId) => {
    return collection(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME, leadId, CONTACTS_COLLECTION);
};

// ===== CREATE OPERATIONS =====

/**
 * Criar nova lead
 */
export const createLead = async (consultorId, leadData) => {
    try {
        // Validar dados
        const validation = validateLeadData(leadData);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
        }

        // Criar schema da lead
        const leadSchema = createLeadSchema(leadData);
        leadSchema.consultorId = consultorId;

        // Calcular score inicial
        leadSchema.score = calculateLeadScore(leadSchema);

        // Adicionar ao Firestore
        const leadRef = await addDoc(getLeadCollection(consultorId), leadSchema);

        return {
            id: leadRef.id,
            ...leadSchema
        };
    } catch (error) {
        console.error('Erro ao criar lead:', error);
        throw error;
    }
};

/**
 * Criar leads em lote
 */
export const createLeadsBatch = async (consultorId, leadsData) => {
    try {
        const batch = writeBatch(db);
        const leads = [];

        for (const leadData of leadsData) {
            const validation = validateLeadData(leadData);
            if (!validation.isValid) {
                console.warn('Lead inválida ignorada:', validation.errors);
                continue;
            }

            const leadSchema = createLeadSchema(leadData);
            leadSchema.consultorId = consultorId;
            leadSchema.score = calculateLeadScore(leadSchema);

            const leadRef = doc(getLeadCollection(consultorId));
            batch.set(leadRef, leadSchema);

            leads.push({
                id: leadRef.id,
                ...leadSchema
            });
        }

        await batch.commit();
        return leads;
    } catch (error) {
        console.error('Erro ao criar leads em lote:', error);
        throw error;
    }
};

// ===== READ OPERATIONS =====

/**
 * Buscar lead por ID
 */
export const getLead = async (consultorId, leadId) => {
    try {
        const leadDoc = await getDoc(getLeadDoc(consultorId, leadId));

        if (!leadDoc.exists()) {
            throw new Error('Lead não encontrada');
        }

        const leadData = leadDoc.data();

        // Calcular temperatura atual
        leadData.temperatura = calculateLeadTemperature(leadData.ultimoContacto);

        // Verificar alertas
        leadData.alerts = needsAlert(leadData);

        // Próxima ação recomendada
        leadData.nextAction = getNextRecommendedAction(leadData);

        return {
            id: leadDoc.id,
            ...leadData
        };
    } catch (error) {
        console.error('Erro ao buscar lead:', error);
        throw error;
    }
};

/**
 * Listar leads com filtros e paginação
 * ✅ CORRIGIDO: Adicionada validação de IDs e filtro de leads inválidas
 */
export const getLeads = async (consultorId, options = {}) => {
    try {
        const {
            status = null,
            leadSource = null,
            interesse = null,
            temperatura = null,
            searchTerm = null,
            sortBy = 'criadaEm',
            sortOrder = 'desc',
            pageSize = DEFAULT_PAGE_SIZE,
            lastDoc = null
        } = options;

        let q = getLeadCollection(consultorId);
        const constraints = [];

        // Aplicar filtros
        if (status) {
            constraints.push(where('status', '==', status));
        }

        if (leadSource) {
            constraints.push(where('leadSource', '==', leadSource));
        }

        if (interesse) {
            constraints.push(where('interesse', '==', interesse));
        }

        if (temperatura) {
            constraints.push(where('temperatura', '==', temperatura));
        }

        // Ordenação
        if (sortBy) {
            constraints.push(orderBy(sortBy, sortOrder));
        }

        // Paginação
        constraints.push(limit(pageSize));

        if (lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        // Executar query
        q = query(q, ...constraints);
        const snapshot = await getDocs(q);

        // ✅ CORREÇÃO: Processar e validar leads
        const leads = snapshot.docs.map(doc => {
            const leadData = doc.data();

            // Calcular campos dinâmicos
            leadData.temperatura = calculateLeadTemperature(leadData.ultimoContacto);
            leadData.alerts = needsAlert(leadData);

            // ✅ GARANTIR que sempre há um ID válido
            return {
                ...leadData,
                id: doc.id || `temp-${Date.now()}-${Math.random()}`, // Fallback ID
                // Adicionar validações extras se necessário
                name: leadData.name || 'Lead sem nome',
                phone: leadData.phone || '',
                email: leadData.email || '',
                status: leadData.status || 'novo',
                source: leadData.source || 'direto'
            };
        }).filter(lead => {
            // ✅ FILTRAR leads inválidas (sem dados essenciais)
            const isValid = lead.name && (lead.phone || lead.email);

            // Aplicar filtro de pesquisa local se necessário
            if (isValid && searchTerm) {
                const term = searchTerm.toLowerCase();
                const matchesSearch =
                    lead.name?.toLowerCase().includes(term) ||
                    lead.email?.toLowerCase().includes(term) ||
                    lead.phone?.includes(term) ||
                    lead.descricao?.toLowerCase().includes(term);

                return matchesSearch;
            }

            return isValid;
        });

        // ✅ LOG para debug
        console.log(`📊 Leads carregadas: ${leads.length} registros válidos de ${snapshot.docs.length} totais`);

        // ✅ Verificar se há leads com ID null e avisar
        const leadsComIdNull = leads.filter(l => !l.id);
        if (leadsComIdNull.length > 0) {
            console.warn('⚠️ Encontradas leads sem ID:', leadsComIdNull);
        }

        return {
            leads,
            hasMore: snapshot.docs.length === pageSize,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };
    } catch (error) {
        console.error('Erro ao listar leads:', error);
        throw error;
    }
};

/**
 * Obter estatísticas das leads
 */
export const getLeadsStats = async (consultorId) => {
    try {
        const snapshot = await getDocs(getLeadCollection(consultorId));

        const stats = {
            total: 0,
            porStatus: {},
            porFonte: {},
            porInteresse: {},
            porTemperatura: {
                frio: 0,
                morno: 0,
                quente: 0
            },
            alertas: 0,
            taxaConversao: 0
        };

        snapshot.forEach(doc => {
            const lead = doc.data();
            stats.total++;

            // Por status
            stats.porStatus[lead.status] = (stats.porStatus[lead.status] || 0) + 1;

            // Por fonte
            stats.porFonte[lead.leadSource] = (stats.porFonte[lead.leadSource] || 0) + 1;

            // Por interesse
            stats.porInteresse[lead.interesse] = (stats.porInteresse[lead.interesse] || 0) + 1;

            // Por temperatura
            const temp = calculateLeadTemperature(lead.ultimoContacto);
            stats.porTemperatura[temp]++;

            // Alertas
            const alerts = needsAlert(lead);
            if (alerts.length > 0) {
                stats.alertas++;
            }
        });

        // Taxa de conversão
        const ganhas = stats.porStatus[LEAD_STATUS.GANHO] || 0;
        const perdidas = stats.porStatus[LEAD_STATUS.PERDIDO] || 0;
        const total = ganhas + perdidas;

        if (total > 0) {
            stats.taxaConversao = Math.round((ganhas / total) * 100);
        }

        return stats;
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        throw error;
    }
};

/**
 * Obter leads com alertas
 */
export const getAlertLeads = async (consultorId) => {
    try {
        const snapshot = await getDocs(getLeadCollection(consultorId));
        const alertLeads = [];

        snapshot.forEach(doc => {
            const lead = doc.data();
            const alerts = needsAlert(lead);

            if (alerts.length > 0) {
                alertLeads.push({
                    id: doc.id,
                    ...lead,
                    alerts
                });
            }
        });

        // Ordenar por severidade
        alertLeads.sort((a, b) => {
            const aHighAlerts = a.alerts.filter(alert => alert.severity === 'high').length;
            const bHighAlerts = b.alerts.filter(alert => alert.severity === 'high').length;
            return bHighAlerts - aHighAlerts;
        });

        return alertLeads;
    } catch (error) {
        console.error('Erro ao obter leads com alertas:', error);
        throw error;
    }
};

// ===== UPDATE OPERATIONS =====

/**
 * Atualizar lead
 */
export const updateLead = async (consultorId, leadId, updateData) => {
    try {
        // Validar dados de atualização
        const validation = validateLeadData(updateData);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
        }

        const leadRef = getLeadDoc(consultorId, leadId);

        // Preparar dados de atualização
        const updatePayload = {
            ...updateData,
            atualizadaEm: Timestamp.now()
        };

        // Recalcular score se dados relevantes mudaram
        if (updateData.leadSource || updateData.interesse || updateData.ultimoContacto) {
            const currentLead = await getDoc(leadRef);
            if (currentLead.exists()) {
                const currentData = currentLead.data();
                const updatedData = { ...currentData, ...updateData };
                updatePayload.score = calculateLeadScore(updatedData);
                updatePayload.temperatura = calculateLeadTemperature(updatedData.ultimoContacto);
            }
        }

        await updateDoc(leadRef, updatePayload);

        return {
            id: leadId,
            ...updatePayload
        };
    } catch (error) {
        console.error('Erro ao atualizar lead:', error);
        throw error;
    }
};

/**
 * Eliminar lead
 */
export const deleteLead = async (consultorId, leadId) => {
    try {
        await deleteDoc(getLeadDoc(consultorId, leadId));
        return true;
    } catch (error) {
        console.error('Erro ao eliminar lead:', error);
        throw error;
    }
};

// ===== TASK OPERATIONS =====

/**
 * Criar tarefa para lead
 */
export const createTask = async (consultorId, leadId, taskData) => {
    try {
        // Atribuir leadId aos dados ANTES da validação
        const taskDataWithLeadId = {
            ...taskData,
            leadId: leadId,
            consultorId: consultorId
        };

        // Validar dados
        const validation = validateTaskData(taskDataWithLeadId);
        if (!validation.isValid) {
            throw new Error(`Dados da tarefa inválidos: ${JSON.stringify(validation.errors)}`);
        }

        // Criar schema da tarefa
        const taskSchema = createTaskSchema(taskDataWithLeadId);

        // Adicionar ao Firestore
        const taskRef = await addDoc(getTaskCollection(consultorId, leadId), taskSchema);

        // Atualizar contador de tasks na lead
        await updateDoc(getLeadDoc(consultorId, leadId), {
            totalTasks: arrayUnion(1),
            atualizadaEm: Timestamp.now()
        });

        return {
            id: taskRef.id,
            ...taskSchema
        };
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        throw error;
    }
};

/**
 * Obter tarefas da lead
 */
export const getLeadTasks = async (consultorId, leadId) => {
    try {
        const snapshot = await getDocs(getTaskCollection(consultorId, leadId));
        const tasks = [];

        snapshot.forEach(doc => {
            tasks.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Ordenar por data de agendamento
        tasks.sort((a, b) => {
            const aDate = a.agendadaPara?.toDate() || new Date(0);
            const bDate = b.agendadaPara?.toDate() || new Date(0);
            return aDate - bDate;
        });

        return tasks;
    } catch (error) {
        console.error('Erro ao obter tarefas:', error);
        throw error;
    }
};

/**
 * Completar tarefa
 */
export const completeTask = async (consultorId, leadId, taskId, resultData) => {
    try {
        const taskRef = doc(getTaskCollection(consultorId, leadId), taskId);

        await updateDoc(taskRef, {
            status: TASK_STATUS.CONCLUIDA,
            executadaEm: Timestamp.now(),
            resultado: resultData.resultado || '',
            notas: resultData.notas || '',
            duracaoReal: resultData.duracao || null,
            atualizadaEm: Timestamp.now()
        });

        // Atualizar lead
        await updateDoc(getLeadDoc(consultorId, leadId), {
            tasksCompletas: arrayUnion(1),
            ultimoContacto: Timestamp.now(),
            atualizadaEm: Timestamp.now()
        });

        return true;
    } catch (error) {
        console.error('Erro ao completar tarefa:', error);
        throw error;
    }
};

// ===== CONTACT OPERATIONS =====

/**
 * Adicionar contacto à lead
 */
export const addContact = async (consultorId, leadId, contactData) => {
    try {
        const contactSchema = createContactoSchema({
            ...contactData,
            leadId,
            consultorId
        });

        const contactRef = await addDoc(getContactCollection(consultorId, leadId), contactSchema);

        // Atualizar lead
        await updateDoc(getLeadDoc(consultorId, leadId), {
            totalContactos: arrayUnion(1),
            ultimoContacto: Timestamp.now(),
            atualizadaEm: Timestamp.now()
        });

        return {
            id: contactRef.id,
            ...contactSchema
        };
    } catch (error) {
        console.error('Erro ao adicionar contacto:', error);
        throw error;
    }
};

/**
 * Obter contactos da lead
 */
export const getLeadContacts = async (consultorId, leadId) => {
    try {
        const snapshot = await getDocs(getContactCollection(consultorId, leadId));
        const contacts = [];

        snapshot.forEach(doc => {
            contacts.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Ordenar por data (mais recente primeiro)
        contacts.sort((a, b) => {
            const aDate = a.dataContacto?.toDate() || new Date(0);
            const bDate = b.dataContacto?.toDate() || new Date(0);
            return bDate - aDate;
        });

        return contacts;
    } catch (error) {
        console.error('Erro ao obter contactos:', error);
        throw error;
    }
};

// ===== CONVERSION OPERATIONS =====

/**
 * Converter lead em cliente
 */
export const convertLeadToClient = async (consultorId, leadId, clientData) => {
    try {
        const batch = writeBatch(db);

        // Obter dados da lead
        const leadDoc = await getDoc(getLeadDoc(consultorId, leadId));
        if (!leadDoc.exists()) {
            throw new Error('Lead não encontrada');
        }

        const leadData = leadDoc.data();

        // Criar cliente
        const clientRef = doc(collection(db, CONSULTOR_COLLECTION, consultorId, CLIENTS_COLLECTION));
        const clientSchema = {
            ...clientData,
            name: leadData.name,
            phone: leadData.phone,
            email: leadData.email,
            leadOrigem: leadId,
            consultorId: consultorId,
            criadoEm: Timestamp.now(),
            atualizadoEm: Timestamp.now()
        };

        batch.set(clientRef, clientSchema);

        // Atualizar lead
        batch.update(getLeadDoc(consultorId, leadId), {
            status: LEAD_STATUS.GANHO,
            convertidaEm: Timestamp.now(),
            clienteId: clientRef.id,
            atualizadaEm: Timestamp.now()
        });

        await batch.commit();

        return {
            clientId: clientRef.id,
            leadId: leadId
        };
    } catch (error) {
        console.error('Erro ao converter lead:', error);
        throw error;
    }
};

/**
 * Marcar lead como perdida
 */
export const markLeadAsLost = async (consultorId, leadId, motivoPerda) => {
    try {
        await updateDoc(getLeadDoc(consultorId, leadId), {
            status: LEAD_STATUS.PERDIDO,
            motivoPerda: motivoPerda,
            perdidaEm: Timestamp.now(),
            atualizadaEm: Timestamp.now()
        });

        return true;
    } catch (error) {
        console.error('Erro ao marcar lead como perdida:', error);
        throw error;
    }
};

// ===== SEARCH OPERATIONS =====

/**
 * Pesquisar leads
 */
export const searchLeads = async (consultorId, searchTerm) => {
    try {
        const snapshot = await getDocs(getLeadCollection(consultorId));
        const term = searchTerm.toLowerCase();
        const results = [];

        snapshot.forEach(doc => {
            const lead = doc.data();
            const matchesSearch =
                lead.name?.toLowerCase().includes(term) ||
                lead.email?.toLowerCase().includes(term) ||
                lead.phone?.includes(term) ||
                lead.descricao?.toLowerCase().includes(term) ||
                lead.empresa?.toLowerCase().includes(term);

            if (matchesSearch) {
                results.push({
                    id: doc.id,
                    ...lead,
                    temperatura: calculateLeadTemperature(lead.ultimoContacto),
                    alerts: needsAlert(lead)
                });
            }
        });

        return results;
    } catch (error) {
        console.error('Erro ao pesquisar leads:', error);
        throw error;
    }
};

// ===== BULK OPERATIONS =====

/**
 * Atualizar múltiplas leads
 */
export const updateLeadsBatch = async (consultorId, updates) => {
    try {
        const batch = writeBatch(db);

        for (const { leadId, updateData } of updates) {
            const leadRef = getLeadDoc(consultorId, leadId);
            batch.update(leadRef, {
                ...updateData,
                atualizadaEm: Timestamp.now()
            });
        }

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Erro ao atualizar leads em lote:', error);
        throw error;
    }
};

/**
 * Exportar leads
 */
export const exportLeads = async (consultorId, filters = {}) => {
    try {
        const result = await getLeads(consultorId, { ...filters, pageSize: 1000 });
        return result.leads;
    } catch (error) {
        console.error('Erro ao exportar leads:', error);
        throw error;
    }
};

// ===== VALIDATION HELPERS =====

/**
 * Verificar se email já existe
 */
export const checkEmailExists = async (consultorId, email, excludeLeadId = null) => {
    try {
        const q = query(
            getLeadCollection(consultorId),
            where('email', '==', email)
        );
        const snapshot = await getDocs(q);

        if (excludeLeadId) {
            return snapshot.docs.some(doc => doc.id !== excludeLeadId);
        }

        return !snapshot.empty;
    } catch (error) {
        console.error('Erro ao verificar email:', error);
        throw error;
    }
};

/**
 * Verificar se telefone já existe
 */
export const checkPhoneExists = async (consultorId, phone, excludeLeadId = null) => {
    try {
        const q = query(
            getLeadCollection(consultorId),
            where('phone', '==', phone)
        );
        const snapshot = await getDocs(q);

        if (excludeLeadId) {
            return snapshot.docs.some(doc => doc.id !== excludeLeadId);
        }

        return !snapshot.empty;
    } catch (error) {
        console.error('Erro ao verificar telefone:', error);
        throw error;
    }
};