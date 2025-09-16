/**
 * OPPORTUNITY FORM - MyImoMatePro
 * Versão com gestão completa de imóveis
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
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

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

        // NOVO: Imóveis
        imoveis: [],

        notas: ''
    });

    // Estados dos modals
    const [showPropertyForm, setShowPropertyForm] = useState(false);
    const [showVisitForm, setShowVisitForm] = useState(false);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

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
        estadoNegocio: 'prospeção' // prospeção, visitado, proposta, negociação, aceite, cpcv, escritura
    });

    // Nova visita
    const [newVisit, setNewVisit] = useState({
        data: '',
        hora: '',
        notas: '',
        feedback: '',
        interesseNivel: 'medio' // baixo, medio, alto, muito_alto
    });

    // Nova oferta
    const [newOffer, setNewOffer] = useState({
        valor: '',
        data: '',
        condicoes: '',
        status: 'rascunho', // rascunho, submetida, negociacao, aceite, rejeitada
        notas: ''
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
        const date = new Date().toLocaleDateString('pt-PT');
        const typeLabel = OPPORTUNITY_TYPE_LABELS[tipo];
        setFormData(prev => ({
            ...prev,
            tipo,
            titulo: `${typeLabel} - ${currentClient?.name || 'Cliente'} - ${date}`
        }));
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

    // Adicionar visita a um imóvel
    const handleAddVisitToProperty = (propertyId) => {
        if (!newVisit.data || !newVisit.hora) {
            alert('Por favor, preencha data e hora da visita');
            return;
        }

        const visit = {
            ...newVisit,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        setFormData(prev => ({
            ...prev,
            imoveis: prev.imoveis.map(p =>
                p.id === propertyId
                    ? { ...p, visitas: [...p.visitas, visit], estadoNegocio: 'visitado' }
                    : p
            )
        }));

        // Reset
        setNewVisit({
            data: '',
            hora: '',
            notas: '',
            feedback: '',
            interesseNivel: 'medio'
        });
        setShowVisitForm(false);
        setSelectedProperty(null);
    };

    // Adicionar oferta a um imóvel
    const handleAddOfferToProperty = (propertyId) => {
        if (!newOffer.valor) {
            alert('Por favor, preencha o valor da oferta');
            return;
        }

        const offer = {
            ...newOffer,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        setFormData(prev => ({
            ...prev,
            imoveis: prev.imoveis.map(p =>
                p.id === propertyId
                    ? {
                        ...p,
                        ofertas: [...p.ofertas, offer],
                        estadoNegocio: offer.status === 'aceite' ? 'aceite' : 'proposta'
                    }
                    : p
            )
        }));

        // Reset
        setNewOffer({
            valor: '',
            data: '',
            condicoes: '',
            status: 'rascunho',
            notas: ''
        });
        setShowOfferForm(false);
        setSelectedProperty(null);
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
                    {/* Tipo de Oportunidade */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Tipo de Oportunidade
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([type, label]) => {
                                const Icon = getTypeIcon(type);
                                const isSelected = formData.tipo === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleTipoChange(type)}
                                        className={`
                                            flex flex-col items-center justify-center p-4 rounded-lg border-2 
                                            transition-all duration-200
                                            ${isSelected
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }
                                        `}
                                    >
                                        <Icon className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-medium">{label}</span>
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

                    {/* NOVO: Gestão de Imóveis (só para compradores) */}
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
                                                Casas de Banho
                                            </label>
                                            <input
                                                type="number"
                                                value={newProperty.casasBanho}
                                                onChange={(e) => setNewProperty({ ...newProperty, casasBanho: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                min="0"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={newProperty.temSuite}
                                                    onChange={(e) => setNewProperty({ ...newProperty, temSuite: e.target.checked })}
                                                    className="rounded border-gray-300 text-blue-600 mr-2"
                                                />
                                                Tem Suite
                                            </label>
                                            {newProperty.temSuite && (
                                                <input
                                                    type="number"
                                                    value={newProperty.numeroSuites}
                                                    onChange={(e) => setNewProperty({ ...newProperty, numeroSuites: e.target.value })}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                                                    placeholder="Nº"
                                                    min="1"
                                                />
                                            )}
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

                                        {/* Dados do Agente */}
                                        <div className="md:col-span-2 border-t pt-3">
                                            <h4 className="font-medium text-gray-700 mb-2">Agente Responsável</h4>
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={newProperty.agenteNome}
                                                onChange={(e) => setNewProperty({ ...newProperty, agenteNome: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="Nome do agente"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="tel"
                                                value={newProperty.agenteTelefone}
                                                onChange={(e) => setNewProperty({ ...newProperty, agenteTelefone: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="Telefone"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="email"
                                                value={newProperty.agenteEmail}
                                                onChange={(e) => setNewProperty({ ...newProperty, agenteEmail: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="Email"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={newProperty.agenteAgencia}
                                                onChange={(e) => setNewProperty({ ...newProperty, agenteAgencia: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="Agência"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notas sobre o imóvel
                                            </label>
                                            <textarea
                                                value={newProperty.notas}
                                                onChange={(e) => setNewProperty({ ...newProperty, notas: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="Observações sobre o imóvel..."
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

                            {/* Lista de Imóveis */}
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
                                                <span className="text-gray-500">WC:</span>
                                                <span className="ml-1 font-medium">{property.casasBanho}</span>
                                                {property.temSuite && <span className="ml-1 text-xs">(+{property.numeroSuites} suite)</span>}
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Valor:</span>
                                                <span className="ml-1 font-medium text-green-600">
                                                    €{parseFloat(property.valorAnunciado).toLocaleString('pt-PT')}
                                                </span>
                                            </div>
                                            {property.url && (
                                                <div>
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

                                        {/* Agente */}
                                        {property.agenteNome && (
                                            <div className="bg-gray-50 rounded p-2 mb-3 text-sm">
                                                <p className="font-medium text-gray-700">Agente: {property.agenteNome}</p>
                                                {property.agenteTelefone && <p className="text-gray-600">📞 {property.agenteTelefone}</p>}
                                                {property.agenteAgencia && <p className="text-gray-600">🏢 {property.agenteAgencia}</p>}
                                            </div>
                                        )}

                                        {/* Ações */}
                                        <div className="flex gap-2 border-t pt-3">
                                            {/* Visitas */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        📅 Visitas ({property.visitas.length})
                                                    </span>
                                                    {selectedProperty?.id === property.id && showVisitForm ? (
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
                                                            }}
                                                            className="text-xs text-blue-600"
                                                        >
                                                            + Agendar
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Form de nova visita inline */}
                                                {selectedProperty?.id === property.id && showVisitForm && (
                                                    <div className="bg-blue-50 rounded p-2 mb-2">
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
                                                                value={newVisit.interesseNivel}
                                                                onChange={(e) => setNewVisit({ ...newVisit, interesseNivel: e.target.value })}
                                                                className="px-2 py-1 text-sm border rounded col-span-2"
                                                            >
                                                                <option value="baixo">😐 Baixo Interesse</option>
                                                                <option value="medio">🙂 Médio Interesse</option>
                                                                <option value="alto">😊 Alto Interesse</option>
                                                                <option value="muito_alto">🤩 Muito Alto Interesse</option>
                                                            </select>
                                                            <textarea
                                                                value={newVisit.notas}
                                                                onChange={(e) => setNewVisit({ ...newVisit, notas: e.target.value })}
                                                                className="px-2 py-1 text-sm border rounded col-span-2"
                                                                rows={2}
                                                                placeholder="Notas da visita..."
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddVisitToProperty(property.id)}
                                                            className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                        >
                                                            Adicionar Visita
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Lista de visitas */}
                                                {property.visitas.map((visit, idx) => (
                                                    <div key={visit.id} className="text-xs bg-white rounded p-1 mb-1">
                                                        {visit.data} às {visit.hora}
                                                        {visit.interesseNivel === 'muito_alto' && ' 🤩'}
                                                        {visit.interesseNivel === 'alto' && ' 😊'}
                                                        {visit.interesseNivel === 'medio' && ' 🙂'}
                                                        {visit.interesseNivel === 'baixo' && ' 😐'}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Ofertas */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        💶 Ofertas ({property.ofertas.length})
                                                    </span>
                                                    {selectedProperty?.id === property.id && showOfferForm ? (
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
                                                            }}
                                                            className="text-xs text-green-600"
                                                        >
                                                            + Nova Oferta
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Form de nova oferta inline */}
                                                {selectedProperty?.id === property.id && showOfferForm && (
                                                    <div className="bg-green-50 rounded p-2 mb-2">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                type="number"
                                                                value={newOffer.valor}
                                                                onChange={(e) => setNewOffer({ ...newOffer, valor: e.target.value })}
                                                                className="px-2 py-1 text-sm border rounded"
                                                                placeholder="Valor €"
                                                            />
                                                            <select
                                                                value={newOffer.status}
                                                                onChange={(e) => setNewOffer({ ...newOffer, status: e.target.value })}
                                                                className="px-2 py-1 text-sm border rounded"
                                                            >
                                                                <option value="rascunho">📝 Rascunho</option>
                                                                <option value="submetida">📤 Submetida</option>
                                                                <option value="negociacao">🤝 Negociação</option>
                                                                <option value="aceite">✅ Aceite</option>
                                                                <option value="rejeitada">❌ Rejeitada</option>
                                                            </select>
                                                            <textarea
                                                                value={newOffer.condicoes}
                                                                onChange={(e) => setNewOffer({ ...newOffer, condicoes: e.target.value })}
                                                                className="px-2 py-1 text-sm border rounded col-span-2"
                                                                rows={2}
                                                                placeholder="Condições da oferta..."
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddOfferToProperty(property.id)}
                                                            className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                        >
                                                            Adicionar Oferta
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Lista de ofertas */}
                                                {property.ofertas.map((offer) => (
                                                    <div key={offer.id} className="text-xs bg-white rounded p-1 mb-1">
                                                        €{parseFloat(offer.valor).toLocaleString('pt-PT')} - {offer.status}
                                                        {offer.status === 'aceite' && ' ✅'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Estado de Negócio - Fase de Fecho */}
                                        {property.ofertas.some(o => o.status === 'aceite') && (
                                            <div className="border-t mt-3 pt-3">
                                                <p className="text-sm font-medium text-gray-700 mb-2">📋 Fase de Fecho</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdatePropertyStatus(property.id, 'cpcv')}
                                                        className={`px-2 py-1 text-xs rounded ${property.estadoNegocio === 'cpcv'
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        CPCV
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdatePropertyStatus(property.id, 'escritura')}
                                                        className={`px-2 py-1 text-xs rounded ${property.estadoNegocio === 'escritura'
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        Escritura
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