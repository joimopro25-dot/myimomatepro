/**
 * VISITS TAB - MyImoMatePro
 * Tab de gestão de visitas a imóveis
 * Agendamento, feedback e acompanhamento de visitas
 * 
 * Caminho: src/components/opportunities/tabs/VisitsTab.jsx
 */

import React, { useState, useEffect } from 'react';
import { useOpportunities } from '../../../contexts/OpportunityContext';
import {
    VISIT_STATES,
    INTEREST_LEVELS,
    PROPERTY_BUSINESS_STATES
} from '../../../models/opportunityModel';
import {
    CalendarDaysIcon,
    HomeIcon,
    MapPinIcon,
    ClockIcon,
    UserIcon,
    PhoneIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon,
    PlusIcon,
    StarIcon,
    DocumentTextIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CalendarIcon,
    BellIcon,
    ChatBubbleLeftIcon,
    InformationCircleIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import {
    StarIcon as StarSolid,
    CheckCircleIcon as CheckCircleSolid
} from '@heroicons/react/24/solid';

// Estados das visitas com cores
const VISIT_STATE_CONFIG = {
    'agendada': {
        label: 'Agendada',
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300',
        icon: CalendarIcon
    },
    'confirmada': {
        label: 'Confirmada',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        icon: CheckCircleIcon
    },
    'efetuada': {
        label: 'Efetuada',
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-300',
        icon: CheckCircleSolid
    },
    'cancelada': {
        label: 'Cancelada',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300',
        icon: XCircleIcon
    },
    'nao_compareceu': {
        label: 'Não Compareceu',
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-300',
        icon: ExclamationCircleIcon
    }
};

// Níveis de interesse com estrelas
const INTEREST_CONFIG = {
    'sem_interesse': { label: 'Sem Interesse', stars: 0, color: 'text-gray-400' },
    'baixo': { label: 'Baixo', stars: 1, color: 'text-yellow-400' },
    'medio': { label: 'Médio', stars: 3, color: 'text-yellow-400' },
    'alto': { label: 'Alto', stars: 4, color: 'text-yellow-500' },
    'muito_alto': { label: 'Muito Alto', stars: 5, color: 'text-yellow-500' }
};

// Componente de Card de Visita
const VisitCard = ({ visit, property, onEdit, onComplete, onCancel, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const config = VISIT_STATE_CONFIG[visit.estado];
    const Icon = config.icon;

    const formatDateTime = (date, time) => {
        const d = new Date(date);
        const dateStr = d.toLocaleDateString('pt-PT', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        });
        return `${dateStr} às ${time}`;
    };

    const isUpcoming = () => {
        const visitDate = new Date(visit.data);
        return visitDate > new Date() && visit.estado !== 'cancelada' && visit.estado !== 'efetuada';
    };

    const isPast = () => {
        const visitDate = new Date(visit.data);
        return visitDate < new Date() && visit.estado !== 'efetuada' && visit.estado !== 'cancelada';
    };

    return (
        <div className={`bg-white rounded-lg border ${config.borderColor} p-4 hover:shadow-md transition-all`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-5 h-5 ${config.textColor}`} />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                            {config.label}
                        </span>
                        {isUpcoming() && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                                Próxima
                            </span>
                        )}
                        {isPast() && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800">
                                Atrasada
                            </span>
                        )}
                    </div>

                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <HomeIcon className="w-4 h-4 text-gray-500" />
                        {property?.referencia || 'Imóvel'} - {property?.tipo}
                    </h4>

                    <p className="text-sm text-gray-600 mt-1">
                        <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                        {formatDateTime(visit.data, visit.hora)}
                    </p>
                </div>

                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                    {expanded ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    )}
                </button>
            </div>

            {/* Participantes */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    <span>{visit.acompanhante || 'Consultor'}</span>
                </div>
                {visit.clientePresente !== false && (
                    <div className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        <span>Cliente presente</span>
                    </div>
                )}
            </div>

            {/* Localização */}
            {property?.morada && (
                <div className="mt-2 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 inline mr-1" />
                    {property.morada}
                </div>
            )}

            {/* Detalhes Expandidos */}
            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {/* Feedback (se visita efetuada) */}
                    {visit.estado === 'efetuada' && visit.feedback && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <h5 className="font-medium text-gray-700 mb-2">Feedback</h5>

                            {/* Interesse */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-600">Interesse:</span>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <StarSolid
                                            key={i}
                                            className={`w-4 h-4 ${i < INTEREST_CONFIG[visit.feedback.interesse]?.stars
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium">
                                    {INTEREST_CONFIG[visit.feedback.interesse]?.label}
                                </span>
                            </div>

                            {/* Pontos Positivos */}
                            {visit.feedback.pontosPositivos && visit.feedback.pontosPositivos.length > 0 && (
                                <div className="mb-2">
                                    <span className="text-sm font-medium text-green-700">Pontos Positivos:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {visit.feedback.pontosPositivos.map((ponto, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 
                                                           text-xs rounded-full">
                                                {ponto}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Objeções */}
                            {visit.feedback.objecoes && visit.feedback.objecoes.length > 0 && (
                                <div className="mb-2">
                                    <span className="text-sm font-medium text-red-700">Objeções:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {visit.feedback.objecoes.map((obj, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 
                                                         text-xs rounded-full">
                                                {obj}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Comentários */}
                            {visit.feedback.comentarios && (
                                <div className="mt-2">
                                    <span className="text-sm font-medium text-gray-700">Comentários:</span>
                                    <p className="text-sm text-gray-600 mt-1">{visit.feedback.comentarios}</p>
                                </div>
                            )}

                            {/* Próximas Ações */}
                            {visit.feedback.proximasAcoes && (
                                <div className="mt-2">
                                    <span className="text-sm font-medium text-blue-700">Próximas Ações:</span>
                                    <p className="text-sm text-gray-600 mt-1">{visit.feedback.proximasAcoes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notas */}
                    {visit.notas && (
                        <div className="text-sm text-gray-600">
                            <ChatBubbleLeftIcon className="w-4 h-4 inline mr-1" />
                            {visit.notas}
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2">
                        {visit.estado === 'agendada' && (
                            <>
                                <button
                                    onClick={() => onComplete(visit)}
                                    className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-lg 
                                             hover:bg-green-600 text-sm transition-colors"
                                >
                                    Marcar como Efetuada
                                </button>
                                <button
                                    onClick={() => onCancel(visit)}
                                    className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded-lg 
                                             hover:bg-red-600 text-sm transition-colors"
                                >
                                    Cancelar
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => onEdit(visit)}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 
                                     rounded-lg hover:bg-gray-50 text-sm transition-colors"
                        >
                            <PencilIcon className="w-4 h-4 inline mr-1" />
                            Editar
                        </button>

                        <button
                            onClick={() => onDelete(visit)}
                            className="px-3 py-1.5 border border-red-300 text-red-600 
                                     rounded-lg hover:bg-red-50 text-sm transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente Principal
const VisitsTab = ({ data = {}, onChange, opportunityType, clientId, opportunityId }) => {
    const { addVisit, updateVisit, VISIT_STATES: STATES } = useOpportunities();

    // Estado das visitas e imóveis
    const [visits, setVisits] = useState([]);
    const [properties, setProperties] = useState(data.imoveis || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingVisit, setEditingVisit] = useState(null);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    // Formulário de nova visita/edição
    const [formData, setFormData] = useState({
        imovelId: '',
        data: '',
        hora: '',
        acompanhante: '',
        clientePresente: true,
        notas: '',
        estado: 'agendada',
        lembrete: true,
        lembreteAntecedencia: 24 // horas
    });

    // Formulário de feedback
    const [feedbackData, setFeedbackData] = useState({
        interesse: 'medio',
        pontosPositivos: [],
        objecoes: [],
        comentarios: '',
        proximasAcoes: '',
        vaiMostrarMais: false
    });

    // Pontos positivos e objeções predefinidos
    const PONTOS_POSITIVOS_OPTIONS = [
        'Localização', 'Preço', 'Área', 'Luminosidade', 'Vistas',
        'Acabamentos', 'Garagem', 'Arrecadação', 'Varanda', 'Estado conservação',
        'Proximidade transportes', 'Proximidade escolas', 'Zona calma'
    ];

    const OBJECOES_OPTIONS = [
        'Preço elevado', 'Área pequena', 'Sem garagem', 'Obras necessárias',
        'Localização', 'Barulho', 'Pouca luz', 'Andar baixo', 'Sem elevador',
        'Despesas condomínio', 'Orientação solar'
    ];

    // Processar visitas de todos os imóveis
    useEffect(() => {
        const allVisits = [];
        properties.forEach(property => {
            if (property.visitas) {
                property.visitas.forEach(visit => {
                    allVisits.push({
                        ...visit,
                        propertyId: property.id,
                        property: property
                    });
                });
            }
        });
        setVisits(allVisits);
    }, [properties]);

    // Filtrar e ordenar visitas
    const getFilteredVisits = () => {
        let filtered = [...visits];

        // Aplicar filtro
        if (filter !== 'all') {
            filtered = filtered.filter(visit => visit.estado === filter);
        }

        // Ordenar
        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.data) - new Date(a.data);
            } else if (sortBy === 'property') {
                return (a.property?.referencia || '').localeCompare(b.property?.referencia || '');
            } else if (sortBy === 'status') {
                return (a.estado || '').localeCompare(b.estado || '');
            }
            return 0;
        });

        return filtered;
    };

    // Estatísticas
    const getStats = () => {
        const stats = {
            total: visits.length,
            agendadas: visits.filter(v => v.estado === 'agendada').length,
            efetuadas: visits.filter(v => v.estado === 'efetuada').length,
            canceladas: visits.filter(v => v.estado === 'cancelada').length,
            taxaEfetivacao: 0,
            interesseAlto: 0
        };

        if (stats.total > 0) {
            stats.taxaEfetivacao = Math.round((stats.efetuadas / stats.total) * 100);
        }

        const visitasComFeedback = visits.filter(v => v.feedback?.interesse);
        const interesseAlto = visitasComFeedback.filter(v =>
            v.feedback.interesse === 'alto' || v.feedback.interesse === 'muito_alto'
        );

        if (visitasComFeedback.length > 0) {
            stats.interesseAlto = Math.round((interesseAlto.length / visitasComFeedback.length) * 100);
        }

        return stats;
    };

    // Handlers
    const handleAddVisit = async () => {
        if (!formData.imovelId || !formData.data || !formData.hora) {
            alert('Por favor preencha os campos obrigatórios');
            return;
        }

        try {
            const property = properties.find(p => p.id === formData.imovelId);
            const newVisit = {
                ...formData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };

            // Adicionar visita ao imóvel
            const updatedProperties = properties.map(prop => {
                if (prop.id === formData.imovelId) {
                    return {
                        ...prop,
                        visitas: [...(prop.visitas || []), newVisit]
                    };
                }
                return prop;
            });

            setProperties(updatedProperties);

            // Atualizar no parent
            onChange({
                ...data,
                imoveis: updatedProperties
            });

            // Se tiver IDs, salvar no backend
            if (opportunityId && clientId && addVisit) {
                await addVisit(clientId, opportunityId, formData.imovelId, newVisit);
            }

            // Reset form
            setFormData({
                imovelId: '',
                data: '',
                hora: '',
                acompanhante: '',
                clientePresente: true,
                notas: '',
                estado: 'agendada',
                lembrete: true,
                lembreteAntecedencia: 24
            });
            setShowAddForm(false);
        } catch (error) {
            console.error('Erro ao adicionar visita:', error);
            alert('Erro ao adicionar visita');
        }
    };

    const handleCompleteVisit = (visit) => {
        setSelectedVisit(visit);
        setFeedbackData({
            interesse: 'medio',
            pontosPositivos: [],
            objecoes: [],
            comentarios: '',
            proximasAcoes: '',
            vaiMostrarMais: false
        });
        setShowFeedbackForm(true);
    };

    const handleSaveFeedback = async () => {
        try {
            // Atualizar visita com feedback
            const updatedProperties = properties.map(prop => {
                if (prop.id === selectedVisit.propertyId) {
                    return {
                        ...prop,
                        visitas: prop.visitas.map(v => {
                            if (v.id === selectedVisit.id) {
                                return {
                                    ...v,
                                    estado: 'efetuada',
                                    feedback: feedbackData,
                                    completedAt: new Date().toISOString()
                                };
                            }
                            return v;
                        })
                    };
                }
                return prop;
            });

            setProperties(updatedProperties);

            // Atualizar no parent
            onChange({
                ...data,
                imoveis: updatedProperties
            });

            // Se tiver IDs, salvar no backend
            if (opportunityId && clientId && updateVisit) {
                await updateVisit(clientId, opportunityId, selectedVisit.propertyId, selectedVisit.id, {
                    estado: 'efetuada',
                    feedback: feedbackData
                });
            }

            setShowFeedbackForm(false);
            setSelectedVisit(null);
        } catch (error) {
            console.error('Erro ao guardar feedback:', error);
            alert('Erro ao guardar feedback');
        }
    };

    const handleCancelVisit = async (visit) => {
        if (!confirm('Tem certeza que deseja cancelar esta visita?')) return;

        try {
            // Atualizar estado da visita
            const updatedProperties = properties.map(prop => {
                if (prop.id === visit.propertyId) {
                    return {
                        ...prop,
                        visitas: prop.visitas.map(v => {
                            if (v.id === visit.id) {
                                return {
                                    ...v,
                                    estado: 'cancelada',
                                    cancelledAt: new Date().toISOString()
                                };
                            }
                            return v;
                        })
                    };
                }
                return prop;
            });

            setProperties(updatedProperties);
            onChange({
                ...data,
                imoveis: updatedProperties
            });
        } catch (error) {
            console.error('Erro ao cancelar visita:', error);
            alert('Erro ao cancelar visita');
        }
    };

    const handleDeleteVisit = async (visit) => {
        if (!confirm('Tem certeza que deseja eliminar esta visita?')) return;

        try {
            // Remover visita
            const updatedProperties = properties.map(prop => {
                if (prop.id === visit.propertyId) {
                    return {
                        ...prop,
                        visitas: prop.visitas.filter(v => v.id !== visit.id)
                    };
                }
                return prop;
            });

            setProperties(updatedProperties);
            onChange({
                ...data,
                imoveis: updatedProperties
            });
        } catch (error) {
            console.error('Erro ao eliminar visita:', error);
            alert('Erro ao eliminar visita');
        }
    };

    const stats = getStats();
    const filteredVisits = getFilteredVisits();

    return (
        <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <CalendarDaysIcon className="w-5 h-5 mr-2" />
                        Gestão de Visitas
                    </h3>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white 
                                 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Agendar Visita
                    </button>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-5 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.agendadas}</div>
                        <div className="text-xs text-gray-500">Agendadas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.efetuadas}</div>
                        <div className="text-xs text-gray-500">Efetuadas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.taxaEfetivacao}%</div>
                        <div className="text-xs text-gray-500">Taxa Efetivação</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.interesseAlto}%</div>
                        <div className="text-xs text-gray-500">Interesse Alto</div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex gap-4 items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                        >
                            Todas ({visits.length})
                        </button>
                        {Object.entries(VISIT_STATE_CONFIG).map(([key, config]) => {
                            const count = visits.filter(v => v.estado === key).length;
                            if (count === 0) return null;

                            return (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === key
                                            ? `${config.bgColor} ${config.textColor}`
                                            : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    {config.label} ({count})
                                </button>
                            );
                        })}
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-gray-600">Ordenar:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="date">Data</option>
                            <option value="property">Imóvel</option>
                            <option value="status">Estado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de Visitas */}
            {filteredVisits.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                        {filter === 'all'
                            ? 'Ainda não há visitas agendadas'
                            : `Não há visitas ${VISIT_STATE_CONFIG[filter]?.label.toLowerCase()}`}
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="text-blue-500 hover:text-blue-600"
                        >
                            Agendar primeira visita
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredVisits.map(visit => (
                        <VisitCard
                            key={visit.id}
                            visit={visit}
                            property={visit.property}
                            onEdit={(v) => {
                                setEditingVisit(v);
                                setFormData({
                                    imovelId: v.propertyId,
                                    data: v.data,
                                    hora: v.hora,
                                    acompanhante: v.acompanhante || '',
                                    clientePresente: v.clientePresente !== false,
                                    notas: v.notas || '',
                                    estado: v.estado,
                                    lembrete: v.lembrete !== false,
                                    lembreteAntecedencia: v.lembreteAntecedencia || 24
                                });
                                setShowAddForm(true);
                            }}
                            onComplete={handleCompleteVisit}
                            onCancel={handleCancelVisit}
                            onDelete={handleDeleteVisit}
                        />
                    ))}
                </div>
            )}

            {/* Modal Adicionar/Editar Visita */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingVisit ? 'Editar Visita' : 'Agendar Nova Visita'}
                        </h3>

                        <div className="space-y-4">
                            {/* Imóvel */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Imóvel *
                                </label>
                                <select
                                    value={formData.imovelId}
                                    onChange={(e) => setFormData({ ...formData, imovelId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={editingVisit}
                                >
                                    <option value="">Selecione um imóvel</option>
                                    {properties.map(prop => (
                                        <option key={prop.id} value={prop.id}>
                                            {prop.referencia} - {prop.tipo} - {prop.morada}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Data e Hora */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.data}
                                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hora *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.hora}
                                        onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Acompanhante */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Acompanhante
                                </label>
                                <input
                                    type="text"
                                    value={formData.acompanhante}
                                    onChange={(e) => setFormData({ ...formData, acompanhante: e.target.value })}
                                    placeholder="Nome do consultor/agente"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Cliente Presente */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="clientePresente"
                                    checked={formData.clientePresente}
                                    onChange={(e) => setFormData({ ...formData, clientePresente: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-500 
                                             focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="clientePresente" className="text-sm text-gray-700">
                                    Cliente estará presente
                                </label>
                            </div>

                            {/* Lembrete */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="lembrete"
                                        checked={formData.lembrete}
                                        onChange={(e) => setFormData({ ...formData, lembrete: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-500 
                                                 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="lembrete" className="text-sm text-gray-700">
                                        Enviar lembrete
                                    </label>
                                </div>

                                {formData.lembrete && (
                                    <select
                                        value={formData.lembreteAntecedencia}
                                        onChange={(e) => setFormData({ ...formData, lembreteAntecedencia: e.target.value })}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="1">1 hora antes</option>
                                        <option value="2">2 horas antes</option>
                                        <option value="24">1 dia antes</option>
                                        <option value="48">2 dias antes</option>
                                    </select>
                                )}
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas
                                </label>
                                <textarea
                                    value={formData.notas}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                    rows="3"
                                    placeholder="Observações sobre a visita..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingVisit(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 
                                         rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddVisit}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                                         hover:bg-blue-600"
                            >
                                {editingVisit ? 'Atualizar' : 'Agendar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Feedback */}
            {showFeedbackForm && selectedVisit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            Feedback da Visita
                        </h3>

                        <div className="space-y-4">
                            {/* Nível de Interesse */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nível de Interesse do Cliente
                                </label>
                                <div className="flex gap-4">
                                    {Object.entries(INTEREST_CONFIG).map(([key, config]) => (
                                        <button
                                            key={key}
                                            onClick={() => setFeedbackData({ ...feedbackData, interesse: key })}
                                            className={`flex flex-col items-center p-3 rounded-lg border-2 
                                                      transition-all ${feedbackData.interesse === key
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarSolid
                                                        key={i}
                                                        className={`w-4 h-4 ${i < config.stars
                                                                ? config.color
                                                                : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-600">{config.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pontos Positivos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pontos Positivos
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PONTOS_POSITIVOS_OPTIONS.map(ponto => (
                                        <button
                                            key={ponto}
                                            onClick={() => {
                                                const pontos = feedbackData.pontosPositivos.includes(ponto)
                                                    ? feedbackData.pontosPositivos.filter(p => p !== ponto)
                                                    : [...feedbackData.pontosPositivos, ponto];
                                                setFeedbackData({ ...feedbackData, pontosPositivos: pontos });
                                            }}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${feedbackData.pontosPositivos.includes(ponto)
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            {ponto}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Objeções */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Objeções/Preocupações
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {OBJECOES_OPTIONS.map(obj => (
                                        <button
                                            key={obj}
                                            onClick={() => {
                                                const objs = feedbackData.objecoes.includes(obj)
                                                    ? feedbackData.objecoes.filter(o => o !== obj)
                                                    : [...feedbackData.objecoes, obj];
                                                setFeedbackData({ ...feedbackData, objecoes: objs });
                                            }}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${feedbackData.objecoes.includes(obj)
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            {obj}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comentários */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comentários Gerais
                                </label>
                                <textarea
                                    value={feedbackData.comentarios}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, comentarios: e.target.value })}
                                    rows="3"
                                    placeholder="Observações adicionais sobre a visita..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Próximas Ações */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Próximas Ações
                                </label>
                                <textarea
                                    value={feedbackData.proximasAcoes}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, proximasAcoes: e.target.value })}
                                    rows="2"
                                    placeholder="O que fazer a seguir com este cliente..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Vai Mostrar Mais */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="vaiMostrarMais"
                                    checked={feedbackData.vaiMostrarMais}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, vaiMostrarMais: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-500 
                                             focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="vaiMostrarMais" className="text-sm text-gray-700">
                                    Cliente quer ver mais imóveis
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowFeedbackForm(false);
                                    setSelectedVisit(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 
                                         rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveFeedback}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg 
                                         hover:bg-green-600"
                            >
                                Guardar Feedback
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitsTab;