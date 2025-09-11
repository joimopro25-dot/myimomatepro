/**
 * LEAD FORM PAGE - MyImoMatePro
 * Formulário completo para criar/editar leads
 * ✅ VERSÃO COMPLETA E MELHORADA
 * 
 * Caminho: src/pages/LeadForm.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeads } from '../contexts/LeadContext';
import Layout from '../components/Layout';
import {
    LEAD_STATUS,
    QUALIFICATION_TYPES,
    LEAD_SOURCES,
    URGENCY_LEVELS,
    INVESTMENT_TYPES,
    FOLLOWUP_TYPES,
    validateLeadData
} from '../models/leadModel';
import {
    ArrowLeftIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    HomeIcon,
    CurrencyEuroIcon,
    ClockIcon,
    CalendarIcon,
    DocumentTextIcon,
    MapPinIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    FunnelIcon,
    BriefcaseIcon,
    BuildingOfficeIcon,
    KeyIcon
} from '@heroicons/react/24/outline';

export default function LeadForm() {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(leadId);

    const {
        currentLead,
        loading,
        errors: contextErrors,
        createLead,
        updateLead,
        fetchLead,
        clearCurrentLead,
        clearError
    } = useLeads();

    // Estado do formulário com estrutura completa
    const [formData, setFormData] = useState({
        // Dados Básicos
        name: '',
        email: '',
        phone: '',
        secondaryPhone: '',

        // Origem e Qualificação
        source: 'website',
        sourceDetails: '',
        qualificationType: '',
        investmentType: '',
        urgencyLevel: 'medium',

        // Preferências Imobiliárias
        preferences: {
            propertyType: '', // apartamento, moradia, terreno, comercial
            purpose: '', // habitacao_propria, investimento, arrendamento
            minBedrooms: '',
            maxBedrooms: '',
            minArea: '',
            maxArea: '',
            parking: false,
            garage: false,
            garden: false,
            pool: false,
            elevator: false,
            balcony: false,
            storage: false
        },

        // Localização Preferida
        location: {
            zones: [],
            districts: '',
            municipalities: '',
            parishes: '',
            maxDistanceWork: '',
            nearSchools: false,
            nearPublicTransport: false,
            nearHospital: false,
            nearShopping: false
        },

        // Informação Financeira
        financial: {
            budget: '',
            maxBudget: '',
            hasFinancing: false,
            financingApproved: false,
            bankName: '',
            downPayment: '',
            monthlyPayment: '',
            needsFinancingHelp: false
        },

        // Timing e Urgência
        timing: {
            buyingTimeframe: '3_months', // immediately, 3_months, 6_months, 1_year, exploring
            sellingTimeframe: '',
            reasonToBuy: '',
            reasonToSell: '',
            currentSituation: '' // renting, owner, first_buyer, investor
        },

        // Follow-up
        nextContactDate: '',
        nextContactTime: '',
        preferredContactMethod: 'phone',
        bestContactTime: '',
        notes: '',

        // Status
        status: 'new',
        temperature: 'warm', // hot, warm, cold
        priority: 'normal' // high, normal, low
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    // Total de steps
    const totalSteps = 5;

    // Carregar dados se for edição
    useEffect(() => {
        if (isEditMode && leadId) {
            fetchLead(leadId);
        }
        return () => {
            clearCurrentLead();
            clearError();
        };
    }, [leadId, isEditMode]);

    // Preencher formulário com dados da lead
    useEffect(() => {
        if (isEditMode && currentLead) {
            setFormData({
                ...currentLead,
                preferences: {
                    ...formData.preferences,
                    ...currentLead.preferences
                },
                location: {
                    ...formData.location,
                    ...currentLead.location
                },
                financial: {
                    ...formData.financial,
                    ...currentLead.financial
                },
                timing: {
                    ...formData.timing,
                    ...currentLead.timing
                }
            });
        }
    }, [currentLead, isEditMode]);

    // Handle mudanças nos campos
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Limpar erro do campo
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Validar step atual
    const validateStep = (step) => {
        let errors = {};

        switch (step) {
            case 1: // Dados Básicos
                if (!formData.name || formData.name.trim().length < 2) {
                    errors.name = 'Nome é obrigatório (mínimo 2 caracteres)';
                }
                if (!formData.phone || formData.phone.trim().length < 9) {
                    errors.phone = 'Telefone é obrigatório';
                }
                if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    errors.email = 'Email inválido';
                }
                break;

            case 2: // Qualificação
                if (!formData.qualificationType) {
                    errors.qualificationType = 'Tipo de qualificação é obrigatório';
                }
                break;

            case 3: // Preferências
                // Validações opcionais
                break;

            case 4: // Financeiro
                if (formData.financial.budget && isNaN(formData.financial.budget)) {
                    errors['financial.budget'] = 'Orçamento deve ser um número';
                }
                break;

            case 5: // Follow-up
                if (!formData.nextContactDate) {
                    errors.nextContactDate = 'Data do próximo contacto é obrigatória';
                }
                break;
        }

        return errors;
    };

    // Navegar entre steps
    const handleNextStep = () => {
        const errors = validateStep(currentStep);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    };

    const handlePreviousStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    // Submit do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar todos os steps
        let allErrors = {};
        for (let i = 1; i <= totalSteps; i++) {
            const stepErrors = validateStep(i);
            allErrors = { ...allErrors, ...stepErrors };
        }

        if (Object.keys(allErrors).length > 0) {
            setValidationErrors(allErrors);
            // Voltar ao primeiro step com erro
            const firstErrorStep = Object.keys(allErrors).reduce((min, key) => {
                if (key.includes('name') || key.includes('phone') || key.includes('email')) return Math.min(min, 1);
                if (key.includes('qualification')) return Math.min(min, 2);
                if (key.includes('preferences')) return Math.min(min, 3);
                if (key.includes('financial')) return Math.min(min, 4);
                return Math.min(min, 5);
            }, totalSteps);
            setCurrentStep(firstErrorStep);
            return;
        }

        try {
            if (isEditMode) {
                await updateLead(leadId, formData);
            } else {
                await createLead(formData);
            }
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/leads');
            }, 2000);
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
        }
    };

    // Renderizar Step 1: Dados Básicos
    const renderBasicData = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Dados do Prospect</h2>
                <p className="text-gray-600 mt-2">Informações básicas de contacto</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${validationErrors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Nome completo do prospect"
                        />
                        {validationErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                        )}
                    </div>

                    {/* Telefone Principal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone Principal *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="912 345 678"
                        />
                        {validationErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                        )}
                    </div>

                    {/* Telefone Secundário */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone Secundário
                        </label>
                        <input
                            type="tel"
                            name="secondaryPhone"
                            value={formData.secondaryPhone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Opcional"
                        />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${validationErrors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="email@exemplo.com"
                        />
                        {validationErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                        )}
                    </div>

                    {/* Origem da Lead */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Como nos conheceu? *
                        </label>
                        <select
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            {Object.entries(LEAD_SOURCES).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>

                    {/* Detalhes da Origem */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Detalhes
                        </label>
                        <input
                            type="text"
                            name="sourceDetails"
                            value={formData.sourceDetails}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Ex: Campanha Facebook Ads"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Renderizar Step 2: Qualificação Imobiliária
    const renderQualification = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HomeIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Qualificação Imobiliária</h2>
                <p className="text-gray-600 mt-2">Tipo de interesse e urgência</p>
            </div>

            {/* Tipo de Qualificação */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                    Tipo de Qualificação *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(QUALIFICATION_TYPES).map(([key, value]) => {
                        const icons = {
                            buyer: HomeIcon,
                            seller: KeyIcon,
                            landlord: BuildingOfficeIcon,
                            tenant: UserIcon,
                            investor: ChartBarIcon
                        };
                        const Icon = icons[key];

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, qualificationType: key }))}
                                className={`p-4 rounded-xl border-2 transition-all ${formData.qualificationType === key
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className={`w-8 h-8 mx-auto mb-2 ${formData.qualificationType === key ? 'text-orange-600' : 'text-gray-400'
                                    }`} />
                                <p className={`text-sm font-medium ${formData.qualificationType === key ? 'text-orange-900' : 'text-gray-700'
                                    }`}>
                                    {value}
                                </p>
                            </button>
                        );
                    })}
                </div>
                {validationErrors.qualificationType && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.qualificationType}</p>
                )}
            </div>

            {/* Detalhes específicos por tipo */}
            {formData.qualificationType === 'investor' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                        Tipo de Investimento
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(INVESTMENT_TYPES).map(([key, value]) => (
                            <label key={key} className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name="investmentType"
                                    value={key}
                                    checked={formData.investmentType === key}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-gray-700">{value}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Urgência e Temperatura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                        Nível de Urgência
                    </label>
                    <div className="space-y-3">
                        {Object.entries(URGENCY_LEVELS).map(([key, value]) => (
                            <label key={key} className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name="urgencyLevel"
                                    value={key}
                                    checked={formData.urgencyLevel === key}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-gray-700">{value}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                        Temperatura da Lead
                    </label>
                    <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                            <input
                                type="radio"
                                name="temperature"
                                value="hot"
                                checked={formData.temperature === 'hot'}
                                onChange={handleChange}
                                className="w-4 h-4 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-gray-700">🔥 Quente - Pronto para fechar</span>
                        </label>
                        <label className="flex items-center space-x-3">
                            <input
                                type="radio"
                                name="temperature"
                                value="warm"
                                checked={formData.temperature === 'warm'}
                                onChange={handleChange}
                                className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                            />
                            <span className="text-gray-700">☀️ Morna - Em avaliação</span>
                        </label>
                        <label className="flex items-center space-x-3">
                            <input
                                type="radio"
                                name="temperature"
                                value="cold"
                                checked={formData.temperature === 'cold'}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">❄️ Fria - Início de relacionamento</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    // Renderizar Step 3: Preferências
    const renderPreferences = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HomeIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Preferências do Imóvel</h2>
                <p className="text-gray-600 mt-2">O que o cliente procura</p>
            </div>

            {/* Tipo e Características */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Imóvel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Propriedade
                        </label>
                        <select
                            name="preferences.propertyType"
                            value={formData.preferences.propertyType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Selecione...</option>
                            <option value="apartamento">Apartamento</option>
                            <option value="moradia">Moradia</option>
                            <option value="terreno">Terreno</option>
                            <option value="comercial">Comercial</option>
                            <option value="armazem">Armazém</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Finalidade
                        </label>
                        <select
                            name="preferences.purpose"
                            value={formData.preferences.purpose}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Selecione...</option>
                            <option value="habitacao_propria">Habitação Própria</option>
                            <option value="investimento">Investimento</option>
                            <option value="arrendamento">Arrendamento</option>
                            <option value="ferias">Casa de Férias</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quartos (Mín - Máx)
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="number"
                                name="preferences.minBedrooms"
                                value={formData.preferences.minBedrooms}
                                onChange={handleChange}
                                className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Mín"
                                min="0"
                            />
                            <input
                                type="number"
                                name="preferences.maxBedrooms"
                                value={formData.preferences.maxBedrooms}
                                onChange={handleChange}
                                className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Máx"
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Área m² (Mín - Máx)
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="number"
                                name="preferences.minArea"
                                value={formData.preferences.minArea}
                                onChange={handleChange}
                                className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Mín"
                                min="0"
                            />
                            <input
                                type="number"
                                name="preferences.maxArea"
                                value={formData.preferences.maxArea}
                                onChange={handleChange}
                                className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Máx"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Características desejadas */}
                <h4 className="text-sm font-medium text-gray-700 mt-6 mb-3">Características Desejadas</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { key: 'parking', label: 'Estacionamento' },
                        { key: 'garage', label: 'Garagem' },
                        { key: 'garden', label: 'Jardim' },
                        { key: 'pool', label: 'Piscina' },
                        { key: 'elevator', label: 'Elevador' },
                        { key: 'balcony', label: 'Varanda' },
                        { key: 'storage', label: 'Arrecadação' }
                    ].map(item => (
                        <label key={item.key} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name={`preferences.${item.key}`}
                                checked={formData.preferences[item.key]}
                                onChange={handleChange}
                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Localização */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    Localização Pretendida
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Distritos
                        </label>
                        <input
                            type="text"
                            name="location.districts"
                            value={formData.location.districts}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="Ex: Porto, Braga"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Concelhos
                        </label>
                        <input
                            type="text"
                            name="location.municipalities"
                            value={formData.location.municipalities}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="Ex: Matosinhos, Gaia"
                        />
                    </div>
                </div>

                <h4 className="text-sm font-medium text-gray-700 mt-6 mb-3">Proximidades Importantes</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { key: 'nearSchools', label: 'Escolas' },
                        { key: 'nearPublicTransport', label: 'Transportes' },
                        { key: 'nearHospital', label: 'Hospital' },
                        { key: 'nearShopping', label: 'Comércio' }
                    ].map(item => (
                        <label key={item.key} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name={`location.${item.key}`}
                                checked={formData.location[item.key]}
                                onChange={handleChange}
                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    // Renderizar Step 4: Informação Financeira
    const renderFinancial = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CurrencyEuroIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Informação Financeira</h2>
                <p className="text-gray-600 mt-2">Capacidade de investimento</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Orçamento Mínimo (€)
                        </label>
                        <input
                            type="number"
                            name="financial.budget"
                            value={formData.financial.budget}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="150000"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Orçamento Máximo (€)
                        </label>
                        <input
                            type="number"
                            name="financial.maxBudget"
                            value={formData.financial.maxBudget}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="250000"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Entrada Disponível (€)
                        </label>
                        <input
                            type="number"
                            name="financial.downPayment"
                            value={formData.financial.downPayment}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="30000"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prestação Mensal Máxima (€)
                        </label>
                        <input
                            type="number"
                            name="financial.monthlyPayment"
                            value={formData.financial.monthlyPayment}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="800"
                            min="0"
                        />
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            name="financial.hasFinancing"
                            checked={formData.financial.hasFinancing}
                            onChange={handleChange}
                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-gray-700">Necessita de financiamento</span>
                    </label>

                    {formData.financial.hasFinancing && (
                        <>
                            <label className="flex items-center space-x-3 ml-7">
                                <input
                                    type="checkbox"
                                    name="financial.financingApproved"
                                    checked={formData.financial.financingApproved}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                />
                                <span className="text-gray-700">Já tem pré-aprovação bancária</span>
                            </label>

                            {formData.financial.financingApproved && (
                                <div className="ml-7">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome do Banco
                                    </label>
                                    <input
                                        type="text"
                                        name="financial.bankName"
                                        value={formData.financial.bankName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="Ex: Banco XYZ"
                                    />
                                </div>
                            )}

                            <label className="flex items-center space-x-3 ml-7">
                                <input
                                    type="checkbox"
                                    name="financial.needsFinancingHelp"
                                    checked={formData.financial.needsFinancingHelp}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                />
                                <span className="text-gray-700">Precisa de ajuda com financiamento</span>
                            </label>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    // Renderizar Step 5: Follow-up e Notas
    const renderFollowUp = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Próximo Contacto</h2>
                <p className="text-gray-600 mt-2">Agendar follow-up</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data do Próximo Contacto *
                        </label>
                        <input
                            type="date"
                            name="nextContactDate"
                            value={formData.nextContactDate}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${validationErrors.nextContactDate ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {validationErrors.nextContactDate && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.nextContactDate}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hora
                        </label>
                        <input
                            type="time"
                            name="nextContactTime"
                            value={formData.nextContactTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Método de Contacto Preferido
                        </label>
                        <select
                            name="preferredContactMethod"
                            value={formData.preferredContactMethod}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="phone">Telefone</option>
                            <option value="email">Email</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="presencial">Presencial</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Melhor Horário para Contacto
                        </label>
                        <select
                            name="bestContactTime"
                            value={formData.bestContactTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Qualquer hora</option>
                            <option value="morning">Manhã (9h-12h)</option>
                            <option value="afternoon">Tarde (14h-18h)</option>
                            <option value="evening">Noite (18h-21h)</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas e Observações
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Adicione notas importantes sobre esta lead..."
                    />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status da Lead
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            {Object.entries(LEAD_STATUS).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prioridade
                        </label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="low">Baixa</option>
                            <option value="normal">Normal</option>
                            <option value="high">Alta</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    // Renderizar conteúdo do step atual
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderBasicData();
            case 2:
                return renderQualification();
            case 3:
                return renderPreferences();
            case 4:
                return renderFinancial();
            case 5:
                return renderFollowUp();
            default:
                return renderBasicData();
        }
    };

    // Loading
    if (loading.current && isEditMode) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando dados da lead...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/leads')}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Editar Lead' : 'Nova Lead'}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {isEditMode ? 'Atualizar informações da lead' : 'Registar novo prospect'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4, 5].map((step) => (
                            <div key={step} className="flex-1 flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step === currentStep
                                            ? 'bg-orange-500 text-white'
                                            : step < currentStep
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {step < currentStep ? (
                                        <CheckCircleIcon className="w-6 h-6" />
                                    ) : (
                                        step
                                    )}
                                </div>
                                {step < totalSteps && (
                                    <div
                                        className={`flex-1 h-1 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-600">Dados</span>
                        <span className="text-xs text-gray-600">Qualificação</span>
                        <span className="text-xs text-gray-600">Preferências</span>
                        <span className="text-xs text-gray-600">Financeiro</span>
                        <span className="text-xs text-gray-600">Follow-up</span>
                    </div>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit}>
                    {renderCurrentStep()}

                    {/* Botões de navegação */}
                    <div className="flex justify-between mt-8">
                        <button
                            type="button"
                            onClick={handlePreviousStep}
                            disabled={currentStep === 1}
                            className={`px-6 py-3 rounded-lg font-medium ${currentStep === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Anterior
                        </button>

                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600"
                            >
                                Próximo
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700"
                            >
                                {isEditMode ? 'Atualizar Lead' : 'Criar Lead'}
                            </button>
                        )}
                    </div>
                </form>

                {/* Mensagem de sucesso */}
                {showSuccess && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 max-w-md">
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                                {isEditMode ? 'Lead Atualizada!' : 'Lead Criada com Sucesso!'}
                            </h3>
                            <p className="text-center text-gray-600">
                                Redirecionando para a lista de leads...
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}