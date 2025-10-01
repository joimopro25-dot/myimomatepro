/**
 * DASHBOARD - MyImoMatePro
 * Enhanced with real-time data counters and deal funnel
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import Layout from '../components/Layout';
import {
  UsersIcon,
  BriefcaseIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { BUYER_DEAL_STAGES } from '../models/buyerDealModel';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalOpportunities: 0,
    totalDeals: 0,
    dealsByStage: {}
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (!auth.currentUser) {
        return;
      }

      const userId = auth.currentUser.uid;
      let clientCount = 0;
      let opportunityCount = 0;
      let dealCount = 0;
      const dealsByStage = {};

      // Initialize deal stages
      BUYER_DEAL_STAGES.forEach(stage => {
        dealsByStage[stage.value] = 0;
      });

      // Get all clients
      const clientsRef = collection(db, 'consultants', userId, 'clients');
      const clientsSnapshot = await getDocs(clientsRef);
      clientCount = clientsSnapshot.size;

      // For each client, get opportunities and deals
      for (const clientDoc of clientsSnapshot.docs) {
        // Get opportunities
        const opportunitiesRef = collection(
          db,
          'consultants',
          userId,
          'clients',
          clientDoc.id,
          'opportunities'
        );
        const opportunitiesSnapshot = await getDocs(opportunitiesRef);
        opportunityCount += opportunitiesSnapshot.size;

        // For each opportunity, get deals
        for (const oppDoc of opportunitiesSnapshot.docs) {
          const dealsRef = collection(
            db,
            'consultants',
            userId,
            'clients',
            clientDoc.id,
            'opportunities',
            oppDoc.id,
            'deals'
          );
          const dealsSnapshot = await getDocs(dealsRef);
          dealCount += dealsSnapshot.size;

          // Count deals by stage
          dealsSnapshot.docs.forEach(dealDoc => {
            const dealData = dealDoc.data();
            if (dealData.stage) {
              dealsByStage[dealData.stage] = (dealsByStage[dealData.stage] || 0) + 1;
            }
          });
        }
      }

      setStats({
        totalClients: clientCount,
        totalOpportunities: opportunityCount,
        totalDeals: dealCount,
        dealsByStage
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate conversion rate (deals / opportunities)
  const conversionRate = stats.totalOpportunities > 0 
    ? Math.round((stats.totalDeals / stats.totalOpportunities) * 100) 
    : 0;

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            Bem-vindo de volta, {auth.currentUser?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">Aqui está um resumo da sua atividade de hoje</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Clients */}
          <div
            onClick={() => navigate('/clients')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Clientes</p>
                {loading ? (
                  <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <span>Ver todos →</span>
            </div>
          </div>

          {/* Opportunities */}
          <div
            onClick={() => navigate('/opportunities')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Oportunidades</p>
                {loading ? (
                  <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOpportunities}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <BriefcaseIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <span>Ver todos →</span>
            </div>
          </div>

          {/* Deals */}
          <div
            onClick={() => navigate('/deals')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Negócios</p>
                {loading ? (
                  <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stats.totalDeals}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600">
              <span>Ver pipeline →</span>
            </div>
          </div>
        </div>

        {/* Deal Funnel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Funil de Negócios
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Distribuição de negócios por fase
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : stats.totalDeals === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBagIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Ainda não há negócios</p>
              <p className="text-sm mt-1">Crie oportunidades para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stage Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {BUYER_DEAL_STAGES.map(stage => {
                  const count = stats.dealsByStage[stage.value] || 0;
                  const percentage = stats.totalDeals > 0 
                    ? Math.round((count / stats.totalDeals) * 100) 
                    : 0;

                  return (
                    <div
                      key={stage.value}
                      className={`p-4 rounded-lg border-2 ${
                        count > 0 
                          ? `border-${stage.color}-300 bg-${stage.color}-50` 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${
                          count > 0 ? `text-${stage.color}-700` : 'text-gray-400'
                        }`}>
                          {count}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {stage.label}
                        </p>
                        {count > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {percentage}%
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simple Bar Chart */}
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  {BUYER_DEAL_STAGES.filter(stage => stats.dealsByStage[stage.value] > 0).map(stage => {
                    const count = stats.dealsByStage[stage.value];
                    const percentage = Math.round((count / stats.totalDeals) * 100);
                    
                    return (
                      <div key={stage.value} className="flex items-center gap-3">
                        <div className="w-32 text-sm text-gray-700 truncate">
                          {stage.label}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className={`h-full bg-${stage.color}-500 rounded-full transition-all duration-500 flex items-center justify-end px-2`}
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            <span className="text-xs font-medium text-white">
                              {count}
                            </span>
                          </div>
                        </div>
                        <div className="w-12 text-sm text-gray-600 text-right">
                          {percentage}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Volume Card */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm mb-1">Volume de Negócios</p>
                <p className="text-3xl font-bold">€0</p>
              </div>
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-purple-100 text-sm">+18% vs mês anterior</p>
          </div>

          {/* Conversion Rate Card */}
          <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-orange-100 text-sm mb-1">Taxa de Conversão</p>
                <p className="text-3xl font-bold">{conversionRate}%</p>
              </div>
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-orange-100 text-sm">
              {stats.totalDeals} negócios de {stats.totalOpportunities} oportunidades
            </p>
          </div>
        </div>

        {/* Getting Started Section */}
        {stats.totalClients === 0 && (
          <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-2">Começar a usar o MyImoMatePro</h2>
            <p className="text-blue-100 mb-4">
              Complete a configuração inicial para aproveitar ao máximo seu CRM
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-sm">Conta criada e configurada</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs">2</span>
                </div>
                <span className="text-sm">Adicione seu primeiro cliente</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs">3</span>
                </div>
                <span className="text-sm">Crie uma oportunidade</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/clients/new')}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Adicionar Cliente
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;