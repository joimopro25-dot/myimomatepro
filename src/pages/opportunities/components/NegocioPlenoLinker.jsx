/**
 * NEGÓCIO PLENO LINKER - Componente para linking de oportunidades
 * Permite conectar oportunidades de Vendedor com Comprador
 * Caminho: src/pages/opportunities/components/NegocioPlenoLinker.jsx
 */

import React, { useState, useEffect } from 'react';
import {
    LinkIcon,
    UserGroupIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    ArrowRightIcon,
    HomeIcon,
    CurrencyEuroIcon,
    CalendarIcon,
    DocumentCheckIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
    OPPORTUNITY_TYPES,
    OPPORTUNITY_TYPE_LABELS,
    LINK_TYPES,
    NEGOCIO_PLENO_STATUS,
    NEGOCIO_PLENO_STATUS_LABELS,
    canLinkOpportunities,
    detectDiscrepancies,
    formatCurrency
} from '../../../models/opportunityModel';
import { useOpportunities } from '../../../contexts/OpportunityContext';
import { useClients } from '../../../contexts/ClientContext';

const NegocioPlenoLinker = ({
    currentOpportunity,
    onLink,
    onUnlink,
    onSync,
    isLinking = false
}) => {
    // Estados
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [availableOpportunities, setAvailableOpportunities] = useState([]);
    const [linkedOpportunityDetails, setLinkedOpportunityDetails] = useState(null);
    const [discrepancies, setDiscrepancies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Contexts
    const { fetchAllOpportunities, fetchOpportunity } = useOpportunities();
    const { fetchAllClients } = useClients();

    // Carregar oportunidade linkada se existir
    useEffect(() => {
        if (currentOpportunity?.linkedOpportunityId) {
            loadLinkedOpportunity();
        }
    }, [currentOpportunity?.linkedOpportunityId]);

    // Detectar discrepâncias quando há oportunidades linkadas
    useEffect(() => {
        if (currentOpportunity?.isNegocioPleno && linkedOpportunityDetails) {
            const newDiscrepancies = detectDiscrepancies(currentOpportunity, linkedOpportunityDetails);
            setDiscrepancies(newDiscrepancies);
        }
    }, [currentOpportunity, linkedOpportunityDetails]);

    // Carregar detalhes da oportunidade linkada
    const loadLinkedOpportunity = async () => {
        try {
            setLoading(true);
            const linked = await fetchOpportunity(
                currentOpportunity.linkedOpportunityClientId,
                currentOpportunity.linkedOpportunityId
            );
            setLinkedOpportunityDetails(linked);
        } catch (err) {
            setError('Erro ao carregar oportunidade linkada');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Buscar oportunidades disponíveis para linking - VERSÃO CORRIGIDA COM DEBUG
    const searchOpportunities = async () => {
        try {
            setLoading(true);
            setError(null);

            // DEBUG: Ver o que está a acontecer
            console.log('Iniciando busca de oportunidades...');
            console.log('Oportunidade atual:', currentOpportunity);

            // Buscar todas as oportunidades
            const allOpportunities = await fetchAllOpportunities();

            console.log('Oportunidades retornadas:', allOpportunities);
            console.log('É array?', Array.isArray(allOpportunities));
            console.log('Quantidade:', allOpportunities?.length || 0);

            // Garantir que temos um array
            const opportunitiesArray = Array.isArray(allOpportunities) ? allOpportunities : [];

            // Filtrar apenas as que podem ser linkadas com a atual
            const targetType = currentOpportunity.tipo === OPPORTUNITY_TYPES.BUYER
                ? OPPORTUNITY_TYPES.SELLER
                : OPPORTUNITY_TYPES.BUYER;

            console.log('Tipo atual:', currentOpportunity.tipo);
            console.log('Procurando por tipo:', targetType);

            const compatible = opportunitiesArray.filter(opp => {
                // Debug de cada oportunidade
                console.log(`Verificando oportunidade: ${opp.titulo}, tipo: ${opp.tipo}`);

                // Deve ser do tipo oposto
                if (opp.tipo !== targetType) {
                    console.log(`  - Tipo incompatível: ${opp.tipo} !== ${targetType}`);
                    return false;
                }

                // Não deve estar já linkada
                if (opp.linkedOpportunityId) {
                    console.log(`  - Já está linkada`);
                    return false;
                }

                // Não deve ser a mesma oportunidade
                if (opp.id === currentOpportunity.id) {
                    console.log(`  - É a mesma oportunidade`);
                    return false;
                }

                // Não deve ser do mesmo cliente
                if (opp.clienteId === currentOpportunity.clienteId) {
                    console.log(`  - É do mesmo cliente`);
                    return false;
                }

                // Aplicar filtro de busca se existir
                if (searchTerm && searchTerm.trim() !== '') {
                    const search = searchTerm.toLowerCase();
                    const match = (
                        opp.titulo?.toLowerCase().includes(search) ||
                        opp.clienteName?.toLowerCase().includes(search) ||
                        opp.descricao?.toLowerCase().includes(search)
                    );
                    if (!match) {
                        console.log(`  - Não corresponde ao termo de busca: ${searchTerm}`);
                        return false;
                    }
                }

                console.log(`  ✓ Oportunidade compatível!`);
                return true;
            });

            console.log('Oportunidades compatíveis encontradas:', compatible.length);
            console.log('Oportunidades compatíveis:', compatible);

            if (compatible.length === 0 && opportunitiesArray.length > 0) {
                setError('Nenhuma oportunidade compatível encontrada. Certifique-se de que existem oportunidades do tipo oposto (Vendedor/Comprador) criadas no sistema.');
            }

            setAvailableOpportunities(compatible);
        } catch (err) {
            console.error('Erro completo ao buscar oportunidades:', err);
            setError(`Erro ao buscar oportunidades: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Handler para linking
    const handleLink = async () => {
        if (!selectedOpportunity) {
            setError('Selecione uma oportunidade para linkar');
            return;
        }

        try {
            setLoading(true);
            await onLink(selectedOpportunity);
            setShowLinkModal(false);
            setSelectedOpportunity(null);
            setSearchTerm('');
        } catch (err) {
            setError('Erro ao linkar oportunidades');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handler para unlink
    const handleUnlink = async () => {
        if (window.confirm('Tem certeza que deseja deslinkar este Negócio Pleno?')) {
            try {
                setLoading(true);
                await onUnlink();
                setLinkedOpportunityDetails(null);
            } catch (err) {
                setError('Erro ao deslinkar oportunidades');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    // Handler para sincronização
    const handleSync = async () => {
        try {
            setLoading(true);
            await onSync();
            await loadLinkedOpportunity(); // Recarregar após sync
        } catch (err) {
            setError('Erro ao sincronizar oportunidades');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Calcular comissão total
    const calculateTotalCommission = () => {
        if (!currentOpportunity?.isNegocioPleno) return 0;

        return currentOpportunity.negocioPlenoData?.totalComissao || 0;
    };

    // Renderizar badge de status
    const renderStatusBadge = () => {
        if (!currentOpportunity?.isNegocioPleno) return null;

        const status = currentOpportunity.negocioPlenoStatus;
        const hasDiscrepancies = discrepancies.length > 0;

        return (
            <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${hasDiscrepancies
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                    }`}>
                    {hasDiscrepancies
                        ? NEGOCIO_PLENO_STATUS_LABELS[NEGOCIO_PLENO_STATUS.DISCREPANCY]
                        : NEGOCIO_PLENO_STATUS_LABELS[status]}
                </span>
                {hasDiscrepancies && (
                    <span className="text-yellow-600 text-sm">
                        {discrepancies.length} discrepância{discrepancies.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>
        );
    };

    // Se já está linkado, mostrar informações do Negócio Pleno
    if (currentOpportunity?.isNegocioPleno) {
        return (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-200 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <LinkIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                🤝 NEGÓCIO PLENO
                            </h3>
                            <p className="text-sm text-gray-600">
                                Oportunidades linkadas com sucesso
                            </p>
                        </div>
                    </div>
                    {renderStatusBadge()}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Card Atual */}
                    <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-500">
                                {currentOpportunity.tipo === OPPORTUNITY_TYPES.BUYER ? 'Comprador' : 'Vendedor'}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Atual
                            </span>
                        </div>
                        <p className="font-semibold text-gray-900">{currentOpportunity.titulo}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Cliente: {currentOpportunity.clienteName || 'N/D'}
                        </p>
                        {currentOpportunity.valorEstimado && (
                            <p className="text-sm font-medium text-green-600 mt-2">
                                Comissão: {formatCurrency(
                                    currentOpportunity.valorEstimado * currentOpportunity.percentualComissao / 100
                                )}
                            </p>
                        )}
                    </div>

                    {/* Card Linkado */}
                    <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-500">
                                {linkedOpportunityDetails?.tipo === OPPORTUNITY_TYPES.BUYER ? 'Comprador' : 'Vendedor'}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                Linkado
                            </span>
                        </div>
                        {linkedOpportunityDetails ? (
                            <>
                                <p className="font-semibold text-gray-900">
                                    {linkedOpportunityDetails.titulo}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Cliente: {currentOpportunity.linkedOpportunityClientName || 'N/D'}
                                </p>
                                {linkedOpportunityDetails.valorEstimado && (
                                    <p className="text-sm font-medium text-green-600 mt-2">
                                        Comissão: {formatCurrency(
                                            linkedOpportunityDetails.valorEstimado * linkedOpportunityDetails.percentualComissao / 100
                                        )}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">Carregando...</p>
                        )}
                    </div>
                </div>

                {/* Comissão Total */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CurrencyEuroIcon className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">
                                Comissão Total do Negócio Pleno
                            </span>
                        </div>
                        <span className="text-xl font-bold text-green-600">
                            {formatCurrency(calculateTotalCommission())}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <span>Vendedor: {formatCurrency(currentOpportunity.negocioPlenoData?.comissaoVendedor || 0)}</span>
                        <span>Comprador: {formatCurrency(currentOpportunity.negocioPlenoData?.comissaoComprador || 0)}</span>
                    </div>
                </div>

                {/* Discrepâncias */}
                {discrepancies.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                        <div className="flex items-start space-x-2">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-yellow-800 mb-2">
                                    Discrepâncias Detectadas:
                                </p>
                                <ul className="space-y-1">
                                    {discrepancies.map((disc, index) => (
                                        <li key={index} className="text-sm text-yellow-700">
                                            • {disc.mensagem}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ações */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-500">
                        Linkado em: {currentOpportunity.negocioPlenoData?.linkedAt
                            ? new Date(currentOpportunity.negocioPlenoData.linkedAt.toDate()).toLocaleDateString('pt-PT')
                            : 'N/D'}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => setShowDetailsModal(true)}
                            className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium"
                        >
                            Ver Detalhes
                        </button>
                        <button
                            type="button"
                            onClick={handleSync}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium disabled:opacity-50"
                        >
                            Sincronizar
                        </button>
                        <button
                            type="button"
                            onClick={handleUnlink}
                            disabled={loading}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium disabled:opacity-50"
                        >
                            Deslinkar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Se não está linkado, mostrar botão para linkar
    return (
        <>
            <div className="bg-gray-50 rounded-xl border border-gray-200 border-dashed p-6">
                <div className="text-center">
                    <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Ativar Negócio Pleno
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {currentOpportunity?.tipo === OPPORTUNITY_TYPES.BUYER
                            ? 'Linkar este comprador com um vendedor seu'
                            : 'Linkar este vendedor com um comprador seu'}
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowLinkModal(true)}
                        disabled={isLinking || loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                    >
                        <LinkIcon className="w-4 h-4 inline mr-2" />
                        Procurar e Linkar Oportunidade
                    </button>
                </div>
            </div>

            {/* Modal de Linking */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                Linkar para Negócio Pleno
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowLinkModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Informação sobre o tipo de oportunidade procurada */}
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-800">
                                Procurando por oportunidades de <strong>
                                    {currentOpportunity?.tipo === OPPORTUNITY_TYPES.BUYER ? 'Vendedor' : 'Comprador'}
                                </strong> para linkar com esta oportunidade de <strong>
                                    {currentOpportunity?.tipo === OPPORTUNITY_TYPES.BUYER ? 'Comprador' : 'Vendedor'}
                                </strong>.
                            </p>
                        </div>

                        {/* Campo de busca */}
                        <div className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyUp={(e) => e.key === 'Enter' && searchOpportunities()}
                                    placeholder="Pesquisar por título, cliente ou descrição..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            </div>
                            <button
                                type="button"
                                onClick={searchOpportunities}
                                disabled={loading}
                                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 w-full"
                            >
                                {loading ? 'Procurando...' : 'Procurar Oportunidades'}
                            </button>
                        </div>

                        {/* Mensagem de erro */}
                        {error && (
                            <div className="bg-red-50 text-red-800 p-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        {/* Lista de oportunidades disponíveis */}
                        {availableOpportunities.length > 0 && (
                            <div className="space-y-2 mb-4">
                                <p className="text-sm font-medium text-gray-700">
                                    {availableOpportunities.length} oportunidade(s) encontrada(s)
                                </p>
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {availableOpportunities.map(opp => (
                                        <div
                                            key={opp.id}
                                            onClick={() => setSelectedOpportunity(opp)}
                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedOpportunity?.id === opp.id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {opp.titulo}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Cliente: {opp.clienteName || 'N/D'}
                                                    </p>
                                                    {opp.valorEstimado && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Valor: {formatCurrency(opp.valorEstimado)}
                                                        </p>
                                                    )}
                                                </div>
                                                {selectedOpportunity?.id === opp.id && (
                                                    <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preview do linking */}
                        {selectedOpportunity && (
                            <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                                <p className="text-sm font-medium text-green-800 mb-2">
                                    Preview do Negócio Pleno:
                                </p>
                                <div className="flex items-center justify-center space-x-2 text-sm">
                                    <div className="text-center">
                                        <p className="font-medium">{currentOpportunity?.titulo}</p>
                                        <p className="text-xs text-gray-600">
                                            {currentOpportunity?.tipo === OPPORTUNITY_TYPES.BUYER ? 'Comprador' : 'Vendedor'}
                                        </p>
                                    </div>
                                    <ArrowRightIcon className="w-4 h-4 text-green-600" />
                                    <LinkIcon className="w-4 h-4 text-green-600" />
                                    <ArrowRightIcon className="w-4 h-4 text-green-600" />
                                    <div className="text-center">
                                        <p className="font-medium">{selectedOpportunity.titulo}</p>
                                        <p className="text-xs text-gray-600">
                                            {selectedOpportunity.tipo === OPPORTUNITY_TYPES.BUYER ? 'Comprador' : 'Vendedor'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-center text-xs text-green-600 mt-2">
                                    Comissão Total Estimada: {formatCurrency(
                                        (currentOpportunity?.valorEstimado || 0) * (currentOpportunity?.percentualComissao || 0) / 100 +
                                        (selectedOpportunity.valorEstimado || 0) * (selectedOpportunity.percentualComissao || 0) / 100
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Botões de ação */}
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLinkModal(false);
                                    setSelectedOpportunity(null);
                                    setSearchTerm('');
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleLink}
                                disabled={!selectedOpportunity || loading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Confirmar Linking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalhes (quando já linkado) */}
            {showDetailsModal && linkedOpportunityDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                Detalhes do Negócio Pleno
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Timeline comparativa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Coluna Vendedor */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <HomeIcon className="w-5 h-5 mr-2 text-blue-500" />
                                    Lado Vendedor
                                </h4>
                                <div className="space-y-3">
                                    {/* Aqui viria a timeline do vendedor */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-sm text-gray-600">
                                            Timeline do vendedor...
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Coluna Comprador */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <UserGroupIcon className="w-5 h-5 mr-2 text-green-500" />
                                    Lado Comprador
                                </h4>
                                <div className="space-y-3">
                                    {/* Aqui viria a timeline do comprador */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-sm text-gray-600">
                                            Timeline do comprador...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NegocioPlenoLinker;