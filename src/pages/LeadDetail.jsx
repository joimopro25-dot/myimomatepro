/**
 * LEAD DETAIL PAGE - MyImoMatePro
 * Página de detalhes completos da lead
 * Inclui timeline, tarefas, contactos e ações
 * 
 * Caminho: src/pages/LeadDetail.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeads } from '../contexts/LeadContext';
import {
    LEAD_STATUS_LABELS,
    LEAD_SOURCE_LABELS,
    LEAD_INTEREST_LABELS,
    LEAD_TEMPERATURE_LABELS,
    TASK_TYPES,
    TASK_TYPE_LABELS,
    TASK_STATUS_LABELS,
    calculateLeadTemperature,
    getNextRecommendedAction,
    getRelativeTime,
    formatPhone
} from '../models/leadModel';
import Layout from '../components/Layout';
import {
    ArrowLeftIcon,
    PencilIcon,
    UserPlusIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChatBubbleLeftIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    FireIcon,
    PlusIcon,
    EyeIcon,
    DocumentTextIcon,
    TagIcon,
    BanknotesIcon,
    HomeIcon,
    IdentificationIcon,
    XMarkIcon,
    TrashIcon,
    ArrowRightIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import { Snowflake } from 'lucide-react';

const LeadDetailPage = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();

    const {
        currentLead,
        leadTasks,
        leadContacts,
        loading,
        errors,
        fetchLead,
        fetchLeadTasks,
        fetchLeadContacts,
        createTask,
        addContact,
        completeTask,
        convertLead,
        markAsLost,
        updateLead,
        deleteLead,
        clearCurrentLead,
        clearError
    } = useLeads();

    // Estados locais
    const [activeTab, setActiveTab] = useState('info');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [showLostModal, setShowLostModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        tasks: true,
        contacts: true,
        timeline: true
    });

    // Estados dos formulários
    const [taskForm, setTaskForm] = useState({
        tipo: 'call',
        titulo: '',
        descricao: '',
        agendadaPara: ''
    });

    const [contactForm, setContactForm] = useState({
        tipo: 'call',
        resumo: '',
        notas: '',
        resultado: 'positivo',
        agendarProximo: false,
        proximoContactoData: '',
        proximoContactoTipo: 'call'
    });

    const [convertForm, setConvertForm] = useState({
        tipoNegocio: '',
        valorNegocio: '',
        comissao: '',
        observacoes: ''
    });

    const [lostReason, setLostReason] = useState('');

    // Carregar dados ao montar
    useEffect(() => {
        const loadData = async () => {
            if (leadId) {
                await fetchLead(leadId);
                await fetchLeadTasks(leadId);
                await fetchLeadContacts(leadId);
            }
        };
        loadData();

        // Limpar ao desmontar
        return () => {
            clearCurrentLead();
            clearError('fetch');
        };
    }, [leadId]);

    // Navegação
    const handleBack = () => {
        navigate('/leads');
    };

    const handleEdit = () => {
        navigate(`/leads/${leadId}/edit`);
    };

    // Criar tarefa
    const handleCreateTask = async (e) => {
        e.preventDefault();

        try {
            await createTask(leadId, taskForm);
            setShowTaskModal(false);
            setTaskForm({
                tipo: 'call',
                titulo: '',
                descricao: '',
                agendadaPara: ''
            });

            // Recarregar tarefas
            await fetchLeadTasks(leadId);
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
        }
    };

    // Completar tarefa
    const handleCompleteTask = async (taskId) => {
        try {
            await completeTask(leadId, taskId, {
                resultado: 'Tarefa completada',
                notas: ''
            });

            // Recarregar dados
            await fetchLeadTasks(leadId);
            await fetchLead(leadId);
        } catch (error) {
            console.error('Erro ao completar tarefa:', error);
        }
    };

    // Adicionar contacto
    const handleAddContact = async (e) => {
        e.preventDefault();

        try {
            await addContact(leadId, contactForm);
            setShowContactModal(false);
            setContactForm({
                tipo: 'call',
                resumo: '',
                notas: '',
                resultado: 'positivo',
                agendarProximo: false,
                proximoContactoData: '',
                proximoContactoTipo: 'call'
            });

            // Recarregar contactos
            await fetchLeadContacts(leadId);
            await fetchLead(leadId);
        } catch (error) {
            console.error('Erro ao adicionar contacto:', error);
        }
    };

    // Converter lead
    const handleConvertLead = async (e) => {
        e.preventDefault();

        try {
            await convertLead(leadId, convertForm);
            setShowConvertModal(false);

            // Redirecionar para clientes
            navigate('/clients', {
                state: {
                    message: 'Lead convertida em cliente com sucesso!'
                }
            });
        } catch (error) {
            console.error('Erro ao converter lead:', error);
        }
    };

    // Marcar como perdida
    const handleMarkAsLost = async () => {
        try {
            await markAsLost(leadId, lostReason);
            setShowLostModal(false);

            // Recarregar lead
            await fetchLead(leadId);
        } catch (error) {
            console.error('Erro ao marcar como perdida:', error);
        }
    };

    // Eliminar lead
    const handleDelete = async () => {
        try {
            await deleteLead(leadId);
            navigate('/leads', {
                state: {
                    message: 'Lead eliminada com sucesso!'
                }
            });
        } catch (error) {
            console.error('Erro ao eliminar lead:', error);
        }
    };

    // Toggle seções expandidas
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Componente de temperatura
    const TemperatureIcon = ({ temperatura }) => {
        switch (temperatura) {
            case 'quente':
                return <FireIcon className="h-5 w-5 text-red-500" />;
            case 'morno':
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
            case 'frio':
                return <Snowflake className="h-5 w-5 text-blue-500" />;
            default:
                return null;
        }
    };

    // Componente de status badge
    const StatusBadge = ({ status }) => {
        const colors = {
            novo: 'bg-blue-100 text-blue-800',
            contactado: 'bg-yellow-100 text-yellow-800',
            qualificado: 'bg-green-100 text-green-800',
            proposta: 'bg-purple-100 text-purple-800',
            negociacao: 'bg-orange-100 text-orange-800',
            ganho: 'bg-green-500 text-white',
            perdido: 'bg-red-100 text-red-800',
            standby: 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {LEAD_STATUS_LABELS[status] || status}
            </span>
        );
    };

    if (loading.fetch) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    if (!currentLead) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Lead não encontrada</h3>
                    <div className="mt-6">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                        >
                            Voltar às Leads
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                                Voltar às Leads
                            </button>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleEdit}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                                >
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Eliminar
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {currentLead.name}
                                </h1>
                                <div className="mt-2 flex items-center space-x-4">
                                    <StatusBadge status={currentLead.status} />
                                    <div className="flex items-center">
                                        <TemperatureIcon temperatura={currentLead.temperatura} />
                                        <span className="ml-1 text-sm text-gray-500">
                                            {LEAD_TEMPERATURE_LABELS[currentLead.temperatura]}
                                        </span>
                                    </div>
                                    {currentLead.score && (
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-500">Score:</span>
                                            <span className="ml-1 text-sm font-medium text-gray-900">
                                                {currentLead.score}/100
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ações Rápidas */}
                            <div className="flex space-x-2">
                                {currentLead.status !== 'ganho' && currentLead.status !== 'perdido' && (
                                    <>
                                        <button
                                            onClick={() => setShowConvertModal(true)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                        >
                                            <UserPlusIcon className="h-4 w-4 mr-2" />
                                            Converter
                                        </button>
                                        <button
                                            onClick={() => setShowLostModal(true)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                                        >
                                            <XMarkIcon className="h-4 w-4 mr-2" />
                                            Marcar Perdida
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Alertas */}
                        {currentLead.alerts?.length > 0 && (
                            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                <div className="flex">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-yellow-800">
                                            Alertas Ativos
                                        </p>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <ul className="list-disc list-inside space-y-1">
                                                {currentLead.alerts.map((alert, index) => (
                                                    <li key={index}>{alert.message}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="border-t border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                            {['info', 'timeline', 'tarefas', 'contactos'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                                        ${activeTab === tab
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Conteúdo das Tabs */}
                <div className="bg-white shadow rounded-lg p-6">
                    {/* Tab: Informações */}
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Dados de Contacto */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Dados de Contacto
                                    </h3>
                                    <dl className="space-y-3">
                                        <div className="flex items-center">
                                            <dt className="flex items-center text-sm font-medium text-gray-500 w-24">
                                                <PhoneIcon className="h-4 w-4 mr-2" />
                                                Telefone
                                            </dt>
                                            <dd className="text-sm text-gray-900">
                                                {formatPhone(currentLead.phone)}
                                            </dd>
                                        </div>
                                        {currentLead.email && (
                                            <div className="flex items-center">
                                                <dt className="flex items-center text-sm font-medium text-gray-500 w-24">
                                                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                                                    Email
                                                </dt>
                                                <dd className="text-sm text-gray-900">
                                                    {currentLead.email}
                                                </dd>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <dt className="flex items-center text-sm font-medium text-gray-500 w-24">
                                                <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                                                Preferência
                                            </dt>
                                            <dd className="text-sm text-gray-900">
                                                {currentLead.contactPreference === 'phone' ? 'Telefone' :
                                                    currentLead.contactPreference === 'email' ? 'Email' :
                                                        currentLead.contactPreference === 'whatsapp' ? 'WhatsApp' : 'Qualquer'}
                                            </dd>
                                        </div>
                                        {currentLead.melhorHorario && (
                                            <div className="flex items-center">
                                                <dt className="flex items-center text-sm font-medium text-gray-500 w-24">
                                                    <ClockIcon className="h-4 w-4 mr-2" />
                                                    Horário
                                                </dt>
                                                <dd className="text-sm text-gray-900">
                                                    {currentLead.melhorHorario}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                {/* Qualificação */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Qualificação
                                    </h3>
                                    <dl className="space-y-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Fonte</dt>
                                            <dd className="text-sm text-gray-900">
                                                {LEAD_SOURCE_LABELS[currentLead.leadSource]}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Interesse</dt>
                                            <dd className="text-sm text-gray-900">
                                                {LEAD_INTEREST_LABELS[currentLead.interesse]}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Urgência</dt>
                                            <dd className="text-sm text-gray-900">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${currentLead.urgencia === 'alta' ? 'bg-red-100 text-red-800' :
                                                        currentLead.urgencia === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'}`}>
                                                    {currentLead.urgencia ?
                                                        currentLead.urgencia.charAt(0).toUpperCase() + currentLead.urgencia.slice(1) :
                                                        'Não definida'}
                                                </span>
                                            </dd>
                                        </div>
                                        {currentLead.orcamentoEstimado && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Orçamento</dt>
                                                <dd className="text-sm text-gray-900">
                                                    €{currentLead.orcamentoEstimado.toLocaleString()}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>

                            {/* Detalhes Adicionais */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Detalhes Adicionais
                                </h3>
                                <dl className="space-y-4">
                                    {currentLead.zonaInteresse && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Zona de Interesse</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {currentLead.zonaInteresse}
                                            </dd>
                                        </div>
                                    )}
                                    {currentLead.tipologiaInteresse && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Tipologia</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {currentLead.tipologiaInteresse}
                                            </dd>
                                        </div>
                                    )}
                                    {currentLead.descricao && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Descrição</dt>
                                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                                {currentLead.descricao}
                                            </dd>
                                        </div>
                                    )}
                                    {currentLead.consultorObservations && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Observações do Consultor</dt>
                                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                                {currentLead.consultorObservations}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            {/* Tags */}
                            {currentLead.tags?.length > 0 && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentLead.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                                            >
                                                <TagIcon className="h-4 w-4 mr-1" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Estatísticas */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Estatísticas</h3>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {currentLead.totalContactos || 0}
                                        </p>
                                        <p className="text-sm text-gray-500">Contactos</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {currentLead.totalTasks || 0}
                                        </p>
                                        <p className="text-sm text-gray-500">Tarefas</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {currentLead.tasksCompletas || 0}
                                        </p>
                                        <p className="text-sm text-gray-500">Concluídas</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {currentLead.ultimoContacto ?
                                                getRelativeTime(currentLead.ultimoContacto) :
                                                'Nunca'}
                                        </p>
                                        <p className="text-sm text-gray-500">Último Contacto</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Timeline */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Histórico de Atividades
                                </h3>
                            </div>

                            {/* Timeline combinado de tarefas e contactos */}
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {[...leadTasks, ...leadContacts]
                                        .sort((a, b) => {
                                            const dateA = a.agendadaPara || a.dataContacto || a.criadaEm;
                                            const dateB = b.agendadaPara || b.dataContacto || b.criadaEm;
                                            return dateB?.toDate() - dateA?.toDate();
                                        })
                                        .map((item, index, array) => (
                                            <li key={`${item.id}-${index}`}>
                                                <div className="relative pb-8">
                                                    {index !== array.length - 1 && (
                                                        <span
                                                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className={`
                                                                h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                                                                ${item.status === 'concluida' || item.resultado ?
                                                                    'bg-green-500' :
                                                                    'bg-gray-400'}
                                                            `}>
                                                                {item.tipo === 'call' ? (
                                                                    <PhoneIcon className="h-4 w-4 text-white" />
                                                                ) : item.tipo === 'email' ? (
                                                                    <EnvelopeIcon className="h-4 w-4 text-white" />
                                                                ) : item.tipo === 'meeting' ? (
                                                                    <CalendarIcon className="h-4 w-4 text-white" />
                                                                ) : (
                                                                    <ChatBubbleLeftIcon className="h-4 w-4 text-white" />
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {item.titulo || item.resumo || TASK_TYPE_LABELS[item.tipo]}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {getRelativeTime(
                                                                        item.agendadaPara || item.dataContacto || item.criadaEm
                                                                    )}
                                                                </p>
                                                            </div>
                                                            {(item.descricao || item.notas) && (
                                                                <div className="mt-2 text-sm text-gray-700">
                                                                    {item.descricao || item.notas}
                                                                </div>
                                                            )}
                                                            {item.resultado && (
                                                                <div className="mt-2">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        {item.resultado}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Tab: Tarefas */}
                    {activeTab === 'tarefas' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Tarefas ({leadTasks.length})
                                </h3>
                                <button
                                    onClick={() => setShowTaskModal(true)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Nova Tarefa
                                </button>
                            </div>

                            {leadTasks.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    Sem tarefas agendadas
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leadTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {task.titulo}
                                                        </h4>
                                                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                            ${task.status === 'concluida' ? 'bg-green-100 text-green-800' :
                                                                task.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'}`}>
                                                            {TASK_STATUS_LABELS[task.status]}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {task.descricao}
                                                    </p>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500">
                                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                                        {task.agendadaPara ?
                                                            new Date(task.agendadaPara.toDate()).toLocaleString() :
                                                            'Sem data definida'}
                                                    </div>
                                                </div>
                                                {task.status === 'pendente' && (
                                                    <button
                                                        onClick={() => handleCompleteTask(task.id)}
                                                        className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                                                    >
                                                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                        Concluir
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Contactos */}
                    {activeTab === 'contactos' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Histórico de Contactos ({leadContacts.length})
                                </h3>
                                <button
                                    onClick={() => setShowContactModal(true)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Registar Contacto
                                </button>
                            </div>

                            {leadContacts.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    Sem contactos registados
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leadContacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className="bg-gray-50 rounded-lg p-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {TASK_TYPE_LABELS[contact.tipo]}
                                                        </h4>
                                                        {contact.resultado && (
                                                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                                ${contact.resultado === 'positivo' ? 'bg-green-100 text-green-800' :
                                                                    contact.resultado === 'negativo' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'}`}>
                                                                {contact.resultado}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {contact.resumo}
                                                    </p>
                                                    {contact.notas && (
                                                        <p className="mt-2 text-sm text-gray-500">
                                                            {contact.notas}
                                                        </p>
                                                    )}
                                                    <div className="mt-2 flex items-center text-sm text-gray-500">
                                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                                        {getRelativeTime(contact.dataContacto)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Próxima Ação Recomendada */}
                {currentLead.nextAction && currentLead.status !== 'ganho' && currentLead.status !== 'perdido' && (
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-lg">
                        <div className="flex">
                            <InformationCircleIcon className="h-5 w-5 text-indigo-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-indigo-800">
                                    Próxima Ação Recomendada
                                </p>
                                <p className="mt-1 text-sm text-indigo-700">
                                    {currentLead.nextAction.label}: {currentLead.nextAction.description}
                                </p>
                                <button
                                    onClick={() => {
                                        setTaskForm({
                                            tipo: currentLead.nextAction.type,
                                            titulo: currentLead.nextAction.label,
                                            descricao: currentLead.nextAction.description,
                                            agendadaPara: ''
                                        });
                                        setShowTaskModal(true);
                                    }}
                                    className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Criar tarefa →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Nova Tarefa */}
            {showTaskModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleCreateTask}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Nova Tarefa
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Tipo
                                            </label>
                                            <select
                                                value={taskForm.tipo}
                                                onChange={(e) => setTaskForm({ ...taskForm, tipo: e.target.value })}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                            >
                                                {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Título
                                            </label>
                                            <input
                                                type="text"
                                                value={taskForm.titulo}
                                                onChange={(e) => setTaskForm({ ...taskForm, titulo: e.target.value })}
                                                required
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Descrição
                                            </label>
                                            <textarea
                                                value={taskForm.descricao}
                                                onChange={(e) => setTaskForm({ ...taskForm, descricao: e.target.value })}
                                                rows={3}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Agendar para
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={taskForm.agendadaPara}
                                                onChange={(e) => setTaskForm({ ...taskForm, agendadaPara: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Criar Tarefa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowTaskModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Registar Contacto */}
            {showContactModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleAddContact}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Registar Contacto
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Tipo
                                            </label>
                                            <select
                                                value={contactForm.tipo}
                                                onChange={(e) => setContactForm({ ...contactForm, tipo: e.target.value })}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                            >
                                                {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Resumo
                                            </label>
                                            <input
                                                type="text"
                                                value={contactForm.resumo}
                                                onChange={(e) => setContactForm({ ...contactForm, resumo: e.target.value })}
                                                required
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Notas
                                            </label>
                                            <textarea
                                                value={contactForm.notas}
                                                onChange={(e) => setContactForm({ ...contactForm, notas: e.target.value })}
                                                rows={3}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Resultado
                                            </label>
                                            <select
                                                value={contactForm.resultado}
                                                onChange={(e) => setContactForm({ ...contactForm, resultado: e.target.value })}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                            >
                                                <option value="positivo">Positivo</option>
                                                <option value="neutro">Neutro</option>
                                                <option value="negativo">Negativo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Registar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowContactModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Converter Lead */}
            {showConvertModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleConvertLead}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Converter Lead em Cliente
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="bg-green-50 border-l-4 border-green-400 p-4">
                                            <p className="text-sm text-green-700">
                                                Está prestes a converter <strong>{currentLead.name}</strong> em cliente.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Tipo de Negócio
                                            </label>
                                            <input
                                                type="text"
                                                value={convertForm.tipoNegocio}
                                                onChange={(e) => setConvertForm({ ...convertForm, tipoNegocio: e.target.value })}
                                                placeholder="Ex: Venda de Apartamento T2"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Valor do Negócio (€)
                                            </label>
                                            <input
                                                type="number"
                                                value={convertForm.valorNegocio}
                                                onChange={(e) => setConvertForm({ ...convertForm, valorNegocio: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Comissão (€)
                                            </label>
                                            <input
                                                type="number"
                                                value={convertForm.comissao}
                                                onChange={(e) => setConvertForm({ ...convertForm, comissao: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Observações
                                            </label>
                                            <textarea
                                                value={convertForm.observacoes}
                                                onChange={(e) => setConvertForm({ ...convertForm, observacoes: e.target.value })}
                                                rows={3}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Converter em Cliente
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowConvertModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Marcar como Perdida */}
            {showLostModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Marcar Lead como Perdida
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Motivo da Perda
                                        </label>
                                        <textarea
                                            value={lostReason}
                                            onChange={(e) => setLostReason(e.target.value)}
                                            rows={3}
                                            required
                                            placeholder="Descreva o motivo da perda..."
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={handleMarkAsLost}
                                    disabled={!lostReason}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    Marcar como Perdida
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowLostModal(false);
                                        setLostReason('');
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

            {/* Modal: Confirmar Exclusão */}
            {showDeleteConfirm && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

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
                                                Tem a certeza que deseja eliminar a lead <strong>{currentLead.name}</strong>?
                                                Esta ação não pode ser revertida.
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
                                    onClick={() => setShowDeleteConfirm(false)}
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
};

export default LeadDetailPage;