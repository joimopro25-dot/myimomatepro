/**
 * BUYER OPPORTUNITY - Componente específico para Compradores
 * Migrado do OpportunityForm.jsx original com toda a funcionalidade
 * Caminho: src/pages/opportunities/components/BuyerOpportunity.jsx
 */

import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    TrashIcon,
    LinkIcon,
    MapPinIcon,
    PencilIcon,
    ExclamationCircleIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import NegocioPlenoLinker from './NegocioPlenoLinker';

// Estados de Visita
const VISIT_STATES = {
    SCHEDULED: 'agendada',
    CONFIRMED: 'confirmada',
    COMPLETED: 'efetuada',
    CANCELLED: 'cancelada',
    NO_SHOW: 'nao_compareceu'
};

const VISIT_STATE_LABELS = {
    [VISIT_STATES.SCHEDULED]: '📅 Agendada',
    [VISIT_STATES.CONFIRMED]: '✅ Confirmada',
    [VISIT_STATES.COMPLETED]: '✔️ Efetuada',
    [VISIT_STATES.CANCELLED]: '❌ Cancelada',
    [VISIT_STATES.NO_SHOW]: '⚠️ Não Compareceu'
};

// Estados de Oferta
const OFFER_STATES = {
    DRAFT: 'rascunho',
    SUBMITTED: 'submetida',
    NEGOTIATION: 'negociacao',
    COUNTER_OFFER: 'contraproposta',
    ACCEPTED: 'aceite',
    REJECTED: 'rejeitada'
};

const OFFER_STATE_LABELS = {
    [OFFER_STATES.DRAFT]: '📝 Rascunho',
    [OFFER_STATES.SUBMITTED]: '📤 Submetida',
    [OFFER_STATES.NEGOTIATION]: '🤝 Negociação',
    [OFFER_STATES.COUNTER_OFFER]: '↔️ Contraproposta',
    [OFFER_STATES.ACCEPTED]: '✅ Aceite',
    [OFFER_STATES.REJECTED]: '❌ Rejeitada'
};

const BuyerOpportunity = ({
    formData,
    updateFormData,
    handleInputChange,
    clientId,
    opportunityId
}) => {
    // Hooks
    const { currentUser } = useAuth();

    // Estados dos modals
    const [showPropertyForm, setShowPropertyForm] = useState(false);
    const [showVisitForm, setShowVisitForm] = useState(false);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [showCPCVForm, setShowCPCVForm] = useState(false);
    const [showEscrituraForm, setShowEscrituraForm] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [editingVisit, setEditingVisit] = useState(null);
    const [editingOffer, setEditingOffer] = useState(null);
    const [editingProperty, setEditingProperty] = useState(null);
    const [editingCPCV, setEditingCPCV] = useState(null);

    // Novo imóvel
    const [newProperty, setNewProperty] = useState({
        referencia: '',
        tipologia: 'T2',
        area: '',
        casasBanho: 1,
        temSuite: false,
        numeroSuites: 0,
        url: '',
        localizacao: '',
        valorAnunciado: '',
        agenteNome: '',
        agenteTelefone: '',
        agenteEmail: '',
        agenteAgencia: '',
        notas: '',
        visitas: [],
        ofertas: [],
        cpcv: null,
        estadoNegocio: 'prospeção'
    });

    // Nova visita melhorada
    const [newVisit, setNewVisit] = useState({
        data: '',
        hora: '',
        estado: VISIT_STATES.SCHEDULED,
        notas: '',
        feedback: '',
        interesseNivel: 'medio',
        pontosPositivos: '',
        pontosNegativos: '',
        proximosPassos: ''
    });

    // Nova oferta melhorada
    const [newOffer, setNewOffer] = useState({
        valor: '',
        data: '',
        condicoes: '',
        status: OFFER_STATES.DRAFT,
        notas: '',
        isContraproposta: false,
        valorContraproposta: '',
        condicoesContraproposta: '',
        justificacao: ''
    });

    // Dados do CPCV
    const [cpcvData, setCpcvData] = useState({
        numeroContrato: '',
        dataAssinatura: '',
        valorVenda: '',
        sinal: '',
        sinalPercentagem: 10,
        dataEscritura: '',
        financiamento: false,
        banco: '',
        valorCredito: '',
        dipEmitido: false
    });

    // Dados da Escritura
    const [escrituraData, setEscrituraData] = useState({
        dataRealizacao: '',
        notas: ''
    });

    // Função para editar imóvel
    const handleEditProperty = (property) => {
        setEditingProperty(property);
        setNewProperty({
            referencia: property.referencia,
            tipologia: property.tipologia,
            area: property.area,
            casasBanho: property.casasBanho,
            temSuite: property.temSuite,
            numeroSuites: property.numeroSuites,
            url: property.url,
            localizacao: property.localizacao,
            valorAnunciado: property.valorAnunciado,
            agenteNome: property.agenteNome,
            agenteTelefone: property.agenteTelefone,
            agenteEmail: property.agenteEmail,
            agenteAgencia: property.agenteAgencia,
            notas: property.notas,
            visitas: property.visitas || [],
            ofertas: property.ofertas || [],
            cpcv: property.cpcv || null,
            estadoNegocio: property.estadoNegocio || 'prospeção'
        });
        setShowPropertyForm(true);
    };

    // Modificar handleAddProperty para suportar edição
    const handleAddProperty = () => {
        if (!newProperty.referencia) {
            alert('Por favor, adicione uma referência para o imóvel');
            return;
        }

        const property = {
            ...newProperty,
            id: editingProperty ? editingProperty.id : Date.now().toString(),
            createdAt: editingProperty ? editingProperty.createdAt : new Date().toISOString()
        };

        let updatedImoveis;
        if (editingProperty) {
            updatedImoveis = (formData.imoveis || []).map(p =>
                p.id === editingProperty.id ? property : p
            );
        } else {
            updatedImoveis = [...(formData.imoveis || []), property];
        }

        updateFormData({ imoveis: updatedImoveis });

        // Reset form
        setNewProperty({
            referencia: '',
            tipologia: 'T2',
            area: '',
            casasBanho: 1,
            temSuite: false,
            numeroSuites: 0,
            url: '',
            localizacao: '',
            valorAnunciado: '',
            agenteNome: '',
            agenteTelefone: '',
            agenteEmail: '',
            agenteAgencia: '',
            notas: '',
            visitas: [],
            ofertas: [],
            cpcv: null,
            estadoNegocio: 'prospeção'
        });
        setShowPropertyForm(false);
        setEditingProperty(null);
    };

    const handleRemoveProperty = (propertyId) => {
        if (confirm('Tem certeza que deseja remover este imóvel?')) {
            updateFormData({
                imoveis: (formData.imoveis || []).filter(p => p.id !== propertyId)
            });
        }
    };

    // Sistema de Visitas Melhorado
    const handleAddOrUpdateVisit = (propertyId) => {
        if (!newVisit.data || !newVisit.hora) {
            alert('Por favor, preencha data e hora da visita');
            return;
        }

        const visit = {
            ...newVisit,
            id: editingVisit?.id || Date.now().toString(),
            createdAt: editingVisit?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedImoveis = (formData.imoveis || []).map(p => {
            if (p.id === propertyId) {
                let updatedVisitas;
                if (editingVisit) {
                    updatedVisitas = p.visitas.map(v =>
                        v.id === editingVisit.id ? visit : v
                    );
                } else {
                    updatedVisitas = [...p.visitas, visit];
                }

                const estadoNegocio = visit.estado === VISIT_STATES.COMPLETED ? 'visitado' : p.estadoNegocio;

                return { ...p, visitas: updatedVisitas, estadoNegocio };
            }
            return p;
        });

        updateFormData({ imoveis: updatedImoveis });

        // Reset
        setNewVisit({
            data: '',
            hora: '',
            estado: VISIT_STATES.SCHEDULED,
            notas: '',
            feedback: '',
            interesseNivel: 'medio',
            pontosPositivos: '',
            pontosNegativos: '',
            proximosPassos: ''
        });
        setEditingVisit(null);
        setShowVisitForm(false);
        setSelectedProperty(null);
    };

    const handleEditVisit = (property, visit) => {
        setSelectedProperty(property);
        setEditingVisit(visit);
        setNewVisit({
            ...visit
        });
        setShowVisitForm(true);
    };

    // Sistema de Ofertas Melhorado
    const handleAddOrUpdateOffer = (propertyId) => {
        if (!newOffer.valor) {
            alert('Por favor, preencha o valor da oferta');
            return;
        }

        const offer = {
            ...newOffer,
            id: editingOffer?.id || Date.now().toString(),
            createdAt: editingOffer?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedImoveis = (formData.imoveis || []).map(p => {
            if (p.id === propertyId) {
                let updatedOfertas;
                if (editingOffer) {
                    updatedOfertas = p.ofertas.map(o =>
                        o.id === editingOffer.id ? offer : o
                    );
                } else {
                    updatedOfertas = [...p.ofertas, offer];
                }

                let estadoNegocio = p.estadoNegocio;
                if (offer.status === OFFER_STATES.ACCEPTED) {
                    estadoNegocio = 'aceite';
                    setShowCPCVForm(true);
                    setCpcvData(prev => ({
                        ...prev,
                        valorVenda: offer.valor,
                        sinal: (parseFloat(offer.valor) * 0.1).toString()
                    }));
                } else if (offer.status === OFFER_STATES.SUBMITTED) {
                    estadoNegocio = 'proposta';
                } else if (offer.status === OFFER_STATES.NEGOTIATION || offer.status === OFFER_STATES.COUNTER_OFFER) {
                    estadoNegocio = 'negociação';
                }

                return { ...p, ofertas: updatedOfertas, estadoNegocio };
            }
            return p;
        });

        updateFormData({ imoveis: updatedImoveis });

        // Reset
        setNewOffer({
            valor: '',
            data: '',
            condicoes: '',
            status: OFFER_STATES.DRAFT,
            notas: '',
            isContraproposta: false,
            valorContraproposta: '',
            condicoesContraproposta: '',
            justificacao: ''
        });
        setEditingOffer(null);
        setShowOfferForm(false);
        setSelectedProperty(null);
    };

    const handleEditOffer = (property, offer) => {
        setSelectedProperty(property);
        setEditingOffer(offer);
        setNewOffer({
            ...offer
        });
        setShowOfferForm(true);
    };

    // Função para editar CPCV
    const handleEditCPCV = (property) => {
        setEditingCPCV(property);
        setCpcvData({
            numeroContrato: property.cpcv.numeroContrato || '',
            dataAssinatura: property.cpcv.dataAssinatura || '',
            valorVenda: property.cpcv.valorVenda || '',
            sinal: property.cpcv.sinal || '',
            sinalPercentagem: property.cpcv.sinalPercentagem || 10,
            dataEscritura: property.cpcv.dataEscritura || '',
            financiamento: property.cpcv.financiamento || false,
            banco: property.cpcv.banco || '',
            valorCredito: property.cpcv.valorCredito || '',
            dipEmitido: property.cpcv.dipEmitido || false
        });
        setSelectedProperty(property);
        setShowCPCVForm(true);
    };

    // Sistema CPCV
    const handleSaveCPCV = (propertyId) => {
        if (!cpcvData.numeroContrato || !cpcvData.dataAssinatura) {
            alert('Por favor, preencha os dados obrigatórios do CPCV');
            return;
        }

        const updatedImoveis = (formData.imoveis || []).map(p => {
            if (p.id === propertyId) {
                return {
                    ...p,
                    cpcv: cpcvData,
                    estadoNegocio: 'cpcv'
                };
            }
            return p;
        });

        updateFormData({ imoveis: updatedImoveis });

        setShowCPCVForm(false);
        setEditingCPCV(null);
        setSelectedProperty(null);
        setCpcvData({
            numeroContrato: '',
            dataAssinatura: '',
            valorVenda: '',
            sinal: '',
            sinalPercentagem: 10,
            dataEscritura: '',
            financiamento: false,
            banco: '',
            valorCredito: '',
            dipEmitido: false
        });
    };

    // Função para marcar escritura realizada
    const handleMarkEscritura = (propertyId) => {
        if (!escrituraData.dataRealizacao) {
            alert('Por favor, preencha a data de realização da escritura');
            return;
        }

        const updatedImoveis = (formData.imoveis || []).map(p =>
            p.id === propertyId
                ? {
                    ...p,
                    estadoNegocio: 'escritura',
                    escritura: {
                        dataRealizacao: escrituraData.dataRealizacao,
                        notas: escrituraData.notas
                    }
                }
                : p
        );

        updateFormData({ imoveis: updatedImoveis });

        setShowEscrituraForm(false);
        setEscrituraData({
            dataRealizacao: '',
            notas: ''
        });
        setSelectedProperty(null);
    };

    // Atualizar estado de negócio do imóvel
    const handleUpdatePropertyStatus = (propertyId, newStatus) => {
        if (newStatus === 'escritura') {
            setSelectedProperty({ id: propertyId });
            setShowEscrituraForm(true);
        } else {
            const updatedImoveis = (formData.imoveis || []).map(p =>
                p.id === propertyId
                    ? { ...p, estadoNegocio: newStatus }
                    : p
            );
            updateFormData({ imoveis: updatedImoveis });
        }
    };

    // Estado de negócio badges
    const getStatusBadge = (status) => {
        const badges = {
            'prospeção': { color: 'bg-gray-100 text-gray-700', label: 'Prospeção' },
            'visitado': { color: 'bg-blue-100 text-blue-700', label: 'Visitado' },
            'proposta': { color: 'bg-yellow-100 text-yellow-700', label: 'Proposta' },
            'negociação': { color: 'bg-orange-100 text-orange-700', label: 'Negociação' },
            'aceite': { color: 'bg-green-100 text-green-700', label: 'Aceite' },
            'cpcv': { color: 'bg-purple-100 text-purple-700', label: 'CPCV' },
            'escritura': { color: 'bg-indigo-100 text-indigo-700', label: 'Escritura' }
        };
        return badges[status] || badges['prospeção'];
    };

    return (
        <>
            {/* NEGÓCIO PLENO SECTION */}
            <div className="mb-6">
                <NegocioPlenoLinker
                    currentOpportunity={formData}
                    onLink={async (targetOpportunity) => {
                        // Implementar lógica de linking
                        const linkData = {
                            linkedOpportunityId: targetOpportunity.id,
                            linkedOpportunityClientId: targetOpportunity.clienteId,
                            linkedOpportunityClientName: targetOpportunity.clienteName,
                            linkedType: 'comprador_para_vendedor',
                            isNegocioPleno: true,
                            negocioPlenoStatus: 'linkado',
                            negocioPlenoData: {
                                linkedAt: new Date(),
                                linkedBy: currentUser?.uid,
                                lastSync: new Date(),
                                discrepancies: [],
                                totalComissao: 0,
                                comissaoVendedor: 0,
                                comissaoComprador: 0,
                            }
                        };
                        updateFormData(linkData);
                    }}
                    onUnlink={async () => {
                        // Implementar lógica de unlinking
                        updateFormData({
                            linkedOpportunityId: null,
                            linkedOpportunityClientId: null,
                            linkedOpportunityClientName: null,
                            linkedType: null,
                            isNegocioPleno: false,
                            negocioPlenoStatus: null,
                            negocioPlenoData: null
                        });
                    }}
                    onSync={async () => {
                        // Implementar lógica de sincronização
                        console.log('Sincronizando Negócio Pleno...');
                    }}
                />
            </div>

            {/* SEÇÃO DE GESTÃO DE IMÓVEIS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        🏠 Imóveis em Análise ({(formData.imoveis || []).length})
                    </h2>
                    <button
                        type="button"
                        onClick={() => setShowPropertyForm(true)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Adicionar Imóvel
                    </button>
                </div>

                {/* Formulário de Novo/Editar Imóvel */}
                {showPropertyForm && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                            {editingProperty ? 'Editar Imóvel' : 'Novo Imóvel'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Referência *
                                </label>
                                <input
                                    type="text"
                                    value={newProperty.referencia}
                                    onChange={(e) => setNewProperty({ ...newProperty, referencia: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Ex: REF123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipologia
                                </label>
                                <select
                                    value={newProperty.tipologia}
                                    onChange={(e) => setNewProperty({ ...newProperty, tipologia: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="T0">T0</option>
                                    <option value="T1">T1</option>
                                    <option value="T2">T2</option>
                                    <option value="T3">T3</option>
                                    <option value="T4">T4</option>
                                    <option value="T5+">T5+</option>
                                    <option value="Moradia">Moradia</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Área (m²)
                                </label>
                                <input
                                    type="number"
                                    value={newProperty.area}
                                    onChange={(e) => setNewProperty({ ...newProperty, area: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="120"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Valor Anunciado (€)
                                </label>
                                <input
                                    type="number"
                                    value={newProperty.valorAnunciado}
                                    onChange={(e) => setNewProperty({ ...newProperty, valorAnunciado: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="250000"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Localização
                                </label>
                                <input
                                    type="text"
                                    value={newProperty.localizacao}
                                    onChange={(e) => setNewProperty({ ...newProperty, localizacao: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Ex: Centro da cidade, próximo ao metro"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link/URL do Anúncio
                                </label>
                                <input
                                    type="url"
                                    value={newProperty.url}
                                    onChange={(e) => setNewProperty({ ...newProperty, url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <button
                                type="button"
                                onClick={handleAddProperty}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {editingProperty ? 'Salvar Alterações' : 'Adicionar Imóvel'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPropertyForm(false);
                                    setEditingProperty(null);
                                    setNewProperty({
                                        referencia: '',
                                        tipologia: 'T2',
                                        area: '',
                                        casasBanho: 1,
                                        temSuite: false,
                                        numeroSuites: 0,
                                        url: '',
                                        localizacao: '',
                                        valorAnunciado: '',
                                        agenteNome: '',
                                        agenteTelefone: '',
                                        agenteEmail: '',
                                        agenteAgencia: '',
                                        notas: '',
                                        visitas: [],
                                        ofertas: [],
                                        cpcv: null,
                                        estadoNegocio: 'prospeção'
                                    });
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de Imóveis */}
                <div className="space-y-4">
                    {(formData.imoveis || []).map((property) => (
                        <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            {/* Header do Imóvel */}
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {property.referencia} - {property.tipologia}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(property.estadoNegocio).color}`}>
                                            {getStatusBadge(property.estadoNegocio).label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <MapPinIcon className="w-4 h-4 inline mr-1" />
                                        {property.localizacao}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEditProperty(property)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                        title="Editar imóvel"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveProperty(property.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        title="Remover imóvel"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Info do Imóvel */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                                <div>
                                    <span className="text-gray-500">Área:</span>
                                    <span className="ml-1 font-medium">{property.area}m²</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Valor:</span>
                                    <span className="ml-1 font-medium text-green-600">
                                        €{parseFloat(property.valorAnunciado || 0).toLocaleString('pt-PT')}
                                    </span>
                                </div>
                                {property.url && (
                                    <div className="md:col-span-2">
                                        <a
                                            href={property.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 inline-flex items-center"
                                        >
                                            <LinkIcon className="w-3 h-3 mr-1" />
                                            Ver anúncio
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Sistema de Visitas */}
                            <div className="border-t pt-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        📅 Visitas ({property.visitas.length})
                                    </span>
                                    {selectedProperty?.id === property.id && showVisitForm && !editingVisit ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowVisitForm(false);
                                                setSelectedProperty(null);
                                            }}
                                            className="text-xs text-red-600"
                                        >
                                            Cancelar
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedProperty(property);
                                                setShowVisitForm(true);
                                                setEditingVisit(null);
                                                setNewVisit({
                                                    data: '',
                                                    hora: '',
                                                    estado: VISIT_STATES.SCHEDULED,
                                                    notas: '',
                                                    feedback: '',
                                                    interesseNivel: 'medio',
                                                    pontosPositivos: '',
                                                    pontosNegativos: '',
                                                    proximosPassos: ''
                                                });
                                            }}
                                            className="text-xs text-blue-600"
                                        >
                                            + Agendar Visita
                                        </button>
                                    )}
                                </div>

                                {/* Formulário de Visita */}
                                {selectedProperty?.id === property.id && showVisitForm && (
                                    <div className="bg-blue-50 rounded p-3 mb-2">
                                        <h4 className="font-medium text-sm mb-2">
                                            {editingVisit ? 'Editar Visita' : 'Nova Visita'}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                value={newVisit.data}
                                                onChange={(e) => setNewVisit({ ...newVisit, data: e.target.value })}
                                                className="px-2 py-1 text-sm border rounded"
                                            />
                                            <input
                                                type="time"
                                                value={newVisit.hora}
                                                onChange={(e) => setNewVisit({ ...newVisit, hora: e.target.value })}
                                                className="px-2 py-1 text-sm border rounded"
                                            />
                                            <select
                                                value={newVisit.estado}
                                                onChange={(e) => setNewVisit({ ...newVisit, estado: e.target.value })}
                                                className="px-2 py-1 text-sm border rounded col-span-2"
                                            >
                                                {Object.entries(VISIT_STATE_LABELS).map(([state, label]) => (
                                                    <option key={state} value={state}>{label}</option>
                                                ))}
                                            </select>

                                            {newVisit.estado === VISIT_STATES.COMPLETED && (
                                                <>
                                                    <div className="col-span-2 border-t pt-2 mt-2">
                                                        <label className="text-xs font-medium text-gray-600">Feedback da Visita</label>
                                                    </div>
                                                    <select
                                                        value={newVisit.interesseNivel}
                                                        onChange={(e) => setNewVisit({ ...newVisit, interesseNivel: e.target.value })}
                                                        className="px-2 py-1 text-sm border rounded col-span-2"
                                                    >
                                                        <option value="sem_interesse">😐 Sem Interesse</option>
                                                        <option value="baixo">😔 Baixo Interesse</option>
                                                        <option value="medio">🙂 Médio Interesse</option>
                                                        <option value="alto">😊 Alto Interesse</option>
                                                        <option value="muito_alto">🤩 Muito Alto Interesse</option>
                                                    </select>
                                                    <textarea
                                                        value={newVisit.pontosPositivos}
                                                        onChange={(e) => setNewVisit({ ...newVisit, pontosPositivos: e.target.value })}
                                                        className="px-2 py-1 text-sm border rounded col-span-2"
                                                        rows={2}
                                                        placeholder="Pontos positivos..."
                                                    />
                                                    <textarea
                                                        value={newVisit.pontosNegativos}
                                                        onChange={(e) => setNewVisit({ ...newVisit, pontosNegativos: e.target.value })}
                                                        className="px-2 py-1 text-sm border rounded col-span-2"
                                                        rows={2}
                                                        placeholder="Pontos negativos..."
                                                    />
                                                    <textarea
                                                        value={newVisit.proximosPassos}
                                                        onChange={(e) => setNewVisit({ ...newVisit, proximosPassos: e.target.value })}
                                                        className="px-2 py-1 text-sm border rounded col-span-2"
                                                        rows={2}
                                                        placeholder="Próximos passos..."
                                                    />
                                                </>
                                            )}

                                            <textarea
                                                value={newVisit.notas}
                                                onChange={(e) => setNewVisit({ ...newVisit, notas: e.target.value })}
                                                className="px-2 py-1 text-sm border rounded col-span-2"
                                                rows={2}
                                                placeholder="Notas gerais..."
                                            />
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAddOrUpdateVisit(property.id)}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                            >
                                                {editingVisit ? 'Atualizar' : 'Adicionar'} Visita
                                            </button>
                                            {editingVisit && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingVisit(null);
                                                        setShowVisitForm(false);
                                                        setNewVisit({
                                                            data: '',
                                                            hora: '',
                                                            estado: VISIT_STATES.SCHEDULED,
                                                            notas: '',
                                                            feedback: '',
                                                            interesseNivel: 'medio',
                                                            pontosPositivos: '',
                                                            pontosNegativos: '',
                                                            proximosPassos: ''
                                                        });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                                                >
                                                    Cancelar Edição
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Lista de visitas */}
                                {property.visitas.map((visit) => (
                                    <div key={visit.id} className="flex items-center justify-between text-xs bg-white rounded p-2 mb-1">
                                        <div className="flex-1">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-2 ${visit.estado === VISIT_STATES.COMPLETED ? 'bg-green-100 text-green-700' :
                                                visit.estado === VISIT_STATES.CANCELLED ? 'bg-red-100 text-red-700' :
                                                    visit.estado === VISIT_STATES.CONFIRMED ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {VISIT_STATE_LABELS[visit.estado]?.split(' ')[0]}
                                            </span>
                                            {visit.data} às {visit.hora}
                                            {visit.interesseNivel === 'muito_alto' && ' 🤩'}
                                            {visit.interesseNivel === 'alto' && ' 😊'}
                                            {visit.interesseNivel === 'medio' && ' 🙂'}
                                            {visit.interesseNivel === 'baixo' && ' 😔'}
                                            {visit.feedback && <ChatBubbleLeftRightIcon className="w-3 h-3 inline ml-1 text-gray-400" />}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleEditVisit(property, visit)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <PencilIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Sistema de Ofertas */}
                            <div className="border-t pt-3 mt-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        💶 Ofertas/Propostas ({property.ofertas.length})
                                    </span>
                                    {selectedProperty?.id === property.id && showOfferForm && !editingOffer ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowOfferForm(false);
                                                setSelectedProperty(null);
                                            }}
                                            className="text-xs text-red-600"
                                        >
                                            Cancelar
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedProperty(property);
                                                setShowOfferForm(true);
                                                setEditingOffer(null);
                                                setNewOffer({
                                                    valor: '',
                                                    data: '',
                                                    condicoes: '',
                                                    status: OFFER_STATES.DRAFT,
                                                    notas: '',
                                                    isContraproposta: false,
                                                    valorContraproposta: '',
                                                    condicoesContraproposta: '',
                                                    justificacao: ''
                                                });
                                            }}
                                            className="text-xs text-green-600"
                                        >
                                            + Nova Oferta
                                        </button>
                                    )}
                                </div>

                                {/* Formulário de Oferta */}
                                {selectedProperty?.id === property.id && showOfferForm && (
                                    <div className="bg-green-50 rounded p-3 mb-2">
                                        <h4 className="font-medium text-sm mb-2">
                                            {editingOffer ? 'Editar Oferta' : 'Nova Oferta'}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                value={newOffer.valor}
                                                onChange={(e) => setNewOffer({ ...newOffer, valor: e.target.value })}
                                                className="px-2 py-1 text-sm border rounded"
                                                placeholder="Valor €"
                                            />
                                            <input
                                                type="date"
                                                value={newOffer.data}
                                                onChange={(e) => setNewOffer({ ...newOffer, data: e.target.value })}
                                                className="px-2 py-1 text-sm border rounded"
                                            />
                                            <select
                                                value={newOffer.status}
                                                onChange={(e) => setNewOffer({ ...newOffer, status: e.target.value })}
                                                className="px-2 py-1 text-sm border rounded col-span-2"
                                            >
                                                {Object.entries(OFFER_STATE_LABELS).map(([state, label]) => (
                                                    <option key={state} value={state}>{label}</option>
                                                ))}
                                            </select>

                                            {newOffer.status === OFFER_STATES.COUNTER_OFFER && (
                                                <>
                                                    <div className="col-span-2 border-t pt-2 mt-2">
                                                        <label className="text-xs font-medium text-gray-600">Dados da Contraproposta</label>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={newOffer.valorContraproposta}
                                                        onChange={(e) => setNewOffer({ ...newOffer, valorContraproposta: e.target.value })}
                                                        className="px-2 py-1 text-sm border rounded col-span-2"
                                                        placeholder="Valor contraproposta €"
                                                    />
                                                    <textarea
                                                        value={newOffer.condicoesContraproposta}
                                                        onChange={(e) => setNewOffer({ ...newOffer, condicoesContraproposta: e.target.value })}
                                                        className="px-2 py-1 text-sm border rounded col-span-2"
                                                        rows={2}
                                                        placeholder="Condições da contraproposta..."
                                                    />
                                                    <textarea
                                                        value={newOffer.justificacao}
                                                        onChange={(e) => setNewOffer({ ...newOffer, justificacao: e.target.value })}
                                                        className="px-2 py-1 text-sm border rounded col-span-2"
                                                        rows={2}
                                                        placeholder="Justificação..."
                                                    />
                                                </>
                                            )}

                                            <textarea
                                                value={newOffer.condicoes}
                                                onChange={(e) => setNewOffer({ ...newOffer, condicoes: e.target.value })}
                                                className="px-2 py-1 text-sm border rounded col-span-2"
                                                rows={2}
                                                placeholder="Condições gerais..."
                                            />
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAddOrUpdateOffer(property.id)}
                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                            >
                                                {editingOffer ? 'Atualizar' : 'Adicionar'} Oferta
                                            </button>
                                            {editingOffer && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingOffer(null);
                                                        setShowOfferForm(false);
                                                        setNewOffer({
                                                            valor: '',
                                                            data: '',
                                                            condicoes: '',
                                                            status: OFFER_STATES.DRAFT,
                                                            notas: '',
                                                            isContraproposta: false,
                                                            valorContraproposta: '',
                                                            condicoesContraproposta: '',
                                                            justificacao: ''
                                                        });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                                                >
                                                    Cancelar Edição
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Lista de ofertas */}
                                {property.ofertas.map((offer) => (
                                    <div key={offer.id} className="flex items-center justify-between text-xs bg-white rounded p-2 mb-1">
                                        <div className="flex-1">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-2 ${offer.status === OFFER_STATES.ACCEPTED ? 'bg-green-100 text-green-700' :
                                                offer.status === OFFER_STATES.REJECTED ? 'bg-red-100 text-red-700' :
                                                    offer.status === OFFER_STATES.NEGOTIATION ? 'bg-orange-100 text-orange-700' :
                                                        offer.status === OFFER_STATES.COUNTER_OFFER ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                }`}>
                                                {OFFER_STATE_LABELS[offer.status]?.split(' ')[0]}
                                            </span>
                                            €{parseFloat(offer.valor || 0).toLocaleString('pt-PT')}
                                            {offer.valorContraproposta && ` → €${parseFloat(offer.valorContraproposta).toLocaleString('pt-PT')}`}
                                            {offer.data && ` em ${offer.data}`}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleEditOffer(property, offer)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <PencilIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Sistema CPCV */}
                            {property.ofertas.some(o => o.status === OFFER_STATES.ACCEPTED) && !property.cpcv && (
                                <div className="border-t mt-3 pt-3">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                                        <p className="text-xs text-yellow-800 flex items-center">
                                            <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                                            Proposta aceite - Criar CPCV
                                        </p>
                                    </div>
                                    {showCPCVForm && selectedProperty?.id === property.id ? (
                                        <div className="bg-purple-50 rounded p-3">
                                            <h4 className="font-medium text-sm mb-2">📋 Dados do CPCV</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={cpcvData.numeroContrato}
                                                    onChange={(e) => setCpcvData({ ...cpcvData, numeroContrato: e.target.value })}
                                                    className="px-2 py-1 text-sm border rounded"
                                                    placeholder="Nº Contrato"
                                                />
                                                <input
                                                    type="date"
                                                    value={cpcvData.dataAssinatura}
                                                    onChange={(e) => setCpcvData({ ...cpcvData, dataAssinatura: e.target.value })}
                                                    className="px-2 py-1 text-sm border rounded"
                                                />
                                                <input
                                                    type="number"
                                                    value={cpcvData.valorVenda}
                                                    onChange={(e) => setCpcvData({ ...cpcvData, valorVenda: e.target.value })}
                                                    className="px-2 py-1 text-sm border rounded"
                                                    placeholder="Valor Venda €"
                                                />
                                                <input
                                                    type="number"
                                                    value={cpcvData.sinal}
                                                    onChange={(e) => setCpcvData({ ...cpcvData, sinal: e.target.value })}
                                                    className="px-2 py-1 text-sm border rounded"
                                                    placeholder="Sinal €"
                                                />
                                                <input
                                                    type="date"
                                                    value={cpcvData.dataEscritura}
                                                    onChange={(e) => setCpcvData({ ...cpcvData, dataEscritura: e.target.value })}
                                                    className="px-2 py-1 text-sm border rounded col-span-2"
                                                />
                                                <div className="col-span-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={cpcvData.financiamento}
                                                            onChange={(e) => setCpcvData({ ...cpcvData, financiamento: e.target.checked })}
                                                            className="rounded border-gray-300 text-blue-600 mr-2"
                                                        />
                                                        <span className="text-sm">Necessita Financiamento</span>
                                                    </label>
                                                </div>
                                                {cpcvData.financiamento && (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={cpcvData.banco}
                                                            onChange={(e) => setCpcvData({ ...cpcvData, banco: e.target.value })}
                                                            className="px-2 py-1 text-sm border rounded"
                                                            placeholder="Banco"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={cpcvData.valorCredito}
                                                            onChange={(e) => setCpcvData({ ...cpcvData, valorCredito: e.target.value })}
                                                            className="px-2 py-1 text-sm border rounded"
                                                            placeholder="Valor Crédito €"
                                                        />
                                                        <div className="col-span-2">
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={cpcvData.dipEmitido}
                                                                    onChange={(e) => setCpcvData({ ...cpcvData, dipEmitido: e.target.checked })}
                                                                    className="rounded border-gray-300 text-blue-600 mr-2"
                                                                />
                                                                <span className="text-sm">DIP Emitido</span>
                                                            </label>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveCPCV(property.id)}
                                                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                                                >
                                                    Guardar CPCV
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowCPCVForm(false);
                                                        setEditingCPCV(null);
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedProperty(property);
                                                setShowCPCVForm(true);
                                                setCpcvData(prev => ({
                                                    ...prev,
                                                    valorVenda: property.ofertas.find(o => o.status === OFFER_STATES.ACCEPTED)?.valor || ''
                                                }));
                                            }}
                                            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center gap-1"
                                        >
                                            <DocumentTextIcon className="w-4 h-4" />
                                            Criar CPCV
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Formulário de edição do CPCV */}
                            {showCPCVForm && selectedProperty?.id === property.id && editingCPCV && property.cpcv && (
                                <div className="border-t mt-3 pt-3 bg-purple-50 rounded p-3">
                                    <h4 className="font-medium text-sm mb-2">📋 Editar CPCV</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            value={cpcvData.numeroContrato}
                                            onChange={(e) => setCpcvData({ ...cpcvData, numeroContrato: e.target.value })}
                                            className="px-2 py-1 text-sm border rounded"
                                            placeholder="Nº Contrato"
                                        />
                                        <input
                                            type="date"
                                            value={cpcvData.dataAssinatura}
                                            onChange={(e) => setCpcvData({ ...cpcvData, dataAssinatura: e.target.value })}
                                            className="px-2 py-1 text-sm border rounded"
                                        />
                                        <input
                                            type="number"
                                            value={cpcvData.valorVenda}
                                            onChange={(e) => setCpcvData({ ...cpcvData, valorVenda: e.target.value })}
                                            className="px-2 py-1 text-sm border rounded"
                                            placeholder="Valor Venda €"
                                        />
                                        <input
                                            type="number"
                                            value={cpcvData.sinal}
                                            onChange={(e) => setCpcvData({ ...cpcvData, sinal: e.target.value })}
                                            className="px-2 py-1 text-sm border rounded"
                                            placeholder="Sinal €"
                                        />
                                        <input
                                            type="date"
                                            value={cpcvData.dataEscritura}
                                            onChange={(e) => setCpcvData({ ...cpcvData, dataEscritura: e.target.value })}
                                            className="px-2 py-1 text-sm border rounded col-span-2"
                                        />
                                        <div className="col-span-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={cpcvData.financiamento}
                                                    onChange={(e) => setCpcvData({ ...cpcvData, financiamento: e.target.checked })}
                                                    className="rounded border-gray-300 text-blue-600 mr-2"
                                                />
                                                <span className="text-sm">Necessita Financiamento</span>
                                            </label>
                                        </div>
                                        {cpcvData.financiamento && (
                                            <>
                                                <input
                                                    type="text"
                                                    value={cpcvData.banco}
                                                    onChange={(e) => setCpcvData({ ...cpcvData, banco: e.target.value })}
                                                    className="px-2 py-1 text-sm border rounded"
                                                    placeholder="Banco"
                                                />
                                                <input
                                                    type="number"
                                                    value={cpcvData.valorCredito}
                                                    onChange={(e) => setCpcvData({ ...cpcvData, valorCredito: e.target.value })}
                                                    className="px-2 py-1 text-sm border rounded"
                                                    placeholder="Valor Crédito €"
                                                />
                                                <div className="col-span-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={cpcvData.dipEmitido}
                                                            onChange={(e) => setCpcvData({ ...cpcvData, dipEmitido: e.target.checked })}
                                                            className="rounded border-gray-300 text-blue-600 mr-2"
                                                        />
                                                        <span className="text-sm">DIP Emitido</span>
                                                    </label>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleSaveCPCV(property.id)}
                                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                                        >
                                            Salvar Alterações
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCPCVForm(false);
                                                setEditingCPCV(null);
                                                setSelectedProperty(null);
                                            }}
                                            className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Mostrar dados do CPCV se existir */}
                            {property.cpcv && (!showCPCVForm || selectedProperty?.id !== property.id || !editingCPCV) && (
                                <div className="border-t mt-3 pt-3">
                                    <div className="bg-purple-50 rounded p-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-purple-900 mb-1">
                                                    📋 CPCV - {property.cpcv.numeroContrato}
                                                </p>
                                                <div className="text-xs text-purple-700 space-y-1">
                                                    <p>Assinatura: {property.cpcv.dataAssinatura}</p>
                                                    <p>Valor: €{parseFloat(property.cpcv.valorVenda || 0).toLocaleString('pt-PT')}</p>
                                                    <p>Sinal: €{parseFloat(property.cpcv.sinal || 0).toLocaleString('pt-PT')}</p>
                                                    <p>Escritura: {property.cpcv.dataEscritura}</p>
                                                    {property.cpcv.dipEmitido && (
                                                        <p className="text-green-700">✓ DIP Emitido</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleEditCPCV(property)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Editar CPCV"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {!property.escritura && (
                                            <button
                                                type="button"
                                                onClick={() => handleUpdatePropertyStatus(property.id, 'escritura')}
                                                className="mt-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                                            >
                                                Marcar Escritura Realizada
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Mostrar dados da escritura se existir */}
                            {property.escritura && (
                                <div className="border-t mt-3 pt-3">
                                    <div className="bg-indigo-50 rounded p-2">
                                        <p className="text-sm font-medium text-indigo-900 mb-1">
                                            ✅ Escritura Realizada
                                        </p>
                                        <div className="text-xs text-indigo-700 space-y-1">
                                            <p>Data: {property.escritura.dataRealizacao}</p>
                                            {property.escritura.notas && (
                                                <p>Notas: {property.escritura.notas}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {(!formData.imoveis || formData.imoveis.length === 0) && (
                        <p className="text-center text-gray-500 py-8">
                            Nenhum imóvel adicionado ainda.
                            <br />
                            <span className="text-sm">Adicione imóveis que o cliente está a considerar.</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Modal para Escritura */}
            {showEscrituraForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Marcar Escritura Realizada</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Realização da Escritura *
                                </label>
                                <input
                                    type="date"
                                    value={escrituraData.dataRealizacao}
                                    onChange={(e) => setEscrituraData({ ...escrituraData, dataRealizacao: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas
                                </label>
                                <textarea
                                    value={escrituraData.notas}
                                    onChange={(e) => setEscrituraData({ ...escrituraData, notas: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    rows={4}
                                    placeholder="Observações sobre a escritura..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => handleMarkEscritura(selectedProperty.id)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Confirmar Escritura
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowEscrituraForm(false);
                                    setEscrituraData({ dataRealizacao: '', notas: '' });
                                    setSelectedProperty(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BuyerOpportunity;