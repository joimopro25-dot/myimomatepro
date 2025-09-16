/**
 * OPPORTUNITY FORM - MyImoMatePro
 * Versão MELHORADA com gestão completa de imóveis, visitas e propostas
 * 
 * Melhorias implementadas:
 * 1. Tipo de oportunidade bloqueado em edição
 * 2. Sistema de visitas com estados e feedback editável
 * 3. Sistema de ofertas com contrapropostas
 * 4. Integração com CPCV
 * 
 * Caminho: src/pages/OpportunityForm.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOpportunities } from '../contexts/OpportunityContext';
import { useClients } from '../contexts/ClientContext';
import Layout from '../components/Layout';
import {
    OPPORTUNITY_TYPES,
    OPPORTUNITY_TYPE_LABELS,
    OPPORTUNITY_STATES,
    OPPORTUNITY_STATE_LABELS,
    OPPORTUNITY_PRIORITIES,
    PROPERTY_TYPES,
    PROPERTY_TYPE_LABELS,
    validateOpportunityData
} from '../models/opportunityModel';
import {
    ArrowLeftIcon,
    HomeIcon,
    ShoppingCartIcon,
    CurrencyEuroIcon,
    UserGroupIcon,
    ChartBarIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    CalendarDaysIcon,
    PlusIcon,
    TrashIcon,
    LinkIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    EyeIcon,
    DocumentCheckIcon,
    ClipboardDocumentCheckIcon,
    LockClosedIcon,
    PencilIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

// Estados de Visita
const VISIT_STATES = {
    SCHEDULED: 'agendada',
    CONFIRMED: 'confirmada',
    COMPLETED: 'efetuada',
    CANCELLED: 'cancelada',
    NO_SHOW: 'nao_compareceu'
};

const VISIT_STATE_LABELS = {
    [VISIT_STATES.SCHEDULED]: '📅 Agendada',
    [VISIT_STATES.CONFIRMED]: '✅ Confirmada',
    [VISIT_STATES.COMPLETED]: '✔️ Efetuada',
    [VISIT_STATES.CANCELLED]: '❌ Cancelada',
    [VISIT_STATES.NO_SHOW]: '⚠️ Não Compareceu'
};

// Estados de Oferta
const OFFER_STATES = {
    DRAFT: 'rascunho',
    SUBMITTED: 'submetida',
    NEGOTIATION: 'negociacao',
    COUNTER_OFFER: 'contraproposta',
    ACCEPTED: 'aceite',
    REJECTED: 'rejeitada'
};

const OFFER_STATE_LABELS = {
    [OFFER_STATES.DRAFT]: '📝 Rascunho',
    [OFFER_STATES.SUBMITTED]: '📤 Submetida',
    [OFFER_STATES.NEGOTIATION]: '🤝 Negociação',
    [OFFER_STATES.COUNTER_OFFER]: '↔️ Contraproposta',
    [OFFER_STATES.ACCEPTED]: '✅ Aceite',
    [OFFER_STATES.REJECTED]: '❌ Rejeitada'
};

const OpportunityForm = () => {
    const navigate = useNavigate();
    const { clientId, opportunityId } = useParams();
    const { currentUser } = useAuth();
    const {
        createNewOpportunity,
        updateExistingOpportunity,
        fetchOpportunity,
        loading,
        errors
    } = useOpportunities();
    const { currentClient, fetchClient } = useClients();

    // Estado principal
    const [formData, setFormData] = useState({
        // Dados principais
        tipo: OPPORTUNITY_TYPES.BUYER,
        estado: OPPORTUNITY_STATES.LEAD,
        prioridade: OPPORTUNITY_PRIORITIES.MEDIUM,
        titulo: '',
        descricao: '',

        // Valores
        valorEstimado: '',
        valorMinimo: '',
        valorMaximo: '',
        percentualComissao: 5,

        // Imóveis com estrutura melhorada
        imoveis: [],

        notas: ''
    });

    // Estados dos modals
    const [showPropertyForm, setShowPropertyForm] = useState(false);
    const [showVisitForm, setShowVisitForm] = useState(false);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [showCPCVForm, setShowCPCVForm] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [editingVisit, setEditingVisit] = useState(null);
    const [editingOffer, setEditingOffer] = useState(null);

    // Novo imóvel
    const [newProperty, setNewProperty] = useState({
        referencia: '',
        tipologia: 'T2',
        area: '',
        casasBanho: 1,
        temSuite: false,
        numeroSuites: 0,
        url: '',
        localizacao: '',
        valorAnunciado: '',
        agenteNome: '',
        agenteTelefone: '',
        agenteEmail: '',
        agenteAgencia: '',
        notas: '',
        visitas: [],
        ofertas: [],
        cpcv: null,
        estadoNegocio: 'prospeção'
    });

    // Nova visita melhorada
    const [newVisit, setNewVisit] = useState({
        data: '',
        hora: '',
        estado: VISIT_STATES.SCHEDULED,
        notas: '',
        feedback: '',
        interesseNivel: 'medio',
        pontosPositivos: '',
        pontosNegativos: '',
        proximosPassos: ''
    });

    // Nova oferta melhorada
    const [newOffer, setNewOffer] = useState({
        valor: '',
        data: '',
        condicoes: '',
        status: OFFER_STATES.DRAFT,
        notas: '',
        // Campos para contraproposta
        isContraproposta: false,
        valorContraproposta: '',
        condicoesContraproposta: '',
        justificacao: ''
    });

    // Dados do CPCV
    const [cpcvData, setCpcvData] = useState({
        numeroContrato: '',
        dataAssinatura: '',
        valorVenda: '',
        sinal: '',
        sinalPercentagem: 10,
        dataEscritura: '',
        financiamento: false,
        banco: '',
        valorCredito: '',
        dipEmitido: false,
        numeroDIP: ''
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Carregar dados
    useEffect(() => {
        if (clientId && currentUser?.uid) {
            fetchClient(clientId);
        }
    }, [clientId, currentUser]);

    useEffect(() => {
        if (opportunityId && clientId && currentUser?.uid) {
            loadOpportunity();
        }
    }, [opportunityId, clientId, currentUser]);

    const loadOpportunity = async () => {
        try {
            const opportunity = await fetchOpportunity(clientId, opportunityId);
            if (opportunity) {
                setFormData({
                    ...formData,
                    ...opportunity,
                    valorEstimado: opportunity.valorEstimado?.toString() || '',
                    valorMinimo: opportunity.valorMinimo?.toString() || '',
                    valorMaximo: opportunity.valorMaximo?.toString() || '',
                    imoveis: opportunity.imoveis || []
                });
            }
        } catch (error) {
            console.error('Erro ao carregar oportunidade:', error);
        }
    };

    // Handlers básicos
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [field]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleTipoChange = (tipo) => {
        // Só permite mudança se não estiver editando
        if (!opportunityId) {
            const date = new Date().toLocaleDateString('pt-PT');
            const typeLabel = OPPORTUNITY_TYPE_LABELS[tipo];
            setFormData(prev => ({
                ...prev,
                tipo,
                titulo: `${typeLabel} - ${currentClient?.name || 'Cliente'} - ${date}`
            }));
        }
    };

    // Gestão de Imóveis
    const handleAddProperty = () => {
        if (!newProperty.referencia) {
            alert('Por favor, adicione uma referência para o imóvel');
            return;
        }

        const property = {
            ...newProperty,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        setFormData(prev => ({
            ...prev,
            imoveis: [...prev.imoveis, property]
        }));

        // Reset form
        setNewProperty({
            referencia: '',
            tipologia: 'T2',
            area: '',
            casasBanho: 1,
            temSuite: false,
            numeroSuites: 0,
            url: '',
            localizacao: '',
            valorAnunciado: '',
            agenteNome: '',
            agenteTelefone: '',
            agenteEmail: '',
            agenteAgencia: '',
            notas: '',
            visitas: [],
            ofertas: [],
            cpcv: null,
            estadoNegocio: 'prospeção'
        });
        setShowPropertyForm(false);
    };

    const handleRemoveProperty = (propertyId) => {
        if (confirm('Tem certeza que deseja remover este imóvel?')) {
            setFormData(prev => ({
                ...prev,
                imoveis: prev.imoveis.filter(p => p.id !== propertyId)
            }));
        }
    };

    // Sistema de Visitas Melhorado
    const handleAddOrUpdateVisit = (propertyId) => {
        if (!newVisit.data || !newVisit.hora) {
            alert('Por favor, preencha data e hora da visita');
            return;
        }

        const visit = {
            ...newVisit,
            id: editingVisit?.id || Date.now().toString(),
            createdAt: editingVisit?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setFormData(prev => ({
            ...prev,
            imoveis: prev.imoveis.map(p => {
                if (p.id === propertyId) {
                    let updatedVisitas;
                    if (editingVisit) {
                        // Atualizar visita existente
                        updatedVisitas = p.visitas.map(v =>
                            v.id === editingVisit.id ? visit : v
                        );
                    } else {
                        // Adicionar nova visita
                        updatedVisitas = [...p.visitas, visit];
                    }

                    // Atualizar estado do negócio se visita foi efetuada
                    const estadoNegocio = visit.estado === VISIT_STATES.COMPLETED ? 'visitado' : p.estadoNegocio;

                    return { ...p, visitas: updatedVisitas, estadoNegocio };
                }
                return p;
            })
        }));

        // Reset
        setNewVisit({
            data: '',
            hora: '',
            estado: VISIT_STATES.SCHEDULED,
            notas: '',
            feedback: '',
            interesseNivel: 'medio',
            pontosPositivos: '',
            pontosNegativos: '',
            proximosPassos: ''
        });
        setEditingVisit(null);
        setShowVisitForm(false);
        setSelectedProperty(null);
    };

    const handleEditVisit = (property, visit) => {
        setSelectedProperty(property);
        setEditingVisit(visit);
        setNewVisit({
            ...visit
        });
        setShowVisitForm(true);
    };

    // Sistema de Ofertas Melhorado
    const handleAddOrUpdateOffer = (propertyId) => {
        if (!newOffer.valor) {
            alert('Por favor, preencha o valor da oferta');
            return;
        }

        const offer = {
            ...newOffer,
            id: editingOffer?.id || Date.now().toString(),
            createdAt: editingOffer?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setFormData(prev => ({
            ...prev,
            imoveis: prev.imoveis.map(p => {
                if (p.id === propertyId) {
                    let updatedOfertas;
                    if (editingOffer) {
                        // Atualizar oferta existente
                        updatedOfertas = p.ofertas.map(o =>
                            o.id === editingOffer.id ? offer : o
                        );
                    } else {
                        // Adicionar nova oferta
                        updatedOfertas = [...p.ofertas, offer];
                    }

                    // Atualizar estado do negócio baseado no status da oferta
                    let estadoNegocio = p.estadoNegocio;
                    if (offer.status === OFFER_STATES.ACCEPTED) {
                        estadoNegocio = 'aceite';
                        // Mostrar formulário CPCV
                        setShowCPCVForm(true);
                        setCpcvData(prev => ({
                            ...prev,
                            valorVenda: offer.valor,
                            sinal: (parseFloat(offer.valor) * 0.1).toString() // 10% default
                        }));
                    } else if (offer.status === OFFER_STATES.SUBMITTED) {
                        estadoNegocio = 'proposta';
                    } else if (offer.status === OFFER_STATES.NEGOTIATION || offer.status === OFFER_STATES.COUNTER_OFFER) {
                        estadoNegocio = 'negociação';
                    }

                    return { ...p, ofertas: updatedOfertas, estadoNegocio };
                }
                return p;
            })
        }));

        // Reset
        setNewOffer({
            valor: '',
            data: '',
            condicoes: '',
            status: OFFER_STATES.DRAFT,
            notas: '',
            isContraproposta: false,
            valorContraproposta: '',
            condicoesContraproposta: '',
            justificacao: ''
        });
        setEditingOffer(null);
        setShowOfferForm(false);
        setSelectedProperty(null);
    };

    const handleEditOffer = (property, offer) => {
        setSelectedProperty(property);
        setEditingOffer(offer);
        setNewOffer({
            ...offer
        });
        setShowOfferForm(true);
    };

    // Sistema CPCV
    const handleSaveCPCV = (propertyId) => {
        if (!cpcvData.numeroContrato || !cpcvData.dataAssinatura) {
            alert('Por favor, preencha os dados obrigatórios do CPCV');
            return;
        }

        setFormData(prev => ({
            ...prev,
            imoveis: prev.imoveis.map(p => {
                if (p.id === propertyId) {
                    return {
                        ...p,
                        cpcv: cpcvData,
                        estadoNegocio: 'cpcv'
                    };
                }
                return p;
            })
        }));

        setShowCPCVForm(false);
        setCpcvData({
            numeroContrato: '',
            dataAssinatura: '',
            valorVenda: '',
            sinal: '',
            sinalPercentagem: 10,
            dataEscritura: '',
            financiamento: false,
            banco: '',
            valorCredito: '',
            dipEmitido: false,
            numeroDIP: ''
        });
    };

    // Atualizar estado de negócio do imóvel
    const handleUpdatePropertyStatus = (propertyId, newStatus) => {
        setFormData(prev => ({
            ...prev,
            imoveis: prev.imoveis.map(p =>
                p.id === propertyId
                    ? { ...p, estadoNegocio: newStatus }
                    : p
            )
        }));
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setValidationErrors({});
        setSuccessMessage('');

        const dataToSubmit = {
            ...formData,
            valorEstimado: parseFloat(formData.valorEstimado) || 0,
            valorMinimo: parseFloat(formData.valorMinimo) || 0,
            valorMaximo: parseFloat(formData.valorMaximo) || 0,
            comissaoEstimada: (parseFloat(formData.valorEstimado) || 0) * (formData.percentualComissao / 100)
        };

        const validation = validateOpportunityData(dataToSubmit);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            setIsSubmitting(false);
            return;
        }

        try {
            if (opportunityId) {
                await updateExistingOpportunity(clientId, opportunityId, dataToSubmit);
                setSuccessMessage('Oportunidade atualizada com sucesso!');
            } else {
                await createNewOpportunity(clientId, dataToSubmit);
                setSuccessMessage('Oportunidade criada com sucesso!');
            }

            setTimeout(() => {
                navigate(`/clients/${clientId}`);
            }, 1000);

        } catch (error) {
            console.error('Erro ao salvar oportunidade:', error);
            setValidationErrors({
                geral: 'Erro ao salvar oportunidade. Por favor, tente novamente.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Ícones por tipo
    const getTypeIcon = (tipo) => {
        const icons = {
            [OPPORTUNITY_TYPES.BUYER]: ShoppingCartIcon,
            [OPPORTUNITY_TYPES.SELLER]: CurrencyEuroIcon,
            [OPPORTUNITY_TYPES.LANDLORD]: HomeIcon,
            [OPPORTUNITY_TYPES.TENANT]: UserGroupIcon,
            [OPPORTUNITY_TYPES.INVESTOR]: ChartBarIcon
        };
        return icons[tipo] || HomeIcon;
    };

    // Estado de negócio badges
    const getStatusBadge = (status) => {
        const badges = {
            'prospeção': { color: 'bg-gray-100 text-gray-700', label: 'Prospeção' },
            'visitado': { color: 'bg-blue-100 text-blue-700', label: 'Visitado' },
            'proposta': { color: 'bg-yellow-100 text-yellow-700', label: 'Proposta' },
            'negociação': { color: 'bg-orange-100 text-orange-700', label: 'Negociação' },
            'aceite': { color: 'bg-green-100 text-green-700', label: 'Aceite' },
            'cpcv': { color: 'bg-purple-100 text-purple-700', label: 'CPCV' },
            'escritura': { color: 'bg-indigo-100 text-indigo-700', label: 'Escritura' }
        };
        return badges[status] || badges['prospeção'];
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/clients/${clientId}`)}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Voltar ao cliente
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900">
                        {opportunityId ? 'Editar Oportunidade' : 'Nova Oportunidade'}
                    </h1>
                    {currentClient && (
                        <p className="mt-2 text-gray-600">
                            Cliente: <span className="font-semibold">{currentClient.name}</span>
                        </p>
                    )}
                </div>

                {/* Mensagens */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                            <p className="text-green-800">{successMessage}</p>
                        </div>
                    </div>
                )}

                {validationErrors.geral && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-2" />
                            <p className="text-red-800">{validationErrors.geral}</p>
                        </div>
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Tipo de Oportunidade com bloqueio em edição */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Tipo de Oportunidade
                            </h2>
                            {opportunityId && (
                                <span className="inline-flex items-center text-sm text-gray-500">
                                    <LockClosedIcon className="w-4 h-4 mr-1" />
                                    Não editável após criação
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([type, label]) => {
                                const Icon = getTypeIcon(type);
                                const isSelected = formData.tipo === type;
                                const isDisabled = !!opportunityId;

                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleTipoChange(type)}
                                        disabled={isDisabled}
                                        className={`
                                            flex flex-col items-center justify-center p-4 rounded-lg border-2 
                                            transition-all duration-200
                                            ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                                            ${isSelected
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : isDisabled
                                                    ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-50'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }
                                        `}
                                    >
                                        <Icon className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-medium">{label}</span>
                                        {isSelected && isDisabled && (
                                            <LockClosedIcon className="w-3 h-3 mt-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Informações Básicas */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Informações Básicas
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {Object.entries(OPPORTUNITY_STATE_LABELS).map(([state, label]) => (
                                            <option key={state} value={state}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prioridade
                                    </label>
                                    <select
                                        name="prioridade"
                                        value={formData.prioridade}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="baixa">🟢 Baixa</option>
                                        <option value="media">🟡 Média</option>
                                        <option value="alta">🟠 Alta</option>
                                        <option value="urgente">🔴 Urgente</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gestão de Imóveis Melhorada (só para compradores) */}
                    {formData.tipo === OPPORTUNITY_TYPES.BUYER && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    🏠 Imóveis em Análise ({formData.imoveis.length})
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowPropertyForm(true)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    Adicionar Imóvel
                                </button>
                            </div>

                            {/* Formulário de Novo Imóvel */}
                            {showPropertyForm && (
                                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Novo Imóvel</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Referência *
                                            </label>
                                            <input
                                                type="text"
                                                value={newProperty.referencia}
                                                onChange={(e) => setNewProperty({ ...newProperty, referencia: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="Ex: REF123"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipologia
                                            </label>
                                            <select
                                                value={newProperty.tipologia}
                                                onChange={(e) => setNewProperty({ ...newProperty, tipologia: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            >
                                                <option value="T0">T0</option>
                                                <option value="T1">T1</option>
                                                <option value="T2">T2</option>
                                                <option value="T3">T3</option>
                                                <option value="T4">T4</option>
                                                <option value="T5+">T5+</option>
                                                <option value="Moradia">Moradia</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Área (m²)
                                            </label>
                                            <input
                                                type="number"
                                                value={newProperty.area}
                                                onChange={(e) => setNewProperty({ ...newProperty, area: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="120"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Valor Anunciado (€)
                                            </label>
                                            <input
                                                type="number"
                                                value={newProperty.valorAnunciado}
                                                onChange={(e) => setNewProperty({ ...newProperty, valorAnunciado: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="250000"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Localização
                                            </label>
                                            <input
                                                type="text"
                                                value={newProperty.localizacao}
                                                onChange={(e) => setNewProperty({ ...newProperty, localizacao: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="Ex: Centro da cidade, próximo ao metro"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Link/URL do Anúncio
                                            </label>
                                            <input
                                                type="url"
                                                value={newProperty.url}
                                                onChange={(e) => setNewProperty({ ...newProperty, url: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAddProperty}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Adicionar Imóvel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowPropertyForm(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Lista de Imóveis com Sistema Melhorado */}
                            <div className="space-y-4">
                                {formData.imoveis.map((property) => (
                                    <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        {/* Header do Imóvel */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {property.referencia} - {property.tipologia}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(property.estadoNegocio).color}`}>
                                                        {getStatusBadge(property.estadoNegocio).label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    <MapPinIcon className="w-4 h-4 inline mr-1" />
                                                    {property.localizacao}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProperty(property.id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Info do Imóvel */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                                            <div>
                                                <span className="text-gray-500">Área:</span>
                                                <span className="ml-1 font-medium">{property.area}m²</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Valor:</span>
                                                <span className="ml-1 font-medium text-green-600">
                                                    €{parseFloat(property.valorAnunciado || 0).toLocaleString('pt-PT')}
                                                </span>
                                            </div>
                                            {property.url && (
                                                <div className="md:col-span-2">
                                                    <a
                                                        href={property.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-700 inline-flex items-center"
                                                    >
                                                        <LinkIcon className="w-3 h-3 mr-1" />
                                                        Ver anúncio
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Sistema de Visitas Melhorado */}
                                        <div className="border-t pt-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    📅 Visitas ({property.visitas.length})
                                                </span>
                                                {selectedProperty?.id === property.id && showVisitForm && !editingVisit ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowVisitForm(false);
                                                            setSelectedProperty(null);
                                                        }}
                                                        className="text-xs text-red-600"
                                                    >
                                                        Cancelar
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedProperty(property);
                                                            setShowVisitForm(true);
                                                            setEditingVisit(null);
                                                            setNewVisit({
                                                                data: '',
                                                                hora: '',
                                                                estado: VISIT_STATES.SCHEDULED,
                                                                notas: '',
                                                                feedback: '',
                                                                interesseNivel: 'medio',
                                                                pontosPositivos: '',
                                                                pontosNegativos: '',
                                                                proximosPassos: ''
                                                            });
                                                        }}
                                                        className="text-xs text-blue-600"
                                                    >
                                                        + Agendar Visita
                                                    </button>
                                                )}
                                            </div>

                                            {/* Formulário de Visita Melhorado */}
                                            {selectedProperty?.id === property.id && showVisitForm && (
                                                <div className="bg-blue-50 rounded p-3 mb-2">
                                                    <h4 className="font-medium text-sm mb-2">
                                                        {editingVisit ? 'Editar Visita' : 'Nova Visita'}
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="date"
                                                            value={newVisit.data}
                                                            onChange={(e) => setNewVisit({ ...newVisit, data: e.target.value })}
                                                            className="px-2 py-1 text-sm border rounded"
                                                        />
                                                        <input
                                                            type="time"
                                                            value={newVisit.hora}
                                                            onChange={(e) => setNewVisit({ ...newVisit, hora: e.target.value })}
                                                            className="px-2 py-1 text-sm border rounded"
                                                        />
                                                        <select
                                                            value={newVisit.estado}
                                                            onChange={(e) => setNewVisit({ ...newVisit, estado: e.target.value })}
                                                            className="px-2 py-1 text-sm border rounded col-span-2"
                                                        >
                                                            {Object.entries(VISIT_STATE_LABELS).map(([state, label]) => (
                                                                <option key={state} value={state}>{label}</option>
                                                            ))}
                                                        </select>

                                                        {/* Campos de Feedback (só aparecem se visita foi efetuada) */}
                                                        {newVisit.estado === VISIT_STATES.COMPLETED && (
                                                            <>
                                                                <div className="col-span-2 border-t pt-2 mt-2">
                                                                    <label className="text-xs font-medium text-gray-600">Feedback da Visita</label>
                                                                </div>
                                                                <select
                                                                    value={newVisit.interesseNivel}
                                                                    onChange={(e) => setNewVisit({ ...newVisit, interesseNivel: e.target.value })}
                                                                    className="px-2 py-1 text-sm border rounded col-span-2"
                                                                >
                                                                    <option value="sem_interesse">😐 Sem Interesse</option>
                                                                    <option value="baixo">😔 Baixo Interesse</option>
                                                                    <option value="medio">🙂 Médio Interesse</option>
                                                                    <option value="alto">😊 Alto Interesse</option>
                                                                    <option value="muito_alto">🤩 Muito Alto Interesse</option>
                                                                </select>
                                                                <textarea
                                                                    value={newVisit.pontosPositivos}
                                                                    onChange={(e) => setNewVisit({ ...newVisit, pontosPositivos: e.target.value })}
                                                                    className="px-2 py-1 text-sm border rounded col-span-2"
                                                                    rows={2}
                                                                    placeholder="Pontos positivos..."
                                                                />
                                                                <textarea
                                                                    value={newVisit.pontosNegativos}
                                                                    onChange={(e) => setNewVisit({ ...newVisit, pontosNegativos: e.target.value })}
                                                                    className="px-2 py-1 text-sm border rounded col-span-2"
                                                                    rows={2}
                                                                    placeholder="Pontos negativos..."
                                                                />
                                                                <textarea
                                                                    value={newVisit.proximosPassos}
                                                                    onChange={(e) => setNewVisit({ ...newVisit, proximosPassos: e.target.value })}
                                                                    className="px-2 py-1 text-sm border rounded col-span-2"
                                                                    rows={2}
                                                                    placeholder="Próximos passos..."
                                                                />
                                                            </>
                                                        )}

                                                        <textarea
                                                            value={newVisit.notas}
                                                            onChange={(e) => setNewVisit({ ...newVisit, notas: e.target.value })}
                                                            className="px-2 py-1 text-sm border rounded col-span-2"
                                                            rows={2}
                                                            placeholder="Notas gerais..."
                                                        />
                                                    </div>
                                                    <div className="mt-2 flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddOrUpdateVisit(property.id)}
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                        >
                                                            {editingVisit ? 'Atualizar' : 'Adicionar'} Visita
                                                        </button>
                                                        {editingVisit && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingVisit(null);
                                                                    setShowVisitForm(false);
                                                                    setNewVisit({
                                                                        data: '',
                                                                        hora: '',
                                                                        estado: VISIT_STATES.SCHEDULED,
                                                                        notas: '',
                                                                        feedback: '',
                                                                        interesseNivel: 'medio',
                                                                        pontosPositivos: '',
                                                                        pontosNegativos: '',
                                                                        proximosPassos: ''
                                                                    });
                                                                }}
                                                                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                                                            >
                                                                Cancelar Edição
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Lista de visitas com opção de editar */}
                                            {property.visitas.map((visit) => (
                                                <div key={visit.id} className="flex items-center justify-between text-xs bg-white rounded p-2 mb-1">
                                                    <div className="flex-1">
                                                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-2 ${visit.estado === VISIT_STATES.COMPLETED ? 'bg-green-100 text-green-700' :
                                                                visit.estado === VISIT_STATES.CANCELLED ? 'bg-red-100 text-red-700' :
                                                                    visit.estado === VISIT_STATES.CONFIRMED ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {VISIT_STATE_LABELS[visit.estado]?.split(' ')[0]}
                                                        </span>
                                                        {visit.data} às {visit.hora}
                                                        {visit.interesseNivel === 'muito_alto' && ' 🤩'}
                                                        {visit.interesseNivel === 'alto' && ' 😊'}
                                                        {visit.interesseNivel === 'medio' && ' 🙂'}
                                                        {visit.interesseNivel === 'baixo' && ' 😔'}
                                                        {visit.feedback && <ChatBubbleLeftRightIcon className="w-3 h-3 inline ml-1 text-gray-400" />}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditVisit(property, visit)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    >
                                                        <PencilIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Sistema de Ofertas Melhorado */}
                                        <div className="border-t pt-3 mt-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    💶 Ofertas/Propostas ({property.ofertas.length})
                                                </span>
                                                {selectedProperty?.id === property.id && showOfferForm && !editingOffer ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowOfferForm(false);
                                                            setSelectedProperty(null);
                                                        }}
                                                        className="text-xs text-red-600"
                                                    >
                                                        Cancelar
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedProperty(property);
                                                            setShowOfferForm(true);
                                                            setEditingOffer(null);
                                                            setNewOffer({
                                                                valor: '',
                                                                data: '',
                                                                condicoes: '',
                                                                status: OFFER_STATES.DRAFT,
                                                                notas: '',
                                                                isContraproposta: false,
                                                                valorContraproposta: '',
                                                                condicoesContraproposta: '',
                                                                justificacao: ''
                                                            });
                                                        }}
                                                        className="text-xs text-green-600"
                                                    >
                                                        + Nova Oferta
                                                    </button>
                                                )}
                                            </div>

                                            {/* Formulário de Oferta Melhorado */}
                                            {selectedProperty?.id === property.id && showOfferForm && (
                                                <div className="bg-green-50 rounded p-3 mb-2">
                                                    <h4 className="font-medium text-sm mb-2">
                                                        {editingOffer ? 'Editar Oferta' : 'Nova Oferta'}
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="number"
                                                            value={newOffer.valor}
                                                            onChange={(e) => setNewOffer({ ...newOffer, valor: e.target.value })}
                                                            className="px-2 py-1 text-sm border rounded"
                                                            placeholder="Valor €"
                                                        />
                                                        <input
                                                            type="date"
                                                            value={newOffer.data}
                                                            onChange={(e) => setNewOffer({ ...newOffer, data: e.target.value })}
                                                            className="px-2 py-1 text-sm border rounded"
                                                        />
                                                        <select
                                                            value={newOffer.status}
                                                            onChange={(e) => setNewOffer({ ...newOffer, status: e.target.value })}
                                                            className="px-2 py-1 text-sm border rounded col-span-2"
                                                        >
                                                            {Object.entries(OFFER_STATE_LABELS).map(([state, label]) => (
                                                                <option key={state} value={state}>{label}</option>
                                                            ))}
                                                        </select>

                                                        {/* Campos de Contraproposta */}
                                                        {newOffer.status === OFFER_STATES.COUNTER_OFFER && (
                                                            <>
                                                                <div className="col-span-2 border-t pt-2 mt-2">
                                                                    <label className="text-xs font-medium text-gray-600">Dados da Contraproposta</label>
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    value={newOffer.valorContraproposta}
                                                                    onChange={(e) => setNewOffer({ ...newOffer, valorContraproposta: e.target.value })}
                                                                    className="px-2 py-1 text-sm border rounded col-span-2"
                                                                    placeholder="Valor contraproposta €"
                                                                />
                                                                <textarea
                                                                    value={newOffer.condicoesContraproposta}
                                                                    onChange={(e) => setNewOffer({ ...newOffer, condicoesContraproposta: e.target.value })}
                                                                    className="px-2 py-1 text-sm border rounded col-span-2"
                                                                    rows={2}
                                                                    placeholder="Condições da contraproposta..."
                                                                />
                                                                <textarea
                                                                    value={newOffer.justificacao}
                                                                    onChange={(e) => setNewOffer({ ...newOffer, justificacao: e.target.value })}
                                                                    className="px-2 py-1 text-sm border rounded col-span-2"
                                                                    rows={2}
                                                                    placeholder="Justificação..."
                                                                />
                                                            </>
                                                        )}

                                                        <textarea
                                                            value={newOffer.condicoes}
                                                            onChange={(e) => setNewOffer({ ...newOffer, condicoes: e.target.value })}
                                                            className="px-2 py-1 text-sm border rounded col-span-2"
                                                            rows={2}
                                                            placeholder="Condições gerais..."
                                                        />
                                                    </div>
                                                    <div className="mt-2 flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddOrUpdateOffer(property.id)}
                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                        >
                                                            {editingOffer ? 'Atualizar' : 'Adicionar'} Oferta
                                                        </button>
                                                        {editingOffer && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingOffer(null);
                                                                    setShowOfferForm(false);
                                                                    setNewOffer({
                                                                        valor: '',
                                                                        data: '',
                                                                        condicoes: '',
                                                                        status: OFFER_STATES.DRAFT,
                                                                        notas: '',
                                                                        isContraproposta: false,
                                                                        valorContraproposta: '',
                                                                        condicoesContraproposta: '',
                                                                        justificacao: ''
                                                                    });
                                                                }}
                                                                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                                                            >
                                                                Cancelar Edição
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Lista de ofertas com opção de editar */}
                                            {property.ofertas.map((offer) => (
                                                <div key={offer.id} className="flex items-center justify-between text-xs bg-white rounded p-2 mb-1">
                                                    <div className="flex-1">
                                                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-2 ${offer.status === OFFER_STATES.ACCEPTED ? 'bg-green-100 text-green-700' :
                                                                offer.status === OFFER_STATES.REJECTED ? 'bg-red-100 text-red-700' :
                                                                    offer.status === OFFER_STATES.NEGOTIATION ? 'bg-orange-100 text-orange-700' :
                                                                        offer.status === OFFER_STATES.COUNTER_OFFER ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {OFFER_STATE_LABELS[offer.status]?.split(' ')[0]}
                                                        </span>
                                                        €{parseFloat(offer.valor || 0).toLocaleString('pt-PT')}
                                                        {offer.valorContraproposta && ` → €${parseFloat(offer.valorContraproposta).toLocaleString('pt-PT')}`}
                                                        {offer.data && ` em ${offer.data}`}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditOffer(property, offer)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    >
                                                        <PencilIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Sistema CPCV */}
                                        {property.ofertas.some(o => o.status === OFFER_STATES.ACCEPTED) && !property.cpcv && (
                                            <div className="border-t mt-3 pt-3">
                                                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                                                    <p className="text-xs text-yellow-800 flex items-center">
                                                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                                                        Proposta aceite - Criar CPCV
                                                    </p>
                                                </div>
                                                {showCPCVForm && selectedProperty?.id === property.id ? (
                                                    <div className="bg-purple-50 rounded p-3">
                                                        <h4 className="font-medium text-sm mb-2">📋 Dados do CPCV</h4>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                type="text"
                                                                value={cpcvData.numeroContrato}
                                                                onChange={(e) => setCpcvData({ ...cpcvData, numeroContrato: e.target.value })}
                                                                className="px-2 py-1 text-sm border rounded"
                                                                placeholder="Nº Contrato"
                                                            />
                                                            <input
                                                                type="date"
                                                                value={cpcvData.dataAssinatura}
                                                                onChange={(e) => setCpcvData({ ...cpcvData, dataAssinatura: e.target.value })}
                                                                className="px-2 py-1 text-sm border rounded"
                                                                placeholder="Data Assinatura"
                                                            />
                                                            <input
                                                                type="number"
                                                                value={cpcvData.valorVenda}
                                                                onChange={(e) => setCpcvData({ ...cpcvData, valorVenda: e.target.value })}
                                                                className="px-2 py-1 text-sm border rounded"
                                                                placeholder="Valor Venda €"
                                                            />
                                                            <input
                                                                type="number"
                                                                value={cpcvData.sinal}
                                                                onChange={(e) => setCpcvData({ ...cpcvData, sinal: e.target.value })}
                                                                className="px-2 py-1 text-sm border rounded"
                                                                placeholder="Sinal €"
                                                            />
                                                            <input
                                                                type="date"
                                                                value={cpcvData.dataEscritura}
                                                                onChange={(e) => setCpcvData({ ...cpcvData, dataEscritura: e.target.value })}
                                                                className="px-2 py-1 text-sm border rounded col-span-2"
                                                                placeholder="Data Escritura"
                                                            />
                                                            <div className="col-span-2">
                                                                <label className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={cpcvData.financiamento}
                                                                        onChange={(e) => setCpcvData({ ...cpcvData, financiamento: e.target.checked })}
                                                                        className="rounded border-gray-300 text-blue-600 mr-2"
                                                                    />
                                                                    <span className="text-sm">Necessita Financiamento</span>
                                                                </label>
                                                            </div>
                                                            {cpcvData.financiamento && (
                                                                <>
                                                                    <input
                                                                        type="text"
                                                                        value={cpcvData.banco}
                                                                        onChange={(e) => setCpcvData({ ...cpcvData, banco: e.target.value })}
                                                                        className="px-2 py-1 text-sm border rounded"
                                                                        placeholder="Banco"
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        value={cpcvData.valorCredito}
                                                                        onChange={(e) => setCpcvData({ ...cpcvData, valorCredito: e.target.value })}
                                                                        className="px-2 py-1 text-sm border rounded"
                                                                        placeholder="Valor Crédito €"
                                                                    />
                                                                    <div className="col-span-2">
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={cpcvData.dipEmitido}
                                                                                onChange={(e) => setCpcvData({ ...cpcvData, dipEmitido: e.target.checked })}
                                                                                className="rounded border-gray-300 text-blue-600 mr-2"
                                                                            />
                                                                            <span className="text-sm">DIP Emitido</span>
                                                                        </label>
                                                                    </div>
                                                                    {cpcvData.dipEmitido && (
                                                                        <input
                                                                            type="text"
                                                                            value={cpcvData.numeroDIP}
                                                                            onChange={(e) => setCpcvData({ ...cpcvData, numeroDIP: e.target.value })}
                                                                            className="px-2 py-1 text-sm border rounded col-span-2"
                                                                            placeholder="Número DIP"
                                                                        />
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSaveCPCV(property.id)}
                                                                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                                                            >
                                                                Guardar CPCV
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowCPCVForm(false)}
                                                                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedProperty(property);
                                                            setShowCPCVForm(true);
                                                            setCpcvData(prev => ({
                                                                ...prev,
                                                                valorVenda: property.ofertas.find(o => o.status === OFFER_STATES.ACCEPTED)?.valor || ''
                                                            }));
                                                        }}
                                                        className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center gap-1"
                                                    >
                                                        <DocumentTextIcon className="w-4 h-4" />
                                                        Criar CPCV
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Mostrar dados do CPCV se existir */}
                                        {property.cpcv && (
                                            <div className="border-t mt-3 pt-3">
                                                <div className="bg-purple-50 rounded p-2">
                                                    <p className="text-sm font-medium text-purple-900 mb-1">
                                                        📋 CPCV - {property.cpcv.numeroContrato}
                                                    </p>
                                                    <div className="text-xs text-purple-700 space-y-1">
                                                        <p>Assinatura: {property.cpcv.dataAssinatura}</p>
                                                        <p>Valor: €{parseFloat(property.cpcv.valorVenda || 0).toLocaleString('pt-PT')}</p>
                                                        <p>Sinal: €{parseFloat(property.cpcv.sinal || 0).toLocaleString('pt-PT')}</p>
                                                        <p>Escritura: {property.cpcv.dataEscritura}</p>
                                                        {property.cpcv.dipEmitido && (
                                                            <p className="text-green-700">✓ DIP Emitido: {property.cpcv.numeroDIP}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdatePropertyStatus(property.id, 'escritura')}
                                                        className="mt-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                                                    >
                                                        Marcar Escritura Realizada
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {formData.imoveis.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">
                                        Nenhum imóvel adicionado ainda.
                                        <br />
                                        <span className="text-sm">Adicione imóveis que o cliente está a considerar.</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Valores Gerais */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            💰 Valores e Orçamento
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Valor Estimado do Negócio (€)
                                </label>
                                <input
                                    type="number"
                                    name="valorEstimado"
                                    value={formData.valorEstimado}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comissão (%)
                                </label>
                                <input
                                    type="number"
                                    name="percentualComissao"
                                    value={formData.percentualComissao}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {formData.valorEstimado && formData.percentualComissao && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Comissão Estimada
                                    </label>
                                    <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                        <span className="font-semibold text-green-700">
                                            €{((parseFloat(formData.valorEstimado) || 0) * (formData.percentualComissao / 100)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/clients/${clientId}`)}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'A guardar...' : (opportunityId ? 'Atualizar' : 'Criar Oportunidade')}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default OpportunityForm;