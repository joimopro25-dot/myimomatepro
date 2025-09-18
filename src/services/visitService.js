/**
 * VISIT SERVICE - MyImoMatePro
 * Serviço para gestão de visitas
 * 
 * Caminho: src/services/visitService.js
 */

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    createVisitSchema,
    validateVisitData,
    VISIT_STATES,
    generateVisitReminder,
    suggestNextActions
} from '../models/visitModel';

// ===== COLEÇÕES =====
const getVisitsCollection = (consultorId, opportunityId) => {
    return collection(db,
        'consultores', consultorId,
        'oportunidades', opportunityId,
        'visitas'
    );
};

// ===== CRIAR VISITA =====
export const createVisit = async (consultorId, opportunityId, visitData) => {
    try {
        console.log('VisitService: Criando visita', { consultorId, opportunityId });

        // Validar dados
        const validation = validateVisitData(visitData);
        if (!validation.isValid) {
            console.error('VisitService: Dados inválidos', validation.errors);
            throw new Error(Object.values(validation.errors).join(', '));
        }

        // Criar schema
        const visitSchema = createVisitSchema({
            ...visitData,
            opportunityId,
            consultorId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Adicionar ao Firestore
        const visitsRef = getVisitsCollection(consultorId, opportunityId);
        const docRef = await addDoc(visitsRef, visitSchema);

        console.log('VisitService: Visita criada com sucesso', docRef.id);

        // Agendar lembrete se necessário
        if (visitData.dataVisita && visitData.estado === VISIT_STATES.SCHEDULED) {
            await scheduleVisitReminder(consultorId, opportunityId, docRef.id, visitData);
        }

        // Atualizar timeline da oportunidade
        await addToOpportunityTimeline(consultorId, opportunityId, {
            tipo: 'visita_agendada',
            descricao: `Visita agendada para ${formatDate(visitData.dataVisita)}`,
            visitId: docRef.id
        });

        return docRef.id;
    } catch (error) {
        console.error('VisitService: Erro ao criar visita', error);
        throw error;
    }
};

// ===== ATUALIZAR VISITA =====
export const updateVisit = async (consultorId, opportunityId, visitId, updates) => {
    try {
        console.log('VisitService: Atualizando visita', { visitId, updates });

        const visitRef = doc(db,
            'consultores', consultorId,
            'oportunidades', opportunityId,
            'visitas', visitId
        );

        // Adicionar timestamp de atualização
        const updateData = {
            ...updates,
            updatedAt: serverTimestamp()
        };

        await updateDoc(visitRef, updateData);

        // Se mudou de agendada para efetuada, adicionar à timeline
        if (updates.estado === VISIT_STATES.COMPLETED) {
            await addToOpportunityTimeline(consultorId, opportunityId, {
                tipo: 'visita_realizada',
                descricao: 'Visita realizada com sucesso',
                visitId
            });
        }

        // Se foi cancelada
        if (updates.estado === VISIT_STATES.CANCELLED) {
            await addToOpportunityTimeline(consultorId, opportunityId, {
                tipo: 'visita_cancelada',
                descricao: `Visita cancelada: ${updates.cancelamento?.motivo || 'Sem motivo especificado'}`,
                visitId
            });
        }

        console.log('VisitService: Visita atualizada com sucesso');
        return true;
    } catch (error) {
        console.error('VisitService: Erro ao atualizar visita', error);
        throw error;
    }
};

// ===== ADICIONAR FEEDBACK =====
export const addVisitFeedback = async (consultorId, opportunityId, visitId, feedback) => {
    try {
        console.log('VisitService: Adicionando feedback', { visitId });

        const visitRef = doc(db,
            'consultores', consultorId,
            'oportunidades', opportunityId,
            'visitas', visitId
        );

        // Buscar visita atual
        const visitDoc = await getDoc(visitRef);
        if (!visitDoc.exists()) {
            throw new Error('Visita não encontrada');
        }

        const visitData = visitDoc.data();

        // Atualizar com feedback
        const updateData = {
            feedback: {
                ...visitData.feedback,
                ...feedback,
                realizada: true
            },
            estado: VISIT_STATES.COMPLETED,
            updatedAt: serverTimestamp()
        };

        await updateDoc(visitRef, updateData);

        // Sugerir próximas ações baseadas no feedback
        const nextActions = suggestNextActions(feedback);

        // Criar tarefas automáticas se necessário
        if (nextActions.length > 0) {
            await createTasksFromVisitFeedback(consultorId, opportunityId, visitId, nextActions);
        }

        // Adicionar à timeline
        await addToOpportunityTimeline(consultorId, opportunityId, {
            tipo: 'feedback_visita',
            descricao: `Feedback da visita: Interesse ${feedback.interesseNivel}`,
            visitId,
            dados: { interesseNivel: feedback.interesseNivel }
        });

        console.log('VisitService: Feedback adicionado com sucesso');
        return nextActions;
    } catch (error) {
        console.error('VisitService: Erro ao adicionar feedback', error);
        throw error;
    }
};

// ===== LISTAR VISITAS =====
export const listVisits = async (consultorId, opportunityId, filters = {}) => {
    try {
        console.log('VisitService: Listando visitas', { opportunityId, filters });

        const visitsRef = getVisitsCollection(consultorId, opportunityId);

        // Construir query
        let visitQuery = visitsRef;

        // Aplicar filtros
        if (filters.estado) {
            visitQuery = query(visitQuery, where('estado', '==', filters.estado));
        }

        if (filters.propertyId) {
            visitQuery = query(visitQuery, where('propertyId', '==', filters.propertyId));
        }

        // Ordenar por data
        visitQuery = query(visitQuery, orderBy('dataVisita', 'desc'));

        const snapshot = await getDocs(visitQuery);

        const visits = [];
        snapshot.forEach((doc) => {
            visits.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`VisitService: ${visits.length} visitas encontradas`);
        return visits;
    } catch (error) {
        console.error('VisitService: Erro ao listar visitas', error);
        throw error;
    }
};

// ===== OBTER VISITA =====
export const getVisit = async (consultorId, opportunityId, visitId) => {
    try {
        console.log('VisitService: Obtendo visita', { visitId });

        const visitRef = doc(db,
            'consultores', consultorId,
            'oportunidades', opportunityId,
            'visitas', visitId
        );

        const visitDoc = await getDoc(visitRef);

        if (!visitDoc.exists()) {
            console.error('VisitService: Visita não encontrada');
            return null;
        }

        return {
            id: visitDoc.id,
            ...visitDoc.data()
        };
    } catch (error) {
        console.error('VisitService: Erro ao obter visita', error);
        throw error;
    }
};

// ===== CANCELAR VISITA =====
export const cancelVisit = async (consultorId, opportunityId, visitId, motivo, reagendar = false, novaData = null) => {
    try {
        console.log('VisitService: Cancelando visita', { visitId, motivo });

        const updates = {
            estado: VISIT_STATES.CANCELLED,
            cancelamento: {
                motivo,
                data: serverTimestamp(),
                reagendada: reagendar,
                novaData
            }
        };

        await updateVisit(consultorId, opportunityId, visitId, updates);

        // Se for reagendar, criar nova visita
        if (reagendar && novaData) {
            const visitDoc = await getVisit(consultorId, opportunityId, visitId);

            const newVisitData = {
                ...visitDoc,
                dataVisita: novaData,
                estado: VISIT_STATES.SCHEDULED,
                observacoes: `Reagendada de ${formatDate(visitDoc.dataVisita)}. Motivo: ${motivo}`
            };

            delete newVisitData.id;
            delete newVisitData.createdAt;
            delete newVisitData.updatedAt;
            delete newVisitData.cancelamento;

            const newVisitId = await createVisit(consultorId, opportunityId, newVisitData);

            console.log('VisitService: Nova visita criada após reagendamento', newVisitId);
            return newVisitId;
        }

        return true;
    } catch (error) {
        console.error('VisitService: Erro ao cancelar visita', error);
        throw error;
    }
};

// ===== CONFIRMAR VISITA =====
export const confirmVisit = async (consultorId, opportunityId, visitId) => {
    try {
        console.log('VisitService: Confirmando visita', { visitId });

        const updates = {
            estado: VISIT_STATES.CONFIRMED,
            'participantes.cliente.confirmado': true,
            'preparacao.clienteConfirmado': true
        };

        await updateVisit(consultorId, opportunityId, visitId, updates);

        console.log('VisitService: Visita confirmada com sucesso');
        return true;
    } catch (error) {
        console.error('VisitService: Erro ao confirmar visita', error);
        throw error;
    }
};

// ===== ESTATÍSTICAS DE VISITAS =====
export const getVisitStatistics = async (consultorId, opportunityId) => {
    try {
        console.log('VisitService: Calculando estatísticas de visitas');

        const visits = await listVisits(consultorId, opportunityId);

        const stats = {
            total: visits.length,
            scheduled: visits.filter(v => v.estado === VISIT_STATES.SCHEDULED).length,
            confirmed: visits.filter(v => v.estado === VISIT_STATES.CONFIRMED).length,
            completed: visits.filter(v => v.estado === VISIT_STATES.COMPLETED).length,
            cancelled: visits.filter(v => v.estado === VISIT_STATES.CANCELLED).length,
            noShow: visits.filter(v => v.estado === VISIT_STATES.NO_SHOW).length,

            // Taxa de conversão
            conversionRate: 0,
            averageInterest: 0,

            // Por propriedade
            byProperty: {}
        };

        // Calcular taxa de conversão e interesse médio
        const completedVisits = visits.filter(v => v.estado === VISIT_STATES.COMPLETED);

        if (completedVisits.length > 0) {
            const withHighInterest = completedVisits.filter(v =>
                v.feedback?.interesseNivel === 'alto' ||
                v.feedback?.interesseNivel === 'muito_alto'
            );

            stats.conversionRate = Math.round((withHighInterest.length / completedVisits.length) * 100);

            // Calcular interesse médio
            const interestMap = {
                'sem_interesse': 0,
                'baixo': 25,
                'medio': 50,
                'alto': 75,
                'muito_alto': 100
            };

            const totalInterest = completedVisits.reduce((sum, v) =>
                sum + (interestMap[v.feedback?.interesseNivel] || 0), 0
            );

            stats.averageInterest = Math.round(totalInterest / completedVisits.length);
        }

        // Agrupar por propriedade
        visits.forEach(visit => {
            if (visit.propertyId) {
                if (!stats.byProperty[visit.propertyId]) {
                    stats.byProperty[visit.propertyId] = {
                        total: 0,
                        completed: 0,
                        cancelled: 0
                    };
                }

                stats.byProperty[visit.propertyId].total++;

                if (visit.estado === VISIT_STATES.COMPLETED) {
                    stats.byProperty[visit.propertyId].completed++;
                } else if (visit.estado === VISIT_STATES.CANCELLED) {
                    stats.byProperty[visit.propertyId].cancelled++;
                }
            }
        });

        console.log('VisitService: Estatísticas calculadas', stats);
        return stats;
    } catch (error) {
        console.error('VisitService: Erro ao calcular estatísticas', error);
        throw error;
    }
};

// ===== PRÓXIMAS VISITAS =====
export const getUpcomingVisits = async (consultorId, days = 7) => {
    try {
        console.log('VisitService: Buscando próximas visitas', { days });

        const hoje = new Date();
        const futureDate = new Date();
        futureDate.setDate(hoje.getDate() + days);

        // Buscar em todas as oportunidades do consultor
        const opportunitiesRef = collection(db, 'consultores', consultorId, 'oportunidades');
        const oppSnapshot = await getDocs(opportunitiesRef);

        const allVisits = [];

        for (const oppDoc of oppSnapshot.docs) {
            const visitsRef = collection(db,
                'consultores', consultorId,
                'oportunidades', oppDoc.id,
                'visitas'
            );

            const visitQuery = query(visitsRef,
                where('estado', 'in', [VISIT_STATES.SCHEDULED, VISIT_STATES.CONFIRMED]),
                where('dataVisita', '>=', Timestamp.fromDate(hoje)),
                where('dataVisita', '<=', Timestamp.fromDate(futureDate)),
                orderBy('dataVisita', 'asc')
            );

            const visitSnapshot = await getDocs(visitQuery);

            visitSnapshot.forEach(doc => {
                allVisits.push({
                    id: doc.id,
                    opportunityId: oppDoc.id,
                    ...doc.data()
                });
            });
        }

        console.log(`VisitService: ${allVisits.length} visitas encontradas nos próximos ${days} dias`);
        return allVisits;
    } catch (error) {
        console.error('VisitService: Erro ao buscar próximas visitas', error);
        throw error;
    }
};

// ===== HELPERS PRIVADOS =====

// Agendar lembrete de visita
const scheduleVisitReminder = async (consultorId, opportunityId, visitId, visitData) => {
    try {
        const reminder = generateVisitReminder(visitData);

        // Aqui você pode integrar com um serviço de notificações
        // Por exemplo: Firebase Cloud Messaging, SendGrid, etc.

        console.log('VisitService: Lembrete agendado', reminder);
        return true;
    } catch (error) {
        console.error('VisitService: Erro ao agendar lembrete', error);
        // Não lançar erro para não impedir a criação da visita
        return false;
    }
};

// Criar tarefas baseadas no feedback
const createTasksFromVisitFeedback = async (consultorId, opportunityId, visitId, actions) => {
    try {
        // Aqui você pode integrar com o serviço de tarefas
        // Por enquanto, apenas log
        console.log('VisitService: Criando tarefas automáticas', actions);
        return true;
    } catch (error) {
        console.error('VisitService: Erro ao criar tarefas', error);
        return false;
    }
};

// Adicionar evento à timeline da oportunidade
const addToOpportunityTimeline = async (consultorId, opportunityId, event) => {
    try {
        const oppRef = doc(db, 'consultores', consultorId, 'oportunidades', opportunityId);
        const oppDoc = await getDoc(oppRef);

        if (oppDoc.exists()) {
            const timeline = oppDoc.data().timeline || [];
            timeline.push({
                ...event,
                createdAt: serverTimestamp()
            });

            await updateDoc(oppRef, {
                timeline,
                updatedAt: serverTimestamp()
            });
        }

        return true;
    } catch (error) {
        console.error('VisitService: Erro ao atualizar timeline', error);
        return false;
    }
};

// Formatar data
const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('pt-PT');
};

// ===== EXPORTS =====
export default {
    createVisit,
    updateVisit,
    addVisitFeedback,
    listVisits,
    getVisit,
    cancelVisit,
    confirmVisit,
    getVisitStatistics,
    getUpcomingVisits
};