/**
 * TIMELINE TAB - MyImoMatePro
 * Tab de histórico de eventos da oportunidade
 * Visualização cronológica de todas as atividades
 * 
 * Caminho: src/components/opportunities/tabs/TimelineTab.jsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useOpportunities } from '../../../contexts/OpportunityContext';
import { useAuth } from '../../../contexts/AuthContext';
import { TIMELINE_EVENT_TYPES } from '../../../models/opportunityModel';
import {
    ClockIcon,
    CalendarIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChatBubbleLeftIcon,
    DocumentTextIcon,
    HomeIcon,
    CurrencyEuroIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    PlusIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    ChartBarIcon,
    MapPinIcon,
    CameraIcon,
    PaperClipIcon,
    BellIcon,
    TagIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolid,
    XCircleIcon as XCircleSolid,
    InformationCircleIcon as InfoCircleSolid
} from '@heroicons/react/24/solid';

// Configuração de eventos com cores e ícones
const EVENT_CONFIG = {
    [TIMELINE_EVENT_TYPES.CREATED]: {
        label: 'Criado',
        icon: PlusIcon,
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
    },
    [TIMELINE_EVENT_TYPES.UPDATED]: {
        label: 'Atualizado',
        icon: ArrowPathIcon,
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300'
    },
    [TIMELINE_EVENT_TYPES.STATE_CHANGED]: {
        label: 'Mudança de Estado',
        icon: ChartBarIcon,
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-300'
    },
    [TIMELINE_EVENT_TYPES.CONTACT_MADE]: {
        label: 'Contacto',
        icon: PhoneIcon,
        color: 'indigo',
        bgColor: 'bg-indigo-100',
        textColor: 'text-indigo-800',
        borderColor: 'border-indigo-300'
    },
    [TIMELINE_EVENT_TYPES.EMAIL_SENT]: {
        label: 'Email Enviado',
        icon: EnvelopeIcon,
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300'
    },
    [TIMELINE_EVENT_TYPES.MEETING_SCHEDULED]: {
        label: 'Reunião Agendada',
        icon: CalendarIcon,
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300'
    },
    [TIMELINE_EVENT_TYPES.VISIT_SCHEDULED]: {
        label: 'Visita Agendada',
        icon: HomeIcon,
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-300'
    },
    [TIMELINE_EVENT_TYPES.VISIT_COMPLETED]: {
        label: 'Visita Realizada',
        icon: CheckCircleIcon,
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
    },
    [TIMELINE_EVENT_TYPES.PROPOSAL_SENT]: {
        label: 'Proposta Enviada',
        icon: DocumentTextIcon,
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-300'
    },
    [TIMELINE_EVENT_TYPES.PROPOSAL_ACCEPTED]: {
        label: 'Proposta Aceite',
        icon: CheckCircleSolid,
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
    },
    [TIMELINE_EVENT_TYPES.PROPOSAL_REJECTED]: {
        label: 'Proposta Rejeitada',
        icon: XCircleSolid,
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300'
    },
    [TIMELINE_EVENT_TYPES.DOCUMENT_ADDED]: {
        label: 'Documento Adicionado',
        icon: PaperClipIcon,
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-300'
    },
    [TIMELINE_EVENT_TYPES.NOTE_ADDED]: {
        label: 'Nota Adicionada',
        icon: ChatBubbleLeftIcon,
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-300'
    },
    [TIMELINE_EVENT_TYPES.TASK_CREATED]: {
        label: 'Tarefa Criada',
        icon: ClipboardDocumentListIcon,
        color: 'indigo',
        bgColor: 'bg-indigo-100',
        textColor: 'text-indigo-800',
        borderColor: 'border-indigo-300'
    },
    [TIMELINE_EVENT_TYPES.TASK_COMPLETED]: {
        label: 'Tarefa Concluída',
        icon: CheckCircleIcon,
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
    },
    [TIMELINE_EVENT_TYPES.PROPERTY_ADDED]: {
        label: 'Imóvel Adicionado',
        icon: HomeIcon,
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300'
    },
    [TIMELINE_EVENT_TYPES.VALUE_UPDATED]: {
        label: 'Valor Atualizado',
        icon: CurrencyEuroIcon,
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
    }
};

// Componente de item da timeline
const TimelineItem = ({ event, isFirst, isLast }) => {
    const config = EVENT_CONFIG[event.tipo] || EVENT_CONFIG[TIMELINE_EVENT_TYPES.NOTE_ADDED];
    const Icon = config.icon;

    const formatDate = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) {
            return `Hoje às ${d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (d.toDateString() === yesterday.toDateString()) {
            return `Ontem às ${d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return d.toLocaleString('pt-PT', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    return (
        <div className="flex gap-4 group">
            {/* Linha vertical */}
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${config.bgColor} ${config.borderColor} border-2 z-10 
                    group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${config.textColor}`} />
                </div>
                {!isLast && (
                    <div className="w-0.5 h-full bg-gray-200 -mt-2" />
                )}
            </div>

            {/* Conteúdo do evento */}
            <div className="flex-1 pb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-4 
                    hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full 
                                text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                                {config.label}
                            </span>
                            <h4 className="text-sm font-semibold text-gray-900 mt-2">
                                {event.descricao}
                            </h4>
                        </div>
                        <span className="text-xs text-gray-500">
                            {formatDate(event.data)}
                        </span>
                    </div>

                    {/* Dados adicionais do evento */}
                    {event.dados && Object.keys(event.dados).length > 0 && (
                        <div className="mt-3 space-y-1">
                            {Object.entries(event.dados).map(([key, value]) => (
                                <div key={key} className="flex items-center text-xs text-gray-600">
                                    <span className="font-medium capitalize mr-1">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                    </span>
                                    <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Usuário e ação */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                            <UserIcon className="w-3 h-3 mr-1" />
                            <span>{event.usuario || 'Sistema'}</span>
                        </div>
                        {event.notas && (
                            <div className="flex items-center text-xs text-gray-500">
                                <ChatBubbleLeftIcon className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-xs">{event.notas}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TimelineTab = ({ data = {}, onChange, opportunityId }) => {
    const { currentUser } = useAuth();
    const { addEventToTimeline, TIMELINE_EVENT_TYPES: TYPES } = useOpportunities();

    // Estados
    const [events, setEvents] = useState(data.timeline || []);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // desc = mais recente primeiro
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [newEvent, setNewEvent] = useState({
        tipo: TIMELINE_EVENT_TYPES.NOTE_ADDED,
        descricao: '',
        notas: ''
    });
    const [groupByDate, setGroupByDate] = useState(true);

    // Atualizar eventos quando data muda
    useEffect(() => {
        if (data.timeline && JSON.stringify(data.timeline) !== JSON.stringify(events)) {
            setEvents(data.timeline);
        }
    }, [data.timeline]);

    // Filtrar e ordenar eventos
    useEffect(() => {
        let filtered = [...events];

        // Aplicar filtro por tipo
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(event => event.tipo === selectedFilter);
        }

        // Aplicar busca
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (event.notas && event.notas.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Ordenar
        filtered.sort((a, b) => {
            const dateA = new Date(a.data);
            const dateB = new Date(b.data);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        setFilteredEvents(filtered);
    }, [events, selectedFilter, searchTerm, sortOrder]);

    // Agrupar eventos por data
    const groupedEvents = useMemo(() => {
        if (!groupByDate) return { 'all': filteredEvents };

        const groups = {};
        filteredEvents.forEach(event => {
            const date = new Date(event.data);
            const dateKey = date.toLocaleDateString('pt-PT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(event);
        });

        return groups;
    }, [filteredEvents, groupByDate]);

    // Estatísticas
    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);
        const thisMonth = new Date(today);
        thisMonth.setMonth(thisMonth.getMonth() - 1);

        return {
            total: events.length,
            today: events.filter(e => {
                const eventDate = new Date(e.data);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === today.getTime();
            }).length,
            thisWeek: events.filter(e => new Date(e.data) >= thisWeek).length,
            thisMonth: events.filter(e => new Date(e.data) >= thisMonth).length
        };
    }, [events]);

    // Adicionar novo evento
    const handleAddEvent = async () => {
        if (!newEvent.descricao) {
            alert('Por favor, adicione uma descrição');
            return;
        }

        const eventToAdd = {
            ...newEvent,
            data: new Date().toISOString(),
            usuario: currentUser?.displayName || currentUser?.email || 'Utilizador',
            dados: {}
        };

        try {
            // Adicionar ao timeline local
            const updatedEvents = [eventToAdd, ...events];
            setEvents(updatedEvents);

            // Atualizar no parent
            onChange({
                ...data,
                timeline: updatedEvents
            });

            // Se tiver opportunityId, salvar no backend
            if (opportunityId && addEventToTimeline) {
                await addEventToTimeline(opportunityId, eventToAdd);
            }

            // Limpar formulário
            setNewEvent({
                tipo: TIMELINE_EVENT_TYPES.NOTE_ADDED,
                descricao: '',
                notas: ''
            });
            setShowAddEvent(false);
        } catch (error) {
            console.error('Erro ao adicionar evento:', error);
            alert('Erro ao adicionar evento');
        }
    };

    // Obter tipos únicos de eventos existentes
    const availableEventTypes = useMemo(() => {
        const types = new Set(events.map(e => e.tipo));
        return Array.from(types);
    }, [events]);

    return (
        <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <ClockIcon className="w-5 h-5 mr-2" />
                        Histórico de Atividades
                    </h3>
                    <button
                        type="button"
                        onClick={() => setShowAddEvent(!showAddEvent)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white 
                                 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Adicionar Evento
                    </button>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
                        <div className="text-xs text-gray-500">Hoje</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
                        <div className="text-xs text-gray-500">Esta Semana</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
                        <div className="text-xs text-gray-500">Este Mês</div>
                    </div>
                </div>

                {/* Formulário para adicionar evento */}
                {showAddEvent && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium mb-3">Novo Evento</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Evento
                                </label>
                                <select
                                    value={newEvent.tipo}
                                    onChange={(e) => setNewEvent({ ...newEvent, tipo: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {Object.entries(EVENT_CONFIG).map(([type, config]) => (
                                        <option key={type} value={type}>
                                            {config.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição *
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.descricao}
                                    onChange={(e) => setNewEvent({ ...newEvent, descricao: e.target.value })}
                                    placeholder="Descreva o que aconteceu..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas (opcional)
                                </label>
                                <textarea
                                    value={newEvent.notas}
                                    onChange={(e) => setNewEvent({ ...newEvent, notas: e.target.value })}
                                    placeholder="Notas adicionais..."
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddEvent(false);
                                        setNewEvent({
                                            tipo: TIMELINE_EVENT_TYPES.NOTE_ADDED,
                                            descricao: '',
                                            notas: ''
                                        });
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 
                                             rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddEvent}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                                             hover:bg-blue-600"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtros e controles */}
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Busca */}
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 
                                                            w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar eventos..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filtro por tipo */}
                    <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg 
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todos os Tipos</option>
                        {availableEventTypes.map(type => (
                            <option key={type} value={type}>
                                {EVENT_CONFIG[type]?.label || type}
                            </option>
                        ))}
                    </select>

                    {/* Ordenação */}
                    <button
                        type="button"
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg 
                                 hover:bg-gray-50 transition-colors"
                        title={sortOrder === 'desc' ? 'Mais recente primeiro' : 'Mais antigo primeiro'}
                    >
                        {sortOrder === 'desc' ? (
                            <ArrowDownIcon className="w-4 h-4" />
                        ) : (
                            <ArrowUpIcon className="w-4 h-4" />
                        )}
                    </button>

                    {/* Agrupar por data */}
                    <button
                        type="button"
                        onClick={() => setGroupByDate(!groupByDate)}
                        className={`px-3 py-2 border rounded-lg transition-colors ${groupByDate
                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <CalendarIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {searchTerm || selectedFilter !== 'all'
                                ? 'Nenhum evento encontrado com os filtros aplicados'
                                : 'Ainda não há eventos nesta oportunidade'}
                        </p>
                        {!showAddEvent && events.length === 0 && (
                            <button
                                type="button"
                                onClick={() => setShowAddEvent(true)}
                                className="mt-4 text-blue-500 hover:text-blue-600"
                            >
                                Adicionar primeiro evento
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
                            <div key={dateKey}>
                                {groupByDate && dateKey !== 'all' && (
                                    <div className="flex items-center mb-4">
                                        <div className="flex-1 h-px bg-gray-200" />
                                        <span className="px-4 text-sm font-medium text-gray-500">
                                            {dateKey}
                                        </span>
                                        <div className="flex-1 h-px bg-gray-200" />
                                    </div>
                                )}

                                <div className="relative">
                                    {dateEvents.map((event, index) => (
                                        <TimelineItem
                                            key={`${event.data}-${index}`}
                                            event={event}
                                            isFirst={index === 0}
                                            isLast={index === dateEvents.length - 1}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Resumo do Timeline */}
            {filteredEvents.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Resumo da Atividade
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(
                            filteredEvents.reduce((acc, event) => {
                                const type = EVENT_CONFIG[event.tipo]?.label || 'Outro';
                                acc[type] = (acc[type] || 0) + 1;
                                return acc;
                            }, {})
                        ).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{type}:</span>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimelineTab;