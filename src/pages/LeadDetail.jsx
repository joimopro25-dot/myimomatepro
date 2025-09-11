/**
 * LEAD DETAIL PAGE - MyImoMatePro
 * Página de detalhes da lead com sistema de follow-ups e sidebar integrada
 * 
 * Caminho: src/pages/LeadDetail.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useLeads } from '../contexts/LeadContext';
import { useClients } from '../contexts/ClientContext';
import {
    LEAD_STATUS,
    QUALIFICATION_TYPES,
    LEAD_SOURCES,
    URGENCY_LEVELS,
    INVESTMENT_TYPES,
    FOLLOWUP_TYPES
} from '../models/leadModel';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    CurrencyEuroIcon,
    DocumentTextIcon,
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ChatBubbleLeftRightIcon,
    UserPlusIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

export default function LeadDetail() {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const {
        currentLead,
        fetchLead,
        deleteLead,
        changeLeadStatus,
        addFollowUp,
        convertLead,
        loading
    } = useLeads();
    const { createClient } = useClients();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const [followUpData, setFollowUpData] = useState({
        type: 'call',
        description: '',
        scheduledFor: new Date().toISOString().split('T')[0]
    });

    const [newStatus, setNewStatus] = useState('');

    // Carregar dados da lead
    useEffect(() => {
        if (leadId) {
            fetchLead(leadId);
        }
    }, [leadId, fetchLead]);

    // Handlers
    const handleDelete = async () => {
        try {
            await deleteLead(leadId);
            navigate('/leads');
        } catch (error) {
            console.error('Erro ao eliminar lead:', error);
        }
    };

    const handleStatusChange = async () => {
        try {
            await changeLeadStatus(leadId, newStatus);
            setShowStatusModal(false);
            setNewStatus('');
        } catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };

    const handleAddFollowUp = async () => {
        try {
            await addFollowUp(leadId, followUpData);
            setShowFollowUpModal(false);
            setFollowUpData({
                type: 'call',
                description: '',
                scheduledFor: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error('Erro ao adicionar follow-up:', error);
        }
    };

    const handleConvert = async () => {
        try {
            const clientData = await convertLead(leadId);
            if (clientData) {
                navigate(`/clients/${clientData.id}`);
            }
        } catch (error) {
            console.error('Erro ao converter lead:', error);
        }
    };

    // Helpers
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('pt-PT');
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('pt-PT');
    };

    const getStatusColor = (status) => {
        const colors = {
            'nova': 'bg-blue-100 text-blue-800',
            'contactada': 'bg-yellow-100 text-yellow-800',
            'qualificada': 'bg-green-100 text-green-800',
            'proposta': 'bg-purple-100 text-purple-800',
            'negociacao': 'bg-orange-100 text-orange-800',
            'convertida': 'bg-green-100 text-green-800',
            'perdida': 'bg-red-100 text-red-800',
            'arquivada': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getUrgencyColor = (urgency) => {
        const colors = {
            'baixa': 'text-green-600',
            'normal': 'text-yellow-600',
            'alta': 'text-orange-600',
            'urgente': 'text-red-600'
        };
        return colors[urgency] || 'text-gray-600';
    };

    const getFollowUpIcon = (type) => {
        const icons = {
            'call': <PhoneIcon className="h-5 w-5" />,
            'email': <EnvelopeIcon className="h-5 w-5" />,
            'meeting': <CalendarIcon className="h-5 w-5" />,
            'whatsapp': <ChatBubbleLeftRightIcon className="h-5 w-5" />
        };
        return icons[type] || <ClockIcon className="h-5 w-5" />;
    };

    // Renderizar detalhes da qualificação baseado no tipo (robusto para estruturas do Firestore)
    const renderQualificationDetails = () => {
        const q = currentLead?.qualification;
        if (!q || !q.type) return null;

        // mapear valores de tipo possivelmente em PT para keys internas em inglês
        const typeMap = {
            'inquilino': 'tenant',
            'inquilinos': 'tenant',
            'comprador': 'buyer',
            'compradores': 'buyer',
            'vendedor': 'seller',
            'vendedores': 'seller',
            'senhorio': 'landlord',
            'senhorios': 'landlord',
            'investidor': 'investor',
            'investidores': 'investor',
            // aceitar já chaves em inglês
            'tenant': 'tenant',
            'buyer': 'buyer',
            'seller': 'seller',
            'landlord': 'landlord',
            'investor': 'investor'
        };

        const rawType = q.type;
        const candidateKey = typeMap[String(rawType).toLowerCase()] || rawType;
        const nested = q[candidateKey] && typeof q[candidateKey] === 'object' ? q[candidateKey] : null;
        const data = nested || q; // campos podem estar aninhados ou directamente em qualification
        const typeLabel = QUALIFICATION_TYPES.find(t => t.value === candidateKey || t.value === rawType)?.label || String(rawType);

        const details = [];

        // utilitário para adicionar campo se existir
        const pushField = (key, label, renderValue) => {
            const val = data?.[key];
            if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) return;
            details.push(
                <div key={key}>
                    <dt className="text-sm font-medium text-gray-500">{label}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                        {renderValue ? renderValue(val) : val}
                    </dd>
                </div>
            );
        };

        // campos comuns / possíveis
        pushField('urgency', 'Urgência', (v) => URGENCY_LEVELS.find(u => u.value === v)?.label || v);
        pushField('looking', 'Procura');
        pushField('budget', 'Orçamento', (v) => (v !== '' ? `€${v}` : v));
        pushField('preferredLocation', 'Localização Preferida');
        pushField('propertyType', 'Tipo de Imóvel');
        pushField('value', 'Valor Pretendido', (v) => (v !== '' ? `€${v}` : v));
        pushField('rentValue', 'Renda', (v) => (v !== '' ? `€${v}` : v));
        pushField('location', 'Localização');
        pushField('investmentType', 'Tipo de Investimento', (v) => INVESTMENT_TYPES.find(i => i.value === v)?.label || v);
        pushField('expectedReturn', 'Retorno Esperado', (v) => (v !== '' ? `${v}%` : v));
        pushField('notes', 'Notas');

        // se não encontrou nenhum campo específico, mostrar todo o objecto (fallback)
        if (details.length === 0) {
            return (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Qualificação - {typeLabel}
                        </h3>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Qualificação - {typeLabel}
                    </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        {details}
                    </dl>
                </div>
            </div>
        );
    };

    if (!currentLead) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            to="/leads"
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Voltar para Leads
                        </Link>

                        <div className="mt-4 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {currentLead.prospect.name}
                                </h1>
                                <div className="mt-2 flex items-center space-x-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentLead.status)}`}>
                                        {LEAD_STATUS.find(s => s.value === currentLead.status)?.label}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Criada em {formatDate(currentLead.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <Link
                                    to={`/leads/${leadId}/edit`}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <PencilIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                    Editar
                                </Link>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <TrashIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <button
                            onClick={() => setShowStatusModal(true)}
                            className="relative rounded-lg border border-gray-300 bg-white px-4 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                        >
                            <ChartBarIcon className="h-6 w-6 text-gray-600" />
                            <div className="text-sm font-medium text-gray-900">
                                Alterar Status
                            </div>
                        </button>

                        <button
                            onClick={() => setShowFollowUpModal(true)}
                            className="relative rounded-lg border border-gray-300 bg-white px-4 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                        >
                            <ClockIcon className="h-6 w-6 text-gray-600" />
                            <div className="text-sm font-medium text-gray-900">
                                Adicionar Follow-up
                            </div>
                        </button>

                        <button
                            onClick={() => setShowConvertModal(true)}
                            disabled={currentLead.status === 'convertida'}
                            className="relative rounded-lg border border-gray-300 bg-white px-4 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <UserPlusIcon className="h-6 w-6 text-gray-600" />
                            <div className="text-sm font-medium text-gray-900">
                                Converter em Cliente
                            </div>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Coluna Principal */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Informações do Prospect */}
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Informações do Prospect
                                    </h3>
                                </div>
                                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Nome</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{currentLead.prospect.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                <a href={`tel:${currentLead.prospect.phone}`} className="text-indigo-600 hover:text-indigo-500">
                                                    {currentLead.prospect.phone}
                                                </a>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                <a href={`mailto:${currentLead.prospect.email}`} className="text-indigo-600 hover:text-indigo-500">
                                                    {currentLead.prospect.email}
                                                </a>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Origem</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {LEAD_SOURCES.find(s => s.value === currentLead.source?.origin)?.label}
                                                {currentLead.source?.details && (
                                                    <span className="text-gray-500"> - {currentLead.source.details}</span>
                                                )}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Detalhes da Qualificação */}
                            {renderQualificationDetails()}

                            {/* Histórico de Follow-ups */}
                            {currentLead.followUps && currentLead.followUps.length > 0 && (
                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Histórico de Follow-ups
                                        </h3>
                                    </div>
                                    <div className="border-t border-gray-200">
                                        <ul className="divide-y divide-gray-200">
                                            {currentLead.followUps.map((followUp, index) => (
                                                <li key={index} className="px-4 py-4 sm:px-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0">
                                                                {getFollowUpIcon(followUp.type)}
                                                            </div>
                                                            <div className="ml-4">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {FOLLOWUP_TYPES.find(t => t.value === followUp.type)?.label}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {followUp.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {formatDateTime(followUp.createdAt)}
                                                        </div>
                                                    </div>
                                                    {followUp.completed && (
                                                        <div className="mt-2 flex items-center text-sm text-green-600">
                                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                            Concluído
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Coluna Lateral */}
                        <div className="space-y-6">
                            {/* Próximo Contacto */}
                            {currentLead.nextContact && (
                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Próximo Contacto
                                        </h3>
                                    </div>
                                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                        <div className="text-sm text-gray-900">
                                            <CalendarIcon className="h-5 w-5 text-gray-400 inline mr-2" />
                                            {formatDate(currentLead.nextContact)}
                                        </div>
                                        {currentLead.nextContactNotes && (
                                            <p className="mt-2 text-sm text-gray-500">
                                                {currentLead.nextContactNotes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Estatísticas */}
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Estatísticas
                                    </h3>
                                </div>
                                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                    <dl className="space-y-3">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Follow-ups</dt>
                                            <dd className="text-sm text-gray-900">
                                                {currentLead.followUps?.length || 0}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Última Atualização</dt>
                                            <dd className="text-sm text-gray-900">
                                                {formatDate(currentLead.updatedAt)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modais */}
            {/* Modal de Status */}
            {showStatusModal && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Alterar Status da Lead
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Novo Status
                                    </label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">Selecione...</option>
                                        {LEAD_STATUS.filter(s => s.value !== currentLead.status).map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={handleStatusChange}
                                    disabled={!newStatus}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Alterar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setNewStatus('');
                                    }}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Follow-up */}
            {showFollowUpModal && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Adicionar Follow-up
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Tipo
                                        </label>
                                        <select
                                            value={followUpData.type}
                                            onChange={(e) => setFollowUpData({ ...followUpData, type: e.target.value })}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            {FOLLOWUP_TYPES.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Descrição
                                        </label>
                                        <textarea
                                            value={followUpData.description}
                                            onChange={(e) => setFollowUpData({ ...followUpData, description: e.target.value })}
                                            rows={3}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Detalhes do follow-up..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Agendar para
                                        </label>
                                        <input
                                            type="date"
                                            value={followUpData.scheduledFor}
                                            onChange={(e) => setFollowUpData({ ...followUpData, scheduledFor: e.target.value })}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={handleAddFollowUp}
                                    disabled={!followUpData.description}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Adicionar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowFollowUpModal(false);
                                        setFollowUpData({
                                            type: 'call',
                                            description: '',
                                            scheduledFor: new Date().toISOString().split('T')[0]
                                        });
                                    }}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Conversão */}
            {showConvertModal && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <UserPlusIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Converter Lead em Cliente
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Tem certeza que deseja converter esta lead em cliente?
                                                Esta ação criará um novo cliente com os dados atuais da lead.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={handleConvert}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Converter
                                </button>
                                <button
                                    onClick={() => setShowConvertModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Exclusão */}
            {showDeleteModal && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Eliminar Lead
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Tem certeza que deseja eliminar esta lead? Esta ação não pode ser desfeita.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={handleDelete}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Eliminar
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}