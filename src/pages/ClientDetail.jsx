/**
 * CLIENT DETAIL PAGE - MyImoMatePro
 * Página de visualização completa dos dados do cliente
 * ✅ VERSÃO COMPLETA E CORRIGIDA
 * 
 * Caminho: src/pages/ClientDetail.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
import {
    CLIENT_CONTACT_PREFERENCES,
    CLIENT_MARITAL_STATUS,
    CLIENT_MARRIAGE_REGIMES,
    CLIENT_CREDIT_TYPES,
    CLIENT_LEAD_SOURCES,
    CLIENT_AVAILABLE_TAGS
} from '../models/clientModel';
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

    // Helper function para formatação de datas
    const formatDate = (dateValue) => {
        if (!dateValue) return 'Não informado';

        try {
            let date;
            if (dateValue?.seconds) {
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

    // Carregar dados do cliente
    useEffect(() => {
        if (clientId) {
            fetchClient(clientId);
        }

        return () => {
            clearCurrentClient();
        };
    }, [clientId]);

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

    // Cliente não encontrado
    if (!currentClient) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <InformationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Cliente não encontrado</h2>
                        <button
                            onClick={() => navigate('/clients')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Voltar à Lista
                        </button>
                    </div>
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
                            {CLIENT_MARITAL_STATUS[client.maritalStatus] || client.maritalStatus || 'Não informado'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <IdentificationIcon className="w-5 h-5 mr-2" />
                    Documentos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cartão de Cidadão</label>
                        <p className="text-gray-900">{client.idNumber || 'Não informado'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Validade CC</label>
                        <p className="text-gray-900">{formatDate(client.idExpiry)}</p>
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
                    Contactos
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

            {/* Morada */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    Morada de Residência
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Morada</label>
                        <p className="text-gray-900">
                            {client.address?.street || 'Não informado'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                        <p className="text-gray-900">{client.address?.postalCode || 'Não informado'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Localidade</label>
                        <p className="text-gray-900">{client.address?.city || 'Não informado'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Freguesia</label>
                        <p className="text-gray-900">{client.address?.parish || 'Não informado'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Concelho</label>
                        <p className="text-gray-900">{client.address?.municipality || 'Não informado'}</p>
                    </div>
                </div>
            </div>

            {/* Dados do Cônjuge */}
            {(client.maritalStatus === 'married' || client.maritalStatus === 'union') && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <HeartIcon className="w-5 h-5 mr-2" />
                        Dados do Cônjuge
                    </h3>
                    {client.spouse ? (
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
                                <p className="text-gray-900">{client.spouse.nif || 'Não informado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                                <p className="text-gray-900">{client.spouse.profession || 'Não informado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Regime de Bens</label>
                                <p className="text-gray-900">
                                    {CLIENT_MARRIAGE_REGIMES[client.marriageRegime] || 'Não informado'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">Dados do cônjuge não informados</p>
                    )}
                </div>
            )}
        </div>
    );

    // Renderizar dados financeiros
    const renderFinancialData = () => (
        <div className="space-y-6">
            {/* Informações Financeiras */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CurrencyEuroIcon className="w-5 h-5 mr-2" />
                    Informações Financeiras
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rendimento do Cônjuge</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Situação de Crédito</label>
                        <p className="text-gray-900">
                            {CLIENT_CREDIT_TYPES[client.financial?.creditSituation] || 'Não informado'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Informações Bancárias */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                    Informações Bancárias
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banco de Relacionamento</label>
                        <p className="text-gray-900">
                            {client.financial?.bankRelationship || 'Não informado'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pré-aprovação Bancária</label>
                        <p className="text-gray-900">
                            {client.financial?.hasPreApproval ? 'Sim' : 'Não'}
                        </p>
                    </div>
                    {client.financial?.hasPreApproval && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Banco da Pré-aprovação</label>
                                <p className="text-gray-900">
                                    {client.financial.preApproval?.bank || 'Não informado'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Pré-aprovado</label>
                                <p className="text-gray-900">
                                    {client.financial.preApproval?.amount ? `€${client.financial.preApproval.amount}` : 'Não informado'}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
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
                            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                            <p className="text-sm text-gray-600">Detalhes do Cliente</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/clients/edit/${clientId}`)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Editar Cliente
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                                        ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Conteúdo do Tab */}
                {renderTabContent()}
            </div>
        </Layout>
    );
};

export default ClientDetail;