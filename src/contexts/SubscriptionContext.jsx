import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { getClientStats } from '../services/clientService';

const SubscriptionContext = createContext();

export function useSubscription() {
    return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClientes: 0,
        totalNegocios: 0,
        valorNegocios: 0
    });

    const { currentUser } = useAuth();

    // Criar subscrição inicial
    async function createSubscription(planoData, metodoPagamento = 'pending') {
        if (!currentUser) return;

        const subscriptionData = {
            plano: planoData.nome,
            preco: planoData.preco,
            precoAnual: planoData.precoAnual,
            limiteClientes: planoData.limiteClientes,
            limiteVolumeNegocios: planoData.limiteVolumeNegocios,
            ciclo: 'mensal', // mensal ou anual
            status: 'active', // active, cancelled, expired
            criadoEm: new Date(),
            proximoPagamento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
            ultimoPagamento: {
                data: new Date(),
                valor: planoData.preco,
                status: 'pending'
            },
            metodoPagamento: metodoPagamento,
            trial: true,
            trialFim: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // +14 dias trial
        };

        await setDoc(doc(db, 'subscriptions', currentUser.uid), subscriptionData);
        return subscriptionData;
    }

    // Atualizar método de pagamento
    async function updatePaymentMethod(metodoPagamento) {
        if (!currentUser) return;

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            metodoPagamento,
            updatedAt: new Date()
        }, { merge: true });
    }

    // Cancelar plano
    async function cancelSubscription() {
        if (!currentUser) return;

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            status: 'cancelled',
            canceladoEm: new Date(),
            updatedAt: new Date()
        }, { merge: true });
    }

    // Alterar ciclo de pagamento
    async function changeBillingCycle(ciclo) {
        if (!currentUser || !subscription) return;

        const novoPreco = ciclo === 'anual' ? subscription.precoAnual : subscription.preco;
        const proximoPagamento = ciclo === 'anual'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            ciclo,
            proximoPagamento,
            precoAtual: novoPreco,
            updatedAt: new Date()
        }, { merge: true });
    }

    // Upgrade/Downgrade plano
    async function changePlan(novoPlano) {
        if (!currentUser) return;

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            plano: novoPlano.nome,
            preco: novoPlano.preco,
            precoAnual: novoPlano.precoAnual,
            limiteClientes: novoPlano.limiteClientes,
            limiteVolumeNegocios: novoPlano.limiteVolumeNegocios,
            updatedAt: new Date()
        }, { merge: true });
    }

    // Carregar estatísticas
    async function loadStats() {
        if (!currentUser) return;

        try {
            console.log('📊 SubscriptionContext: Carregando estatísticas reais...');

            // ✅ BUSCAR ESTATÍSTICAS REAIS DO FIRESTORE
            const clientStats = await getClientStats(currentUser.uid);

            setStats({
                totalClientes: clientStats.total || 0,
                totalNegocios: 0, // TODO: Implementar quando tivermos negócios
                valorNegocios: 0  // TODO: Implementar quando tivermos negócios
            });

            console.log('✅ SubscriptionContext: Estatísticas carregadas:', {
                totalClientes: clientStats.total || 0
            });

        } catch (error) {
            console.error('❌ SubscriptionContext: Erro ao carregar estatísticas:', error);
            // Em caso de erro, manter valores zerados
            setStats({
                totalClientes: 0,
                totalNegocios: 0,
                valorNegocios: 0
            });
        }
    }

    // Verificar se está no limite de clientes
    function isClientLimitReached() {
        if (!subscription || subscription.limiteClientes === 'unlimited') return false;
        return stats.totalClientes >= subscription.limiteClientes;
    }

    // Verificar se está no limite de volume de negócios
    function isVolumeLimitReached() {
        if (!subscription || subscription.limiteVolumeNegocios === 'unlimited') return false;
        return stats.valorNegocios >= subscription.limiteVolumeNegocios;
    }

    // Verificar se qualquer limite foi atingido
    function isAnyLimitReached() {
        return isClientLimitReached() || isVolumeLimitReached();
    }

    // Percentagem de uso de clientes
    function getClientUsagePercentage() {
        if (!subscription || subscription.limiteClientes === 'unlimited') return 0;
        return Math.min(100, (stats.totalClientes / subscription.limiteClientes) * 100);
    }

    // Percentagem de uso de volume
    function getVolumeUsagePercentage() {
        if (!subscription || subscription.limiteVolumeNegocios === 'unlimited') return 0;
        return Math.min(100, (stats.valorNegocios / subscription.limiteVolumeNegocios) * 100);
    }

    // Dias restantes do trial
    function getTrialDaysLeft() {
        if (!subscription?.trial || !subscription?.trialFim) return 0;
        const hoje = new Date();
        const fimTrial = new Date(subscription.trialFim);
        const diffTime = fimTrial - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    // Dias até próximo pagamento
    function getDaysUntilNextPayment() {
        if (!subscription?.proximoPagamento) return 0;
        const hoje = new Date();
        const proximoPagamento = new Date(subscription.proximoPagamento);
        const diffTime = proximoPagamento - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    // Formatação de valores monetários
    function formatCurrency(value) {
        if (value === 'unlimited') return 'Ilimitado';
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    useEffect(() => {
        if (!currentUser) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, 'subscriptions', currentUser.uid),
            (doc) => {
                if (doc.exists()) {
                    setSubscription({ id: doc.id, ...doc.data() });
                } else {
                    setSubscription(null);
                }
                setLoading(false);
            },
            (error) => {
                console.error('Erro ao carregar subscrição:', error);
                setLoading(false);
            }
        );

        loadStats();

        return unsubscribe;
    }, [currentUser]);

    const value = {
        subscription,
        stats,
        loading,
        createSubscription,
        updatePaymentMethod,
        cancelSubscription,
        changeBillingCycle,
        changePlan,
        loadStats,
        isClientLimitReached,
        isVolumeLimitReached,
        isAnyLimitReached,
        getClientUsagePercentage,
        getVolumeUsagePercentage,
        getTrialDaysLeft,
        getDaysUntilNextPayment,
        formatCurrency
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}