/**
 * LEAD FORM PAGE - MyImoMatePro
 * Formulário para criar/editar leads
 * 
 * Caminho: src/pages/LeadForm.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeads } from '../contexts/LeadContext';
import {
    validateLeadData,
    LEAD_SOURCES,
    LEAD_INTERESTS,
    LEAD_SOURCE_LABELS,
    LEAD_INTEREST_LABELS
} from '../models/leadModel';
import Layout from '../components/Layout';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentArrowUpIcon,
    InformationCircleIcon,
    TagIcon,
    ClockIcon,
    PhoneIcon,
    EnvelopeIcon,
    UserIcon,
    HomeIcon,
    CurrencyEuroIcon,
    CalendarIcon,
    ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

const LeadFormPage = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(leadId);

    // Context de leads
    const {
        currentLead,
        loading,
        errors: contextErrors,
        createLead,
        fetchLead,
        updateLead,
        clearCurrentLead,
        clearError
    } = useLeads();

    // Estados locais
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;
    const [formData, setFormData] = useState(getInitialFormData());
    const [validationErrors, setValidationErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Função para dados iniciais
    function getInitialFormData() {
        return {
            // Passo 1 - Dados Básicos
            name: '',
            phone: '',
            email: '',
            leadSource: LEAD_SOURCES.WEBSITE,
            interesse: LEAD_INTERESTS.COMPRAR,

            // Passo 2 - Qualificação
            urgencia: 'media',
            orcamentoEstimado: '',
            zonaInteresse: '',
            tipologiaInteresse: '',
            melhorHorario: '',
            contactPreference: 'phone',
            statusQualificacao: 'por_qualificar',

            // Passo 3 - Informações Adicionais
            descricao: '',
            consultorObservations: '',
            proximoContacto: '',
            tags: [],
            gdprConsent: false,
            marketingConsent: false
        };
    }

    // Carregar dados da lead em modo de edição
    useEffect(() => {
        const loadLead = async () => {
            if (isEditMode && leadId) {
                try {
                    const lead = await fetchLead(leadId);
                    if (lead) {
                        setFormData({
                            name: lead.name || '',
                            phone: lead.phone || '',
                            email: lead.email || '',
                            leadSource: lead.leadSource || LEAD_SOURCES.WEBSITE,
                            interesse: lead.interesse || LEAD_INTERESTS.COMPRAR,
                            urgencia: lead.urgencia || 'media',
                            orcamentoEstimado: lead.orcamentoEstimado || '',
                            zonaInteresse: lead.zonaInteresse || '',
                            tipologiaInteresse: lead.tipologiaInteresse || '',
                            melhorHorario: lead.melhorHorario || '',
                            contactPreference: lead.contactPreference || 'phone',
                            statusQualificacao: lead.statusQualificacao || 'por_qualificar',
                            descricao: lead.descricao || '',
                            consultorObservations: lead.consultorObservations || '',
                            proximoContacto: lead.proximoContacto ?
                                new Date(lead.proximoContacto.toDate()).toISOString().slice(0, 16) : '',
                            tags: lead.tags || [],
                            gdprConsent: lead.gdprConsent || false,
                            marketingConsent: lead.marketingConsent || false
                        });
                    }
                } catch (error) {
                    console.error('Erro ao carregar lead:', error);
                    setValidationErrors({ global: 'Erro ao carregar dados da lead' });
                }
            }
        };

        loadLead();
    }, [isEditMode, leadId, fetchLead]);

    // Limpar ao desmontar
    useEffect(() => {
        return () => {
            clearCurrentLead();
            clearError('create');
            clearError('update');
        };
    }, [clearCurrentLead, clearError]);

    // Manipular mudanças no formulário
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Marcar como tocado
        setTouched(prev => ({ ...prev, [name]: true }));

        // Limpar erro do campo
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [validationErrors]);

    // Adicionar tag
    const handleAddTag = useCallback((tag) => {
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
        }
    }, [formData.tags]);

    // Remover tag
    const handleRemoveTag = useCallback((tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    }, []);

    // Validar passo atual
    const validateStep = useCallback((step) => {
        const stepData = {};
        const errors = {};

        switch (step) {
            case 1:
                // Validar dados básicos
                stepData.name = formData.name;
                stepData.phone = formData.phone;
                stepData.email = formData.email;

                if (!formData.name?.trim()) {
                    errors.name = 'Nome é obrigatório';
                }
                if (!formData.phone?.trim()) {
                    errors.phone = 'Telefone é obrigatório';
                } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
                    errors.phone = 'Formato de telefone inválido';
                }
                if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    errors.email = 'Email inválido';
                }
                break;

            case 2:
                // Validar qualificação
                if (formData.orcamentoEstimado && formData.orcamentoEstimado < 0) {
                    errors.orcamentoEstimado = 'Orçamento deve ser positivo';
                }
                break;

            case 3:
                // Validar informações adicionais
                if (!formData.gdprConsent) {
                    errors.gdprConsent = 'Consentimento GDPR é obrigatório';
                }
                break;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    // Navegar entre passos
    const handleNextStep = useCallback(() => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    }, [currentStep, validateStep]);

    const handlePrevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    }, []);

    // Submeter formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar todos os passos
        let isValid = true;
        for (let i = 1; i <= totalSteps; i++) {
            if (!validateStep(i)) {
                isValid = false;
                setCurrentStep(i);
                break;
            }
        }

        if (!isValid) return;

        setIsSubmitting(true);

        try {
            if (isEditMode) {
                await updateLead(leadId, formData);
            } else {
                await createLead(formData);
            }

            setShowSuccess(true);

            // Redirecionar após 2 segundos
            setTimeout(() => {
                navigate('/leads', {
                    state: {
                        fromForm: true,
                        action: isEditMode ? 'updated' : 'created'
                    }
                });
            }, 2000);
        } catch (error) {
            console.error('Erro ao guardar lead:', error);
            setValidationErrors({
                global: `Erro ao ${isEditMode ? 'atualizar' : 'criar'} lead: ${error.message}`
            });
            setIsSubmitting(false);
        }
    };

    // Cancelar
    const handleCancel = () => {
        navigate('/leads');
    };

    // Componente de indicador de passos
    const StepIndicator = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                        <div
                            className={`
                                flex items-center justify-center w-10 h-10 rounded-full
                                ${currentStep >= step
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-500'}
                            `}
                        >
                            {currentStep > step ? (
                                <CheckCircleIcon className="w-6 h-6" />
                            ) : (
                                step
                            )}
                        </div>
                        {step < 3 && (
                            <div
                                className={`w-full h-1 mx-2 ${currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-600">Dados Básicos</span>
                <span className="text-xs text-gray-600">Qualificação</span>
                <span className="text-xs text-gray-600">Informações</span>
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={handleCancel}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Voltar às Leads
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Editar Lead' : 'Nova Lead'}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        {isEditMode
                            ? 'Atualize as informações da lead'
                            : 'Adicione uma nova lead ao sistema'}
                    </p>
                </div>

                {/* Mensagem de Sucesso */}
                {showSuccess && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                        <div className="flex">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                                <p className="text-sm text-green-700">
                                    Lead {isEditMode ? 'atualizada' : 'criada'} com sucesso!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Erro Global */}
                {validationErrors.global && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    {validationErrors.global}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Indicador de Passos */}
                <StepIndicator />

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4">
                        {/* Passo 1: Dados Básicos */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Dados Básicos
                                </h3>

                                {/* Nome */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Nome Completo *
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`
                                                block w-full pl-10 pr-3 py-2 border rounded-md
                                                focus:outline-none focus:ring-1
                                                ${validationErrors.name
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}
                                            `}
                                            placeholder="João Silva"
                                        />
                                    </div>
                                    {validationErrors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {validationErrors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Telefone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Telefone *
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="phone"
                                            id="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={`
                                                block w-full pl-10 pr-3 py-2 border rounded-md
                                                focus:outline-none focus:ring-1
                                                ${validationErrors.phone
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}
                                            `}
                                            placeholder="912 345 678"
                                        />
                                    </div>
                                    {validationErrors.phone && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {validationErrors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`
                                                block w-full pl-10 pr-3 py-2 border rounded-md
                                                focus:outline-none focus:ring-1
                                                ${validationErrors.email
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}
                                            `}
                                            placeholder="joao.silva@email.com"
                                        />
                                    </div>
                                    {validationErrors.email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {validationErrors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Fonte da Lead */}
                                <div>
                                    <label htmlFor="leadSource" className="block text-sm font-medium text-gray-700">
                                        Fonte da Lead
                                    </label>
                                    <select
                                        id="leadSource"
                                        name="leadSource"
                                        value={formData.leadSource}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                    >
                                        {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Interesse */}
                                <div>
                                    <label htmlFor="interesse" className="block text-sm font-medium text-gray-700">
                                        Interesse
                                    </label>
                                    <select
                                        id="interesse"
                                        name="interesse"
                                        value={formData.interesse}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                    >
                                        {Object.entries(LEAD_INTEREST_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Passo 2: Qualificação */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Qualificação da Lead
                                </h3>

                                {/* Urgência */}
                                <div>
                                    <label htmlFor="urgencia" className="block text-sm font-medium text-gray-700">
                                        Urgência
                                    </label>
                                    <select
                                        id="urgencia"
                                        name="urgencia"
                                        value={formData.urgencia}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                    >
                                        <option value="baixa">Baixa</option>
                                        <option value="media">Média</option>
                                        <option value="alta">Alta</option>
                                    </select>
                                </div>

                                {/* Orçamento Estimado */}
                                <div>
                                    <label htmlFor="orcamentoEstimado" className="block text-sm font-medium text-gray-700">
                                        Orçamento Estimado (€)
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CurrencyEuroIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            name="orcamentoEstimado"
                                            id="orcamentoEstimado"
                                            value={formData.orcamentoEstimado}
                                            onChange={handleChange}
                                            className={`
                                                block w-full pl-10 pr-3 py-2 border rounded-md
                                                focus:outline-none focus:ring-1
                                                ${validationErrors.orcamentoEstimado
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}
                                            `}
                                            placeholder="250000"
                                            min="0"
                                        />
                                    </div>
                                    {validationErrors.orcamentoEstimado && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {validationErrors.orcamentoEstimado}
                                        </p>
                                    )}
                                </div>

                                {/* Zona de Interesse */}
                                <div>
                                    <label htmlFor="zonaInteresse" className="block text-sm font-medium text-gray-700">
                                        Zona de Interesse
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <HomeIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="zonaInteresse"
                                            id="zonaInteresse"
                                            value={formData.zonaInteresse}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Porto, Vila Nova de Gaia"
                                        />
                                    </div>
                                </div>

                                {/* Tipologia de Interesse */}
                                <div>
                                    <label htmlFor="tipologiaInteresse" className="block text-sm font-medium text-gray-700">
                                        Tipologia de Interesse
                                    </label>
                                    <select
                                        id="tipologiaInteresse"
                                        name="tipologiaInteresse"
                                        value={formData.tipologiaInteresse}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                    >
                                        <option value="">Selecionar...</option>
                                        <option value="T0">T0</option>
                                        <option value="T1">T1</option>
                                        <option value="T2">T2</option>
                                        <option value="T3">T3</option>
                                        <option value="T4">T4</option>
                                        <option value="T5+">T5+</option>
                                        <option value="moradia">Moradia</option>
                                        <option value="terreno">Terreno</option>
                                        <option value="comercial">Comercial</option>
                                    </select>
                                </div>

                                {/* Melhor Horário */}
                                <div>
                                    <label htmlFor="melhorHorario" className="block text-sm font-medium text-gray-700">
                                        Melhor Horário para Contacto
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ClockIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="melhorHorario"
                                            id="melhorHorario"
                                            value={formData.melhorHorario}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Manhã, Tarde, Fim de tarde"
                                        />
                                    </div>
                                </div>

                                {/* Preferência de Contacto */}
                                <div>
                                    <label htmlFor="contactPreference" className="block text-sm font-medium text-gray-700">
                                        Preferência de Contacto
                                    </label>
                                    <select
                                        id="contactPreference"
                                        name="contactPreference"
                                        value={formData.contactPreference}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                    >
                                        <option value="phone">Telefone</option>
                                        <option value="email">Email</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="any">Qualquer</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Passo 3: Informações Adicionais */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Informações Adicionais
                                </h3>

                                {/* Descrição */}
                                <div>
                                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                                        Descrição / Necessidades
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="descricao"
                                            name="descricao"
                                            rows={4}
                                            value={formData.descricao}
                                            onChange={handleChange}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Descreva as necessidades e expectativas do cliente..."
                                        />
                                    </div>
                                </div>

                                {/* Observações do Consultor */}
                                <div>
                                    <label htmlFor="consultorObservations" className="block text-sm font-medium text-gray-700">
                                        Observações do Consultor
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="consultorObservations"
                                            name="consultorObservations"
                                            rows={3}
                                            value={formData.consultorObservations}
                                            onChange={handleChange}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Notas internas sobre a lead..."
                                        />
                                    </div>
                                </div>

                                {/* Próximo Contacto */}
                                <div>
                                    <label htmlFor="proximoContacto" className="block text-sm font-medium text-gray-700">
                                        Agendar Próximo Contacto
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="datetime-local"
                                            name="proximoContacto"
                                            id="proximoContacto"
                                            value={formData.proximoContacto}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                                            >
                                                <TagIcon className="h-4 w-4 mr-1" />
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Adicionar tag..."
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.target;
                                                    if (input.value) {
                                                        handleAddTag(input.value);
                                                        input.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Consentimentos */}
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="gdprConsent"
                                                name="gdprConsent"
                                                type="checkbox"
                                                checked={formData.gdprConsent}
                                                onChange={handleChange}
                                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="gdprConsent" className="font-medium text-gray-700">
                                                Consentimento GDPR *
                                            </label>
                                            <p className="text-gray-500">
                                                O cliente consentiu o tratamento dos seus dados pessoais
                                            </p>
                                            {validationErrors.gdprConsent && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {validationErrors.gdprConsent}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="marketingConsent"
                                                name="marketingConsent"
                                                type="checkbox"
                                                checked={formData.marketingConsent}
                                                onChange={handleChange}
                                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="marketingConsent" className="font-medium text-gray-700">
                                                Consentimento Marketing
                                            </label>
                                            <p className="text-gray-500">
                                                O cliente aceita receber comunicações de marketing
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer com botões */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                        <div>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                    Anterior
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancelar
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Próximo
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            A guardar...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                                            {isEditMode ? 'Atualizar Lead' : 'Criar Lead'}
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

export default LeadFormPage;