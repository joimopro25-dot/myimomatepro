/**
 * LEAD DETAIL PAGE - MyImoMatePro
 * Página de detalhes da lead com sistema de follow-ups
 * 
 * Caminho: src/pages/LeadDetail.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
        type: 'chamada',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [newStatus, setNewStatus] = useState('');

    // Carregar dados da lead
    useEffect(() => {
        if (leadId) {
            fetchLead(leadId);
        }
    }, [leadId]);

    // Handlers
    const handleDelete = async () => {
        try {
            await deleteLead(leadId);
            navigate('/leads');
        } catch (error) {
            console.error('Erro ao deletar lead:', error);
        }
    };

    const handleStatusChange = async () => {
        if (!newStatus) return;

        try {
            await changeLeadStatus(leadId, newStatus);
            setShowStatusModal(false);
            setNewStatus('');
            // Recarregar lead
            fetchLead(leadId);
        } catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };

    const handleAddFollowUp = async () => {
        try {
            await addFollowUp(leadId, followUpData);
            setShowFollowUpModal(false);
            setFollowUpData({
                type: 'chamada',
                notes: '',
                date: new Date().toISOString().split('T')[0]
            });
            // Recarregar lead
            fetchLead(leadId);
        } catch (error) {
            console.error('Erro ao adicionar follow-up:', error);
        }
    };

    const handleConvertToClient = async () => {
        try {
            // Criar cliente com dados da lead
            const clientData = {
                name: currentLead.prospect.name,
                phone: currentLead.prospect.phone,
                email: currentLead.prospect.email,
                leadSource: currentLead.source.origin,
                notes: currentLead.generalNotes
            };

            const newClient = await createClient(clientData);

            // Marcar lead como convertida
            await convertLead(leadId, newClient.id);

            setShowConvertModal(false);

            // Redirecionar para o cliente
            navigate(`/clients/${newClient.id}`);
        } catch (error) {
            console.error('Erro ao converter lead:', error);
        }
    };

    // Funções auxiliares
    const getStatusColor = (status) => {
        const colors = {
            nova: 'bg-blue-100 text-blue-800',
            qualificada: 'bg-yellow-100 text-yellow-800',
            emNegociacao: 'bg-purple-100 text-purple-800',
            convertida: 'bg-green-100 text-green-800',
            perdida: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getUrgencyColor = (urgency) => {
        const colors = {
            baixa: 'bg-gray-100 text-gray-800',
            normal: 'bg-blue-100 text-blue-800',
            alta: 'bg-orange-100 text-orange-800',
            urgente: 'bg-red-100 text-red-800'
        };
        return colors[urgency] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('pt-PT');
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('pt-PT');
    };

    // Renderizar campos de qualificação específicos
    const renderQualificationDetails = () => {
        if (!currentLead?.qualification?.type) return null;

        const type = currentLead.qualification.type;
        const typeLabel = QUALIFICATION_TYPES.find(t => t.value === type)?.label;

        let details = null;

        switch (type) {
            case 'comprador':
                const buyer = currentLead.qualification.buyer;
                details = (
                    <>
                        {buyer?.looking && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Procura</dt>
                                <dd className="mt-1 text-sm text-gray-900">{buyer.looking}</dd>
                            </div>
                        )}
                        {buyer?.budget && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Orçamento</dt>
                                <dd className="mt-1 text-sm text-gray-900">{buyer.budget}</dd>
                            </div>
                        )}
                        {buyer?.preferredLocation && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Localização Preferida</dt>
                                <dd className="mt-1 text-sm text-gray-900">{buyer.preferredLocation}</dd>
                            </div>
                        )}
                        {buyer?.urgency && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Urgência</dt>
                                <dd className="mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(buyer.urgency)}`}>
                                        {URGENCY_LEVELS.find(u => u.value === buyer.urgency)?.label}
                                    </span>
                                </dd>
                            </div>
                        )}
                        {buyer?.notes && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Notas</dt>
                                <dd className="mt-1 text-sm text-gray-900">{buyer.notes}</dd>
                            </div>
                        )}
                    </>
                );
                break;

            case 'vendedor':
                const seller = currentLead.qualification.seller;
                details = (
                    <>
                        {seller?.propertyType && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Tipo de Imóvel</dt>
                                <dd className="mt-1 text-sm text-gray-900">{seller.propertyType}</dd>
                            </div>
                        )}
                        {seller?.value && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Valor Pretendido</dt>
                                <dd className="mt-1 text-sm text-gray-900">{seller.value}</dd>
                            </div>
                        )}
                        {seller?.location && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Localização</dt>
                                <dd className="mt-1 text-sm text-gray-900">{seller.location}</dd>
                            </div>
                        )}
                        {seller?.urgency && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Urgência</dt>
                                <dd className="mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(seller.urgency)}`}>
                                        {URGENCY_LEVELS.find(u => u.value === seller.urgency)?.label}
                                    </span>
                                </dd>
                            </div>
                        )}
                        {seller?.notes && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Notas</dt>
                                <dd className="mt-1 text-sm text-gray-900">{seller.notes}</dd>
                            </div>
                        )}
                    </>
                );
                break;

            case 'investidor':
                const investor = currentLead.qualification.investor;
                details = (
                    <>
                        {investor?.investmentType && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Tipo de Investimento</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {INVESTMENT_TYPES.find(t => t.value === investor.investmentType)?.label}
                                </dd>
                            </div>
                        )}
                        {investor?.budget && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Orçamento</dt>
                                <dd className="mt-1 text-sm text-gray-900">{investor.budget}</dd>
                            </div>
                        )}
                        {investor?.expectedReturn && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Retorno Esperado</dt>
                                <dd className="mt-1 text-sm text-gray-900">{investor.expectedReturn}</dd>
                            </div>
                        )}
                        {investor?.preferredLocation && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Localização Preferida</dt>
                                <dd className="mt-1 text-sm text-gray-900">{investor.preferredLocation}</dd>
                            </div>
                        )}
                        {investor?.notes && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Notas</dt>
                                <dd className="mt-1 text-sm text-gray-900">{investor.notes}</dd>
                            </div>
                        )}
                    </>
                );
                break;

            // Adicionar casos para inquilino e senhorio conforme necessário
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
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
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
                                Editar
                            </Link>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                            >
                                <TrashIcon className="-ml-1 mr-2 h-4 w-4" />
                                Deletar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ações Rápidas */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <button
                        onClick={() => setShowFollowUpModal(true)}
                        className="relative rounded-lg border border-gray-300 bg-white px-4 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                    >
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-600" />
                        <div className="text-sm font-medium text-gray-900">
                            Adicionar Follow-up
                        </div>
                    </button>

                    <button
                        onClick={() => setShowStatusModal(true)}
                        className="relative rounded-lg border border-gray-300 bg-white px-4 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                    >
                        <ClockIcon className="h-6 w-6 text-gray-600" />
                        <div className="text-sm font-medium text-gray-900">
                            Alterar Status
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

                    <Link
                        to="/leads/new"
                        className="relative rounded-lg border border-gray-300 bg-white px-4 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                    >
                        <PlusIcon className="h-6 w-6 text-gray-600" />
                        <div className="text-sm font-medium text-gray-900">
                            Nova Lead
                        </div>
                    </Link>
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
                                    {currentLead.prospect.email && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                <a href={`mailto:${currentLead.prospect.email}`} className="text-indigo-600 hover:text-indigo-500">
                                                    {currentLead.prospect.email}
                                                </a>
                                            </dd>
                                        </div>
                                    )}
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

                        {/* Qualificação */}
                        {renderQualificationDetails()}

                        {/* Histórico de Follow-ups */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Histórico de Follow-ups
                                </h3>
                            </div>
                            <div className="border-t border-gray-200">
                                {currentLead.followUps && currentLead.followUps.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {currentLead.followUps.map((followUp, index) => (
                                            <li key={followUp.id || index} className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0">
                                                            {followUp.type === 'chamada' && <PhoneIcon className="h-5 w-5 text-gray-400" />}
                                                            {followUp.type === 'email' && <EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                                                            {followUp.type === 'visita' && <CalendarIcon className="h-5 w-5 text-gray-400" />}
                                                            {followUp.type === 'whatsapp' && <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {FOLLOWUP_TYPES.find(t => t.value === followUp.type)?.label}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {followUp.notes}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatDateTime(followUp.createdAt || followUp.date)}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-12">
                                        <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                                            Sem follow-ups
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Adicione o primeiro follow-up para esta lead.
                                        </p>
                                        <div className="mt-6">
                                            <button
                                                onClick={() => setShowFollowUpModal(true)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                                Adicionar Follow-up
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Coluna Lateral */}
                    <div className="space-y-6">
                        {/* Próximo Contacto */}
                        {currentLead.nextContact?.date && (
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Próximo Contacto
                                    </h3>
                                </div>
                                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                    <dl className="space-y-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Data</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {formatDate(currentLead.nextContact.date)}
                                            </dd>
                                        </div>
                                        {currentLead.nextContact.type && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {currentLead.nextContact.type}
                                                </dd>
                                            </div>
                                        )}
                                        {currentLead.nextContact.notes && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Notas</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {currentLead.nextContact.notes}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        )}

                        {/* Notas Gerais */}
                        {currentLead.generalNotes && (
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Notas Gerais
                                    </h3>
                                </div>
                                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {currentLead.generalNotes}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Informações de Conversão */}
                        {currentLead.conversion?.converted && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex">
                                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">
                                            Lead Convertida
                                        </h3>
                                        <div className="mt-2 text-sm text-green-700">
                                            <p>Convertida em {formatDate(currentLead.conversion.convertedAt)}</p>
                                            {currentLead.conversion.clientId && (
                                                <Link
                                                    to={`/clients/${currentLead.conversion.clientId}`}
                                                    className="mt-2 inline-flex items-center text-green-700 hover:text-green-800 font-medium"
                                                >
                                                    Ver Cliente
                                                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Delete */}
            {showDeleteModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Deletar Lead
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Tem certeza que deseja deletar esta lead? Esta ação não pode ser desfeita.
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
                                    Deletar
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

            {/* Modal de Follow-up */}
            {showFollowUpModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
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
                                            Data
                                        </label>
                                        <input
                                            type="date"
                                            value={followUpData.date}
                                            onChange={(e) => setFollowUpData({ ...followUpData, date: e.target.value })}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Notas
                                        </label>
                                        <textarea
                                            value={followUpData.notes}
                                            onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                                            rows={3}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Detalhes do follow-up..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={handleAddFollowUp}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Adicionar
                                </button>
                                <button
                                    onClick={() => setShowFollowUpModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Alterar Status */}
            {showStatusModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
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
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
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

            {/* Modal de Converter em Cliente */}
            {showConvertModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
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
                                                Esta ação irá criar um novo cliente com os dados desta lead e marcá-la como convertida.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={handleConvertToClient}
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
        </div>
    );
}