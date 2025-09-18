/**
 * OFFER SERVICE - MyImoMatePro
 * Serviço para gestão de propostas/ofertas
 * 
 * Caminho: src/services/offerService.js
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
    createOfferSchema,
    validateOfferData,
    OFFER_STATES,
    OFFER_TYPES,
    calculateOfferValues,
    calculateCommissions,
    isOfferExpired,
    generateNegotiationTimeline
} from '../models/offerModel';

// ===== COLEÇÕES =====
const getOffersCollection = (consultorId, opportunityId) => {
    return collection(db,
        'consultores', consultorId,
        'oportunidades', opportunityId,
        'ofertas'
    );
};

// ===== CRIAR PROPOSTA =====
export const createOffer = async (consultorId, opportunityId, offerData) => {
    try {
        console.log('OfferService: Criando proposta', { consultorId, opportunityId });

        // Validar dados
        const validation = validateOfferData(offerData);
        if (!validation.isValid) {
            console.error('OfferService: Dados inválidos', validation.errors);
            throw new Error(Object.values(validation.errors).join(', '));
        }

        // Calcular valores automáticos
        const valores = calculateOfferValues(
            offerData.valores.valorProposto,
            offerData.valores.sinalPercentagem,
            offerData.valores.reforcoPercentagem || 0
        );

        // Calcular comissões
        const comissoes = calculateCommissions(
            offerData.valores.valorProposto,
            offerData.comissoes?.percentagemTotal || 5,
            {
                comprador: offerData.comissoes?.partilhaComprador || 50,
                vendedor: offerData.comissoes?.partilhaVendedor || 50
            }
        );

        // Criar schema
        const offerSchema = createOfferSchema({
            ...offerData,
            opportunityId,
            consultorId,
            valores: {
                ...offerData.valores,
                ...valores
            },
            comissoes: {
                ...offerData.comissoes,
                ...comissoes
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Adicionar ao Firestore
        const offersRef = getOffersCollection(consultorId, opportunityId);
        const docRef = await addDoc(offersRef, offerSchema);

        console.log('OfferService: Proposta criada com sucesso', docRef.id);

        // Atualizar timeline da oportunidade
        await addToOpportunityTimeline(consultorId, opportunityId, {
            tipo: 'proposta_criada',
            descricao: `Proposta criada: €${offerData.valores.valorProposto}`,
            offerId: docRef.id
        });

        return docRef.id;
    } catch (error) {
        console.error('OfferService: Erro ao criar proposta', error);
        throw error;
    }
};

// ===== ATUALIZAR PROPOSTA =====
export const updateOffer = async (consultorId, opportunityId, offerId, updates) => {
    try {
        console.log('OfferService: Atualizando proposta', { offerId, updates });

        const offerRef = doc(db,
            'consultores', consultorId,
            'oportunidades', opportunityId,
            'ofertas', offerId
        );

        // Se estiver atualizando valores, recalcular
        if (updates.valores) {
            const currentOffer = await getOffer(consultorId, opportunityId, offerId);

            const valores = calculateOfferValues(
                updates.valores.valorProposto || currentOffer.valores.valorProposto,
                updates.valores.sinalPercentagem || currentOffer.valores.sinalPercentagem,
                updates.valores.reforcoPercentagem || currentOffer.valores.reforcoPercentagem || 0
            );

            updates.valores = {
                ...currentOffer.valores,
                ...updates.valores,
                ...valores
            };
        }

        // Adicionar timestamp de atualização
        const updateData = {
            ...updates,
            updatedAt: serverTimestamp()
        };

        await updateDoc(offerRef, updateData);

        // Adicionar evento à timeline baseado no novo estado
        if (updates.estado) {
            await handleStateChange(consultorId, opportunityId, offerId, updates.estado);
        }

        console.log('OfferService: Proposta atualizada com sucesso');
        return true;
    } catch (error) {
        console.error('OfferService: Erro ao atualizar proposta', error);
        throw error;
    }
};

// ===== SUBMETER PROPOSTA =====
export const submitOffer = async (consultorId, opportunityId, offerId) => {
    try {
        console.log('OfferService: Submetendo proposta', { offerId });

        const updates = {
            estado: OFFER_STATES.SUBMITTED,
            dataSubmissao: serverTimestamp()
        };

        await updateOffer(consultorId, opportunityId, offerId, updates);

        console.log('OfferService: Proposta submetida com sucesso');
        return true;
    } catch (error) {
        console.error('OfferService: Erro ao submeter proposta', error);
        throw error;
    }
};

// ===== ADICIONAR CONTRAPROPOSTA =====
export const addCounterOffer = async (consultorId, opportunityId, offerId, counterData) => {
    try {
        console.log('OfferService: Adicionando contraproposta', { offerId });

        const offerRef = doc(db,
            'consultores', consultorId,
            'oportunidades', opportunityId,
            'ofertas', offerId
        );

        // Buscar proposta atual
        const offerDoc = await getDoc(offerRef);
        if (!offerDoc.exists()) {
            throw new Error('Proposta não encontrada');
        }

        const currentOffer = offerDoc.data();

        // Atualizar com contraproposta
        const updates = {
            estado: OFFER_STATES.COUNTER_OFFER,
            'negociacao.isContraproposta': true,
            'negociacao.numeroRonda': (currentOffer.negociacao?.numeroRonda || 1) + 1,
            'negociacao.contraproposta': {
                ...counterData,
                dataContraproposta: serverTimestamp()
            },
            'negociacao.historico': [
                ...(currentOffer.negociacao?.historico || []),
                {
                    date: serverTimestamp(),
                    event: 'Contraproposta recebida',
                    value: counterData.valor,
                    details: counterData.condicoes
                }
            ]
        };

        await updateDoc(offerRef, updates);

        // Adicionar à timeline
        await addToOpportunityTimeline(consultorId, opportunityId, {
            tipo: 'contraproposta',
            descricao: `Contraproposta recebida: €${counterData.valor}`,
            offerId
        });

        console.log('OfferService: Contraproposta adicionada com sucesso');
        return true;
    } catch (error) {
        console.error('OfferService: Erro ao adicionar contraproposta', error);
        throw error;
    }
};

// ===== ACEITAR PROPOSTA =====
export const acceptOffer = async (consultorId, opportunityId, offerId) => {
    try {
        console.log('OfferService: Aceitando proposta', { offerId });

        const updates = {
            estado: OFFER_STATES.ACCEPTED,
            dataResposta: serverTimestamp()
        };

        await updateOffer(consultorId, opportunityId, offerId, updates);

        // Criar CPCV automaticamente
        const cpcvId = await createCPCVFromOffer(consultorId, opportunityId, offerId);

        // Atualizar estado da oportunidade
        await updateOpportunityState(consultorId, opportunityId, 'proposta_aceite');

        console.log('OfferService: Proposta aceite e CPCV criado', cpcvId);
        return { success: true, cpcvId };
    } catch (error) {
        console.error('OfferService: Erro ao aceitar proposta', error);
        throw error;
    }
};

// ===== REJEITAR PROPOSTA =====
export const rejectOffer = async (consultorId, opportunityId, offerId, motivo) => {
    try {
        console.log('OfferService: Rejeitando proposta', { offerId, motivo });

        const updates = {
            estado: OFFER_STATES.REJECTED,
            dataResposta: serverTimestamp(),
            motivoRejeicao: motivo
        };

        await updateOffer(consultorId, opportunityId, offerId, updates);

        console.log('OfferService: Proposta rejeitada');
        return true;
    } catch (error) {
        console.error('OfferService: Erro ao rejeitar proposta', error);
        throw error;
    }
};

// ===== LISTAR PROPOSTAS =====
export const listOffers = async (consultorId, opportunityId, filters = {}) => {
    try {
        console.log('OfferService: Listando propostas', { opportunityId, filters });

        const offersRef = getOffersCollection(consultorId, opportunityId);

        // Construir query
        let offerQuery = offersRef;

        // Aplicar filtros
        if (filters.estado) {
            offerQuery = query(offerQuery, where('estado', '==', filters.estado));
        }

        if (filters.tipo) {
            offerQuery = query(offerQuery, where('tipo', '==', filters.tipo));
        }

        // Ordenar por data
        offerQuery = query(offerQuery, orderBy('createdAt', 'desc'));

        const snapshot = await getDocs(offerQuery);

        const offers = [];
        snapshot.forEach((doc) => {
            const offerData = doc.data();
            offers.push({
                id: doc.id,
                ...offerData,
                isExpired: isOfferExpired(offerData.dataValidade)
            });
        });

        console.log(`OfferService: ${offers.length} propostas encontradas`);
        return offers;
    } catch (error) {
        console.error('OfferService: Erro ao listar propostas', error);
        throw error;
    }
};

// ===== OBTER PROPOSTA =====
export const getOffer = async (consultorId, opportunityId, offerId) => {
    try {
        console.log('OfferService: Obtendo proposta', { offerId });

        const offerRef = doc(db,
            'consultores', consultorId,
            'oportunidades', opportunityId,
            'ofertas', offerId
        );

        const offerDoc = await getDoc(offerRef);

        if (!offerDoc.exists()) {
            console.error('OfferService: Proposta não encontrada');
            return null;
        }

        const offerData = offerDoc.data();

        return {
            id: offerDoc.id,
            ...offerData,
            isExpired: isOfferExpired(offerData.dataValidade),
            timeline: generateNegotiationTimeline(offerData)
        };
    } catch (error) {
        console.error('OfferService: Erro ao obter proposta', error);
        throw error;
    }
};

// ===== GERAR DOCUMENTO DA PROPOSTA =====
export const generateOfferDocument = async (consultorId, opportunityId, offerId) => {
    try {
        console.log('OfferService: Gerando documento da proposta', { offerId });

        const offer = await getOffer(consultorId, opportunityId, offerId);

        if (!offer) {
            throw new Error('Proposta não encontrada');
        }

        // Aqui você pode integrar com um serviço de geração de PDF
        // Por exemplo: jsPDF, PDFKit, ou um serviço externo

        const document = {
            title: `Proposta ${offer.numeroProposta}`,
            date: new Date(),
            content: offer,
            // ... outros campos do documento
        };

        console.log('OfferService: Documento gerado', document);
        return document;
    } catch (error) {
        console.error('OfferService: Erro ao gerar documento', error);
        throw error;
    }
};

// ===== ESTATÍSTICAS DE PROPOSTAS =====
export const getOfferStatistics = async (consultorId, opportunityId) => {
    try {
        console.log('OfferService: Calculando estatísticas de propostas');

        const offers = await listOffers(consultorId, opportunityId);

        const stats = {
            total: offers.length,
            draft: offers.filter(o => o.estado === OFFER_STATES.DRAFT).length,
            submitted: offers.filter(o => o.estado === OFFER_STATES.SUBMITTED).length,
            accepted: offers.filter(o => o.estado === OFFER_STATES.ACCEPTED).length,
            rejected: offers.filter(o => o.estado === OFFER_STATES.REJECTED).length,
            inNegotiation: offers.filter(o => o.estado === OFFER_STATES.COUNTER_OFFER).length,
            expired: offers.filter(o => o.isExpired).length,

            // Valores
            averageValue: 0,
            totalValue: 0,
            highestOffer: 0,
            lowestOffer: Infinity,

            // Taxa de sucesso
            successRate: 0,

            // Tempo médio de negociação
            averageNegotiationTime: 0
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

            // Tempo médio de negociação (para propostas aceites)
            const acceptedOffers = offers.filter(o => o.estado === OFFER_STATES.ACCEPTED);

            if (acceptedOffers.length > 0) {
                let totalDays = 0;

                acceptedOffers.forEach(offer => {
                    if (offer.dataSubmissao && offer.dataResposta) {
                        const submitted = offer.dataSubmissao.toDate ?
                            offer.dataSubmissao.toDate() :
                            new Date(offer.dataSubmissao);
                        const responded = offer.dataResposta.toDate ?
                            offer.dataResposta.toDate() :
                            new Date(offer.dataResposta);

                        const diff = responded - submitted;
                        totalDays += Math.ceil(diff / (1000 * 60 * 60 * 24));
                    }
                });

                stats.averageNegotiationTime = Math.round(totalDays / acceptedOffers.length);
            }
        }

        if (stats.lowestOffer === Infinity) {
            stats.lowestOffer = 0;
        }

        console.log('OfferService: Estatísticas calculadas', stats);
        return stats;
    } catch (error) {
        console.error('OfferService: Erro ao calcular estatísticas', error);
        throw error;
    }
};

// ===== VERIFICAR PROPOSTAS EXPIRADAS =====
export const checkExpiredOffers = async (consultorId) => {
    try {
        console.log('OfferService: Verificando propostas expiradas');

        // Buscar todas as propostas ativas
        const opportunitiesRef = collection(db, 'consultores', consultorId, 'oportunidades');
        const oppSnapshot = await getDocs(opportunitiesRef);

        let expiredCount = 0;

        for (const oppDoc of oppSnapshot.docs) {
            const offersRef = collection(db,
                'consultores', consultorId,
                'oportunidades', oppDoc.id,
                'ofertas'
            );

            const offerQuery = query(offersRef,
                where('estado', 'in', [OFFER_STATES.SUBMITTED, OFFER_STATES.UNDER_REVIEW])
            );

            const offerSnapshot = await getDocs(offerQuery);

            for (const offerDoc of offerSnapshot.docs) {
                const offer = offerDoc.data();

                if (isOfferExpired(offer.dataValidade)) {
                    await updateDoc(offerDoc.ref, {
                        estado: OFFER_STATES.EXPIRED,
                        updatedAt: serverTimestamp()
                    });

                    expiredCount++;
                }
            }
        }

        console.log(`OfferService: ${expiredCount} propostas marcadas como expiradas`);
        return expiredCount;
    } catch (error) {
        console.error('OfferService: Erro ao verificar propostas expiradas', error);
        throw error;
    }
};

// ===== HELPERS PRIVADOS =====

// Lidar com mudança de estado
const handleStateChange = async (consultorId, opportunityId, offerId, newState) => {
    const stateMessages = {
        [OFFER_STATES.SUBMITTED]: 'Proposta submetida',
        [OFFER_STATES.UNDER_REVIEW]: 'Proposta em análise',
        [OFFER_STATES.COUNTER_OFFER]: 'Contraproposta recebida',
        [OFFER_STATES.ACCEPTED]: 'Proposta aceite',
        [OFFER_STATES.REJECTED]: 'Proposta recusada',
        [OFFER_STATES.EXPIRED]: 'Proposta expirada',
        [OFFER_STATES.WITHDRAWN]: 'Proposta retirada'
    };

    await addToOpportunityTimeline(consultorId, opportunityId, {
        tipo: 'mudanca_estado_proposta',
        descricao: stateMessages[newState] || `Estado alterado para ${newState}`,
        offerId,
        dados: { novoEstado: newState }
    });
};

// Criar CPCV a partir da proposta aceite
const createCPCVFromOffer = async (consultorId, opportunityId, offerId) => {
    try {
        const offer = await getOffer(consultorId, opportunityId, offerId);

        // Aqui você pode integrar com o serviço de CPCV
        // Por enquanto, apenas retornar um ID simulado
        console.log('OfferService: Criando CPCV a partir da proposta', offer);

        // TODO: Implementar integração com cpcvService
        return 'cpcv_' + Date.now();
    } catch (error) {
        console.error('OfferService: Erro ao criar CPCV', error);
        throw error;
    }
};

// Atualizar estado da oportunidade
const updateOpportunityState = async (consultorId, opportunityId, newState) => {
    try {
        const oppRef = doc(db, 'consultores', consultorId, 'oportunidades', opportunityId);

        await updateDoc(oppRef, {
            estado: newState,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('OfferService: Erro ao atualizar estado da oportunidade', error);
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
        console.error('OfferService: Erro ao atualizar timeline', error);
        return false;
    }
};

// ===== EXPORTS =====
export default {
    createOffer,
    updateOffer,
    submitOffer,
    addCounterOffer,
    acceptOffer,
    rejectOffer,
    listOffers,
    getOffer,
    generateOfferDocument,
    getOfferStatistics,
    checkExpiredOffers
};