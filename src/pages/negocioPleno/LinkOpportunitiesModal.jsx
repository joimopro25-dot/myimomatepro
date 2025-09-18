/**
 * LINK OPPORTUNITIES MODAL - MyImoMatePro
 * Modal para linkar oportunidades vendedor/comprador e criar negócio pleno
 * 
 * Caminho: src/components/negocioPleno/LinkOpportunitiesModal.jsx
 */

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useNegociosPlenos } from '../../contexts/NegocioPlenoContext';
import { listAllOpportunities } from '../../services/opportunityService';
import { getClient } from '../../services/clientService';
import {
    XMarkIcon,
    LinkIcon,
    HomeIcon,
    ShoppingCartIcon,
    UserGroupIcon,
    CurrencyEuroIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowRightIcon,
    InformationCircleIcon,
    BuildingOfficeIcon,
    PhoneIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';

const LinkOpportunitiesModal = ({
    isOpen,
    onClose,
    preSelectedOpportunity = null,
    onSuccess = null
}) => {
    const { currentUser } = useAuth();
    const { linkOpportunities, findNegocioPlenoByOpportunity } = useNegociosPlenos();

    // Estados
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Oportunidades
    const [sellerOpportunities, setSellerOpportunities] = useState([]);
    const [buyerOpportunities, setBuyerOpportunities] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [selectedBuyer, setSelectedBuyer] = useState(null);

    // Filtros
    const [sellerSearch, setSellerSearch] = useState('');
    const [buyerSearch, setBuyerSearch] = useState('');

    // Dados adicionais
    const [showAdditionalData, setShowAdditionalData] = useState(false);
    const [additionalData, setAdditionalData] = useState({
        titulo: '',
        descricao: '',
        valores: {
            valorAcordado: 0,
            sinalPercentagem: 10,
            reforcoPercentagem: 0
        },
        comissoes: {
            percentagemTotal: 5,
            percentagemVendedor: 50,
            percentagemComprador: 50
        }
    });

    // Carregar oportunidades ao abrir
    useEffect(() => {
        if (isOpen && currentUser?.uid) {
            loadOpportunities();
        }
    }, [isOpen, currentUser]);

    // Pré-selecionar se fornecida
    useEffect(() => {
        if (preSelectedOpportunity) {
            if (preSelectedOpportunity.tipo === 'vendedor' || preSelectedOpportunity.tipo === 'senhorio') {
                setSelectedSeller(preSelectedOpportunity);
            } else if (preSelectedOpportunity.tipo === 'comprador' || preSelectedOpportunity.tipo === 'inquilino') {
                setSelectedBuyer(preSelectedOpportunity);
            }
        }
    }, [preSelectedOpportunity]);

    /**
     * Carregar todas as oportunidades disponíveis
     */
    const loadOpportunities = async () => {
        setSearching(true);
        setError(null);

        try {
            const result = await listAllOpportunities(currentUser.uid, {
                pageSize: 100,
                activeOnly: true
            });

            const opportunities = result.opportunities || [];

            // Separar por tipo
            const sellers = [];
            const buyers = [];

            for (const opp of opportunities) {
                // Verificar se já está linkada
                const existingNegocio = await findNegocioPlenoByOpportunity(opp.id);

                if (!existingNegocio) {
                    // Buscar dados do cliente
                    try {
                        const clientData = await getClient(currentUser.uid, opp.clienteId);
                        opp.clienteNome = clientData.name || 'Cliente desconhecido';
                        opp.clienteContacto = clientData.phone || clientData.email || '';
                    } catch (err) {
                        opp.clienteNome = 'Cliente desconhecido';
                        opp.clienteContacto = '';
                    }

                    if (opp.tipo === 'vendedor' || opp.tipo === 'senhorio') {
                        sellers.push(opp);
                    } else if (opp.tipo === 'comprador' || opp.tipo === 'inquilino') {
                        buyers.push(opp);
                    }
                }
            }

            setSellerOpportunities(sellers);
            setBuyerOpportunities(buyers);

        } catch (err) {
            console.error('Erro ao carregar oportunidades:', err);
            setError('Erro ao carregar oportunidades disponíveis');
        } finally {
            setSearching(false);
        }
    };

    /**
     * Filtrar oportunidades vendedoras
     */
    const filteredSellers = sellerOpportunities.filter(opp => {
        if (!sellerSearch) return true;
        const searchLower = sellerSearch.toLowerCase();
        return (
            opp.titulo?.toLowerCase().includes(searchLower) ||
            opp.clienteNome?.toLowerCase().includes(searchLower) ||
            opp.descricao?.toLowerCase().includes(searchLower)
        );
    });

    /**
     * Filtrar oportunidades compradoras
     */
    const filteredBuyers = buyerOpportunities.filter(opp => {
        if (!buyerSearch) return true;
        const searchLower = buyerSearch.toLowerCase();
        return (
            opp.titulo?.toLowerCase().includes(searchLower) ||
            opp.clienteNome?.toLowerCase().includes(searchLower) ||
            opp.descricao?.toLowerCase().includes(searchLower)
        );
    });

    /**
     * Validar seleção
     */
    const validateSelection = () => {
        if (!selectedSeller) {
            setError('Selecione uma oportunidade vendedora');
            return false;
        }

        if (!selectedBuyer) {
            setError('Selecione uma oportunidade compradora');
            return false;
        }

        if (selectedSeller.clienteId === selectedBuyer.clienteId) {
            setError('Não pode linkar oportunidades do mesmo cliente');
            return false;
        }

        return true;
    };

    /**
     * Criar negócio pleno
     */
    const handleCreateNegocioPleno = async () => {
        if (!validateSelection()) return;

        setLoading(true);
        setError(null);

        try {
            // Preparar dados para link
            const linkData = {
                oportunidadeVendedora: {
                    id: selectedSeller.id,
                    clienteId: selectedSeller.clienteId,
                    clienteNome: selectedSeller.clienteNome,
                    clienteContacto: selectedSeller.clienteContacto
                },
                oportunidadeCompradora: {
                    id: selectedBuyer.id,
                    clienteId: selectedBuyer.clienteId,
                    clienteNome: selectedBuyer.clienteNome,
                    clienteContacto: selectedBuyer.clienteContacto
                }
            };

            // Adicionar dados adicionais se fornecidos
            if (showAdditionalData) {
                linkData.titulo = additionalData.titulo ||
                    `Negócio: ${selectedSeller.titulo} - ${selectedBuyer.titulo}`;
                linkData.descricao = additionalData.descricao;
                linkData.valores = additionalData.valores;
                linkData.comissoes = additionalData.comissoes;

                // Migrar dados do imóvel da oportunidade vendedora
                if (selectedSeller.imovel) {
                    linkData.imovel = selectedSeller.imovel;
                }
            }

            // Criar negócio pleno
            const result = await linkOpportunities(linkData);

            if (result) {
                setSuccess(true);

                // Notificar sucesso
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess(result);
                    }
                    handleClose();
                }, 2000);
            } else {
                setError('Erro ao criar negócio pleno');
            }

        } catch (err) {
            console.error('Erro ao criar negócio pleno:', err);
            setError(err.message || 'Erro ao criar negócio pleno');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fechar modal
     */
    const handleClose = () => {
        setSelectedSeller(null);
        setSelectedBuyer(null);
        setSellerSearch('');
        setBuyerSearch('');
        setShowAdditionalData(false);
        setAdditionalData({
            titulo: '',
            descricao: '',
            valores: {
                valorAcordado: 0,
                sinalPercentagem: 10,
                reforcoPercentagem: 0
            },
            comissoes: {
                percentagemTotal: 5,
                percentagemVendedor: 50,
                percentagemComprador: 50
            }
        });
        setError(null);
        setSuccess(false);
        onClose();
    };

    /**
     * Renderizar card de oportunidade
     */
    const OpportunityCard = ({ opportunity, isSelected, onSelect, type }) => {
        const Icon = type === 'seller'
            ? (opportunity.tipo === 'vendedor' ? CurrencyEuroIcon : HomeIcon)
            : (opportunity.tipo === 'comprador' ? ShoppingCartIcon : UserGroupIcon);

        const typeLabel = {
            'vendedor': 'Vendedor',
            'senhorio': 'Senhorio',
            'comprador': 'Comprador',
            'inquilino': 'Inquilino'
        };

        return (
            <div
                onClick={() => onSelect(opportunity)}
                className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    }
                `}
            >
                {isSelected && (
                    <div className="absolute top-2 right-2">
                        <CheckCircleIcon className="w-6 h-6 text-blue-500" />
                    </div>
                )}

                <div className="flex items-start gap-3">
                    <div className={`
                        p-2 rounded-lg
                        ${type === 'seller' ? 'bg-green-100' : 'bg-blue-100'}
                    `}>
                        <Icon className={`
                            w-5 h-5
                            ${type === 'seller' ? 'text-green-600' : 'text-blue-600'}
                        `} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                            {opportunity.titulo || 'Sem título'}
                        </h4>

                        <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">{opportunity.clienteNome}</span>
                        </p>

                        {opportunity.clienteContacto && (
                            <p className="text-sm text-gray-500 mt-1 truncate">
                                {opportunity.clienteContacto}
                            </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                            <span className={`
                                inline-flex px-2 py-1 text-xs font-medium rounded-full
                                ${type === 'seller'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }
                            `}>
                                {typeLabel[opportunity.tipo]}
                            </span>

                            {opportunity.valorEstimado > 0 && (
                                <span className="text-sm text-gray-600">
                                    €{opportunity.valorEstimado.toLocaleString('pt-PT')}
                                </span>
                            )}
                        </div>

                        {opportunity.descricao && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                {opportunity.descricao}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <LinkIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <span>Criar Negócio Pleno</span>
                                        </div>
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        className="rounded-lg p-2 hover:bg-gray-100"
                                        onClick={handleClose}
                                    >
                                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>

                                {/* Mensagens */}
                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
                                            <p className="text-red-800">{error}</p>
                                        </div>
                                    </div>
                                )}

                                {success && (
                                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                            <p className="text-green-800">Negócio pleno criado com sucesso!</p>
                                        </div>
                                    </div>
                                )}

                                {/* Info Box */}
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-semibold mb-1">O que é um Negócio Pleno?</p>
                                            <p>
                                                Um negócio pleno une uma oportunidade vendedora a uma compradora,
                                                centralizando todos os dados do negócio (valores, CPCV, escritura, comissões)
                                                num único local, eliminando duplicação e garantindo consistência.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {searching ? (
                                    <div className="py-12 text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-gray-600 mt-4">Carregando oportunidades...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Grid de Seleção */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                            {/* Coluna Vendedor */}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <div className="p-1.5 bg-green-100 rounded">
                                                        <CurrencyEuroIcon className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    Oportunidade Vendedora/Senhorio
                                                    <span className="text-sm text-gray-500">
                                                        ({filteredSellers.length} disponíveis)
                                                    </span>
                                                </h4>

                                                {/* Busca */}
                                                <div className="relative mb-3">
                                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={sellerSearch}
                                                        onChange={(e) => setSellerSearch(e.target.value)}
                                                        placeholder="Buscar por título ou cliente..."
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                {/* Lista */}
                                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                                    {filteredSellers.length > 0 ? (
                                                        filteredSellers.map(opp => (
                                                            <OpportunityCard
                                                                key={opp.id}
                                                                opportunity={opp}
                                                                isSelected={selectedSeller?.id === opp.id}
                                                                onSelect={setSelectedSeller}
                                                                type="seller"
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 text-gray-500">
                                                            <HomeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                            <p>Nenhuma oportunidade vendedora disponível</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Coluna Comprador */}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <div className="p-1.5 bg-blue-100 rounded">
                                                        <ShoppingCartIcon className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    Oportunidade Compradora/Inquilino
                                                    <span className="text-sm text-gray-500">
                                                        ({filteredBuyers.length} disponíveis)
                                                    </span>
                                                </h4>

                                                {/* Busca */}
                                                <div className="relative mb-3">
                                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={buyerSearch}
                                                        onChange={(e) => setBuyerSearch(e.target.value)}
                                                        placeholder="Buscar por título ou cliente..."
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                {/* Lista */}
                                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                                    {filteredBuyers.length > 0 ? (
                                                        filteredBuyers.map(opp => (
                                                            <OpportunityCard
                                                                key={opp.id}
                                                                opportunity={opp}
                                                                isSelected={selectedBuyer?.id === opp.id}
                                                                onSelect={setSelectedBuyer}
                                                                type="buyer"
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 text-gray-500">
                                                            <ShoppingCartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                            <p>Nenhuma oportunidade compradora disponível</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preview da Ligação */}
                                        {selectedSeller && selectedBuyer && (
                                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="font-semibold text-gray-900 mb-3">Preview do Negócio Pleno</h4>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-600">Vendedor</p>
                                                        <p className="font-medium">{selectedSeller.clienteNome}</p>
                                                        <p className="text-sm text-gray-500">{selectedSeller.titulo}</p>
                                                    </div>

                                                    <div className="px-4">
                                                        <ArrowRightIcon className="w-6 h-6 text-blue-500" />
                                                    </div>

                                                    <div className="flex-1 text-right">
                                                        <p className="text-sm text-gray-600">Comprador</p>
                                                        <p className="font-medium">{selectedBuyer.clienteNome}</p>
                                                        <p className="text-sm text-gray-500">{selectedBuyer.titulo}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Dados Adicionais (Opcional) */}
                                        {selectedSeller && selectedBuyer && (
                                            <div className="mb-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAdditionalData(!showAdditionalData)}
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    {showAdditionalData ? 'Ocultar' : 'Adicionar'} dados adicionais (opcional)
                                                </button>

                                                {showAdditionalData && (
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Título do Negócio
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={additionalData.titulo}
                                                                    onChange={(e) => setAdditionalData({
                                                                        ...additionalData,
                                                                        titulo: e.target.value
                                                                    })}
                                                                    placeholder="Ex: Venda T3 Lisboa - João Silva"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Valor Acordado (€)
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={additionalData.valores.valorAcordado}
                                                                    onChange={(e) => setAdditionalData({
                                                                        ...additionalData,
                                                                        valores: {
                                                                            ...additionalData.valores,
                                                                            valorAcordado: parseFloat(e.target.value) || 0
                                                                        }
                                                                    })}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Sinal (%)
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={additionalData.valores.sinalPercentagem}
                                                                    onChange={(e) => setAdditionalData({
                                                                        ...additionalData,
                                                                        valores: {
                                                                            ...additionalData.valores,
                                                                            sinalPercentagem: parseFloat(e.target.value) || 0
                                                                        }
                                                                    })}
                                                                    min="0"
                                                                    max="100"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Comissão Total (%)
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={additionalData.comissoes.percentagemTotal}
                                                                    onChange={(e) => setAdditionalData({
                                                                        ...additionalData,
                                                                        comissoes: {
                                                                            ...additionalData.comissoes,
                                                                            percentagemTotal: parseFloat(e.target.value) || 0
                                                                        }
                                                                    })}
                                                                    min="0"
                                                                    max="100"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Descrição / Notas
                                                            </label>
                                                            <textarea
                                                                value={additionalData.descricao}
                                                                onChange={(e) => setAdditionalData({
                                                                    ...additionalData,
                                                                    descricao: e.target.value
                                                                })}
                                                                rows={3}
                                                                placeholder="Notas sobre o negócio..."
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Botões */}
                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                disabled={loading}
                                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCreateNegocioPleno}
                                                disabled={!selectedSeller || !selectedBuyer || loading}
                                                className={`
                                                    px-6 py-2 rounded-lg font-medium transition-colors
                                                    ${selectedSeller && selectedBuyer && !loading
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span>Criando...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <LinkIcon className="w-5 h-5" />
                                                        <span>Criar Negócio Pleno</span>
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default LinkOpportunitiesModal;