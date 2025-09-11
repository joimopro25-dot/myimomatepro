/**
 * LEAD FORM PAGE - MyImoMatePro
 * Formulário para criar/editar leads
 * ✅ VERSÃO CORRIGIDA - Erro controlled/uncontrolled resolvido
 * 
 * Caminho: src/pages/LeadForm.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useLeads } from '../contexts/LeadContext';
import { useAuth } from '../contexts/AuthContext';
import {
    LEAD_STATUS,
    QUALIFICATION_TYPES,
    LEAD_SOURCES,
    URGENCY_LEVELS,
    PROPERTY_TYPES,
    INVESTMENT_TYPES,
    TENANT_DURATION
} from '../models/leadModel';
import {
    ArrowLeftIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    HomeIcon,
    CurrencyEuroIcon,
    KeyIcon,
    BuildingOfficeIcon,
    ChartBarIcon,
    DocumentTextIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function LeadForm() {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const {
        createLead,
        updateLead,
        fetchLead,
        fetchLeads,
        currentLead,
        loading
    } = useLeads();

    const isEditMode = !!leadId;

    // Estado inicial do formulário com TODOS os campos definidos
    const getInitialFormData = () => ({
        prospect: {
            name: '',
            phone: '',
            email: ''
        },
        qualification: {
            type: 'comprador',
            buyer: {
                budget: '',
                urgency: 'normal',
                zones: [],
                propertyType: 'apartamento',
                bedrooms: '',
                financing: false,
                firstBuyer: false,
                notes: ''
            },
            seller: {
                propertyAddress: '',
                propertyType: 'apartamento',
                askingPrice: '',
                urgency: 'normal',
                reason: '',
                hasDebts: false,
                debtAmount: '',
                notes: ''
            },
            landlord: {
                properties: '',
                currentRent: '',
                vacancy: false,
                managementNeeded: false,
                location: '',
                notes: ''
            },
            tenant: {
                budget: '',
                urgency: 'normal',
                zones: [],
                propertyType: 'apartamento',
                bedrooms: '',
                duration: '12',
                guarantor: false,
                notes: ''
            },
            investor: {
                budget: '',
                strategy: 'buyToRent',
                experience: 'iniciante',
                zones: [],
                roi: '',
                financing: false,
                notes: ''
            }
        },
        source: {
            origin: 'website',
            campaign: '',
            referrer: ''
        },
        status: 'nova',
        notes: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [errors, setErrors] = useState({});

    // Carregar dados da lead em modo de edição
    useEffect(() => {
        if (isEditMode && leadId) {
            fetchLead(leadId).then(lead => {
                if (lead) {
                    // Merge com dados iniciais para garantir que todos os campos existam
                    const mergedData = {
                        ...getInitialFormData(),
                        ...lead,
                        prospect: {
                            ...getInitialFormData().prospect,
                            ...(lead.prospect || {})
                        },
                        qualification: {
                            ...getInitialFormData().qualification,
                            ...(lead.qualification || {}),
                            [lead.qualification?.type || 'buyer']: {
                                ...getInitialFormData().qualification[lead.qualification?.type || 'buyer'],
                                ...(lead.qualification?.[lead.qualification?.type] || {})
                            }
                        },
                        source: {
                            ...getInitialFormData().source,
                            ...(lead.source || {})
                        }
                    };
                    setFormData(mergedData);
                }
            });
        }
    }, [isEditMode, leadId, fetchLead]);

    // Handler para mudanças nos campos - com proteção contra undefined
    const handleChange = (path, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            let current = newData;

            // Navegar até o penúltimo nível
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }

            // Definir o valor (garantindo que nunca seja undefined)
            current[keys[keys.length - 1]] = value === undefined ? '' : value;

            return newData;
        });
    };

    // Validação do formulário
    const validateForm = () => {
        const newErrors = {};

        if (!formData.prospect?.name?.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.prospect?.phone?.trim()) {
            newErrors.phone = 'Telefone é obrigatório';
        }

        if (formData.prospect?.email && !formData.prospect.email.includes('@')) {
            newErrors.email = 'Email inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (isEditMode) {
                await updateLead(leadId, formData);
            } else {
                const newLead = await createLead(formData);

                // Garantir que a lista é atualizada
                if (newLead && newLead.id) {
                    await fetchLeads();
                }
            }

            navigate('/leads');
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            setErrors({ submit: 'Erro ao salvar lead. Tente novamente.' });
        }
    };

    // Renderizar campos específicos por tipo de qualificação
    const renderQualificationFields = () => {
        const type = formData.qualification?.type || 'comprador';

        switch (type) {
            case 'comprador':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Orçamento (€)</label>
                                <input
                                    type="number"
                                    value={formData.qualification.buyer?.budget || ''}
                                    onChange={(e) => handleChange('qualification.buyer.budget', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="250000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Urgência</label>
                                <select
                                    value={formData.qualification.buyer?.urgency || 'normal'}
                                    onChange={(e) => handleChange('qualification.buyer.urgency', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {URGENCY_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Imóvel</label>
                                <select
                                    value={formData.qualification.buyer?.propertyType || 'apartamento'}
                                    onChange={(e) => handleChange('qualification.buyer.propertyType', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {PROPERTY_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quartos</label>
                                <input
                                    type="text"
                                    value={formData.qualification.buyer?.bedrooms || ''}
                                    onChange={(e) => handleChange('qualification.buyer.bedrooms', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="T2, T3..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.qualification.buyer?.financing || false}
                                    onChange={(e) => handleChange('qualification.buyer.financing', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Necessita financiamento</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.qualification.buyer?.firstBuyer || false}
                                    onChange={(e) => handleChange('qualification.buyer.firstBuyer', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Primeiro comprador</span>
                            </label>
                        </div>
                    </div>
                );

            case 'vendedor':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Endereço do Imóvel</label>
                                <input
                                    type="text"
                                    value={formData.qualification.seller?.propertyAddress || ''}
                                    onChange={(e) => handleChange('qualification.seller.propertyAddress', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Rua das Flores, 123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Imóvel</label>
                                <select
                                    value={formData.qualification.seller?.propertyType || 'apartamento'}
                                    onChange={(e) => handleChange('qualification.seller.propertyType', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {PROPERTY_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Preço Pretendido (€)</label>
                                <input
                                    type="number"
                                    value={formData.qualification.seller?.askingPrice || ''}
                                    onChange={(e) => handleChange('qualification.seller.askingPrice', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="350000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Urgência</label>
                                <select
                                    value={formData.qualification.seller?.urgency || 'normal'}
                                    onChange={(e) => handleChange('qualification.seller.urgency', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {URGENCY_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Motivo da Venda</label>
                                <input
                                    type="text"
                                    value={formData.qualification.seller?.reason || ''}
                                    onChange={(e) => handleChange('qualification.seller.reason', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Mudança, upgrade, etc"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'senhorio':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Número de Propriedades</label>
                                <input
                                    type="number"
                                    value={formData.qualification.landlord?.properties || ''}
                                    onChange={(e) => handleChange('qualification.landlord.properties', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Renda Atual (€)</label>
                                <input
                                    type="number"
                                    value={formData.qualification.landlord?.currentRent || ''}
                                    onChange={(e) => handleChange('qualification.landlord.currentRent', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="800"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Localização</label>
                                <input
                                    type="text"
                                    value={formData.qualification.landlord?.location || ''}
                                    onChange={(e) => handleChange('qualification.landlord.location', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Porto, Centro"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.qualification.landlord?.vacancy || false}
                                    onChange={(e) => handleChange('qualification.landlord.vacancy', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Tem imóvel vago</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.qualification.landlord?.managementNeeded || false}
                                    onChange={(e) => handleChange('qualification.landlord.managementNeeded', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Procura gestão profissional</span>
                            </label>
                        </div>
                    </div>
                );

            case 'inquilino':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Orçamento Mensal (€)</label>
                                <input
                                    type="number"
                                    value={formData.qualification.tenant?.budget || ''}
                                    onChange={(e) => handleChange('qualification.tenant.budget', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Urgência</label>
                                <select
                                    value={formData.qualification.tenant?.urgency || 'normal'}
                                    onChange={(e) => handleChange('qualification.tenant.urgency', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {URGENCY_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Imóvel</label>
                                <select
                                    value={formData.qualification.tenant?.propertyType || 'apartamento'}
                                    onChange={(e) => handleChange('qualification.tenant.propertyType', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {PROPERTY_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Duração (meses)</label>
                                <select
                                    value={formData.qualification.tenant?.duration || '12'}
                                    onChange={(e) => handleChange('qualification.tenant.duration', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {TENANT_DURATION.map(duration => (
                                        <option key={duration.value} value={duration.value}>
                                            {duration.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.qualification.tenant?.guarantor || false}
                                onChange={(e) => handleChange('qualification.tenant.guarantor', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Tem fiador</span>
                        </label>
                    </div>
                );

            case 'investidor':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Orçamento (€)</label>
                                <input
                                    type="number"
                                    value={formData.qualification.investor?.budget || ''}
                                    onChange={(e) => handleChange('qualification.investor.budget', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="500000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Estratégia</label>
                                <select
                                    value={formData.qualification.investor?.strategy || 'buyToRent'}
                                    onChange={(e) => handleChange('qualification.investor.strategy', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {INVESTMENT_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ROI Esperado (%)</label>
                                <input
                                    type="number"
                                    value={formData.qualification.investor?.roi || ''}
                                    onChange={(e) => handleChange('qualification.investor.roi', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="6"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Experiência</label>
                                <select
                                    value={formData.qualification.investor?.experience || 'iniciante'}
                                    onChange={(e) => handleChange('qualification.investor.experience', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="iniciante">Iniciante</option>
                                    <option value="intermediario">Intermediário</option>
                                    <option value="experiente">Experiente</option>
                                </select>
                            </div>
                        </div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.qualification.investor?.financing || false}
                                onChange={(e) => handleChange('qualification.investor.financing', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Usa financiamento</span>
                        </label>
                    </div>
                );

            default:
                return null;
        }
    };

    // Loading state
    if (loading.create || loading.update) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/leads')}
                                className="mr-4 text-gray-400 hover:text-gray-600"
                            >
                                <ArrowLeftIcon className="h-6 w-6" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Editar Lead' : 'Nova Lead'}
                            </h1>
                        </div>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Informações do Prospect</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Dados básicos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nome *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.prospect?.name || ''}
                                        onChange={(e) => handleChange('prospect.name', e.target.value)}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="João Silva"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Telefone *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.prospect?.phone || ''}
                                        onChange={(e) => handleChange('prospect.phone', e.target.value)}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="912345678"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.prospect?.email || ''}
                                        onChange={(e) => handleChange('prospect.email', e.target.value)}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="joao@email.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Tipo de Qualificação */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Lead
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {QUALIFICATION_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => handleChange('qualification.type', type.value)}
                                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${formData.qualification?.type === type.value
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Campos específicos do tipo */}
                            {renderQualificationFields()}

                            {/* Origem da Lead */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Origem
                                    </label>
                                    <select
                                        value={formData.source?.origin || 'website'}
                                        onChange={(e) => handleChange('source.origin', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                        Campanha
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.source?.campaign || ''}
                                        onChange={(e) => handleChange('source.campaign', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Google Ads, Facebook, etc"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    value={formData.status || 'nova'}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {LEAD_STATUS.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Notas
                                </label>
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Observações sobre a lead..."
                                />
                            </div>

                            {/* Erro de submit */}
                            {errors.submit && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <p className="text-sm text-red-800">{errors.submit}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer com botões */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/leads')}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isEditMode ? 'Atualizar' : 'Criar'} Lead
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}