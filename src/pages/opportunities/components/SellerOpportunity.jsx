/**
 * SELLER OPPORTUNITY - Componente específico para Vendedores
 * Gestão completa de imóveis para venda
 * Caminho: src/pages/opportunities/components/SellerOpportunity.jsx
 */

import React, { useState, useEffect } from 'react';
import {
    HomeIcon,
    DocumentTextIcon,
    CameraIcon,
    MegaphoneIcon,
    UserGroupIcon,
    CurrencyEuroIcon,
    CalendarIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    ClockIcon,
    EyeIcon,
    DocumentCheckIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import NegocioPlenoLinker from './NegocioPlenoLinker';

// Estados de Documentação
const DOC_STATUS = {
    NOT_STARTED: 'nao_iniciado',
    REQUESTED: 'solicitado',
    IN_PROGRESS: 'em_andamento',
    COMPLETED: 'completo',
    EXPIRED: 'expirado'
};

const DOC_STATUS_LABELS = {
    [DOC_STATUS.NOT_STARTED]: '⏸️ Não Iniciado',
    [DOC_STATUS.REQUESTED]: '📨 Solicitado',
    [DOC_STATUS.IN_PROGRESS]: '⏳ Em Andamento',
    [DOC_STATUS.COMPLETED]: '✅ Completo',
    [DOC_STATUS.EXPIRED]: '⚠️ Expirado'
};

// Estados de Marketing
const MARKETING_CHANNELS = {
    IDEALISTA: 'idealista',
    IMOVIRTUAL: 'imovirtual',
    CASA_SAPO: 'casa_sapo',
    OLX: 'olx',
    FACEBOOK: 'facebook',
    INSTAGRAM: 'instagram',
    WEBSITE: 'website',
    LOJA: 'loja_fisica',
    NETWORK: 'rede_contactos'
};

const MARKETING_LABELS = {
    [MARKETING_CHANNELS.IDEALISTA]: '🏠 Idealista',
    [MARKETING_CHANNELS.IMOVIRTUAL]: '🏘️ Imovirtual',
    [MARKETING_CHANNELS.CASA_SAPO]: '🐸 Casa Sapo',
    [MARKETING_CHANNELS.OLX]: '📢 OLX',
    [MARKETING_CHANNELS.FACEBOOK]: '👥 Facebook',
    [MARKETING_CHANNELS.INSTAGRAM]: '📷 Instagram',
    [MARKETING_CHANNELS.WEBSITE]: '🌐 Website',
    [MARKETING_CHANNELS.LOJA]: '🏪 Loja Física',
    [MARKETING_CHANNELS.NETWORK]: '🤝 Rede de Contactos'
};

// Estados de Visita de Compradores
const BUYER_VISIT_STATUS = {
    SCHEDULED: 'agendada',
    CONFIRMED: 'confirmada',
    COMPLETED: 'realizada',
    INTERESTED: 'interessado',
    NOT_INTERESTED: 'nao_interessado',
    SECOND_VISIT: 'segunda_visita',
    CANCELLED: 'cancelada'
};

const BUYER_VISIT_LABELS = {
    [BUYER_VISIT_STATUS.SCHEDULED]: '📅 Agendada',
    [BUYER_VISIT_STATUS.CONFIRMED]: '✅ Confirmada',
    [BUYER_VISIT_STATUS.COMPLETED]: '✔️ Realizada',
    [BUYER_VISIT_STATUS.INTERESTED]: '💚 Interessado',
    [BUYER_VISIT_STATUS.NOT_INTERESTED]: '❌ Não Interessado',
    [BUYER_VISIT_STATUS.SECOND_VISIT]: '🔄 2ª Visita',
    [BUYER_VISIT_STATUS.CANCELLED]: '🚫 Cancelada'
};

// Estados de Oferta Recebida
const RECEIVED_OFFER_STATUS = {
    RECEIVED: 'recebida',
    UNDER_ANALYSIS: 'em_analise',
    COUNTER_PROPOSED: 'contraproposta',
    ACCEPTED: 'aceite',
    REJECTED: 'rejeitada',
    EXPIRED: 'expirada'
};

const RECEIVED_OFFER_LABELS = {
    [RECEIVED_OFFER_STATUS.RECEIVED]: '📥 Recebida',
    [RECEIVED_OFFER_STATUS.UNDER_ANALYSIS]: '🔍 Em Análise',
    [RECEIVED_OFFER_STATUS.COUNTER_PROPOSED]: '↔️ Contraproposta',
    [RECEIVED_OFFER_STATUS.ACCEPTED]: '✅ Aceite',
    [RECEIVED_OFFER_STATUS.REJECTED]: '❌ Rejeitada',
    [RECEIVED_OFFER_STATUS.EXPIRED]: '⏰ Expirada'
};

const SellerOpportunity = ({
    formData,
    updateFormData,
    handleInputChange,
    clientId,
    opportunityId
}) => {
    // Hooks
    const { currentUser } = useAuth();

    // Estado do imóvel para venda (único, não array)
    const [propertyData, setPropertyData] = useState({
        // Identificação
        referencia: '',
        titulo: '',

        // Localização
        morada: '',
        codigoPostal: '',
        cidade: '',
        freguesia: '',
        zona: '',

        // Características
        tipologia: '',
        areaBruta: '',
        areaUtil: '',
        anoConstrucao: '',
        numQuartos: '',
        numCasasBanho: '',
        numPisos: '',
        garagem: false,
        numLugaresGaragem: '',
        elevador: false,
        varanda: false,
        terraco: false,
        jardim: false,
        piscina: false,

        // Avaliação e Preço
        valorAvaliacao: '',
        dataAvaliacao: '',
        entidadeAvaliadora: '',
        precoVenda: '',
        precoMinimo: '',
        margemNegociacao: '',

        // Documentação
        documentos: {
            certidaoEnergetica: { status: DOC_STATUS.NOT_STARTED, validade: '', ficheiro: null },
            cadernetaPredial: { status: DOC_STATUS.NOT_STARTED, ficheiro: null },
            certidaoPermanente: { status: DOC_STATUS.NOT_STARTED, ficheiro: null },
            licencaHabitabilidade: { status: DOC_STATUS.NOT_STARTED, ficheiro: null },
            plantaImovel: { status: DOC_STATUS.NOT_STARTED, ficheiro: null },
            fichaTesouro: { status: DOC_STATUS.NOT_STARTED, ficheiro: null }
        },

        // Marketing
        canaisMarketing: [],
        dataInicioMarketing: '',
        fotosRealizadas: false,
        dataFotos: '',
        videoRealizado: false,
        tourVirtual: false,
        descricaoMarketing: '',
        pontosFortesMarketing: [],

        // Visitas de Compradores
        visitasCompradores: [],

        // Ofertas Recebidas
        ofertasRecebidas: [],

        // CPCV
        cpcvAssinado: false,
        dataCPCV: '',
        valorCPCV: '',
        sinalPago: false,
        valorSinal: '',
        dataSinal: '',

        // Escritura
        escrituraRealizada: false,
        dataEscritura: '',
        notario: '',
        valorFinalVenda: '',

        // Notas
        observacoes: ''
    });

    // Estados dos modals
    const [showDocModal, setShowDocModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showMarketingModal, setShowMarketingModal] = useState(false);
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [showCPCVModal, setShowCPCVModal] = useState(false);
    const [showEscrituraModal, setShowEscrituraModal] = useState(false);

    // Estado para edição
    const [editingVisit, setEditingVisit] = useState(null);
    const [editingOffer, setEditingOffer] = useState(null);

    // Inicialização
    useEffect(() => {
        if (formData.imovelVenda) {
            setPropertyData(formData.imovelVenda);
        }
    }, [formData.imovelVenda]);

    // Atualiza o formData quando propertyData muda
    useEffect(() => {
        updateFormData({ imovelVenda: propertyData });
    }, [propertyData]);

    // Handlers
    const handlePropertyChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPropertyData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDocStatusUpdate = (docType, updates) => {
        setPropertyData(prev => ({
            ...prev,
            documentos: {
                ...prev.documentos,
                [docType]: {
                    ...prev.documentos[docType],
                    ...updates
                }
            }
        }));
    };

    const handleMarketingChannelToggle = (channel) => {
        setPropertyData(prev => ({
            ...prev,
            canaisMarketing: prev.canaisMarketing.includes(channel)
                ? prev.canaisMarketing.filter(c => c !== channel)
                : [...prev.canaisMarketing, channel]
        }));
    };

    const handleAddPontoForte = () => {
        const ponto = prompt('Adicionar ponto forte para marketing:');
        if (ponto) {
            setPropertyData(prev => ({
                ...prev,
                pontosFortesMarketing: [...prev.pontosFortesMarketing, ponto]
            }));
        }
    };

    const handleRemovePontoForte = (index) => {
        setPropertyData(prev => ({
            ...prev,
            pontosFortesMarketing: prev.pontosFortesMarketing.filter((_, i) => i !== index)
        }));
    };

    const handleAddVisit = (visitData) => {
        const newVisit = {
            id: Date.now().toString(),
            ...visitData,
            dataRegisto: new Date().toISOString()
        };

        setPropertyData(prev => ({
            ...prev,
            visitasCompradores: [...prev.visitasCompradores, newVisit]
        }));
        setShowVisitModal(false);
    };

    const handleUpdateVisit = (visitId, updates) => {
        setPropertyData(prev => ({
            ...prev,
            visitasCompradores: prev.visitasCompradores.map(v =>
                v.id === visitId ? { ...v, ...updates } : v
            )
        }));
    };

    const handleDeleteVisit = (visitId) => {
        if (window.confirm('Tem certeza que deseja remover esta visita?')) {
            setPropertyData(prev => ({
                ...prev,
                visitasCompradores: prev.visitasCompradores.filter(v => v.id !== visitId)
            }));
        }
    };

    const handleAddOffer = (offerData) => {
        const newOffer = {
            id: Date.now().toString(),
            ...offerData,
            dataRecebimento: new Date().toISOString()
        };

        setPropertyData(prev => ({
            ...prev,
            ofertasRecebidas: [...prev.ofertasRecebidas, newOffer]
        }));
        setShowOfferModal(false);
    };

    const handleUpdateOffer = (offerId, updates) => {
        setPropertyData(prev => ({
            ...prev,
            ofertasRecebidas: prev.ofertasRecebidas.map(o =>
                o.id === offerId ? { ...o, ...updates } : o
            )
        }));
    };

    const handleDeleteOffer = (offerId) => {
        if (window.confirm('Tem certeza que deseja remover esta oferta?')) {
            setPropertyData(prev => ({
                ...prev,
                ofertasRecebidas: prev.ofertasRecebidas.filter(o => o.id !== offerId)
            }));
        }
    };

    const handleMarkCPCV = (cpcvData) => {
        setPropertyData(prev => ({
            ...prev,
            cpcvAssinado: true,
            ...cpcvData
        }));
        setShowCPCVModal(false);
    };

    const handleMarkEscritura = (escrituraData) => {
        setPropertyData(prev => ({
            ...prev,
            escrituraRealizada: true,
            ...escrituraData
        }));
        setShowEscrituraModal(false);
    };

    // Cálculos
    const calculateComissao = () => {
        if (propertyData.valorFinalVenda) {
            const valor = parseFloat(propertyData.valorFinalVenda);
            const percentual = parseFloat(formData.percentualComissao || 5);
            return (valor * percentual / 100).toFixed(2);
        }
        return '0.00';
    };

    const getPropertyStatus = () => {
        if (propertyData.escrituraRealizada) return { label: '✅ Vendido', color: 'green' };
        if (propertyData.cpcvAssinado) return { label: '📝 CPCV Assinado', color: 'blue' };
        if (propertyData.ofertasRecebidas.some(o => o.status === RECEIVED_OFFER_STATUS.ACCEPTED))
            return { label: '🤝 Oferta Aceite', color: 'indigo' };
        if (propertyData.ofertasRecebidas.length > 0) return { label: '💰 Com Ofertas', color: 'yellow' };
        if (propertyData.canaisMarketing.length > 0) return { label: '📢 Em Marketing', color: 'purple' };
        if (propertyData.precoVenda) return { label: '🏷️ Com Preço', color: 'gray' };
        return { label: '📋 Em Preparação', color: 'gray' };
    };

    const status = getPropertyStatus();

    return (
        <div className="space-y-6">
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
                            linkedType: 'vendedor_para_comprador', // ← Diferença do BuyerOpportunity
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

            {/* Card Principal do Imóvel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <HomeIcon className="w-6 h-6 mr-2 text-blue-500" />
                        Imóvel para Venda
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${status.color}-100 text-${status.color}-700`}>
                        {status.label}
                    </span>
                </div>

                {/* Informações Básicas do Imóvel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Referência Interna
                        </label>
                        <input
                            type="text"
                            name="referencia"
                            value={propertyData.referencia}
                            onChange={handlePropertyChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="REF-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título do Anúncio
                        </label>
                        <input
                            type="text"
                            name="titulo"
                            value={propertyData.titulo}
                            onChange={handlePropertyChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="T3 com Vista Mar"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipologia
                        </label>
                        <select
                            name="tipologia"
                            value={propertyData.tipologia}
                            onChange={handlePropertyChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecione</option>
                            <option value="T0">T0</option>
                            <option value="T1">T1</option>
                            <option value="T2">T2</option>
                            <option value="T3">T3</option>
                            <option value="T4">T4</option>
                            <option value="T5+">T5+</option>
                            <option value="Moradia">Moradia</option>
                            <option value="Terreno">Terreno</option>
                            <option value="Armazem">Armazém</option>
                            <option value="Loja">Loja</option>
                            <option value="Escritorio">Escritório</option>
                        </select>
                    </div>
                </div>

                {/* Localização */}
                <div className="border-t pt-4 mb-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2" />
                        Localização
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Morada
                            </label>
                            <input
                                type="text"
                                name="morada"
                                value={propertyData.morada}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Rua, número, andar"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Código Postal
                            </label>
                            <input
                                type="text"
                                name="codigoPostal"
                                value={propertyData.codigoPostal}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="0000-000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cidade
                            </label>
                            <input
                                type="text"
                                name="cidade"
                                value={propertyData.cidade}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Freguesia
                            </label>
                            <input
                                type="text"
                                name="freguesia"
                                value={propertyData.freguesia}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Zona
                            </label>
                            <input
                                type="text"
                                name="zona"
                                value={propertyData.zona}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Centro, Periferia, etc"
                            />
                        </div>
                    </div>
                </div>

                {/* Características */}
                <div className="border-t pt-4 mb-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                        <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                        Características
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Área Bruta (m²)
                            </label>
                            <input
                                type="number"
                                name="areaBruta"
                                value={propertyData.areaBruta}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Área Útil (m²)
                            </label>
                            <input
                                type="number"
                                name="areaUtil"
                                value={propertyData.areaUtil}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ano Construção
                            </label>
                            <input
                                type="number"
                                name="anoConstrucao"
                                value={propertyData.anoConstrucao}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nº Quartos
                            </label>
                            <input
                                type="number"
                                name="numQuartos"
                                value={propertyData.numQuartos}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nº Casas de Banho
                            </label>
                            <input
                                type="number"
                                name="numCasasBanho"
                                value={propertyData.numCasasBanho}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nº Pisos
                            </label>
                            <input
                                type="number"
                                name="numPisos"
                                value={propertyData.numPisos}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Amenidades */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amenidades
                        </label>
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="garagem"
                                    checked={propertyData.garagem}
                                    onChange={handlePropertyChange}
                                    className="mr-2"
                                />
                                <span className="text-sm">Garagem</span>
                            </label>
                            {propertyData.garagem && (
                                <input
                                    type="number"
                                    name="numLugaresGaragem"
                                    value={propertyData.numLugaresGaragem}
                                    onChange={handlePropertyChange}
                                    placeholder="Nº lugares"
                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                            )}
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="elevador"
                                    checked={propertyData.elevador}
                                    onChange={handlePropertyChange}
                                    className="mr-2"
                                />
                                <span className="text-sm">Elevador</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="varanda"
                                    checked={propertyData.varanda}
                                    onChange={handlePropertyChange}
                                    className="mr-2"
                                />
                                <span className="text-sm">Varanda</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="terraco"
                                    checked={propertyData.terraco}
                                    onChange={handlePropertyChange}
                                    className="mr-2"
                                />
                                <span className="text-sm">Terraço</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="jardim"
                                    checked={propertyData.jardim}
                                    onChange={handlePropertyChange}
                                    className="mr-2"
                                />
                                <span className="text-sm">Jardim</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="piscina"
                                    checked={propertyData.piscina}
                                    onChange={handlePropertyChange}
                                    className="mr-2"
                                />
                                <span className="text-sm">Piscina</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Avaliação e Preço */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                        <CurrencyEuroIcon className="w-5 h-5 mr-2" />
                        Avaliação e Precificação
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Avaliação (€)
                            </label>
                            <input
                                type="number"
                                name="valorAvaliacao"
                                value={propertyData.valorAvaliacao}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="250000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data Avaliação
                            </label>
                            <input
                                type="date"
                                name="dataAvaliacao"
                                value={propertyData.dataAvaliacao}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Entidade Avaliadora
                            </label>
                            <input
                                type="text"
                                name="entidadeAvaliadora"
                                value={propertyData.entidadeAvaliadora}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nome da empresa"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preço de Venda (€) *
                            </label>
                            <input
                                type="number"
                                name="precoVenda"
                                value={propertyData.precoVenda}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="270000"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preço Mínimo (€)
                            </label>
                            <input
                                type="number"
                                name="precoMinimo"
                                value={propertyData.precoMinimo}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="250000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Margem Negociação (%)
                            </label>
                            <input
                                type="number"
                                name="margemNegociacao"
                                value={propertyData.margemNegociacao}
                                onChange={handlePropertyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="5"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Documentação */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    Documentação Necessária
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries({
                        certidaoEnergetica: '🏠 Certificado Energético',
                        cadernetaPredial: '📋 Caderneta Predial',
                        certidaoPermanente: '📄 Certidão Permanente',
                        licencaHabitabilidade: '🏗️ Licença de Habitabilidade',
                        plantaImovel: '📐 Planta do Imóvel',
                        fichaTesouro: '💰 Ficha do Tesouro'
                    }).map(([key, label]) => (
                        <div
                            key={key}
                            className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                                setSelectedDoc(key);
                                setShowDocModal(true);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{label}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${propertyData.documentos[key].status === DOC_STATUS.COMPLETED
                                    ? 'bg-green-100 text-green-700'
                                    : propertyData.documentos[key].status === DOC_STATUS.IN_PROGRESS
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : propertyData.documentos[key].status === DOC_STATUS.EXPIRED
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {DOC_STATUS_LABELS[propertyData.documentos[key].status]}
                                </span>
                            </div>
                            {key === 'certidaoEnergetica' && propertyData.documentos[key].validade && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Válido até: {new Date(propertyData.documentos[key].validade).toLocaleDateString('pt-PT')}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Marketing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <MegaphoneIcon className="w-5 h-5 mr-2 text-purple-500" />
                        Marketing e Promoção
                    </h3>
                    <button
                        onClick={() => setShowMarketingModal(true)}
                        className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm font-medium"
                    >
                        Configurar Marketing
                    </button>
                </div>

                {/* Canais Ativos */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Canais de Marketing Ativos
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(MARKETING_LABELS).map(([channel, label]) => (
                            <button
                                key={channel}
                                onClick={() => handleMarketingChannelToggle(channel)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${propertyData.canaisMarketing.includes(channel)
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Material de Marketing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="fotosRealizadas"
                            checked={propertyData.fotosRealizadas}
                            onChange={handlePropertyChange}
                            className="rounded"
                        />
                        <CameraIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Fotos Profissionais</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="videoRealizado"
                            checked={propertyData.videoRealizado}
                            onChange={handlePropertyChange}
                            className="rounded"
                        />
                        <span className="text-sm">Vídeo</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="tourVirtual"
                            checked={propertyData.tourVirtual}
                            onChange={handlePropertyChange}
                            className="rounded"
                        />
                        <span className="text-sm">Tour Virtual 360°</span>
                    </label>
                </div>

                {/* Pontos Fortes */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                            Pontos Fortes para Marketing
                        </label>
                        <button
                            onClick={handleAddPontoForte}
                            className="text-xs text-purple-600 hover:text-purple-700"
                        >
                            + Adicionar
                        </button>
                    </div>
                    {propertyData.pontosFortesMarketing.length > 0 ? (
                        <ul className="space-y-1">
                            {propertyData.pontosFortesMarketing.map((ponto, index) => (
                                <li key={index} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                    <span>• {ponto}</span>
                                    <button
                                        onClick={() => handleRemovePontoForte(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400">Nenhum ponto forte adicionado</p>
                    )}
                </div>
            </div>

            {/* Visitas de Compradores */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <UserGroupIcon className="w-5 h-5 mr-2 text-blue-500" />
                        Visitas de Potenciais Compradores ({propertyData.visitasCompradores.length})
                    </h3>
                    <button
                        onClick={() => setShowVisitModal(true)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                    >
                        + Nova Visita
                    </button>
                </div>

                {propertyData.visitasCompradores.length > 0 ? (
                    <div className="space-y-3">
                        {propertyData.visitasCompradores.map(visit => (
                            <div key={visit.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-gray-900">
                                            {new Date(visit.dataVisita).toLocaleDateString('pt-PT')} às {visit.horaVisita}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${visit.status === BUYER_VISIT_STATUS.INTERESTED
                                        ? 'bg-green-100 text-green-700'
                                        : visit.status === BUYER_VISIT_STATUS.NOT_INTERESTED
                                            ? 'bg-red-100 text-red-700'
                                            : visit.status === BUYER_VISIT_STATUS.SECOND_VISIT
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {BUYER_VISIT_LABELS[visit.status]}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700">
                                    <strong>Cliente:</strong> {visit.nomeComprador}
                                </p>
                                {visit.telefoneComprador && (
                                    <p className="text-sm text-gray-600">
                                        <strong>Contacto:</strong> {visit.telefoneComprador}
                                    </p>
                                )}
                                {visit.feedback && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        <strong>Feedback:</strong> {visit.feedback}
                                    </p>
                                )}
                                <div className="flex justify-end mt-2 space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingVisit(visit);
                                            setShowVisitModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteVisit(visit.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-4">
                        Ainda não há visitas agendadas
                    </p>
                )}
            </div>

            {/* Ofertas Recebidas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <CurrencyEuroIcon className="w-5 h-5 mr-2 text-green-500" />
                        Ofertas Recebidas ({propertyData.ofertasRecebidas.length})
                    </h3>
                    <button
                        onClick={() => setShowOfferModal(true)}
                        className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium"
                    >
                        + Registar Oferta
                    </button>
                </div>

                {propertyData.ofertasRecebidas.length > 0 ? (
                    <div className="space-y-3">
                        {propertyData.ofertasRecebidas.map(offer => (
                            <div key={offer.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-lg text-gray-900">
                                            €{parseInt(offer.valorOferta).toLocaleString('pt-PT')}
                                        </span>
                                        {offer.valorOferta && propertyData.precoVenda && (
                                            <span className={`text-sm ${parseFloat(offer.valorOferta) >= parseFloat(propertyData.precoVenda)
                                                ? 'text-green-600'
                                                : 'text-orange-600'
                                                }`}>
                                                ({((parseFloat(offer.valorOferta) / parseFloat(propertyData.precoVenda)) * 100).toFixed(1)}% do pedido)
                                            </span>
                                        )}
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${offer.status === RECEIVED_OFFER_STATUS.ACCEPTED
                                        ? 'bg-green-100 text-green-700'
                                        : offer.status === RECEIVED_OFFER_STATUS.REJECTED
                                            ? 'bg-red-100 text-red-700'
                                            : offer.status === RECEIVED_OFFER_STATUS.COUNTER_PROPOSED
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {RECEIVED_OFFER_LABELS[offer.status]}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700">
                                    <strong>Proponente:</strong> {offer.nomeProponente}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Data:</strong> {new Date(offer.dataOferta).toLocaleDateString('pt-PT')}
                                </p>
                                {offer.condicoes && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        <strong>Condições:</strong> {offer.condicoes}
                                    </p>
                                )}
                                {offer.contraproposta && (
                                    <div className="mt-2 p-2 bg-yellow-50 rounded">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Contraproposta:</strong> €{parseInt(offer.valorContraproposta).toLocaleString('pt-PT')}
                                        </p>
                                    </div>
                                )}
                                <div className="flex justify-end mt-2 space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingOffer(offer);
                                            setShowOfferModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteOffer(offer.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-4">
                        Ainda não foram recebidas ofertas
                    </p>
                )}
            </div>

            {/* CPCV e Escritura */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DocumentCheckIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    Formalização da Venda
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CPCV */}
                    <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Contrato Promessa (CPCV)</h4>
                        {propertyData.cpcvAssinado ? (
                            <div className="space-y-2">
                                <p className="text-sm text-green-600 font-medium">✅ CPCV Assinado</p>
                                <p className="text-sm text-gray-600">
                                    <strong>Data:</strong> {new Date(propertyData.dataCPCV).toLocaleDateString('pt-PT')}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Valor:</strong> €{parseInt(propertyData.valorCPCV).toLocaleString('pt-PT')}
                                </p>
                                {propertyData.sinalPago && (
                                    <>
                                        <p className="text-sm text-gray-600">
                                            <strong>Sinal:</strong> €{parseInt(propertyData.valorSinal).toLocaleString('pt-PT')}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Data Sinal:</strong> {new Date(propertyData.dataSinal).toLocaleDateString('pt-PT')}
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-400 mb-3">CPCV ainda não assinado</p>
                                <button
                                    onClick={() => setShowCPCVModal(true)}
                                    disabled={!propertyData.ofertasRecebidas.some(o => o.status === RECEIVED_OFFER_STATUS.ACCEPTED)}
                                    className="w-full px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:bg-gray-100 disabled:text-gray-400 text-sm font-medium"
                                >
                                    Registar CPCV
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Escritura */}
                    <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Escritura Pública</h4>
                        {propertyData.escrituraRealizada ? (
                            <div className="space-y-2">
                                <p className="text-sm text-green-600 font-medium">✅ Escritura Realizada</p>
                                <p className="text-sm text-gray-600">
                                    <strong>Data:</strong> {new Date(propertyData.dataEscritura).toLocaleDateString('pt-PT')}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Notário:</strong> {propertyData.notario}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Valor Final:</strong> €{parseInt(propertyData.valorFinalVenda).toLocaleString('pt-PT')}
                                </p>
                                <p className="text-sm text-green-600 font-medium">
                                    <strong>Comissão:</strong> €{calculateComissao()}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-400 mb-3">Escritura ainda não realizada</p>
                                <button
                                    onClick={() => setShowEscrituraModal(true)}
                                    disabled={!propertyData.cpcvAssinado}
                                    className="w-full px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 text-sm font-medium"
                                >
                                    Registar Escritura
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notas e Observações */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas e Observações</h3>
                <textarea
                    name="observacoes"
                    value={propertyData.observacoes}
                    onChange={handlePropertyChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Adicione notas relevantes sobre o imóvel ou o processo de venda..."
                />
            </div>

            {/* Modal de Documentação */}
            {showDocModal && selectedDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            Atualizar {selectedDoc === 'certidaoEnergetica' ? 'Certificado Energético' :
                                selectedDoc === 'cadernetaPredial' ? 'Caderneta Predial' :
                                    selectedDoc === 'certidaoPermanente' ? 'Certidão Permanente' :
                                        selectedDoc === 'licencaHabitabilidade' ? 'Licença de Habitabilidade' :
                                            selectedDoc === 'plantaImovel' ? 'Planta do Imóvel' : 'Ficha do Tesouro'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={propertyData.documentos[selectedDoc].status}
                                    onChange={(e) => handleDocStatusUpdate(selectedDoc, { status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    {Object.entries(DOC_STATUS_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedDoc === 'certidaoEnergetica' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Validade
                                    </label>
                                    <input
                                        type="date"
                                        value={propertyData.documentos[selectedDoc].validade}
                                        onChange={(e) => handleDocStatusUpdate(selectedDoc, { validade: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowDocModal(false);
                                        setSelectedDoc(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Marketing */}
            {showMarketingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Configurações de Marketing</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Início do Marketing
                                </label>
                                <input
                                    type="date"
                                    name="dataInicioMarketing"
                                    value={propertyData.dataInicioMarketing}
                                    onChange={handlePropertyChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data das Fotos
                                </label>
                                <input
                                    type="date"
                                    name="dataFotos"
                                    value={propertyData.dataFotos}
                                    onChange={handlePropertyChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição para Marketing
                                </label>
                                <textarea
                                    name="descricaoMarketing"
                                    value={propertyData.descricaoMarketing}
                                    onChange={handlePropertyChange}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Descrição atrativa do imóvel para os anúncios..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowMarketingModal(false)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Visitas */}
            {showVisitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingVisit ? 'Editar Visita' : 'Nova Visita de Comprador'}
                        </h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const visitData = Object.fromEntries(formData.entries());

                            if (editingVisit) {
                                handleUpdateVisit(editingVisit.id, visitData);
                                setEditingVisit(null);
                            } else {
                                handleAddVisit(visitData);
                            }
                            setShowVisitModal(false);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome do Comprador *
                                    </label>
                                    <input
                                        type="text"
                                        name="nomeComprador"
                                        defaultValue={editingVisit?.nomeComprador}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefoneComprador"
                                        defaultValue={editingVisit?.telefoneComprador}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data *
                                        </label>
                                        <input
                                            type="date"
                                            name="dataVisita"
                                            defaultValue={editingVisit?.dataVisita}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hora *
                                        </label>
                                        <input
                                            type="time"
                                            name="horaVisita"
                                            defaultValue={editingVisit?.horaVisita}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        defaultValue={editingVisit?.status || BUYER_VISIT_STATUS.SCHEDULED}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        {Object.entries(BUYER_VISIT_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Feedback
                                    </label>
                                    <textarea
                                        name="feedback"
                                        defaultValue={editingVisit?.feedback}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Comentários sobre a visita..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowVisitModal(false);
                                            setEditingVisit(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        {editingVisit ? 'Atualizar' : 'Adicionar'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Ofertas */}
            {showOfferModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingOffer ? 'Editar Oferta' : 'Registar Nova Oferta'}
                        </h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const offerData = Object.fromEntries(formData.entries());

                            if (editingOffer) {
                                handleUpdateOffer(editingOffer.id, offerData);
                                setEditingOffer(null);
                            } else {
                                handleAddOffer(offerData);
                            }
                            setShowOfferModal(false);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome do Proponente *
                                    </label>
                                    <input
                                        type="text"
                                        name="nomeProponente"
                                        defaultValue={editingOffer?.nomeProponente}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor da Oferta (€) *
                                    </label>
                                    <input
                                        type="number"
                                        name="valorOferta"
                                        defaultValue={editingOffer?.valorOferta}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data da Oferta *
                                    </label>
                                    <input
                                        type="date"
                                        name="dataOferta"
                                        defaultValue={editingOffer?.dataOferta}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        defaultValue={editingOffer?.status || RECEIVED_OFFER_STATUS.RECEIVED}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        {Object.entries(RECEIVED_OFFER_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Condições
                                    </label>
                                    <textarea
                                        name="condicoes"
                                        defaultValue={editingOffer?.condicoes}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Condições especiais da oferta..."
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="contraproposta"
                                            defaultChecked={editingOffer?.contraproposta}
                                            onChange={(e) => {
                                                const contrapropostaSection = document.getElementById('contraproposta-section');
                                                contrapropostaSection.style.display = e.target.checked ? 'block' : 'none';
                                            }}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Foi feita contraproposta</span>
                                    </label>
                                </div>

                                <div id="contraproposta-section" style={{ display: editingOffer?.contraproposta ? 'block' : 'none' }}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor da Contraproposta (€)
                                    </label>
                                    <input
                                        type="number"
                                        name="valorContraproposta"
                                        defaultValue={editingOffer?.valorContraproposta}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOfferModal(false);
                                            setEditingOffer(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        {editingOffer ? 'Atualizar' : 'Registar'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal CPCV */}
            {showCPCVModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Registar CPCV</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            handleMarkCPCV(Object.fromEntries(formData.entries()));
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data do CPCV *
                                    </label>
                                    <input
                                        type="date"
                                        name="dataCPCV"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor do CPCV (€) *
                                    </label>
                                    <input
                                        type="number"
                                        name="valorCPCV"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="sinalPago"
                                            onChange={(e) => {
                                                const sinalSection = document.getElementById('sinal-section');
                                                sinalSection.style.display = e.target.checked ? 'block' : 'none';
                                            }}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Sinal pago</span>
                                    </label>
                                </div>

                                <div id="sinal-section" style={{ display: 'none' }} className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Valor do Sinal (€)
                                        </label>
                                        <input
                                            type="number"
                                            name="valorSinal"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data do Sinal
                                        </label>
                                        <input
                                            type="date"
                                            name="dataSinal"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCPCVModal(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        Confirmar CPCV
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Escritura */}
            {showEscrituraModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Registar Escritura</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            handleMarkEscritura(Object.fromEntries(formData.entries()));
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data da Escritura *
                                    </label>
                                    <input
                                        type="date"
                                        name="dataEscritura"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notário *
                                    </label>
                                    <input
                                        type="text"
                                        name="notario"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Nome do notário"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor Final de Venda (€) *
                                    </label>
                                    <input
                                        type="number"
                                        name="valorFinalVenda"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>

                                {formData.percentualComissao && (
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className="text-sm text-green-800">
                                            <strong>Comissão estimada:</strong> Será calculada automaticamente
                                            ({formData.percentualComissao}% do valor final)
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowEscrituraModal(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Confirmar Escritura
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerOpportunity;