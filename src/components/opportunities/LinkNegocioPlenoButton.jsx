/**
 * BOTÃO DE LINK PARA NEGÓCIO PLENO
 * Componente para linkar oportunidades e criar negócios plenos
 * APENAS oportunidades COMPRADORAS podem iniciar o link
 * Caminho: src/components/opportunities/LinkNegocioPlenoButton.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOpportunities } from '../../contexts/OpportunityContext';
import { useNegocioPleno } from '../../contexts/NegocioPlenoContext';
import {
    LinkIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    HomeIcon,
    UserIcon,
    CurrencyEuroIcon,
    MapPinIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { getAvailableOpportunitiesForLinking } from '../../services/opportunityService';
//import { formatCurrency } from '../../models/negocioPlenoModel';

const formatCurrency = (value) => {
    return (value || 0).toLocaleString('pt-PT');
};

const LinkNegocioPlenoButton = ({ opportunity, onLinked }) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { updateExistingOpportunity } = useOpportunities();
    const { createNegocioPleno, fetchNegocioPlenoByOpportunity } = useNegocioPleno();

    // Estados
    const [showModal, setShowModal] = useState(false);
    const [availableOpportunities, setAvailableOpportunities] = useState([]);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [existingNegocioPleno, setExistingNegocioPleno] = useState(null);

    // Verificar se já existe negócio pleno
    useEffect(() => {
        checkExistingNegocioPleno();
    }, [opportunity]);

    const checkExistingNegocioPleno = async () => {
        if (opportunity?.isNegocioPleno || opportunity?.negocioPlenoId) {
            try {
                const negocioPleno = await fetchNegocioPlenoByOpportunity(opportunity.id);
                setExistingNegocioPleno(negocioPleno);
            } catch (error) {
                console.error('Erro ao verificar negócio pleno:', error);
            }
        }
    };

    // Buscar oportunidades disponíveis
    const loadAvailableOpportunities = async () => {
        try {
            setLoading(true);
            setError(null);

            const opportunities = await getAvailableOpportunitiesForLinking(
                opportunity,
                currentUser.uid
            );

            setAvailableOpportunities(opportunities);

            if (opportunities.length === 0) {
                setError('Não há oportunidades vendedoras disponíveis para linkar. Certifique-se de que existem oportunidades de venda ativas que ainda não foram linkadas.');
            }
        } catch (error) {
            console.error('Erro ao buscar oportunidades:', error);
            setError('Erro ao buscar oportunidades disponíveis');
        } finally {
            setLoading(false);
        }
    };

    // Abrir modal
    const handleOpenModal = () => {
        setShowModal(true);
        loadAvailableOpportunities();
    };

    // Criar negócio pleno
    const handleLink = async () => {
        if (!selectedOpportunity) {
            setError('Selecione uma oportunidade vendedora');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // IMPORTANTE: Comprador linka com Vendedor
            // Oportunidade compradora (atual) + Oportunidade vendedora (selecionada)
            const negocioPleno = await createNegocioPleno(
                selectedOpportunity, // Vendedora
                opportunity         // Compradora (atual)
            );

            // Fechar modal
            setShowModal(false);

            // Callback opcional
            if (onLinked) {
                onLinked(negocioPleno);
            }

            // Navegar para o negócio pleno
            navigate(`/negocio-pleno/${negocioPleno.id}`);
        } catch (error) {
            console.error('Erro ao criar negócio pleno:', error);
            setError(error.message || 'Erro ao criar negócio pleno');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar oportunidades baseado na busca
    const filteredOpportunities = availableOpportunities.filter(opp => {
        if (!searchTerm) return true;

        const search = searchTerm.toLowerCase();
        return (
            opp.titulo?.toLowerCase().includes(search) ||
            opp.clienteName?.toLowerCase().includes(search) ||
            opp.imovelVenda?.morada?.toLowerCase().includes(search) ||
            opp.imovelVenda?.referencia?.toLowerCase().includes(search)
        );
    });

    // VERIFICAÇÃO IMPORTANTE: Só mostrar botão para oportunidades COMPRADORAS
    const tiposComprador = ['comprador', 'buyer', 'BUYER'];
    if (!tiposComprador.includes(opportunity?.tipo)) {
        return null; // Não mostrar nada para vendedores
    }

    // Se já tem negócio pleno, mostrar informação
    if (existingNegocioPleno) {
        return (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <SparklesIcon className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-indigo-900">
                                NEGÓCIO PLENO
                            </h3>
                            <p className="text-sm text-indigo-700">
                                {existingNegocioPleno.numero}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/negocio-pleno/${existingNegocioPleno.id}`)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        Ver Negócio Pleno
                    </button>
                </div>

                {/* Informações do negócio */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500">Vendedor</p>
                        <p className="font-medium text-gray-900">
                            {existingNegocioPleno.oportunidades?.vendedora?.clienteNome}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500">Valor Acordado</p>
                        <p className="font-medium text-green-600">
                            €{formatCurrency(existingNegocioPleno.valores?.valorAcordado || 0)}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Botão para criar negócio pleno
    return (
        <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <LinkIcon className="h-6 w-6 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-yellow-800">
                            Criar Negócio Pleno
                        </h3>
                        <p className="mt-1 text-sm text-yellow-700">
                            Esta oportunidade de compra pode ser linkada com uma oportunidade de venda para criar um Negócio Pleno.
                        </p>
                        <button
                            onClick={handleOpenModal}
                            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            <LinkIcon className="w-4 h-4 inline mr-2" />
                            Procurar Vendedor
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Seleção */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Criar Negócio Pleno
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Selecione uma oportunidade vendedora para linkar com este comprador
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Informação da Oportunidade Atual (Comprador) */}
                        <div className="px-6 py-3 bg-green-50 border-b">
                            <div className="flex items-center space-x-3">
                                <UserIcon className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-green-900">
                                        Comprador: {opportunity.clienteName}
                                    </p>
                                    <p className="text-xs text-green-700">
                                        {opportunity.titulo}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Busca */}
                        <div className="px-6 py-3 border-b">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por título, cliente, morada ou referência..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Lista de Oportunidades */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    <p className="mt-2 text-gray-500">Carregando oportunidades vendedoras...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-600">{error}</p>
                                </div>
                            ) : filteredOpportunities.length === 0 ? (
                                <div className="text-center py-8">
                                    <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                                        Nenhuma oportunidade vendedora disponível
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm
                                            ? 'Tente ajustar os termos de busca'
                                            : 'Todas as oportunidades vendedoras já estão linkadas ou não há nenhuma disponível'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {filteredOpportunities.map((opp) => (
                                        <div
                                            key={opp.id}
                                            onClick={() => setSelectedOpportunity(opp)}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedOpportunity?.id === opp.id
                                                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-start space-x-3">
                                                        <HomeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900">
                                                                {opp.titulo}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                <UserIcon className="w-4 h-4 inline mr-1" />
                                                                {opp.clienteName}
                                                            </p>

                                                            {/* Dados do Imóvel */}
                                                            {opp.imovelVenda && (
                                                                <div className="mt-2 space-y-1">
                                                                    <p className="text-sm text-gray-500">
                                                                        <MapPinIcon className="w-4 h-4 inline mr-1" />
                                                                        {opp.imovelVenda.morada || 'Morada não definida'}
                                                                    </p>
                                                                    <div className="flex items-center space-x-4 text-sm">
                                                                        {opp.imovelVenda.tipologia && (
                                                                            <span className="text-gray-600">
                                                                                {opp.imovelVenda.tipologia}
                                                                            </span>
                                                                        )}
                                                                        {opp.imovelVenda.area && (
                                                                            <span className="text-gray-600">
                                                                                {opp.imovelVenda.area} m²
                                                                            </span>
                                                                        )}
                                                                        {opp.imovelVenda.referencia && (
                                                                            <span className="text-gray-500">
                                                                                Ref: {opp.imovelVenda.referencia}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Valor */}
                                                            <p className="mt-2 text-lg font-semibold text-green-600">
                                                                <CurrencyEuroIcon className="w-5 h-5 inline mr-1" />
                                                                €{formatCurrency(opp.valorEstimado || opp.vendedor?.valorPedido || 0)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {selectedOpportunity?.id === opp.id && (
                                                    <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t bg-gray-50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    {selectedOpportunity
                                        ? `Vendedor selecionado: ${selectedOpportunity.clienteName}`
                                        : 'Selecione uma oportunidade vendedora'}
                                </p>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleLink}
                                        disabled={!selectedOpportunity || loading}
                                        className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 ${selectedOpportunity && !loading
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <SparklesIcon className="w-5 h-5" />
                                        <span>Criar Negócio Pleno</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LinkNegocioPlenoButton;