/**
 * LEAD FORM - MyImoMatePro
 * Formulário com 2 passos para criação de leads
 * 
 * Caminho: src/pages/LeadForm.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    createLead,
    updateLead,
    getLeadById
} from '../services/leadService';
import {
    listClients,
    createClient
} from '../services/clientService';
import { LEAD_FUNNEL_STATES } from '../models/leadModel';
import Layout from '../components/Layout';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    CurrencyEuroIcon,
    HomeIcon,
    DocumentTextIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const LeadForm = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isEditMode = Boolean(leadId);

    // Estados do formulário
    const [currentStep, setCurrentStep] = useState(1); // Controle de passos
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Estados para seleção/criação de cliente
    const [clientMode, setClientMode] = useState('existing'); // 'existing' ou 'new'
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);

    // Dados do novo cliente
    const [newClientData, setNewClientData] = useState({
        name: '',
        email: '',
        phone: '',
        nif: '',
        gdprConsent: false
    });

    // Dados da lead
    const [leadData, setLeadData] = useState({
        type: 'Cliente Comprador',
        source: 'Website',
        budget: '',
        propertyReference: '',
        notes: '',
        status: 'active',
        funnelState: LEAD_FUNNEL_STATES.ENTRADA
    });

    // Validação de campos
    const [errors, setErrors] = useState({});

    // Carregar clientes ao montar
    useEffect(() => {
        if (currentUser) {
            loadClients();
            if (isEditMode) {
                loadLead();
            }
        }
    }, [currentUser, leadId]);

    // Carregar lista de clientes
    const loadClients = async () => {
        if (!currentUser?.uid) {
            console.error('Usuário não autenticado');
            return;
        }

        try {
            setLoading(true);
            console.log('Carregando clientes para consultor:', currentUser.uid);

            const result = await listClients(currentUser.uid, {
                pageSize: 100
            });

            console.log('Resultado listClients:', result);

            if (result && result.clients) {
                setClients(result.clients);
            } else if (Array.isArray(result)) {
                setClients(result);
            } else {
                setClients([]);
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    // Carregar lead para edição
    const loadLead = async () => {
        try {
            setLoading(true);
            const lead = await getLeadById(leadId);

            // Preencher dados da lead
            setLeadData({
                type: lead.type || 'Cliente Comprador',
                source: lead.source || 'Website',
                budget: lead.budget || '',
                propertyReference: lead.propertyReference || '',
                notes: lead.notes || '',
                status: lead.status || 'active',
                funnelState: lead.funnelState || LEAD_FUNNEL_STATES.ENTRADA
            });

            // Definir cliente selecionado
            if (lead.client) {
                setSelectedClient(lead.client);
                setClientMode('existing');
            }

            // Se editando, começar no passo 2
            setCurrentStep(2);
        } catch (error) {
            console.error('Erro ao carregar lead:', error);
            setError('Erro ao carregar lead');
        } finally {
            setLoading(false);
        }
    };

    // Validar Passo 1 (Cliente)
    const validateStep1 = () => {
        const newErrors = {};

        if (clientMode === 'existing') {
            if (!selectedClient) {
                newErrors.client = 'Por favor, selecione um cliente';
            }
        } else {
            if (!newClientData.name) {
                newErrors.clientName = 'Nome do cliente é obrigatório';
            }
            if (!newClientData.email && !newClientData.phone) {
                newErrors.clientContact = 'Email ou telefone é obrigatório';
            }
            if (!newClientData.gdprConsent) {
                newErrors.gdprConsent = 'Consentimento GDPR é obrigatório';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validar Passo 2 (Lead)
    const validateStep2 = () => {
        const newErrors = {};

        if (!leadData.type) {
            newErrors.type = 'Tipo de lead é obrigatório';
        }

        if (!leadData.source) {
            newErrors.source = 'Fonte da lead é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Avançar para próximo passo
    const handleNextStep = () => {
        if (validateStep1()) {
            setCurrentStep(2);
            setErrors({});
        }
    };

    // Voltar ao passo anterior
    const handlePreviousStep = () => {
        setCurrentStep(1);
        setErrors({});
    };

    // Submeter formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep2()) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            let clientId;

            // Criar novo cliente se necessário
            if (clientMode === 'new') {
                const clientPayload = {
                    name: newClientData.name,
                    email: newClientData.email || '',
                    phone: newClientData.phone || '',
                    nif: newClientData.nif || '',
                    address: '',
                    city: 'Porto',
                    postalCode: '',
                    country: 'Portugal',
                    type: 'individual',
                    status: 'active',
                    isProspect: true,
                    gdprConsent: newClientData.gdprConsent,
                    gdprConsentDate: new Date().toISOString(),
                    marketingConsent: false,
                    source: leadData.source || 'Website',
                    tags: ['lead'],
                    notes: ''
                };

                console.log('Criando novo cliente:', clientPayload);
                const newClient = await createClient(currentUser.uid, clientPayload);
                clientId = newClient.id;
            } else {
                clientId = selectedClient?.id;
                if (!clientId) {
                    throw new Error('Por favor selecione um cliente');
                }
            }

            // Preparar dados da lead
            const leadPayload = {
                clientId,
                type: leadData.type,
                source: leadData.source,
                budget: leadData.budget ? Number(leadData.budget) : null,
                propertyReference: leadData.propertyReference,
                notes: leadData.notes,
                status: leadData.status,
                funnelState: leadData.funnelState
            };

            console.log('Criando lead:', leadPayload);

            // Criar ou atualizar lead
            if (isEditMode) {
                await updateLead(leadId, leadPayload);
            } else {
                await createLead(leadPayload, currentUser.uid);
            }

            setSuccess(true);

            // Redirecionar após sucesso
            setTimeout(() => {
                navigate('/leads');
            }, 1500);
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            setError(error.message || 'Erro ao salvar lead');
        } finally {
            setSaving(false);
        }
    };

    // Filtrar clientes por pesquisa
    const filteredClients = clients.filter(client => {
        if (!client || !client.name) return false;
        const search = searchTerm.toLowerCase();
        return (
            client.name?.toLowerCase().includes(search) ||
            client.email?.toLowerCase().includes(search) ||
            client.phone?.includes(search)
        );
    });

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/leads')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Voltar para Leads
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Editar Lead' : 'Nova Lead'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Passo {currentStep} de 2: {currentStep === 1 ? 'Seleção do Cliente' : 'Qualificação da Lead'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        * Campos obrigatórios
                    </p>

                    {/* Indicador de Progresso */}
                    <div className="mt-4 flex items-center">
                        <div className={`flex-1 h-2 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className="mx-2 text-sm text-gray-600">Cliente</div>
                        <div className={`flex-1 h-2 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className="mx-2 text-sm text-gray-600">Qualificação</div>
                    </div>
                </div>

                {/* Alertas */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Erro ao salvar</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                        <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Lead salva com sucesso!</p>
                            <p className="text-sm">Redirecionando...</p>
                        </div>
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                        {/* PASSO 1: Cliente */}
                        {currentStep === 1 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Informações do Cliente
                                </h2>

                                {/* Escolha entre cliente existente ou novo */}
                                <div className="flex gap-4 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setClientMode('existing');
                                            setErrors({});
                                        }}
                                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${clientMode === 'existing'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <MagnifyingGlassIcon className="w-5 h-5 mx-auto mb-1" />
                                        Cliente Existente
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setClientMode('new');
                                            setErrors({});
                                        }}
                                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${clientMode === 'new'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <UserPlusIcon className="w-5 h-5 mx-auto mb-1" />
                                        Novo Cliente
                                    </button>
                                </div>

                                {/* Cliente Existente */}
                                {clientMode === 'existing' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Selecione o Cliente *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Pesquisar cliente..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                                        />
                                        <select
                                            value={selectedClient?.id || ''}
                                            onChange={(e) => {
                                                const selectedId = e.target.value;
                                                if (selectedId) {
                                                    const client = clients.find(c => c.id === selectedId);
                                                    setSelectedClient(client);
                                                    setErrors({});
                                                } else {
                                                    setSelectedClient(null);
                                                }
                                            }}
                                            className={`w-full px-3 py-2 border rounded-lg ${errors.client ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            size="5"
                                        >
                                            {clients.length === 0 ? (
                                                <option value="" disabled>
                                                    {loading ? 'Carregando clientes...' : 'Nenhum cliente encontrado'}
                                                </option>
                                            ) : (
                                                <>
                                                    <option value="">Selecione um cliente...</option>
                                                    {filteredClients.map(client => (
                                                        <option key={client.id} value={client.id}>
                                                            {client.name} - {client.email || client.phone || 'Sem contacto'}
                                                        </option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                        {errors.client && (
                                            <p className="mt-1 text-sm text-red-600">{errors.client}</p>
                                        )}

                                        {/* Mostrar dados do cliente selecionado */}
                                        {selectedClient && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm font-semibold text-blue-900">Cliente Selecionado:</p>
                                                <p className="text-sm text-blue-700 mt-1">{selectedClient.name}</p>
                                                {selectedClient.email && <p className="text-sm text-blue-600">{selectedClient.email}</p>}
                                                {selectedClient.phone && <p className="text-sm text-blue-600">{selectedClient.phone}</p>}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Novo Cliente */}
                                {clientMode === 'new' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <UserIcon className="w-4 h-4 inline mr-1" />
                                                    Nome *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newClientData.name}
                                                    onChange={(e) => setNewClientData({
                                                        ...newClientData,
                                                        name: e.target.value
                                                    })}
                                                    className={`w-full px-3 py-2 border rounded-lg ${errors.clientName ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="Nome completo"
                                                />
                                                {errors.clientName && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={newClientData.email}
                                                    onChange={(e) => setNewClientData({
                                                        ...newClientData,
                                                        email: e.target.value
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    placeholder="email@exemplo.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <PhoneIcon className="w-4 h-4 inline mr-1" />
                                                    Telefone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={newClientData.phone}
                                                    onChange={(e) => setNewClientData({
                                                        ...newClientData,
                                                        phone: e.target.value
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    placeholder="912345678"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    NIF
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newClientData.nif}
                                                    onChange={(e) => setNewClientData({
                                                        ...newClientData,
                                                        nif: e.target.value
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    placeholder="123456789"
                                                />
                                            </div>
                                        </div>

                                        {errors.clientContact && (
                                            <p className="text-sm text-red-600">{errors.clientContact}</p>
                                        )}

                                        {/* Checkbox GDPR */}
                                        <div>
                                            <label className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    checked={newClientData.gdprConsent}
                                                    onChange={(e) => setNewClientData({
                                                        ...newClientData,
                                                        gdprConsent: e.target.checked
                                                    })}
                                                    className="mt-1 mr-2"
                                                />
                                                <span className="text-sm text-gray-600">
                                                    Autorizo o tratamento dos meus dados pessoais de acordo com a política de privacidade e GDPR. *
                                                </span>
                                            </label>
                                            {errors.gdprConsent && (
                                                <p className="mt-1 text-sm text-red-600">{errors.gdprConsent}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PASSO 2: Qualificação */}
                        {currentStep === 2 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Qualificação da Lead
                                </h2>

                                {/* Mostrar cliente selecionado */}
                                {(selectedClient || newClientData.name) && (
                                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <p className="text-sm font-semibold text-gray-700">Cliente:</p>
                                        <p className="text-sm text-gray-600">
                                            {selectedClient ? selectedClient.name : newClientData.name}
                                        </p>
                                        {(selectedClient?.email || newClientData.email) && (
                                            <p className="text-sm text-gray-500">
                                                {selectedClient?.email || newClientData.email}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            className={`w-full px-3 py-2 border rounded-lg ${errors.type ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="Cliente Comprador">Cliente Comprador</option>
                                            <option value="Cliente Vendedor">Cliente Vendedor</option>
                                            <option value="Cliente Inquilino">Cliente Inquilino</option>
                                            <option value="Cliente Senhorio">Cliente Senhorio</option>
                                            <option value="Cliente Investidor">Cliente Investidor</option>
                                        </select>
                                        {errors.type && (
                                            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                        )}
                                    </div>

                                    {/* Fonte da Lead */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fonte da Lead *
                                        </label>
                                        <select
                                            value={leadData.source}
                                            onChange={(e) => setLeadData({
                                                ...leadData,
                                                source: e.target.value
                                            })}
                                            className={`w-full px-3 py-2 border rounded-lg ${errors.source ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="Website">Website</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Referência">Referência</option>
                                            <option value="Walk-in">Walk-in</option>
                                            <option value="Telefone">Telefone</option>
                                            <option value="Email">Email</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                        {errors.source && (
                                            <p className="mt-1 text-sm text-red-600">{errors.source}</p>
                                        )}
                                    </div>

                                    {/* Orçamento */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <CurrencyEuroIcon className="w-4 h-4 inline mr-1" />
                                            Orçamento
                                        </label>
                                        <input
                                            type="number"
                                            value={leadData.budget}
                                            onChange={(e) => setLeadData({
                                                ...leadData,
                                                budget: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Ex: 250000"
                                        />
                                    </div>

                                    {/* Referência do Imóvel */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <HomeIcon className="w-4 h-4 inline mr-1" />
                                            Referência do Imóvel
                                        </label>
                                        <input
                                            type="text"
                                            value={leadData.propertyReference}
                                            onChange={(e) => setLeadData({
                                                ...leadData,
                                                propertyReference: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Ex: REF123456"
                                        />
                                    </div>

                                    {/* Notas de Qualificação */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                                            Notas de Qualificação
                                        </label>
                                        <textarea
                                            value={leadData.notes}
                                            onChange={(e) => setLeadData({
                                                ...leadData,
                                                notes: e.target.value
                                            })}
                                            rows="4"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Detalhes sobre a qualificação do cliente..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer com Botões */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/leads')}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900"
                        >
                            Cancelar
                        </button>

                        <div className="flex gap-3">
                            {/* Botão Voltar (apenas no passo 2) */}
                            {currentStep === 2 && !isEditMode && (
                                <button
                                    type="button"
                                    onClick={handlePreviousStep}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
                                >
                                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                    Voltar
                                </button>
                            )}

                            {/* Botão Avançar/Criar */}
                            {currentStep === 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                >
                                    Avançar
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={saving || loading}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                                            {isEditMode ? 'Atualizar' : 'Criar'} Lead
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default LeadForm;