/**
 * PROPERTIES TAB - MyImoMatePro
 * Tab de gestão de imóveis da oportunidade
 * Adicionar, editar e gerir imóveis relacionados
 * 
 * Caminho: src/components/opportunities/tabs/PropertiesTab.jsx
 */

import React, { useState, useEffect } from 'react';
import {
    HomeIcon,
    MapPinIcon,
    CurrencyEuroIcon,
    Square3Stack3DIcon,
    CalendarIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PhotoIcon,
    DocumentTextIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    BuildingOfficeIcon,
    HomeModernIcon,
    BuildingStorefrontIcon,
    Square2StackIcon,
    SunIcon,
    FireIcon,
    BoltIcon,
    WifiIcon,
    TruckIcon,
    ShieldCheckIcon,
    BeakerIcon,
    ArrowTrendingUpIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolid,
    StarIcon
} from '@heroicons/react/24/solid';

// Estados de negócio do imóvel
const BUSINESS_STATES = {
    'prospeccao': { label: 'Prospeção', color: 'gray' },
    'visitado': { label: 'Visitado', color: 'blue' },
    'proposta': { label: 'Proposta', color: 'yellow' },
    'negociacao': { label: 'Negociação', color: 'orange' },
    'aceite': { label: 'Aceite', color: 'green' },
    'cpcv': { label: 'CPCV', color: 'purple' },
    'escritura': { label: 'Escritura', color: 'indigo' }
};

// Tipos de imóvel
const PROPERTY_TYPES = {
    'apartamento': { label: 'Apartamento', icon: BuildingOfficeIcon },
    'moradia': { label: 'Moradia', icon: HomeModernIcon },
    'loja': { label: 'Loja', icon: BuildingStorefrontIcon },
    'terreno': { label: 'Terreno', icon: Square2StackIcon },
    'escritorio': { label: 'Escritório', icon: BuildingOfficeIcon },
    'armazem': { label: 'Armazém', icon: HomeIcon },
    'garagem': { label: 'Garagem', icon: TruckIcon },
    'outro': { label: 'Outro', icon: HomeIcon }
};

// Características predefinidas
const CARACTERISTICAS_OPTIONS = [
    'Varanda', 'Terraço', 'Jardim', 'Piscina', 'Garagem', 'Arrecadação',
    'Elevador', 'Vista Mar', 'Vista Montanha', 'Vista Cidade',
    'Condomínio Fechado', 'Portaria', 'Ar Condicionado', 'Aquecimento Central',
    'Lareira', 'Painéis Solares', 'Vidros Duplos', 'Estores Elétricos',
    'Cozinha Equipada', 'Despensa', 'Suite', 'Closet', 'Casa de Banho Social',
    'Renovado', 'Para Renovar', 'Mobilado', 'Lugar de Estacionamento'
];

// Componente de Card de Imóvel
const PropertyCard = ({ property, onEdit, onDelete, onViewDetails }) => {
    const [expanded, setExpanded] = useState(false);
    const businessState = BUSINESS_STATES[property.estadoNegocio || 'prospeccao'];
    const PropertyIcon = PROPERTY_TYPES[property.tipo]?.icon || HomeIcon;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const calculatePricePerM2 = () => {
        if (!property.valorPedido || !property.areaUtil) return null;
        return Math.round(property.valorPedido / property.areaUtil);
    };

    const pricePerM2 = calculatePricePerM2();

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <PropertyIcon className="w-5 h-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">
                            {property.referencia || 'Sem Referência'}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                       bg-${businessState.color}-100 text-${businessState.color}-800`}>
                            {businessState.label}
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        {property.morada || 'Morada não definida'}
                    </p>

                    {/* Preço e área */}
                    <div className="flex items-center gap-4 mt-2">
                        <div>
                            <span className="text-2xl font-bold text-gray-900">
                                {formatCurrency(property.valorPedido || 0)}
                            </span>
                            {pricePerM2 && (
                                <span className="text-sm text-gray-500 ml-2">
                                    ({formatCurrency(pricePerM2)}/m²)
                                </span>
                            )}
                        </div>
                        {property.areaUtil && (
                            <div className="text-sm text-gray-600">
                                <Square3Stack3DIcon className="w-4 h-4 inline mr-1" />
                                {property.areaUtil}m²
                            </div>
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

            {/* Info resumida */}
            <div className="flex gap-6 text-sm text-gray-600 mb-3">
                {property.tipologia && (
                    <div className="flex items-center gap-1">
                        <HomeIcon className="w-4 h-4" />
                        <span>{property.tipologia}</span>
                    </div>
                )}
                {property.anoConstrucao && (
                    <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{property.anoConstrucao}</span>
                    </div>
                )}
                {property.certificadoEnergetico && (
                    <div className="flex items-center gap-1">
                        <BoltIcon className="w-4 h-4" />
                        <span>Classe {property.certificadoEnergetico}</span>
                    </div>
                )}
            </div>

            {/* Estatísticas */}
            <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center flex-1">
                    <div className="text-lg font-semibold text-blue-600">
                        {property.visitas?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Visitas</div>
                </div>
                <div className="text-center flex-1">
                    <div className="text-lg font-semibold text-green-600">
                        {property.ofertas?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Ofertas</div>
                </div>
                <div className="text-center flex-1">
                    <div className="text-lg font-semibold text-purple-600">
                        {property.cpcv ? '✓' : '-'}
                    </div>
                    <div className="text-xs text-gray-500">CPCV</div>
                </div>
            </div>

            {/* Detalhes expandidos */}
            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {/* Descrição */}
                    {property.descricao && (
                        <div>
                            <h5 className="font-medium text-gray-700 mb-1">Descrição</h5>
                            <p className="text-sm text-gray-600">{property.descricao}</p>
                        </div>
                    )}

                    {/* Características */}
                    {property.caracteristicas && property.caracteristicas.length > 0 && (
                        <div>
                            <h5 className="font-medium text-gray-700 mb-2">Características</h5>
                            <div className="flex flex-wrap gap-1">
                                {property.caracteristicas.map((car, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 
                                                           text-xs rounded-full">
                                        {car}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Informações do proprietário */}
                    {property.proprietario && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <h5 className="font-medium text-gray-700 mb-2">Proprietário</h5>
                            <div className="space-y-1 text-sm text-gray-600">
                                {property.proprietario.nome && (
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="w-4 h-4" />
                                        <span>{property.proprietario.nome}</span>
                                    </div>
                                )}
                                {property.proprietario.telefone && (
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="w-4 h-4" />
                                        <span>{property.proprietario.telefone}</span>
                                    </div>
                                )}
                                {property.proprietario.email && (
                                    <div className="flex items-center gap-2">
                                        <EnvelopeIcon className="w-4 h-4" />
                                        <span>{property.proprietario.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onViewDetails(property)}
                            className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg 
                                     hover:bg-blue-600 text-sm transition-colors"
                        >
                            <EyeIcon className="w-4 h-4 inline mr-1" />
                            Ver Detalhes
                        </button>
                        <button
                            onClick={() => onEdit(property)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 
                                     rounded-lg hover:bg-gray-50 text-sm transition-colors"
                        >
                            <PencilIcon className="w-4 h-4 inline mr-1" />
                            Editar
                        </button>
                        <button
                            onClick={() => onDelete(property)}
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
const PropertiesTab = ({ data = [], onChange, opportunityType }) => {
    // Estado
    const [properties, setProperties] = useState(Array.isArray(data) ? data : data.imoveis || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Formulário
    const [formData, setFormData] = useState({
        referencia: '',
        tipo: 'apartamento',
        tipologia: '',
        morada: '',
        codigoPostal: '',
        localidade: '',
        freguesia: '',
        concelho: '',
        distrito: '',
        valorPedido: '',
        valorAvaliacao: '',
        areaUtil: '',
        areaBruta: '',
        areaTerreno: '',
        anoConstrucao: '',
        certificadoEnergetico: '',
        descricao: '',
        caracteristicas: [],
        proprietario: {
            nome: '',
            telefone: '',
            email: ''
        },
        comissao: '',
        estadoNegocio: 'prospeccao'
    });

    // Atualizar estado quando data mudar
    useEffect(() => {
        if (Array.isArray(data)) {
            setProperties(data);
        } else if (data.imoveis) {
            setProperties(data.imoveis);
        }
    }, [data]);

    // Estatísticas
    const getStats = () => {
        const stats = {
            total: properties.length,
            valorTotal: properties.reduce((acc, p) => acc + (p.valorPedido || 0), 0),
            areaTotal: properties.reduce((acc, p) => acc + (p.areaUtil || 0), 0),
            comVisitas: properties.filter(p => p.visitas && p.visitas.length > 0).length,
            comOfertas: properties.filter(p => p.ofertas && p.ofertas.length > 0).length,
            comCPCV: properties.filter(p => p.cpcv).length
        };

        stats.valorMedio = stats.total > 0 ? stats.valorTotal / stats.total : 0;
        stats.taxaInteresse = stats.total > 0
            ? Math.round((stats.comVisitas / stats.total) * 100) : 0;

        return stats;
    };

    // Handlers
    const handleAddProperty = () => {
        if (!formData.referencia) {
            alert('Por favor adicione uma referência para o imóvel');
            return;
        }

        const newProperty = {
            ...formData,
            id: editingProperty?.id || Date.now().toString(),
            valorPedido: parseFloat(formData.valorPedido) || 0,
            valorAvaliacao: parseFloat(formData.valorAvaliacao) || 0,
            areaUtil: parseFloat(formData.areaUtil) || 0,
            areaBruta: parseFloat(formData.areaBruta) || 0,
            areaTerreno: parseFloat(formData.areaTerreno) || 0,
            anoConstrucao: parseInt(formData.anoConstrucao) || null,
            comissao: parseFloat(formData.comissao) || 0,
            visitas: editingProperty?.visitas || [],
            ofertas: editingProperty?.ofertas || [],
            cpcv: editingProperty?.cpcv || null,
            criadoEm: editingProperty?.criadoEm || new Date().toISOString()
        };

        let updatedProperties;
        if (editingProperty) {
            updatedProperties = properties.map(p =>
                p.id === editingProperty.id ? newProperty : p
            );
        } else {
            updatedProperties = [...properties, newProperty];
        }

        setProperties(updatedProperties);

        // Notificar parent
        onChange(updatedProperties);

        // Reset form
        resetForm();
        setShowAddForm(false);
        setEditingProperty(null);
    };

    const handleEditProperty = (property) => {
        setEditingProperty(property);
        setFormData({
            referencia: property.referencia || '',
            tipo: property.tipo || 'apartamento',
            tipologia: property.tipologia || '',
            morada: property.morada || '',
            codigoPostal: property.codigoPostal || '',
            localidade: property.localidade || '',
            freguesia: property.freguesia || '',
            concelho: property.concelho || '',
            distrito: property.distrito || '',
            valorPedido: property.valorPedido || '',
            valorAvaliacao: property.valorAvaliacao || '',
            areaUtil: property.areaUtil || '',
            areaBruta: property.areaBruta || '',
            areaTerreno: property.areaTerreno || '',
            anoConstrucao: property.anoConstrucao || '',
            certificadoEnergetico: property.certificadoEnergetico || '',
            descricao: property.descricao || '',
            caracteristicas: property.caracteristicas || [],
            proprietario: property.proprietario || {
                nome: '',
                telefone: '',
                email: ''
            },
            comissao: property.comissao || '',
            estadoNegocio: property.estadoNegocio || 'prospeccao'
        });
        setShowAddForm(true);
    };

    const handleDeleteProperty = (property) => {
        if (!confirm(`Tem certeza que deseja eliminar o imóvel ${property.referencia}?`)) {
            return;
        }

        const updatedProperties = properties.filter(p => p.id !== property.id);
        setProperties(updatedProperties);
        onChange(updatedProperties);
    };

    const handleViewDetails = (property) => {
        setSelectedProperty(property);
        setShowDetails(true);
    };

    const resetForm = () => {
        setFormData({
            referencia: '',
            tipo: 'apartamento',
            tipologia: '',
            morada: '',
            codigoPostal: '',
            localidade: '',
            freguesia: '',
            concelho: '',
            distrito: '',
            valorPedido: '',
            valorAvaliacao: '',
            areaUtil: '',
            areaBruta: '',
            areaTerreno: '',
            anoConstrucao: '',
            certificadoEnergetico: '',
            descricao: '',
            caracteristicas: [],
            proprietario: {
                nome: '',
                telefone: '',
                email: ''
            },
            comissao: '',
            estadoNegocio: 'prospeccao'
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const stats = getStats();

    return (
        <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <HomeIcon className="w-5 h-5 mr-2" />
                        Gestão de Imóveis
                    </h3>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white 
                                 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Adicionar Imóvel
                    </button>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-6 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(stats.valorMedio)}
                        </div>
                        <div className="text-xs text-gray-500">Valor Médio</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {stats.areaTotal}m²
                        </div>
                        <div className="text-xs text-gray-500">Área Total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {stats.comVisitas}
                        </div>
                        <div className="text-xs text-gray-500">C/ Visitas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {stats.comOfertas}
                        </div>
                        <div className="text-xs text-gray-500">C/ Ofertas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {stats.taxaInteresse}%
                        </div>
                        <div className="text-xs text-gray-500">Taxa Interesse</div>
                    </div>
                </div>
            </div>

            {/* Lista de Imóveis */}
            {properties.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <HomeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                        Ainda não há imóveis adicionados a esta oportunidade
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="text-blue-500 hover:text-blue-600"
                    >
                        Adicionar primeiro imóvel
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {properties.map(property => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            onEdit={handleEditProperty}
                            onDelete={handleDeleteProperty}
                            onViewDetails={handleViewDetails}
                        />
                    ))}
                </div>
            )}

            {/* Modal Adicionar/Editar Imóvel */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingProperty ? 'Editar Imóvel' : 'Novo Imóvel'}
                        </h3>

                        <div className="space-y-4">
                            {/* Identificação */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Referência *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.referencia}
                                        onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                                        placeholder="REF-001"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo
                                    </label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {Object.entries(PROPERTY_TYPES).map(([key, type]) => (
                                            <option key={key} value={key}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipologia
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tipologia}
                                        onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })}
                                        placeholder="T3, V4, etc"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Localização */}
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Localização</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Morada
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.morada}
                                            onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
                                            placeholder="Rua, número, andar"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Código Postal
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.codigoPostal}
                                            onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                                            placeholder="0000-000"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Localidade
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.localidade}
                                            onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Freguesia
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.freguesia}
                                            onChange={(e) => setFormData({ ...formData, freguesia: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Concelho
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.concelho}
                                            onChange={(e) => setFormData({ ...formData, concelho: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Distrito
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.distrito}
                                            onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Valores */}
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Valores</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Valor Pedido (€)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.valorPedido}
                                            onChange={(e) => setFormData({ ...formData, valorPedido: e.target.value })}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Valor Avaliação (€)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.valorAvaliacao}
                                            onChange={(e) => setFormData({ ...formData, valorAvaliacao: e.target.value })}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Comissão (€)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.comissao}
                                            onChange={(e) => setFormData({ ...formData, comissao: e.target.value })}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Áreas */}
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Áreas</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Área Útil (m²)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.areaUtil}
                                            onChange={(e) => setFormData({ ...formData, areaUtil: e.target.value })}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Área Bruta (m²)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.areaBruta}
                                            onChange={(e) => setFormData({ ...formData, areaBruta: e.target.value })}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Área Terreno (m²)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.areaTerreno}
                                            onChange={(e) => setFormData({ ...formData, areaTerreno: e.target.value })}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Outras informações */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ano Construção
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.anoConstrucao}
                                        onChange={(e) => setFormData({ ...formData, anoConstrucao: e.target.value })}
                                        placeholder="2000"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Certificado Energético
                                    </label>
                                    <select
                                        value={formData.certificadoEnergetico}
                                        onChange={(e) => setFormData({ ...formData, certificadoEnergetico: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Selecione</option>
                                        {['A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F'].map(classe => (
                                            <option key={classe} value={classe}>Classe {classe}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado do Negócio
                                    </label>
                                    <select
                                        value={formData.estadoNegocio}
                                        onChange={(e) => setFormData({ ...formData, estadoNegocio: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {Object.entries(BUSINESS_STATES).map(([key, state]) => (
                                            <option key={key} value={key}>{state.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Características */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Características
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CARACTERISTICAS_OPTIONS.map(car => (
                                        <button
                                            key={car}
                                            type="button"
                                            onClick={() => {
                                                const cars = formData.caracteristicas.includes(car)
                                                    ? formData.caracteristicas.filter(c => c !== car)
                                                    : [...formData.caracteristicas, car];
                                                setFormData({ ...formData, caracteristicas: cars });
                                            }}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${formData.caracteristicas.includes(car)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            {car}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    rows="3"
                                    placeholder="Descrição detalhada do imóvel..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Proprietário */}
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Dados do Proprietário</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nome
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.proprietario.nome}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                proprietario: { ...formData.proprietario, nome: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Telefone
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.proprietario.telefone}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                proprietario: { ...formData.proprietario, telefone: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.proprietario.email}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                proprietario: { ...formData.proprietario, email: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingProperty(null);
                                    resetForm();
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 
                                         rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddProperty}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                                         hover:bg-blue-600"
                            >
                                {editingProperty ? 'Atualizar' : 'Adicionar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertiesTab;