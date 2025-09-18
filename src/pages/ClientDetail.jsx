/**
 * CLIENT DETAIL PAGE - MyImoMatePro
 * Página de visualização completa dos dados do cliente
 * VERSÃO ATUALIZADA - Com suporte para Negócios Plenos e Oportunidades
 * 
 * Caminho: src/pages/ClientDetail.jsx
 * Funcionalidade: Ver todas as informações do cliente (ícone olho)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
import { useNegocioPleno } from '../contexts/NegocioPlenoContext';
import { CLIENT_CONTACT_PREFERENCES, CLIENT_MARITAL_STATUS, CLIENT_MARRIAGE_REGIMES, CLIENT_CREDIT_TYPES, CLIENT_LEAD_SOURCES, CLIENT_AVAILABLE_TAGS } from '../models/clientModel';
import Layout from '../components/Layout';
// NOVO: Import do componente de badges atualizado
import OpportunityBadges from '../components/opportunities/OpportunityBadges';
import {
    ArrowLeftIcon,
    PencilIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    DocumentIcon,
    CurrencyEuroIcon,
    HeartIcon,
    MapPinIcon,
    BanknotesIcon,
    ClipboardDocumentCheckIcon,
    TagIcon,
    CalendarIcon,
    IdentificationIcon,
    BuildingOfficeIcon,
    InformationCircleIcon,
    ChartBarIcon,      // NOVO: Para oportunidades
    SparklesIcon,      // NOVO: Para Negócios Plenos
    LinkIcon,          // NOVO: Para indicar linking
    PlusIcon           // NOVO: Para adicionar
} from '@heroicons/react/24/outline';
import {
    StarIcon as StarIconSolid,
    HeartIcon as HeartIconSolid,
    SparklesIcon as SparklesIconSolid  // NOVO: Versão sólida
} from '@heroicons/react/24/solid';

const ClientDetail = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();

    // Context do cliente
    const {
        currentClient,
        loading,
        errors,
        fetchClient,
        clearCurrentClient
    } = useClients();

    // NOVO: Context de Negócios Plenos
    const { fetchClientNegociosPlenos } = useNegocioPleno();

    // Estados locais
    const [activeTab, setActiveTab] = useState('personal');
    // NOVO: Estado para Negócios Plenos do cliente
    const [clientNegociosPlenos, setClientNegociosPlenos] = useState([]);
    const [negocioPlenoStats, setNegocioPlenoStats] = useState({
        total: 0,
        emProgresso: 0,
        concluidos: 0,
        valorTotal: 0
    });

    // Helper function para formatação de datas
    const formatDate = (dateValue) => {
        if (!dateValue) return 'Não informado';

        try {
            let date;
            if (dateValue.seconds) {
                // Timestamp do Firestore
                date = new Date(dateValue.seconds * 1000);
            } else if (typeof dateValue === 'string') {
                date = new Date(dateValue);
            } else {
                date = dateValue;
            }

            return date.toLocaleDateString('pt-PT');
        } catch (error) {
            return 'Data inválida';
        }
    };

    // NOVO: Carregar Negócios Plenos do cliente
    const loadClientNegociosPlenos = async () => {
        if (clientId && fetchClientNegociosPlenos) {
            try {
                const negocios = await fetchClientNegociosPlenos(clientId);
                setClientNegociosPlenos(negocios);

                // Calcular estatísticas
                const stats = {
                    total: negocios.length,
                    emProgresso: negocios.filter(n =>
                        !['completed', 'cancelled'].includes(n.status)
                    ).length,
                    concluidos: negocios.filter(n => n.status === 'completed').length,
                    valorTotal: negocios.reduce((sum, n) =>
                        sum + (n.valores?.valorAcordado || 0), 0
                    )
                };
                setNegocioPlenoStats(stats);
            } catch (error) {
                console.error('Erro ao carregar Negócios Plenos:', error);
            }
        }
    };

    // Carregar dados do cliente ao montar componente
    useEffect(() => {
        const loadClient = async () => {
            if (clientId) {
                try {
                    await fetchClient(clientId);
                    // NOVO: Carregar também os Negócios Plenos
                    await loadClientNegociosPlenos();
                } catch (error) {
                    console.error('ClientDetail: Erro ao carregar cliente:', error);
                }
            }
        };

        loadClient();

        // Cleanup ao desmontar
        return () => {
            clearCurrentClient();
        };
    }, [clientId, fetchClient, clearCurrentClient]);

    // Estados de loading e erro
    if (loading.current) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">A carregar dados do cliente...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (errors.current) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar cliente</h3>
                    <p className="text-gray-600 mb-6">{errors.current}</p>
                    <button
                        onClick={() => navigate('/clients')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Voltar à Lista
                    </button>
                </div>
            </Layout>
        );
    }

    if (!currentClient) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">Cliente não encontrado</h3>
                    <p className="text-gray-600 mb-6">O cliente solicitado não existe ou foi removido.</p>
                    <button
                        onClick={() => navigate('/clients')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Voltar à Lista
                    </button>
                </div>
            </Layout>
        );
    }

    const client = currentClient;

    // NOVO: Função para obter cor do status do Negócio Pleno
    const getNegocioPlenoStatusColor = (status) => {
        const colors = {
            'linked': 'bg-purple-100 text-purple-800',
            'negotiation': 'bg-yellow-100 text-yellow-800',
            'proposal': 'bg-orange-100 text-orange-800',
            'accepted': 'bg-green-100 text-green-800',
            'cpcv_signed': 'bg-blue-100 text-blue-800',
            'deed_scheduled': 'bg-indigo-100 text-indigo-800',
            'completed': 'bg-emerald-100 text-emerald-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // NOVO: Função para obter label do status
    const getNegocioPlenoStatusLabel = (status) => {
        const labels = {
            'linked': 'Linkado',
            'negotiation': 'Em Negociação',
            'proposal': 'Proposta',
            'accepted': 'Aceite',
            'cpcv_signed': 'CPCV Assinado',
            'deed_scheduled': 'Escritura Agendada',
            'completed': 'Concluído',
            'cancelled': 'Cancelado'
        };
        return labels[status] || status;
    };

    // Tabs de navegação - ATUALIZADO com nova tab
    const tabs = [
        { id: 'personal', name: 'Dados Pessoais', icon: UserIcon },
        { id: 'opportunities', name: 'Oportunidades', icon: ChartBarIcon, badge: negocioPlenoStats.total }, // NOVO
        { id: 'financial', name: 'Informações Financeiras', icon: CurrencyEuroIcon },
        { id: 'documents', name: 'Documentação', icon: ClipboardDocumentCheckIcon },
        { id: 'relationship', name: 'Relacionamento', icon: HeartIcon }
    ];

    // NOVO: Renderizar tab de Oportunidades e Negócios Plenos
    const renderOpportunitiesData = () => (
        <div className="space-y-6">
            {/* Estatísticas de Negócios Plenos */}
            {negocioPlenoStats.total > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <SparklesIconSolid className="w-6 h-6 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Negócios Plenos
                            </h3>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-600 text-white">
                            {negocioPlenoStats.total} Total
                        </span>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-2xl font-bold text-purple-900">{negocioPlenoStats.total}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-gray-500">Em Progresso</p>
                            <p className="text-2xl font-bold text-yellow-600">{negocioPlenoStats.emProgresso}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-gray-500">Concluídos</p>
                            <p className="text-2xl font-bold text-green-600">{negocioPlenoStats.concluidos}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-gray-500">Valor Total</p>
                            <p className="text-xl font-bold text-purple-900">
                                €{negocioPlenoStats.valorTotal.toLocaleString('pt-PT')}
                            </p>
                        </div>
                    </div>

                    {/* Lista de Negócios Plenos */}
                    <div className="space-y-3">
                        {clientNegociosPlenos.map((negocio) => (
                            <div
                                key={negocio.id}
                                onClick={() => navigate(`/negocio-pleno/${negocio.id}`)}
                                className="bg-white rounded-lg p-4 hover:shadow-md transition-all cursor-pointer border border-purple-100"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="w-5 h-5 text-purple-600" />
                                        <span className="font-semibold text-gray-900">
                                            {negocio.tipo === 'comprador'
                                                ? `Compra de ${negocio.vendedorNome}`
                                                : `Venda para ${negocio.compradorNome}`
                                            }
                                        </span>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNegocioPlenoStatusColor(negocio.status)
                                        }`}>
                                        {getNegocioPlenoStatusLabel(negocio.status)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Valor</p>
                                        <p className="font-medium">€{(negocio.valores?.valorAcordado || 0).toLocaleString('pt-PT')}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Imóvel</p>
                                        <p className="font-medium">{negocio.imovel?.morada || 'N/D'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Data Criação</p>
                                        <p className="font-medium">{formatDate(negocio.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Oportunidades do Cliente */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ChartBarIcon className="w-5 h-5 mr-2" />
                        Oportunidades
                    </h3>
                    <button
                        onClick={() => navigate(`/clients/${clientId}/opportunities/new`)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Nova Oportunidade
                    </button>
                </div>

                {/* Componente de Badges de Oportunidades */}
                <OpportunityBadges
                    clientId={clientId}
                    variant="expanded"
                    showEmpty={true}
                />
            </div>

            {/* Botão para criar Negócio Pleno se houver oportunidades */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-purple-900 mb-2">
                            Criar Negócio Pleno
                        </h4>
                        <p className="text-sm text-purple-700">
                            Link oportunidades de compra e venda para criar um Negócio Pleno unificado
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/negocio-pleno/new')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Criar Negócio
                    </button>
                </div>
            </div>
        </div>
    );

    // Renderizar dados pessoais (mantém original)
    const renderPersonalData = () => (
        <div className="space-y-6">
            {/* Informações básicas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2" />
                    Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <p className="text-gray-900">{client.name || 'Não informado'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                        <p className="text-gray-900">{formatDate(client.birthDate)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Naturalidade</label>
                        <p className="text-gray-900">{client.birthPlace || 'Não informado'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                        <p className="text-gray-900">
                            {CLIENT_MARITAL_STATUS[client.maritalStatus] || 'Não informado'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
                        <p className="text-gray-900">{client.nif || 'Não informado'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                        <p className="text-gray-900">{client.profession || 'Não informado'}</p>
                    </div>
                </div>
            </div>

            {/* Contactos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    Informações de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <p className="text-gray-900">{client.phone || 'Não informado'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-900">{client.email || 'Não informado'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferência de Contacto</label>
                        <p className="text-gray-900">
                            {CLIENT_CONTACT_PREFERENCES[client.contactPreference] || 'Não informado'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Melhor Horário</label>
                        <p className="text-gray-900">{client.bestTimeToContact || 'Não informado'}</p>
                    </div>
                </div>
            </div>

            {/* Morada */}
            {client.address && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2" />
                        Morada
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                            <p className="text-gray-900">{client.address.street || 'Não informado'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                            <p className="text-gray-900">{client.address.city || 'Não informado'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                            <p className="text-gray-900">{client.address.postalCode || 'Não informado'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                            <p className="text-gray-900">{client.address.country || 'Portugal'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Informações do cônjuge */}
            {client.spouse && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <HeartIcon className="w-5 h-5 mr-2" />
                        Informações do Cônjuge
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <p className="text-gray-900">{client.spouse.name || 'Não informado'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                            <p className="text-gray-900">{formatDate(client.spouse.birthDate)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
                            <p className="text-gray-900">{client.spouse.nif || 'Não informado'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                            <p className="text-gray-900">{client.spouse.profession || 'Não informado'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Renderizar informações financeiras (mantém original)
    const renderFinancialData = () => (
        <div className="space-y-6">
            {/* Rendimentos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CurrencyEuroIcon className="w-5 h-5 mr-2" />
                    Informações de Rendimento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rendimento Mensal</label>
                        <p className="text-gray-900">
                            {client.financial?.monthlyIncome ? `€${client.financial.monthlyIncome}` : 'Não informado'}
                        </p>
                    </div>
                    {client.spouse && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rendimento Cônjuge</label>
                            <p className="text-gray-900">
                                {client.financial?.spouseMonthlyIncome ? `€${client.financial.spouseMonthlyIncome}` : 'Não informado'}
                            </p>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capital Disponível</label>
                        <p className="text-gray-900">
                            {client.financial?.availableCapital ? `€${client.financial.availableCapital}` : 'Não informado'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rendimento Total do Agregado</label>
                        <p className="text-gray-900">
                            {client.financial?.totalHouseholdIncome ? `€${client.financial.totalHouseholdIncome}` : 'Não informado'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Situação creditícia */}
            {client.financial?.creditType && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BanknotesIcon className="w-5 h-5 mr-2" />
                        Situação Creditícia
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Crédito</label>
                            <p className="text-gray-900">
                                {CLIENT_CREDIT_TYPES[client.financial.creditType] || client.financial.creditType}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                            <p className="text-gray-900">{client.financial.bank || 'Não informado'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Pré-aprovação */}
            {client.financial?.preApproval && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
                        Pré-aprovação de Crédito
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {client.financial.preApproval.hasPreApproval && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Aprovado</label>
                                    <p className="text-gray-900">
                                        {client.financial.preApproval.amount ? `€${client.financial.preApproval.amount}` : 'Não informado'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                    <p className="text-gray-900">
                                        {client.financial.preApproval.notes || 'Sem notas adicionais'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    // Renderizar documentação e tags (mantém original)
    const renderDocumentationAndTags = () => (
        <div className="space-y-6">
            {/* Tags */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TagIcon className="w-5 h-5 mr-2" />
                    Tags do Cliente
                </h3>
                <div className="flex flex-wrap gap-2">
                    {client.tags && client.tags.length > 0 ? (
                        client.tags.map((tag, index) => (
                            <span
                                key={`tag-${index}`}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                                {CLIENT_AVAILABLE_TAGS[tag] || tag}
                            </span>
                        ))
                    ) : (
                        <p className="text-gray-500">Nenhuma tag atribuída</p>
                    )}
                </div>
            </div>

            {/* Documentos disponíveis */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
                    Documentos Disponíveis
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {client.availableDocuments && Object.entries(client.availableDocuments).map(([doc, available]) => {
                        if (!available) return null;
                        return (
                            <div key={doc} className="flex items-center text-sm">
                                <DocumentIcon className="w-4 h-4 text-green-600 mr-2" />
                                <span className="text-gray-900">{doc.replace(/([A-Z])/g, ' $1').trim()}</span>
                            </div>
                        );
                    })}
                </div>
                {!client.availableDocuments ||
                    !Object.values(client.availableDocuments).some(doc => doc) && (
                        <p className="text-gray-500">Nenhum documento registado</p>
                    )}
            </div>

            {/* Observações */}
            {client.notes && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <InformationCircleIcon className="w-5 h-5 mr-2" />
                        Observações do Consultor
                    </h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{client.notes}</p>
                </div>
            )}
        </div>
    );

    // Renderizar relacionamento (mantém original)
    const renderRelationshipData = () => (
        <div className="space-y-6">
            {/* Como conheceu */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2" />
                    Relacionamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Como nos conheceu</label>
                        <p className="text-gray-900">
                            {CLIENT_LEAD_SOURCES[client.leadSource] || client.leadSource || 'Não informado'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data do Próximo Contacto</label>
                        <p className="text-gray-900">{formatDate(client.nextContactDate)}</p>
                    </div>
                </div>
            </div>

            {/* Consentimentos GDPR */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
                    Consentimentos GDPR
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center">
                        <div className={`w-4 h-4 rounded mr-3 flex items-center justify-center ${client.gdprConsent?.dataProcessing ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {client.gdprConsent?.dataProcessing ? '✓' : '✗'}
                        </div>
                        <span className="text-sm text-gray-900">
                            Tratamento de dados pessoais para prestação de serviços
                        </span>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-4 h-4 rounded mr-3 flex items-center justify-center ${client.gdprConsent?.marketing ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {client.gdprConsent?.marketing ? '✓' : '✗'}
                        </div>
                        <span className="text-sm text-gray-900">
                            Comunicações promocionais e de marketing
                        </span>
                    </div>
                </div>
            </div>

            {/* Datas importantes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    Histórico
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente desde</label>
                        <p className="text-gray-900">{formatDate(client.createdAt)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Última atualização</label>
                        <p className="text-gray-900">{formatDate(client.updatedAt)}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Renderizar conteúdo do tab ativo - ATUALIZADO
    const renderTabContent = () => {
        switch (activeTab) {
            case 'personal':
                return renderPersonalData();
            case 'opportunities':  // NOVO
                return renderOpportunitiesData();
            case 'financial':
                return renderFinancialData();
            case 'documents':
                return renderDocumentationAndTags();
            case 'relationship':
                return renderRelationshipData();
            default:
                return renderPersonalData();
        }
    };

    return (
        <Layout>
            <div className="p-6">
                {/* Header com navegação */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/clients')}
                            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                {client.name}
                                {/* NOVO: Indicador de Negócios Plenos */}
                                {negocioPlenoStats.total > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold">
                                        <SparklesIcon className="w-3 h-3 mr-1" />
                                        {negocioPlenoStats.total} NP
                                    </span>
                                )}
                            </h1>
                            <div className="flex items-center mt-1 space-x-4">
                                {client.tags?.includes('VIP') && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                        <StarIconSolid className="w-3 h-3 mr-1" />
                                        VIP
                                    </span>
                                )}
                                {client.tags?.includes('Urgente') && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                        Urgente
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/clients/${clientId}/edit`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4" />
                        Editar Cliente
                    </button>
                </div>

                {/* Informações de contacto rápido */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        {client.phone && (
                            <div className="flex items-center text-blue-700">
                                <PhoneIcon className="w-4 h-4 mr-1" />
                                <span>{client.phone}</span>
                            </div>
                        )}
                        {client.email && (
                            <div className="flex items-center text-blue-700">
                                <EnvelopeIcon className="w-4 h-4 mr-1" />
                                <span>{client.email}</span>
                            </div>
                        )}
                        {client.profession && (
                            <div className="flex items-center text-blue-700">
                                <DocumentIcon className="w-4 h-4 mr-1" />
                                <span>{client.profession}</span>
                            </div>
                        )}
                        {/* NOVO: Indicador rápido de Negócios */}
                        {negocioPlenoStats.emProgresso > 0 && (
                            <div className="flex items-center text-purple-700 font-medium">
                                <SparklesIcon className="w-4 h-4 mr-1" />
                                <span>{negocioPlenoStats.emProgresso} negócios em progresso</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navegação por tabs - ATUALIZADA */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {tab.name}
                                    {/* NOVO: Badge com contador */}
                                    {tab.badge > 0 && (
                                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${tab.id === 'opportunities' && negocioPlenoStats.total > 0
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Conteúdo do tab ativo */}
                {renderTabContent()}
            </div>
        </Layout>
    );
};

export default ClientDetail;