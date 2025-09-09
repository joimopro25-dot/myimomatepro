/**
 * LEAD FORM PAGE - MyImoMatePro
 * Formulário simplificado para criar/editar leads
 * Integra criação de cliente + qualificação de lead
 * 
 * Caminho: src/pages/LeadForm.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLeads } from '../contexts/LeadContext';
import { useClients } from '../contexts/ClientContext';
import {
    validateLeadData,
    LEAD_TYPES,
    LEAD_TYPE_LABELS,
    LEAD_SOURCES,
    LEAD_SOURCE_LABELS,
    formatCurrency,
    getQualificationFieldsByType
} from '../models/leadModel';
import Layout from '../components/Layout';
import {
    ArrowLeftIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    CurrencyEuroIcon,
    HomeIcon,
    DocumentTextIcon,
    TagIcon,
    BuildingOfficeIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';

const LeadFormPage = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEditMode = Boolean(leadId);

    // Verificar se veio de um cliente específico
    const clientIdFromRoute = location.state?.clientId;
    const clientFromRoute = location.state?.client;

    // Contexts
    const {
        currentLead,
        loading: leadLoading,
        errors: leadErrors,
        createLead,
        fetchLead,
        updateLead,
        clearCurrentLead,
        clearError: clearLeadError
    } = useLeads();

    const {
        clients,
        createClient,
        fetchClients,
        loading: clientLoading,
        errors: clientErrors
    } = useClients();

    // Estados do formulário
    const [step, setStep] = useState(1); // 1: Cliente, 2: Qualificação
    const [clientMode, setClientMode] = useState(clientIdFromRoute ? 'existing' : 'new'); // 'new' ou 'existing'
    const [selectedClient, setSelectedClient] = useState(clientFromRoute || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showClientSearch, setShowClientSearch] = useState(false);

    // Dados do formulário de cliente
    const [clientData, setClientData] = useState({
        name: '',
        email: '',
        phone: '',
        nif: '',
        address: '',
        city: '',
        postalCode: '',
        notes: ''
    });

    // Dados do formulário de lead
    const [leadData, setLeadData] = useState({
        type: LEAD_TYPES.COMPRADOR,
        source: LEAD_SOURCES.WEBSITE,
        qualification: {
            qualificationNotes: '',
            budget: '',
            propertyReference: '',
            propertyLocation: '',
            askingPrice: '',
            investmentLocation: '',
            investmentBudget: ''
        }
    });

    // Estados de validação
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Carregar lead em modo de edição
    useEffect(() => {
        if (isEditMode && leadId) {
            loadLead();
        }
    }, [leadId]);

    // Carregar clientes para pesquisa
    useEffect(() => {
        if (clientMode === 'existing' && !clients.length) {
            fetchClients();
        }
    }, [clientMode]);

    // Carregar dados da lead
    const loadLead = async () => {
        try {
            const lead = await fetchLead(leadId);
            if (lead) {
                setLeadData({
                    type: lead.type,
                    source: lead.source,
                    qualification: lead.qualification
                });
                setSelectedClient(lead.client);
                setClientMode('existing');
            }
        } catch (error) {
            console.error('Erro ao carregar lead:', error);
        }
    };

    // Validar formulário de cliente
    const validateClient = () => {
        const newErrors = {};

        if (clientMode === 'new') {
            if (!clientData.name) newErrors.name = 'Nome é obrigatório';
            if (!clientData.phone && !clientData.email) {
                newErrors.contact = 'Telefone ou email é obrigatório';
            }
        } else if (clientMode === 'existing') {
            if (!selectedClient) newErrors.client = 'Selecione um cliente';
        }

        return newErrors;
    };

    // Validar formulário de lead
    const validateLead = () => {
        const newErrors = {};
        const fields = getQualificationFieldsByType(leadData.type);

        // Validar campos específicos por tipo
        if (leadData.type === LEAD_TYPES.COMPRADOR || leadData.type === LEAD_TYPES.INQUILINO) {
            if (!leadData.qualification.budget) {
                newErrors.budget = 'Orçamento é obrigatório';
            }
        }

        if (leadData.type === LEAD_TYPES.VENDEDOR || leadData.type === LEAD_TYPES.SENHORIO) {
            if (!leadData.qualification.propertyLocation) {
                newErrors.propertyLocation = 'Localização do imóvel é obrigatória';
            }
            if (!leadData.qualification.askingPrice) {
                newErrors.askingPrice = 'Valor pretendido é obrigatório';
            }
        }

        if (leadData.type === LEAD_TYPES.INVESTIDOR) {
            if (!leadData.qualification.investmentBudget) {
                newErrors.investmentBudget = 'Orçamento de investimento é obrigatório';
            }
            if (!leadData.qualification.investmentLocation) {
                newErrors.investmentLocation = 'Local de investimento é obrigatório';
            }
        }

        return newErrors;
    };

    // Avançar para próximo passo
    const handleNextStep = () => {
        const clientErrors = validateClient();

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setErrors({});
        setStep(2);
    };

    // Voltar ao passo anterior
    const handlePreviousStep = () => {
        setStep(1);
        setErrors({});
    };

    // Submeter formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar dados da lead
        const leadValidationErrors = validateLead();

        if (Object.keys(leadValidationErrors).length > 0) {
            setErrors(leadValidationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            let clientId;

            // Criar ou obter cliente
            if (clientMode === 'new') {
                const newClient = await createClient({
                    ...clientData,
                    isProspect: true
                });
                clientId = newClient.id;
            } else {
                clientId = selectedClient.id;
            }

            // Preparar dados da lead
            const leadToSave = {
                clientId,
                type: leadData.type,
                source: leadData.source,
                qualification: leadData.qualification
            };

            // Criar ou atualizar lead
            if (isEditMode) {
                await updateLead(leadId, leadToSave);
            } else {
                await createLead(leadToSave);
            }

            setShowSuccess(true);

            // Redirecionar após sucesso
            setTimeout(() => {
                navigate('/leads');
            }, 1500);
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            setErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filtrar clientes para pesquisa
    const filteredClients = clients.filter(client => {
        const search = searchTerm.toLowerCase();
        return (
            client.name?.toLowerCase().includes(search) ||
            client.email?.toLowerCase().includes(search) ||
            client.phone?.includes(search)
        );
    });

    // Renderizar campos de qualificação por tipo
    const renderQualificationFields = () => {
        const { type, qualification } = leadData;

        switch (type) {
            case LEAD_TYPES.COMPRADOR:
            case LEAD_TYPES.INQUILINO:
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <CurrencyEuroIcon className="w-4 h-4 inline mr-1" />
                                Orçamento *
                            </label>
                            <input
                                type="number"
                                value={qualification.budget}
                                onChange={(e) => setLeadData({
                                    ...leadData,
                                    qualification: {
                                        ...qualification,
                                        budget: e.target.value
                                    }
                                })}
                                className={`w-full px-3 py-2 border rounded-md ${errors.budget ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Ex: 250000"
                            />
                            {errors.budget && (
                                <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <HomeIcon className="w-4 h-4 inline mr-1" />
                                Referência do Imóvel
                            </label>
                            <input
                                type="text"
                                value={qualification.propertyReference}
                                onChange={(e) => setLeadData({
                                    ...leadData,
                                    qualification: {
                                        ...qualification,
                                        propertyReference: e.target.value
                                    }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Ex: REF123456"
                            />
                        </div>
                    </>
                );

            case LEAD_TYPES.VENDEDOR:
            case LEAD_TYPES.SENHORIO:
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <MapPinIcon className="w-4 h-4 inline mr-1" />
                                Localização do Imóvel *
                            </label>
                            <input
                                type="text"
                                value={qualification.propertyLocation}
                                onChange={(e) => setLeadData({
                                    ...leadData,
                                    qualification: {
                                        ...qualification,
                                        propertyLocation: e.target.value
                                    }
                                })}
                                className={`w-full px-3 py-2 border rounded-md ${errors.propertyLocation ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Ex: Porto, Cedofeita"
                            />
                            {errors.propertyLocation && (
                                <p className="mt-1 text-sm text-red-600">{errors.propertyLocation}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <CurrencyEuroIcon className="w-4 h-4 inline mr-1" />
                                Valor Pretendido *
                            </label>
                            <input
                                type="number"
                                value={qualification.askingPrice}
                                onChange={(e) => setLeadData({
                                    ...leadData,
                                    qualification: {
                                        ...qualification,
                                        askingPrice: e.target.value
                                    }
                                })}
                                className={`w-full px-3 py-2 border rounded-md ${errors.askingPrice ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Ex: 350000"
                            />
                            {errors.askingPrice && (
                                <p className="mt-1 text-sm text-red-600">{errors.askingPrice}</p>
                            )}
                        </div>
                    </>
                );

            case LEAD_TYPES.INVESTIDOR:
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <BanknotesIcon className="w-4 h-4 inline mr-1" />
                                Orçamento de Investimento *
                            </label>
                            <input
                                type="number"
                                value={qualification.investmentBudget}
                                onChange={(e) => setLeadData({
                                    ...leadData,
                                    qualification: {
                                        ...qualification,
                                        investmentBudget: e.target.value
                                    }
                                })}
                                className={`w-full px-3 py-2 border rounded-md ${errors.investmentBudget ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Ex: 500000"
                            />
                            {errors.investmentBudget && (
                                <p className="mt-1 text-sm text-red-600">{errors.investmentBudget}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <MapPinIcon className="w-4 h-4 inline mr-1" />
                                Local de Investimento *
                            </label>
                            <input
                                type="text"
                                value={qualification.investmentLocation}
                                onChange={(e) => setLeadData({
                                    ...leadData,
                                    qualification: {
                                        ...qualification,
                                        investmentLocation: e.target.value
                                    }
                                })}
                                className={`w-full px-3 py-2 border rounded-md ${errors.investmentLocation ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Ex: Lisboa, Porto"
                            />
                            {errors.investmentLocation && (
                                <p className="mt-1 text-sm text-red-600">{errors.investmentLocation}</p>
                            )}
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/leads')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Voltar para Leads
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Editar Lead' : 'Nova Lead'}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Passo {step} de 2: {step === 1 ? 'Dados do Cliente' : 'Qualificação da Lead'}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center">
                        <div className={`flex-1 h-2 rounded-l ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`flex-1 h-2 rounded-r ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    </div>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                        <div>
                            <p className="text-green-800 font-medium">
                                Lead {isEditMode ? 'atualizada' : 'criada'} com sucesso!
                            </p>
                            <p className="text-green-600 text-sm mt-1">
                                Redirecionando...
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                        <div>
                            <p className="text-red-800 font-medium">Erro ao salvar</p>
                            <p className="text-red-600 text-sm mt-1">{errors.submit}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Cliente */}
                    {step === 1 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                Dados do Cliente
                            </h2>

                            {/* Seletor de modo */}
                            {!clientIdFromRoute && (
                                <div className="mb-6">
                                    <div className="flex space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setClientMode('new')}
                                            className={`flex-1 py-2 px-4 rounded-md border ${clientMode === 'new'
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300'
                                                }`}
                                        >
                                            <UserPlusIcon className="w-5 h-5 inline mr-2" />
                                            Novo Cliente
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClientMode('existing')}
                                            className={`flex-1 py-2 px-4 rounded-md border ${clientMode === 'existing'
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300'
                                                }`}
                                        >
                                            <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
                                            Cliente Existente
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Formulário de novo cliente */}
                            {clientMode === 'new' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <UserIcon className="w-4 h-4 inline mr-1" />
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            value={clientData.name}
                                            onChange={(e) => setClientData({
                                                ...clientData,
                                                name: e.target.value
                                            })}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Ex: João Silva"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <PhoneIcon className="w-4 h-4 inline mr-1" />
                                            Telefone
                                        </label>
                                        <input
                                            type="tel"
                                            value={clientData.phone}
                                            onChange={(e) => setClientData({
                                                ...clientData,
                                                phone: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Ex: 912345678"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={clientData.email}
                                            onChange={(e) => setClientData({
                                                ...clientData,
                                                email: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Ex: joao@email.com"
                                        />
                                    </div>

                                    {errors.contact && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-red-600">{errors.contact}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pesquisa de cliente existente */}
                            {clientMode === 'existing' && (
                                <div>
                                    {selectedClient ? (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {selectedClient.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {selectedClient.email} • {selectedClient.phone}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedClient(null)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Alterar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    onFocus={() => setShowClientSearch(true)}
                                                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md"
                                                    placeholder="Pesquisar cliente por nome, email ou telefone..."
                                                />
                                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                            </div>

                                            {showClientSearch && filteredClients.length > 0 && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                                    {filteredClients.map(client => (
                                                        <button
                                                            key={client.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedClient(client);
                                                                setShowClientSearch(false);
                                                                setSearchTerm('');
                                                            }}
                                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                                                        >
                                                            <p className="font-medium text-gray-900">
                                                                {client.name}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {client.email} • {client.phone}
                                                            </p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {errors.client && (
                                                <p className="mt-1 text-sm text-red-600">{errors.client}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Qualificação */}
                    {step === 2 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                Qualificação da Lead
                            </h2>

                            <div className="space-y-4">
                                {/* Tipo de Lead */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Lead *
                                    </label>
                                    <select
                                        value={leadData.type}
                                        onChange={(e) => setLeadData({
                                            ...leadData,
                                            type: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        {Object.entries(LEAD_TYPE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fonte da Lead */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <TagIcon className="w-4 h-4 inline mr-1" />
                                        Fonte da Lead *
                                    </label>
                                    <select
                                        value={leadData.source}
                                        onChange={(e) => setLeadData({
                                            ...leadData,
                                            source: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Campos específicos por tipo */}
                                {renderQualificationFields()}

                                {/* Notas de Qualificação */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                                        Notas de Qualificação
                                    </label>
                                    <textarea
                                        value={leadData.qualification.qualificationNotes}
                                        onChange={(e) => setLeadData({
                                            ...leadData,
                                            qualification: {
                                                ...leadData.qualification,
                                                qualificationNotes: e.target.value
                                            }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        rows="4"
                                        placeholder="Detalhes sobre a qualificação do cliente..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botões de ação */}
                    <div className="flex justify-between">
                        {step === 1 ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => navigate('/leads')}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Próximo
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePreviousStep}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar Lead'}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default LeadFormPage;