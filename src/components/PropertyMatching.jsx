/**
 * PROPERTY MATCHING COMPONENT - MyImoMatePro
 * Automatically match buyers with properties and vice versa
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import {
  findMatchingBuyers,
  findMatchingProperties,
  createLinkedOffer,
  linkBuyerToSeller
} from '../utils/crossLinkingFirebase';
import {
  HomeIcon,
  UserGroupIcon,
  SparklesIcon,
  LinkIcon,
  CurrencyEuroIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function PropertyMatching({ 
  mode = 'seller', // 'seller' or 'buyer'
  sourceData, // The opportunity/deal we're matching for
  clientId,
  documentId,
  onLink
}) {
  const { currentUser } = useAuth();
  const consultantId = currentUser?.uid;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');

  useEffect(() => {
    if (consultantId && sourceData) {
      loadMatches();
    }
  }, [consultantId, sourceData]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      let results = [];
      
      if (mode === 'seller') {
        // Find buyers for this property
        results = await findMatchingBuyers(db, consultantId, sourceData);
      } else {
        // Find properties for this buyer
        results = await findMatchingProperties(db, consultantId, sourceData.requirements);
      }
      
      setMatches(results);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (match) => {
    setSelectedMatch(match);
    setShowOfferModal(true);
  };

  const handleSubmitOffer = async () => {
    if (!offerAmount || !selectedMatch) return;
    
    try {
      if (mode === 'seller') {
        // Create offer from matched buyer to this seller
        await createLinkedOffer(
          db,
          consultantId,
          clientId,
          documentId,
          { amount: parseFloat(offerAmount) },
          {
            buyerClientId: selectedMatch.clientId,
            buyerDealId: selectedMatch.opportunityId,
            buyerName: selectedMatch.clientName
          }
        );
      } else {
        // Link this buyer deal to matched property
        await linkBuyerToSeller(
          db,
          consultantId,
          clientId,
          documentId,
          selectedMatch.clientId,
          selectedMatch.opportunityId
        );
      }
      
      setShowOfferModal(false);
      setSelectedMatch(null);
      setOfferAmount('');
      loadMatches(); // Refresh
      
      if (onLink) {
        onLink(selectedMatch);
      }
    } catch (error) {
      console.error('Error creating link/offer:', error);
      alert('Erro ao criar ligação');
    }
  };

  const getMatchBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'seller' ? 'Compradores Compatíveis' : 'Imóveis Compatíveis'}
          </h2>
        </div>
        <span className="text-sm text-gray-500">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </span>
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="text-center py-8">
          <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum match encontrado</p>
          <p className="text-sm text-gray-400 mt-1">
            Ajuste os critérios ou aguarde novos {mode === 'seller' ? 'compradores' : 'imóveis'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.slice(0, 5).map((match) => (
            <div 
              key={`${match.clientId}_${match.opportunityId}`}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {match.clientName}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getMatchBadgeColor(match.matchScore)}`}>
                        {match.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {mode === 'seller' ? (
                    // Show buyer info
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CurrencyEuroIcon className="w-4 h-4" />
                        <span>Budget: {formatCurrency(match.budget)}</span>
                      </div>
                      {match.requirements?.desiredLocations && (
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{match.requirements.desiredLocations.join(', ')}</span>
                        </div>
                      )}
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          Motivação: {match.motivation?.urgency || 'Normal'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Show property info
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CurrencyEuroIcon className="w-4 h-4" />
                        <span>{formatCurrency(match.pricing?.askingPrice)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{match.property?.address}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs">
                          {match.property?.bedrooms}Q | {match.property?.area}m²
                        </span>
                        <span className="text-xs text-gray-500">
                          {match.daysOnMarket} dias no mercado
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleCreateOffer(match)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    Conectar
                  </button>
                  <button
                    onClick={() => window.open(`/clients/${match.clientId}`, '_blank')}
                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>

              {/* Match Details */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3 text-green-500" />
                    Preço compatível
                  </span>
                  {match.matchScore >= 70 && (
                    <span className="flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3 text-green-500" />
                      Localização ideal
                    </span>
                  )}
                  {match.matchScore >= 80 && (
                    <span className="flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3 text-green-500" />
                      Requisitos atendidos
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowOfferModal(false)} />
            
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">
                Criar Proposta de Conexão
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Conectando com: <strong>{selectedMatch?.clientName}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Match Score: <strong>{selectedMatch?.matchScore}%</strong>
                  </p>
                </div>

                {mode === 'seller' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor da Proposta
                    </label>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="€ 0"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitOffer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Conectar Negócio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}