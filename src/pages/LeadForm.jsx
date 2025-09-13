/**
 * LEAD FORM PAGE - MyImoMatePro (CORREÇÃO)
 * Formulário para criar e editar leads
 * Correção do erro de input controlado/não controlado
 * 
 * Caminho: src/pages/LeadForm.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useLeads } from '../contexts/LeadContext';
import {
    LEAD_SOURCES,
    QUALIFICATION_TYPES,
    URGENCY_LEVELS,
    INVESTMENT_TYPES,
    validateLeadData
} from '../models/leadModel';
import {
    ArrowLeftIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    HomeIcon,
    CurrencyEuroIcon,
    MapPinIcon,
    ClockIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function LeadForm() {
    const navigate = useNavigate();
    const { leadId } = useParams();
    const { createLead, updateLead, fetchLead, loading } = useLeads();

    const isEditMode = !!leadId;

    // Estado do formulário
    const [formData, setFormData] = useState({
        prospect: {
            name: '',
            phone: '',
            email: ''
        },
        source: {
            origin: 'website',
            details: ''
        },
        qualification: {
            type: '',
            buyer: {
                looking: '',
                budget: '',
                preferredLocation: '',
                urgency: 'normal',
                notes: ''
            },
            seller: {
                propertyType: '',
                value: '',
                location: '',
                urgency: 'normal',
                notes: ''
            },
            tenant: {
                looking: '',
                budget: '',
                preferredLocation: '',
                urgency: 'normal',
                notes: ''
            },
            landlord: {
                propertyType: '',
                rentValue: '',
                location: '',
                urgency: 'normal',
                notes: ''
            },
            investor: {
                investmentType: '',
                budget: '',
                preferredLocation: '',
                expectedReturn: '',
                notes: ''
            }
        },
        nextContact: {
            date: '',
            type: 'chamada',
            notes: ''
        },
        generalNotes: ''
    });

    const [errors, setErrors] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);

    // Carregar dados da lead em modo de edição
    useEffect(() => {
        if (isEditMode) {
            loadLeadData();
        }
    }, [leadId]);

    // CORREÇÃO: Método loadLeadData protegido contra valores undefined
    const loadLeadData = async () => {
        try {
            const lead = await fetchLead(leadId);
            if (lead) {
                // Garantir que todos os campos tenham valores definidos
                setFormData({
                    prospect: {
                        name: lead.prospect?.name || '',
                        phone: lead.prospect?.phone || '',
                        email: lead.prospect?.email || ''
                    },
                    source: {
                        origin: lead.source?.origin || 'website',
                        details: lead.source?.details || ''
                    },
                    qualification: {
                        type: lead.qualification?.type || '',
                        buyer: {
                            looking: lead.qualification?.buyer?.looking || '',
                            budget: lead.qualification?.buyer?.budget || '',
                            preferredLocation: lead.qualification?.buyer?.preferredLocation || '',
                            urgency: lead.qualification?.buyer?.urgency || 'normal',
                            notes: lead.qualification?.buyer?.notes || ''
                        },
                        seller: {
                            propertyType: lead.qualification?.seller?.propertyType || '',
                            value: lead.qualification?.seller?.value || '',
                            location: lead.qualification?.seller?.location || '',
                            urgency: lead.qualification?.seller?.urgency || 'normal',
                            notes: lead.qualification?.seller?.notes || ''
                        },
                        tenant: {
                            looking: lead.qualification?.tenant?.looking || '',
                            budget: lead.qualification?.tenant?.budget || '',
                            preferredLocation: lead.qualification?.tenant?.preferredLocation || '',
                            urgency: lead.qualification?.tenant?.urgency || 'normal',
                            notes: lead.qualification?.tenant?.notes || ''
                        },
                        landlord: {
                            propertyType: lead.qualification?.landlord?.propertyType || '',
                            rentValue: lead.qualification?.landlord?.rentValue || '',
                            location: lead.qualification?.landlord?.location || '',
                            urgency: lead.qualification?.landlord?.urgency || 'normal',
                            notes: lead.qualification?.landlord?.notes || ''
                        },
                        investor: {
                            investmentType: lead.qualification?.investor?.investmentType || '',
                            budget: lead.qualification?.investor?.budget || '',
                            preferredLocation: lead.qualification?.investor?.preferredLocation || '',
                            expectedReturn: lead.qualification?.investor?.expectedReturn || '',
                            notes: lead.qualification?.investor?.notes || ''
                        }
                    },
                    nextContact: {
                        date: lead.nextContact?.date || '',
                        type: lead.nextContact?.type || 'chamada',
                        notes: lead.nextContact?.notes || ''
                    },
                    generalNotes: lead.generalNotes || ''
                });
            }
        } catch (error) {
            console.error('Erro ao carregar lead:', error);
            setErrors(['Erro ao carregar dados da lead']);
        }
    };

    // Handlers para mudanças no formulário - Protegidos contra undefined
    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value || '' // Garantir que nunca seja undefined
            }
        }));
    };

    const handleQualificationChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            qualification: {
                ...prev.qualification,
                [type]: {
                    ...prev.qualification[type],
                    [field]: value || '' // Garantir que nunca seja undefined
                }
            }
        }));
    };

    const handleQualificationTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            qualification: {
                ...prev.qualification,
                type: type
            }
        }));
    };

    // Validar e submeter formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar dados
        const validation = validateLeadData(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            window.scrollTo(0, 0);
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
            }, 1500);
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            setErrors(['Erro ao salvar lead. Tente novamente.']);
        }
    };

    // Renderizar campos específicos por tipo de qualificação
    const renderQualificationFields = () => {
        const type = formData.qualification.type;

        if (!type) {
            return (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                        Selecione o tipo de qualificação para ver os campos específicos
                    </p>
                </div>
            );
        }

        switch (type) {
            case 'comprador':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                O que procura?
                            </label>
                            <textarea
                                value={formData.qualification.buyer.looking}
                                onChange={(e) => handleQualificationChange('buyer', 'looking', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Ex: T2 com garagem, Moradia com jardim..."
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Orçamento
                                </label>
                                <input
                                    type="text"
                                    value={formData.qualification.buyer.budget}
                                    onChange={(e) => handleQualificationChange('buyer', 'budget', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Ex: 150.000€ - 200.000€"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Urgência
                                </label>
                                <select
                                    value={formData.qualification.buyer.urgency}
                                    onChange={(e) => handleQualificationChange('buyer', 'urgency', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    {URGENCY_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Localização Preferida
                            </label>
                            <input
                                type="text"
                                value={formData.qualification.buyer.preferredLocation}
                                onChange={(e) => handleQualificationChange('buyer', 'preferredLocation', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Ex: Porto, Vila Nova de Gaia, Matosinhos..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Notas Adicionais
                            </label>
                            <textarea
                                value={formData.qualification.buyer.notes}
                                onChange={(e) => handleQualificationChange('buyer', 'notes', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Observações importantes sobre o comprador..."
                            />
                        </div>
                    </div>
                );

            case 'vendedor':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                O que quer vender?
                            </label>
                            <input
                                type="text"
                                value={formData.qualification.seller.propertyType}
                                onChange={(e) => handleQualificationChange('seller', 'propertyType', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Ex: Apartamento T3, Moradia V4..."
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Valor Pretendido
                                </label>
                                <input
                                    type="text"
                                    value={formData.qualification.seller.value}
                                    onChange={(e) => handleQualificationChange('seller', 'value', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Ex: 250.000€"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Urgência
                                </label>
                                <select
                                    value={formData.qualification.seller.urgency}
                                    onChange={(e) => handleQualificationChange('seller', 'urgency', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    {URGENCY_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Localização
                            </label>
                            <input
                                type="text"
                                value={formData.qualification.seller.location}
                                onChange={(e) => handleQualificationChange('seller', 'location', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Morada completa do imóvel"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Notas Adicionais
                            </label>
                            <textarea
                                value={formData.qualification.seller.notes}
                                onChange={(e) => handleQualificationChange('seller', 'notes', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Observações importantes sobre o vendedor..."
                            />
                        </div>
                    </div>
                );

            case 'inquilino':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                O que procura?
                            </label>
                            <textarea
                                value={formData.qualification.tenant.looking}
                                onChange={(e) => handleQualificationChange('tenant', 'looking', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Ex: T2 mobilado, Estúdio perto do metro..."
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Orçamento Mensal
                                </label>
                                <input
                                    type="text"
                                    value={formData.qualification.tenant.budget}
                                    onChange={(e) => handleQualificationChange('tenant', 'budget', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Ex: 500€ - 700€"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Urgência
                                </label>
                                <select
                                    value={formData.qualification.tenant.urgency}
                                    onChange={(e) => handleQualificationChange('tenant', 'urgency', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    {URGENCY_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Localização Preferida
                            </label>
                            <input
                                type="text"
                                value={formData.qualification.tenant.preferredLocation}
                                onChange={(e) => handleQualificationChange('tenant', 'preferredLocation', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Ex: Centro do Porto, Gaia..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Notas Adicionais
                            </label>
                            <textarea
                                value={formData.qualification.tenant.notes}
                                onChange={(e) => handleQualificationChange('tenant', 'notes', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Observações importantes sobre o inquilino..."
                            />
                        </div>
                    </div>
                );

            case 'senhorio':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                O que quer arrendar?
                            </label>
                            <input
                                type="text"
                                value={formData.qualification.landlord.propertyType}
                                onChange={(e) => handleQualificationChange('landlord', 'propertyType', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Ex: Apartamento T2, Moradia T3..."
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Valor da Renda
                                </label>
                                <input
                                    type="text"
                                    value={formData.qualification.landlord.rentValue}
                                    onChange={(e) => handleQualificationChange('landlord', 'rentValue', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Ex: 800€/mês"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Urgência
                                </label>
                                <select
                                    value={formData.qualification.landlord.urgency}
                                    onChange={(e) => handleQualificationChange('landlord', 'urgency', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    {URGENCY_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Localização
                            </label>
                            <input
                                type="text"
                                value={formData.qualification.landlord.location}
                                onChange={(e) => handleQualificationChange('landlord', 'location', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Morada completa do imóvel"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Notas Adicionais
                            </label>
                            <textarea
                                value={formData.qualification.landlord.notes}
                                onChange={(e) => handleQualificationChange('landlord', 'notes', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Observações importantes sobre o senhorio..."
                            />
                        </div>
                    </div>
                );

            case 'investidor':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Tipo de Investimento
                            </label>
                            <select
                                value={formData.qualification.investor.investmentType}
                                onChange={(e) => handleQualificationChange('investor', 'investmentType', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Selecione...</option>
                                {INVESTMENT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Orçamento
                                </label>
                                <input
                                    type="text"
                                    value={formData.qualification.investor.budget}
                                    onChange={(e) => handleQualificationChange('investor', 'budget', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Ex: 500.000€ - 1.000.000€"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Retorno Esperado
                                </label>
                                <input
                                    type="text"
                                    value={formData.qualification.investor.expectedReturn}
                                    onChange={(e) => handleQualificationChange('investor', 'expectedReturn', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Ex: 8% ao ano"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Localização Preferida
                            </label>
                            <input
                                type="text"
                                value={formData.qualification.investor.preferredLocation}
                                onChange={(e) => handleQualificationChange('investor', 'preferredLocation', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Ex: Porto, Lisboa, Algarve..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Notas Adicionais
                            </label>
                            <textarea
                                value={formData.qualification.investor.notes}
                                onChange={(e) => handleQualificationChange('investor', 'notes', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Observações importantes sobre o investidor..."
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            to="/leads"
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Voltar para Leads
                        </Link>
                        <h1 className="mt-4 text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Editar Lead' : 'Nova Lead'}
                        </h1>
                    </div>

                    {/* Mensagens de Erro */}
                    {errors.length > 0 && (
                        <div className="mb-4 rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Erro ao salvar lead
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <ul className="list-disc pl-5 space-y-1">
                                            {errors.map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensagem de Sucesso */}
                    {showSuccess && (
                        <div className="mb-4 rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        Lead {isEditMode ? 'atualizada' : 'criada'} com sucesso!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Dados do Prospect */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Dados do Prospect
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nome *
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.prospect.name}
                                            onChange={(e) => handleInputChange('prospect', 'name', e.target.value)}
                                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Nome completo"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Telefone
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={formData.prospect.phone}
                                            onChange={(e) => handleInputChange('prospect', 'phone', e.target.value)}
                                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="912 345 678"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={formData.prospect.email}
                                            onChange={(e) => handleInputChange('prospect', 'email', e.target.value)}
                                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Origem da Lead */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Origem da Lead
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Como nos conheceu?
                                    </label>
                                    <select
                                        value={formData.source.origin}
                                        onChange={(e) => handleInputChange('source', 'origin', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        {LEAD_SOURCES.map(source => (
                                            <option key={source.value} value={source.value}>
                                                {source.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Detalhes
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.source.details}
                                        onChange={(e) => handleInputChange('source', 'details', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Ex: Campanha Facebook Ads"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Qualificação Imobiliária */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Qualificação Imobiliária
                            </h2>

                            {/* Seleção do Tipo */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Tipo de Qualificação
                                </label>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                    {QUALIFICATION_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => handleQualificationTypeChange(type.value)}
                                            className={`
                                                relative rounded-lg border p-4 flex flex-col items-center cursor-pointer
                                                ${formData.qualification.type === type.value
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <span className="text-2xl mb-1">
                                                {type.value === 'comprador' && '🏠'}
                                                {type.value === 'vendedor' && '💰'}
                                                {type.value === 'senhorio' && '🔑'}
                                                {type.value === 'inquilino' && '🏘️'}
                                                {type.value === 'investidor' && '📈'}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {type.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Campos Específicos */}
                            {renderQualificationFields()}
                        </div>

                        {/* Próximo Contacto */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Próximo Contacto
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Data
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.nextContact.date}
                                        onChange={(e) => handleInputChange('nextContact', 'date', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tipo
                                    </label>
                                    <select
                                        value={formData.nextContact.type}
                                        onChange={(e) => handleInputChange('nextContact', 'type', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="chamada">Chamada</option>
                                        <option value="visita">Visita</option>
                                        <option value="email">Email</option>
                                        <option value="whatsapp">WhatsApp</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Notas
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nextContact.notes}
                                        onChange={(e) => handleInputChange('nextContact', 'notes', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Lembretes..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notas Gerais */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas Gerais
                            </label>
                            <textarea
                                value={formData.generalNotes}
                                onChange={(e) => setFormData(prev => ({ ...prev, generalNotes: e.target.value || '' }))}
                                rows={4}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Observações adicionais sobre esta lead..."
                            />
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex justify-end space-x-3">
                            <Link
                                to="/leads"
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={loading.create || loading.update}
                                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading.create || loading.update ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Salvando...
                                    </>
                                ) : (
                                    <>{isEditMode ? 'Atualizar' : 'Criar'} Lead</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}