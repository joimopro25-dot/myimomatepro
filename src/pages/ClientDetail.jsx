/**
 * CLIENT DETAIL PAGE - MyImoMatePro
 * Página de visualização completa dos dados do cliente
 * Funcionalidade: Ver todas as informações do cliente (ícone olho)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
import { CLIENT_CONTACT_PREFERENCES, CLIENT_MARITAL_STATUS, CLIENT_MARRIAGE_REGIMES, CLIENT_CREDIT_TYPES, CLIENT_LEAD_SOURCES, CLIENT_AVAILABLE_TAGS } from '../models/clientModel';
import Layout from '../components/Layout';
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
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
    StarIcon as StarIconSolid,
    HeartIcon as HeartIconSolid
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

    // Estados locais
    const [activeTab, setActiveTab] = useState('personal');

    // Carregar dados do cliente ao montar componente
    useEffect(() => {
        const loadClient = async () => {
            if (clientId) {
                console.log('📋 ClientDetail: Carregando cliente...', { clientId });
                try {
                    await fetchClient(clientId);
                } catch (error) {
                    console.error('❌ ClientDetail: Erro ao carregar cliente:', error);
                }
            }
        };

        loadClient();

        // Cleanup ao desmontar
        return () => {
            clearCurrentClient();
        };
    }, [clientId, fetchClient, clearCurrentClient]);

    // Função para formatar data
    const formatDate = (date) => {
        if (!date) return 'Não informado';
        try {
            if (date.toDate) {
                return date.toDate().toLocaleDateString('pt-PT');
            }
            return new Date(date).toLocaleDateString('pt-PT');
        } catch (error) {
            return 'Data inválida';
        }
    };

    // Loading state
    if (loading.current) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando dados do cliente...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Error state
    if (errors.current) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <div className="text-red-600 mb-4">
                        <InformationCircleIcon className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Erro ao carregar cliente</h3>
                        <p className="text-sm">{errors.current}</p>
                    </div>
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

    // Cliente não encontrado
    if (!currentClient) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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

    // Tabs de navegação
    const tabs = [
        { id: 'personal', name: 'Dados Pessoais', icon: UserIcon },
        { id: 'financial', name: 'Informações Financeiras', icon: CurrencyEuroIcon },
        { id: 'documents', name: 'Documentação', icon: ClipboardDocumentCheckIcon },
        { id: 'relationship', name: 'Relacionamento', icon: HeartIcon }
    ];

    // Renderizar dados pessoais
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
                        <p className="text-gray-900">{client.bestContactTime || 'Não informado'}</p>
                    </div>
                </div>
            </div>

            {/* Documentação */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <IdentificationIcon className="w-5 h-5 mr-2" />
                    Documentação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cartão de Cidadão</label>
                        <p className="text-gray-900">{client.documentNumber || 'Não informado'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Validade do CC</label>
                        <p className="text-gray-900">{formatDate(client.documentExpiry)}</p>
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

            {/* Morada */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    Morada de Residência
                </h3>
                <div className="space-y-2">
                    {client.address ? (
                        <>
                            <p className="text-gray-900">{client.address.street || 'Rua não informada'}</p>
                            <p className="text-gray-600">
                                {[client.address.city, client.address.postalCode, client.address.country]
                                    .filter(Boolean).join(', ') || 'Localização não informada'}
                            </p>
                        </>
                    ) : (
                        <p className="text-gray-500">Morada não informada</p>
                    )}
                </div>
            </div>

            {/* Dados do cônjuge (se aplicável) */}
            {['married', 'union'].includes(client.maritalStatus) && client.spouse && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <HeartIconSolid className="w-5 h-5 mr-2 text-pink-500" />
                        Dados do Cônjuge
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <p className="text-gray-900">{client.spouse.name || 'Não informado'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <p className="text-gray-900">{client.spouse.phone || 'Não informado'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <p className="text-gray-900">{client.spouse.email || 'Não informado'}</p>
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

    // Renderizar informações financeiras
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banco de Relacionamento</label>
                        <p className="text-gray-900">{client.financial?.relationshipBank || 'Não informado'}</p>
                    </div>
                </div>
            </div>

            {/* Créditos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BanknotesIcon className="w-5 h-5 mr-2" />
                    Situação de Crédito
                </h3>
                <div className="space-y-4">
                    {client.financial?.credits && Object.entries(client.financial.credits).map(([type, credit]) => {
                        if (!credit?.active) return null;
                        return (
                            <div key={type} className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">
                                    {CLIENT_CREDIT_TYPES[type] || type}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Montante:</span>
                                        <span className="ml-1 text-gray-900">
                                            {credit.amount ? `€${credit.amount}` : 'N/D'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Entidade:</span>
                                        <span className="ml-1 text-gray-900">{credit.entity || 'N/D'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Prestação:</span>
                                        <span className="ml-1 text-gray-900">
                                            {credit.monthlyPayment ? `€${credit.monthlyPayment}` : 'N/D'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {!client.financial?.credits ||
                        !Object.values(client.financial.credits).some(credit => credit?.active) && (
                            <p className="text-gray-500">Sem créditos ativos</p>
                        )}
                </div>
            </div>

            {/* Pré-aprovação */}
            {client.financial?.preApproval && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                        Pré-aprovação Bancária
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tem Pré-aprovação</label>
                            <p className="text-gray-900">
                                {client.financial.preApproval.hasPreApproval ? 'Sim' : 'Não'}
                            </p>
                        </div>
                        {client.financial.preApproval.hasPreApproval && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                                    <p className="text-gray-900">
                                        {client.financial.preApproval.bank || 'Não informado'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Montante</label>
                                    <p className="text-gray-900">
                                        {client.financial.preApproval.amount ?
                                            `€${client.financial.preApproval.amount}` : 'Não informado'}
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

    // Renderizar documentação e tags
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

    // Renderizar relacionamento
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

    // Renderizar conteúdo do tab ativo
    const renderTabContent = () => {
        switch (activeTab) {
            case 'personal':
                return renderPersonalData();
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
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/clients')}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                {client.name}
                                {/* Indicadores visuais */}
                                <div className="flex ml-3 space-x-1">
                                    {client.tags?.includes('VIP') && (
                                        <StarIconSolid className="w-5 h-5 text-yellow-500" title="Cliente VIP" />
                                    )}
                                    {client.tags?.includes('Urgente') && (
                                        <div className="w-3 h-3 bg-red-500 rounded-full" title="Urgente" />
                                    )}
                                    {['married', 'union'].includes(client.maritalStatus) && (
                                        <HeartIconSolid className="w-5 h-5 text-pink-500" title="Casado/União de facto" />
                                    )}
                                </div>
                            </h1>
                            <p className="text-sm text-gray-600">Visualização completa dos dados do cliente</p>
                        </div>
                    </div>

                    {/* Botão de editar */}
                    <button
                        onClick={() => navigate(`/clients/${client.id}/edit`)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4 mr-2" />
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
                    </div>
                </div>

                {/* Navegação por tabs */}
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