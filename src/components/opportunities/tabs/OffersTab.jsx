/**
 * OFFERS TAB - MyImoMatePro
 * Tab de gestão de ofertas e propostas
 * Criação, negociação e acompanhamento de ofertas
 * 
 * Caminho: src/components/opportunities/tabs/OffersTab.jsx
 */

import React, { useState, useEffect } from 'react';
import { useOpportunities } from '../../../contexts/OpportunityContext';
import {
    OFFER_STATES,
    PROPERTY_BUSINESS_STATES
} from '../../../models/opportunityModel';
import {
    CurrencyEuroIcon,
    DocumentTextIcon,
    CalendarIcon,
    ClockIcon,
    UserIcon,
    HomeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BanknotesIcon,
    CalculatorIcon,
    ChatBubbleLeftIcon,
    PencilIcon,
    TrashIcon,
    DocumentDuplicateIcon,
    ArrowsRightLeftIcon,
    CheckBadgeIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolid,
    XCircleIcon as XCircleSolid
} from '@heroicons/react/24/solid';

// Estados das ofertas com cores
const OFFER_STATE_CONFIG = {
    'rascunho': {
        label: 'Rascunho',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-300',
        icon: DocumentTextIcon
    },
    'submetida': {
        label: 'Submetida',
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300',
        icon: ArrowTrendingUpIcon
    },
    'negociacao': {
        label: 'Em Negociação',
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300',
        icon: ArrowsRightLeftIcon
    },
    'contraproposta': {
        label: 'Contraproposta',
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-300',
        icon: DocumentDuplicateIcon
    },
    'aceite': {
        label: 'Aceite',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        icon: CheckCircleSolid
    },
    'rejeitada': {
        label: 'Rejeitada',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300',
        icon: XCircleSolid
    },
    'expirada': {
        label: 'Expirada',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-300',
        icon: ClockIcon
    }
};

// Componente de Card de Oferta
const OfferCard = ({ offer, property, onEdit, onAccept, onReject, onCounter, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const config = OFFER_STATE_CONFIG[offer.status];
    const Icon = config.icon;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const calculatePercentage = (value, reference) => {
        if (!reference) return 0;
        const diff = ((value - reference) / reference) * 100;
        return diff.toFixed(1);
    };

    const isExpired = () => {
        if (!offer.validadeAte) return false;
        return new Date(offer.validadeAte) < new Date() &&
            offer.status !== 'aceite' &&
            offer.status !== 'rejeitada';
    };

    // Calcular valores
    const percentDiff = property?.valorPedido ?
        calculatePercentage(offer.valor, property.valorPedido) : 0;

    // Timeline da oferta
    const offerTimeline = offer.historico || [];

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
                        {isExpired() && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                Expirada
                            </span>
                        )}
                        {offer.tipo === 'compra' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-600">
                                Compra
                            </span>
                        )}
                        {offer.tipo === 'arrendamento' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-600">
                                Arrendamento
                            </span>
                        )}
                    </div>

                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <HomeIcon className="w-4 h-4 text-gray-500" />
                        {property?.referencia || 'Imóvel'} - {property?.tipo}
                    </h4>

                    <div className="mt-2 flex items-center gap-4">
                        <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(offer.valor)}
                        </span>
                        {percentDiff !== 0 && (
                            <span className={`flex items-center text-sm ${percentDiff > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {percentDiff > 0 ? (
                                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                ) : (
                                    <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                                )}
                                {Math.abs(percentDiff)}%
                            </span>
                        )}
                    </div>
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

            {/* Informações Principais */}
            <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                    <span className="text-gray-500">Data Submissão:</span>
                    <p className="font-medium">{formatDate(offer.dataSubmissao)}</p>
                </div>
                <div>
                    <span className="text-gray-500">Validade:</span>
                    <p className="font-medium">{offer.validadeAte ? formatDate(offer.validadeAte) : 'Sem prazo'}</p>
                </div>
                <div>
                    <span className="text-gray-500">Cliente:</span>
                    <p className="font-medium">{offer.nomeCliente || 'Cliente'}</p>
                </div>
            </div>

            {/* Detalhes Expandidos */}
            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Condições Financeiras */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-medium text-gray-700 mb-3">Condições Financeiras</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Valor Proposto:</span>
                                <p className="font-semibold text-lg">{formatCurrency(offer.valor)}</p>
                            </div>
                            {property?.valorPedido && (
                                <div>
                                    <span className="text-gray-500">Valor Pedido:</span>
                                    <p className="font-semibold text-lg">{formatCurrency(property.valorPedido)}</p>
                                </div>
                            )}
                            {offer.entrada && (
                                <div>
                                    <span className="text-gray-500">Entrada/Sinal:</span>
                                    <p className="font-medium">{formatCurrency(offer.entrada)}</p>
                                </div>
                            )}
                            {offer.financiamento && (
                                <div>
                                    <span className="text-gray-500">Financiamento:</span>
                                    <p className="font-medium">{formatCurrency(offer.financiamento)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Condições da Proposta */}
                    {offer.condicoes && offer.condicoes.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3">
                            <h5 className="font-medium text-blue-700 mb-2">Condições da Proposta</h5>
                            <ul className="space-y-1">
                                {offer.condicoes.map((condicao, i) => (
                                    <li key={i} className="flex items-start text-sm">
                                        <CheckCircleIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                                        <span className="text-gray-700">{condicao}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Notas/Observações */}
                    {offer.notas && (
                        <div className="text-sm text-gray-600">
                            <ChatBubbleLeftIcon className="w-4 h-4 inline mr-1" />
                            {offer.notas}
                        </div>
                    )}

                    {/* Histórico de Negociação */}
                    {offerTimeline.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <h5 className="font-medium text-gray-700 mb-2">Histórico de Negociação</h5>
                            <div className="space-y-2">
                                {offerTimeline.map((event, i) => (
                                    <div key={i} className="flex items-center text-sm">
                                        <span className="text-gray-500 mr-2">{formatDate(event.data)}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${event.tipo === 'aceite' ? 'bg-green-100 text-green-700' :
                                                event.tipo === 'rejeicao' ? 'bg-red-100 text-red-700' :
                                                    event.tipo === 'contraproposta' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {event.tipo}
                                        </span>
                                        <span className="ml-2 text-gray-600">{event.descricao}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Documentos Anexados */}
                    {offer.documentos && offer.documentos.length > 0 && (
                        <div>
                            <h5 className="font-medium text-gray-700 mb-2">Documentos</h5>
                            <div className="flex flex-wrap gap-2">
                                {offer.documentos.map((doc, i) => (
                                    <button
                                        key={i}
                                        className="flex items-center px-3 py-1 bg-gray-100 rounded-lg 
                                                 hover:bg-gray-200 text-sm transition-colors"
                                    >
                                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                                        {doc.nome}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2">
                        {offer.status === 'submetida' && (
                            <>
                                <button
                                    onClick={() => onAccept(offer)}
                                    className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-lg 
                                             hover:bg-green-600 text-sm transition-colors"
                                >
                                    <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                                    Aceitar
                                </button>
                                <button
                                    onClick={() => onCounter(offer)}
                                    className="flex-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg 
                                             hover:bg-yellow-600 text-sm transition-colors"
                                >
                                    <ArrowsRightLeftIcon className="w-4 h-4 inline mr-1" />
                                    Contraproposta
                                </button>
                                <button
                                    onClick={() => onReject(offer)}
                                    className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded-lg 
                                             hover:bg-red-600 text-sm transition-colors"
                                >
                                    <XCircleIcon className="w-4 h-4 inline mr-1" />
                                    Rejeitar
                                </button>
                            </>
                        )}

                        {(offer.status === 'rascunho' || offer.status === 'contraproposta') && (
                            <button
                                onClick={() => onEdit(offer)}
                                className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 
                                         rounded-lg hover:bg-gray-50 text-sm transition-colors"
                            >
                                <PencilIcon className="w-4 h-4 inline mr-1" />
                                Editar
                            </button>
                        )}

                        {offer.status === 'aceite' && (
                            <button
                                className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg 
                                         hover:bg-blue-600 text-sm transition-colors"
                            >
                                <ClipboardDocumentCheckIcon className="w-4 h-4 inline mr-1" />
                                Gerar CPCV
                            </button>
                        )}

                        {offer.status !== 'aceite' && (
                            <button
                                onClick={() => onDelete(offer)}
                                className="px-3 py-1.5 border border-red-300 text-red-600 
                                         rounded-lg hover:bg-red-50 text-sm transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente Principal
const OffersTab = ({ data = {}, onChange, opportunityType, clientId, opportunityId }) => {
    const { addOffer, updateOffer, OFFER_STATES: STATES } = useOpportunities();

    // Estado das ofertas e imóveis
    const [offers, setOffers] = useState([]);
    const [properties, setProperties] = useState(data.imoveis || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showCounterForm, setShowCounterForm] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    // Formulário de nova oferta/edição
    const [formData, setFormData] = useState({
        imovelId: '',
        tipo: 'compra', // compra ou arrendamento
        valor: '',
        entrada: '',
        financiamento: '',
        dataSubmissao: new Date().toISOString().split('T')[0],
        validadeAte: '',
        nomeCliente: '',
        condicoes: [],
        notas: '',
        status: 'rascunho'
    });

    // Formulário de contraproposta
    const [counterData, setCounterData] = useState({
        valorContraproposta: '',
        justificativa: '',
        novasCondicoes: []
    });

    // Condições predefinidas
    const CONDICOES_PREDEFINIDAS = [
        'Sujeito a aprovação de crédito',
        'Sujeito a venda de imóvel próprio',
        'Incluir móveis e equipamentos',
        'Obras da responsabilidade do vendedor',
        'Isenção de IMT',
        'Prazo de escritura de 60 dias',
        'Prazo de escritura de 90 dias',
        'Entrada de 10%',
        'Entrada de 20%',
        'Entrada de 30%'
    ];

    // Processar ofertas de todos os imóveis
    useEffect(() => {
        const allOffers = [];
        properties.forEach(property => {
            if (property.ofertas) {
                property.ofertas.forEach(offer => {
                    allOffers.push({
                        ...offer,
                        propertyId: property.id,
                        property: property
                    });
                });
            }
        });
        setOffers(allOffers);
    }, [properties]);

    // Filtrar e ordenar ofertas
    const getFilteredOffers = () => {
        let filtered = [...offers];

        // Aplicar filtro
        if (filter !== 'all') {
            filtered = filtered.filter(offer => offer.status === filter);
        }

        // Ordenar
        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.dataSubmissao) - new Date(a.dataSubmissao);
            } else if (sortBy === 'value') {
                return b.valor - a.valor;
            } else if (sortBy === 'property') {
                return (a.property?.referencia || '').localeCompare(b.property?.referencia || '');
            } else if (sortBy === 'status') {
                return (a.status || '').localeCompare(b.status || '');
            }
            return 0;
        });

        return filtered;
    };

    // Estatísticas
    const getStats = () => {
        const stats = {
            total: offers.length,
            submetidas: offers.filter(o => o.status === 'submetida').length,
            negociacao: offers.filter(o => o.status === 'negociacao' || o.status === 'contraproposta').length,
            aceites: offers.filter(o => o.status === 'aceite').length,
            valorMedio: 0,
            taxaAceitacao: 0
        };

        // Valor médio
        if (offers.length > 0) {
            const totalValor = offers.reduce((acc, o) => acc + (o.valor || 0), 0);
            stats.valorMedio = totalValor / offers.length;
        }

        // Taxa de aceitação
        const finalizadas = offers.filter(o => o.status === 'aceite' || o.status === 'rejeitada');
        if (finalizadas.length > 0) {
            stats.taxaAceitacao = Math.round((stats.aceites / finalizadas.length) * 100);
        }

        return stats;
    };

    // Handlers
    const handleAddOffer = async () => {
        if (!formData.imovelId || !formData.valor) {
            alert('Por favor preencha os campos obrigatórios');
            return;
        }

        try {
            const property = properties.find(p => p.id === formData.imovelId);
            const newOffer = {
                ...formData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                historico: [{
                    data: new Date().toISOString(),
                    tipo: 'criacao',
                    descricao: 'Proposta criada'
                }]
            };

            // Adicionar oferta ao imóvel
            const updatedProperties = properties.map(prop => {
                if (prop.id === formData.imovelId) {
                    return {
                        ...prop,
                        ofertas: [...(prop.ofertas || []), newOffer]
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
            if (opportunityId && clientId && addOffer) {
                await addOffer(clientId, opportunityId, formData.imovelId, newOffer);
            }

            // Reset form
            setFormData({
                imovelId: '',
                tipo: 'compra',
                valor: '',
                entrada: '',
                financiamento: '',
                dataSubmissao: new Date().toISOString().split('T')[0],
                validadeAte: '',
                nomeCliente: '',
                condicoes: [],
                notas: '',
                status: 'rascunho'
            });
            setShowAddForm(false);
        } catch (error) {
            console.error('Erro ao adicionar oferta:', error);
            alert('Erro ao adicionar oferta');
        }
    };

    const handleAcceptOffer = async (offer) => {
        if (!confirm('Tem certeza que deseja aceitar esta proposta?')) return;

        try {
            // Atualizar estado da oferta
            const updatedProperties = properties.map(prop => {
                if (prop.id === offer.propertyId) {
                    return {
                        ...prop,
                        ofertas: prop.ofertas.map(o => {
                            if (o.id === offer.id) {
                                return {
                                    ...o,
                                    status: 'aceite',
                                    dataAceitacao: new Date().toISOString(),
                                    historico: [...(o.historico || []), {
                                        data: new Date().toISOString(),
                                        tipo: 'aceite',
                                        descricao: 'Proposta aceite'
                                    }]
                                };
                            }
                            return o;
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
            console.error('Erro ao aceitar oferta:', error);
            alert('Erro ao aceitar oferta');
        }
    };

    const handleRejectOffer = async (offer) => {
        const motivo = prompt('Motivo da rejeição:');
        if (!motivo) return;

        try {
            // Atualizar estado da oferta
            const updatedProperties = properties.map(prop => {
                if (prop.id === offer.propertyId) {
                    return {
                        ...prop,
                        ofertas: prop.ofertas.map(o => {
                            if (o.id === offer.id) {
                                return {
                                    ...o,
                                    status: 'rejeitada',
                                    dataRejeicao: new Date().toISOString(),
                                    motivoRejeicao: motivo,
                                    historico: [...(o.historico || []), {
                                        data: new Date().toISOString(),
                                        tipo: 'rejeicao',
                                        descricao: `Proposta rejeitada: ${motivo}`
                                    }]
                                };
                            }
                            return o;
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
            console.error('Erro ao rejeitar oferta:', error);
            alert('Erro ao rejeitar oferta');
        }
    };

    const handleCounterOffer = (offer) => {
        setSelectedOffer(offer);
        setCounterData({
            valorContraproposta: offer.valor,
            justificativa: '',
            novasCondicoes: []
        });
        setShowCounterForm(true);
    };

    const handleSaveCounterOffer = async () => {
        if (!counterData.valorContraproposta || !counterData.justificativa) {
            alert('Por favor preencha todos os campos');
            return;
        }

        try {
            // Criar nova oferta de contraproposta
            const counterOffer = {
                ...selectedOffer,
                id: Date.now().toString(),
                valor: parseFloat(counterData.valorContraproposta),
                status: 'contraproposta',
                condicoes: [...(selectedOffer.condicoes || []), ...counterData.novasCondicoes],
                notas: counterData.justificativa,
                dataContraproposta: new Date().toISOString(),
                historico: [...(selectedOffer.historico || []), {
                    data: new Date().toISOString(),
                    tipo: 'contraproposta',
                    descricao: `Contraproposta: €${counterData.valorContraproposta}`
                }]
            };

            // Adicionar contraproposta
            const updatedProperties = properties.map(prop => {
                if (prop.id === selectedOffer.propertyId) {
                    return {
                        ...prop,
                        ofertas: [...prop.ofertas, counterOffer]
                    };
                }
                return prop;
            });

            setProperties(updatedProperties);
            onChange({
                ...data,
                imoveis: updatedProperties
            });

            setShowCounterForm(false);
            setSelectedOffer(null);
        } catch (error) {
            console.error('Erro ao criar contraproposta:', error);
            alert('Erro ao criar contraproposta');
        }
    };

    const handleDeleteOffer = async (offer) => {
        if (!confirm('Tem certeza que deseja eliminar esta proposta?')) return;

        try {
            // Remover oferta
            const updatedProperties = properties.map(prop => {
                if (prop.id === offer.propertyId) {
                    return {
                        ...prop,
                        ofertas: prop.ofertas.filter(o => o.id !== offer.id)
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
            console.error('Erro ao eliminar oferta:', error);
            alert('Erro ao eliminar oferta');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const stats = getStats();
    const filteredOffers = getFilteredOffers();

    return (
        <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <CurrencyEuroIcon className="w-5 h-5 mr-2" />
                        Gestão de Propostas
                    </h3>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white 
                                 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Nova Proposta
                    </button>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-5 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.submetidas}</div>
                        <div className="text-xs text-gray-500">Submetidas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.negociacao}</div>
                        <div className="text-xs text-gray-500">Em Negociação</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.aceites}</div>
                        <div className="text-xs text-gray-500">Aceites</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(stats.valorMedio)}
                        </div>
                        <div className="text-xs text-gray-500">Valor Médio</div>
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
                            Todas ({offers.length})
                        </button>
                        {Object.entries(OFFER_STATE_CONFIG).map(([key, config]) => {
                            const count = offers.filter(o => o.status === key).length;
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
                            <option value="value">Valor</option>
                            <option value="property">Imóvel</option>
                            <option value="status">Estado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de Ofertas */}
            {filteredOffers.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <CurrencyEuroIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                        {filter === 'all'
                            ? 'Ainda não há propostas registadas'
                            : `Não há propostas ${OFFER_STATE_CONFIG[filter]?.label.toLowerCase()}`}
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="text-blue-500 hover:text-blue-600"
                        >
                            Criar primeira proposta
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOffers.map(offer => (
                        <OfferCard
                            key={offer.id}
                            offer={offer}
                            property={offer.property}
                            onEdit={(o) => {
                                setEditingOffer(o);
                                setFormData({
                                    imovelId: o.propertyId,
                                    tipo: o.tipo || 'compra',
                                    valor: o.valor,
                                    entrada: o.entrada || '',
                                    financiamento: o.financiamento || '',
                                    dataSubmissao: o.dataSubmissao,
                                    validadeAte: o.validadeAte || '',
                                    nomeCliente: o.nomeCliente || '',
                                    condicoes: o.condicoes || [],
                                    notas: o.notas || '',
                                    status: o.status
                                });
                                setShowAddForm(true);
                            }}
                            onAccept={handleAcceptOffer}
                            onReject={handleRejectOffer}
                            onCounter={handleCounterOffer}
                            onDelete={handleDeleteOffer}
                        />
                    ))}
                </div>
            )}

            {/* Modal Adicionar/Editar Proposta */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingOffer ? 'Editar Proposta' : 'Nova Proposta'}
                        </h3>

                        <div className="space-y-4">
                            {/* Imóvel e Tipo */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Imóvel *
                                    </label>
                                    <select
                                        value={formData.imovelId}
                                        onChange={(e) => setFormData({ ...formData, imovelId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={editingOffer}
                                    >
                                        <option value="">Selecione um imóvel</option>
                                        {properties.map(prop => (
                                            <option key={prop.id} value={prop.id}>
                                                {prop.referencia} - {prop.tipo} - {formatCurrency(prop.valorPedido || 0)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Negócio
                                    </label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="compra">Compra</option>
                                        <option value="arrendamento">Arrendamento</option>
                                    </select>
                                </div>
                            </div>

                            {/* Valores */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor Proposto *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.valor}
                                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Entrada/Sinal
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.entrada}
                                        onChange={(e) => setFormData({ ...formData, entrada: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Financiamento
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.financiamento}
                                        onChange={(e) => setFormData({ ...formData, financiamento: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Datas */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data de Submissão
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dataSubmissao}
                                        onChange={(e) => setFormData({ ...formData, dataSubmissao: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Válida Até
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.validadeAte}
                                        onChange={(e) => setFormData({ ...formData, validadeAte: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Cliente */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome do Cliente
                                </label>
                                <input
                                    type="text"
                                    value={formData.nomeCliente}
                                    onChange={(e) => setFormData({ ...formData, nomeCliente: e.target.value })}
                                    placeholder="Nome completo do cliente"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Condições */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Condições da Proposta
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {CONDICOES_PREDEFINIDAS.map(cond => (
                                        <button
                                            key={cond}
                                            type="button"
                                            onClick={() => {
                                                const condicoes = formData.condicoes.includes(cond)
                                                    ? formData.condicoes.filter(c => c !== cond)
                                                    : [...formData.condicoes, cond];
                                                setFormData({ ...formData, condicoes });
                                            }}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${formData.condicoes.includes(cond)
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            {cond}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado da Proposta
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="rascunho">Rascunho</option>
                                    <option value="submetida">Submetida</option>
                                </select>
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas/Observações
                                </label>
                                <textarea
                                    value={formData.notas}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                    rows="3"
                                    placeholder="Informações adicionais sobre a proposta..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingOffer(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 
                                         rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddOffer}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                                         hover:bg-blue-600"
                            >
                                {editingOffer ? 'Atualizar' : 'Criar Proposta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Contraproposta */}
            {showCounterForm && selectedOffer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            Criar Contraproposta
                        </h3>

                        <div className="space-y-4">
                            {/* Valores Comparativos */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500">Valor Original:</span>
                                        <p className="text-lg font-semibold">{formatCurrency(selectedOffer.valor)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Valor Contraproposta *
                                        </label>
                                        <input
                                            type="number"
                                            value={counterData.valorContraproposta}
                                            onChange={(e) => setCounterData({ ...counterData, valorContraproposta: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Justificativa */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Justificativa *
                                </label>
                                <textarea
                                    value={counterData.justificativa}
                                    onChange={(e) => setCounterData({ ...counterData, justificativa: e.target.value })}
                                    rows="3"
                                    placeholder="Explique o motivo da contraproposta..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Novas Condições */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Adicionar Novas Condições
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CONDICOES_PREDEFINIDAS.filter(c => !selectedOffer.condicoes?.includes(c)).map(cond => (
                                        <button
                                            key={cond}
                                            type="button"
                                            onClick={() => {
                                                const condicoes = counterData.novasCondicoes.includes(cond)
                                                    ? counterData.novasCondicoes.filter(c => c !== cond)
                                                    : [...counterData.novasCondicoes, cond];
                                                setCounterData({ ...counterData, novasCondicoes: condicoes });
                                            }}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${counterData.novasCondicoes.includes(cond)
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            {cond}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCounterForm(false);
                                    setSelectedOffer(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 
                                         rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveCounterOffer}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg 
                                         hover:bg-yellow-600"
                            >
                                Enviar Contraproposta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OffersTab;