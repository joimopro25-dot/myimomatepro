/**
 * COMMISSION DASHBOARD - MyImoMatePro
 * Track commissions from both buyer and seller sides
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc            // Added
} from 'firebase/firestore';
import {
  CurrencyEuroIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon, // Renamed from TrendingUpIcon
  CalendarIcon,
  HomeIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

export default function CommissionDashboard() {
  const { currentUser } = useAuth();
  const consultantId = currentUser?.uid;
  
  const [deals, setDeals] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalPending: 0,
    totalProjected: 0,
    dealsThisMonth: 0,
    averageCommission: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingCommission, setEditingCommission] = useState(null);
  const [customPercentage, setCustomPercentage] = useState('');

  useEffect(() => {
    if (consultantId) {
      loadCommissions();
    }
  }, [consultantId]);

  const loadCommissions = async () => {
    try {
      setLoading(true);

      // DEBUG: Check auth and subscription
      console.log('🔐 Current User:', consultantId);
      console.log('🔐 Email:', currentUser?.email);

      if (!consultantId) {
        throw new Error('Utilizador não autenticado');
      }

      // Check subscription
      const subRef = doc(db, 'subscriptions', consultantId);
      const subSnap = await getDoc(subRef);
      console.log('💳 Subscription exists:', subSnap.exists());
      console.log('💳 Subscription data:', subSnap.data());

      // Get all clients
      const clientsRef = collection(db, 'consultants', consultantId, 'clients');
      const clientsSnap = await getDocs(clientsRef);
      
      let allDeals = [];
      let allOpportunities = [];
      
      for (const clientDoc of clientsSnap.docs) {
        const clientData = clientDoc.data();
        
        // Get deals (buyer side)
        const dealsRef = collection(db, 'consultants', consultantId, 'clients', clientDoc.id, 'deals');
        const dealsSnap = await getDocs(dealsRef);
        
        dealsSnap.forEach(dealDoc => {
          const dealData = dealDoc.data();
          allDeals.push({
            id: dealDoc.id,
            clientId: clientDoc.id,
            clientName: clientData.name,
            ...dealData
          });
        });
        
        // Get seller opportunities
        const oppsRef = collection(db, 'consultants', consultantId, 'clients', clientDoc.id, 'opportunities');
        const sellerOppsQuery = query(oppsRef, where('type', '==', 'seller'));
        const oppsSnap = await getDocs(sellerOppsQuery);
        
        oppsSnap.forEach(oppDoc => {
          const oppData = oppDoc.data();
          allOpportunities.push({
            id: oppDoc.id,
            clientId: clientDoc.id,
            clientName: clientData.name,
            ...oppData
          });
        });
      }
      
      setDeals(allDeals);
      setOpportunities(allOpportunities);
      calculateStats(allDeals, allOpportunities);
      
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (deals, opportunities) => {
    let totalEarned = 0;
    let totalPending = 0;
    let totalProjected = 0;
    let completedDeals = 0;
    
    // Calculate from buyer deals
    deals.forEach(deal => {
      if (deal.stage === 'fechado' || deal.stage === 'closed') {
        const commission = calculateDealCommission(deal);
        totalEarned += commission.total;
        completedDeals++;
      } else if (deal.stage === 'negociacao' || deal.stage === 'proposta_aceite') {
        const commission = calculateDealCommission(deal);
        totalPending += commission.total;
      } else if (deal.price) {
        const commission = calculateDealCommission(deal);
        totalProjected += commission.total;
      }
    });
    
    // Calculate from seller opportunities
    opportunities.forEach(opp => {
      if (opp.stage === 'vendido' || opp.stage === 'closed') {
        const commission = calculateSellerCommission(opp);
        totalEarned += commission;
        completedDeals++;
      } else if (opp.stage === 'proposta_aceite' || opp.stage === 'escritura') {
        const commission = calculateSellerCommission(opp);
        totalPending += commission;
      } else if (opp.pricing?.askingPrice) {
        const commission = calculateSellerCommission(opp);
        totalProjected += commission;
      }
    });
    
    // Calculate this month's deals
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const dealsThisMonth = [...deals, ...opportunities].filter(item => {
      if (item.closedDate) {
        const closedDate = new Date(item.closedDate);
        return closedDate.getMonth() === thisMonth && closedDate.getFullYear() === thisYear;
      }
      return false;
    }).length;
    
    setStats({
      totalEarned,
      totalPending,
      totalProjected,
      dealsThisMonth,
      averageCommission: completedDeals > 0 ? totalEarned / completedDeals : 0
    });
  };

  const calculateDealCommission = (deal) => {
    const price = deal.finalPrice || deal.price || 0;
    const buyerComm = (price * (deal.commission?.buyerSide?.percentage || 2.5)) / 100;
    const sellerComm = deal.linkedProperty?.sellerOpportunityId 
      ? (price * (deal.commission?.sellerSide?.percentage || 2.5)) / 100
      : 0;
    
    return {
      buyerSide: buyerComm,
      sellerSide: sellerComm,
      total: buyerComm + sellerComm
    };
  };

  const calculateSellerCommission = (opp) => {
    const price = opp.finalPrice || opp.pricing?.askingPrice || 0;
    return (price * (opp.commission?.percentage || 5)) / 100;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleUpdateCommission = async (item, type) => {
    if (!customPercentage) return;
    
    try {
      if (type === 'deal') {
        const dealRef = doc(db, 'consultants', consultantId, 'clients', item.clientId, 'deals', item.id);
        await updateDoc(dealRef, {
          'commission.buyerSide.percentage': parseFloat(customPercentage)
        });
      } else {
        const oppRef = doc(db, 'consultants', consultantId, 'clients', item.clientId, 'opportunities', item.id);
        await updateDoc(oppRef, {
          'commission.percentage': parseFloat(customPercentage)
        });
      }
      
      setEditingCommission(null);
      setCustomPercentage('');
      loadCommissions(); // Refresh
    } catch (error) {
      console.error('Error updating commission:', error);
    }
  };

  const getStageColor = (stage) => {
    if (stage === 'fechado' || stage === 'vendido' || stage === 'closed') 
      return 'bg-green-100 text-green-800';
    if (stage === 'negociacao' || stage === 'proposta_aceite' || stage === 'escritura')
      return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Comissões</h1>
        <p className="text-gray-600 mt-1">Acompanhe suas comissões e projeções</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ganhos Totais</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalEarned)}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.totalPending)}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projetado</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalProjected)}
              </p>
            </div>
            <ArrowTrendingUpIcon className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Média/Negócio</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.averageCommission)}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Commission Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buyer Deals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Comissões Comprador</h2>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {deals.filter(d => d.price).map(deal => {
              const commission = calculateDealCommission(deal);
              return (
                <div key={`${deal.clientId}_${deal.id}`} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{deal.clientName}</p>
                      <p className="text-sm text-gray-600">{deal.propertyAddress}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStageColor(deal.stage)}`}>
                        {deal.stage}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(commission.total)}
                      </p>
                      <button
                        onClick={() => {
                          setEditingCommission(`deal_${deal.id}`);
                          setCustomPercentage(deal.commission?.buyerSide?.percentage || 2.5);
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {deal.commission?.buyerSide?.percentage || 2.5}%
                      </button>
                    </div>
                  </div>
                  
                  {editingCommission === `deal_${deal.id}` && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={customPercentage}
                        onChange={(e) => setCustomPercentage(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                        placeholder="%"
                      />
                      <button
                        onClick={() => handleUpdateCommission(deal, 'deal')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommission(null);
                          setCustomPercentage('');
                        }}
                        className="px-3 py-1 border text-gray-600 text-sm rounded hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Seller Opportunities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <HomeIcon className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Comissões Vendedor</h2>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {opportunities.filter(o => o.pricing?.askingPrice).map(opp => {
              const commission = calculateSellerCommission(opp);
              return (
                <div key={`${opp.clientId}_${opp.id}`} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{opp.clientName}</p>
                      <p className="text-sm text-gray-600">{opp.property?.address}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStageColor(opp.stage)}`}>
                        {opp.stage}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(commission)}
                      </p>
                      <button
                        onClick={() => {
                          setEditingCommission(`opp_${opp.id}`);
                          setCustomPercentage(opp.commission?.percentage || 5);
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {opp.commission?.percentage || 5}%
                      </button>
                    </div>
                  </div>
                  
                  {editingCommission === `opp_${opp.id}` && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={customPercentage}
                        onChange={(e) => setCustomPercentage(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                        placeholder="%"
                      />
                      <button
                        onClick={() => handleUpdateCommission(opp, 'opportunity')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommission(null);
                          setCustomPercentage('');
                        }}
                        className="px-3 py-1 border text-gray-600 text-sm rounded hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}