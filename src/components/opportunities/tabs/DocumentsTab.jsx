/**
 * DOCUMENTS TAB - MyImoMatePro
 * Tab de gestão de documentos
 * Upload, organização e partilha de documentos
 * 
 * Caminho: src/components/opportunities/tabs/DocumentsTab.jsx
 */

import React, { useState, useEffect } from 'react';
import {
    DocumentTextIcon,
    FolderIcon,
    ArrowUpTrayIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    TrashIcon,
    ShareIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    PaperClipIcon,
    DocumentDuplicateIcon,
    PhotoIcon,
    FilmIcon,
    DocumentChartBarIcon,
    BanknotesIcon,
    HomeIcon,
    ClipboardDocumentCheckIcon,
    ShieldCheckIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PlusIcon,
    LinkIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import {
    DocumentTextIcon as DocumentSolid,
    CheckCircleIcon as CheckCircleSolid
} from '@heroicons/react/24/solid';

// Categorias de documentos
const DOCUMENT_CATEGORIES = {
    'identificacao': {
        label: 'Identificação',
        icon: ShieldCheckIcon,
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300',
        required: ['cc', 'nif']
    },
    'propriedade': {
        label: 'Propriedade',
        icon: HomeIcon,
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        required: ['caderneta', 'certidao_permanente']
    },
    'financeiro': {
        label: 'Financeiro',
        icon: BanknotesIcon,
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300',
        required: ['pre_aprovacao', 'comprovativo_rendimentos']
    },
    'legal': {
        label: 'Legal',
        icon: ClipboardDocumentCheckIcon,
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-300',
        required: ['cpcv', 'procuracao']
    },
    'tecnico': {
        label: 'Técnico',
        icon: DocumentChartBarIcon,
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-300',
        required: ['certificado_energetico', 'licenca_utilizacao']
    },
    'media': {
        label: 'Media',
        icon: PhotoIcon,
        color: 'pink',
        bgColor: 'bg-pink-100',
        textColor: 'text-pink-800',
        borderColor: 'border-pink-300',
        required: []
    },
    'outro': {
        label: 'Outro',
        icon: FolderIcon,
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-300',
        required: []
    }
};

// Tipos de documentos específicos
const DOCUMENT_TYPES = {
    // Identificação
    'cc': { label: 'Cartão de Cidadão', categoria: 'identificacao', obrigatorio: true },
    'nif': { label: 'Comprovativo NIF', categoria: 'identificacao', obrigatorio: true },
    'comprovativo_morada': { label: 'Comprovativo Morada', categoria: 'identificacao', obrigatorio: false },

    // Propriedade
    'caderneta': { label: 'Caderneta Predial', categoria: 'propriedade', obrigatorio: true },
    'certidao_permanente': { label: 'Certidão Permanente', categoria: 'propriedade', obrigatorio: true },
    'escritura': { label: 'Escritura', categoria: 'propriedade', obrigatorio: false },
    'registo_predial': { label: 'Registo Predial', categoria: 'propriedade', obrigatorio: true },

    // Financeiro
    'pre_aprovacao': { label: 'Pré-aprovação Crédito', categoria: 'financeiro', obrigatorio: true },
    'comprovativo_rendimentos': { label: 'Comprovativo Rendimentos', categoria: 'financeiro', obrigatorio: true },
    'irs': { label: 'Declaração IRS', categoria: 'financeiro', obrigatorio: false },
    'extrato_bancario': { label: 'Extrato Bancário', categoria: 'financeiro', obrigatorio: false },

    // Legal
    'cpcv': { label: 'CPCV', categoria: 'legal', obrigatorio: false },
    'procuracao': { label: 'Procuração', categoria: 'legal', obrigatorio: false },
    'minuta': { label: 'Minuta', categoria: 'legal', obrigatorio: false },

    // Técnico
    'certificado_energetico': { label: 'Certificado Energético', categoria: 'tecnico', obrigatorio: true },
    'licenca_utilizacao': { label: 'Licença Utilização', categoria: 'tecnico', obrigatorio: true },
    'ficha_tecnica': { label: 'Ficha Técnica', categoria: 'tecnico', obrigatorio: false },
    'plantas': { label: 'Plantas', categoria: 'tecnico', obrigatorio: false },
    'relatorio_vistoria': { label: 'Relatório Vistoria', categoria: 'tecnico', obrigatorio: false },

    // Media
    'fotografias': { label: 'Fotografias', categoria: 'media', obrigatorio: false },
    'video': { label: 'Vídeo', categoria: 'media', obrigatorio: false },
    'tour_virtual': { label: 'Tour Virtual', categoria: 'media', obrigatorio: false },

    // Outro
    'outro': { label: 'Outro', categoria: 'outro', obrigatorio: false }
};

// Formatos aceites
const ACCEPTED_FORMATS = {
    'documento': ['.pdf', '.doc', '.docx', '.txt'],
    'imagem': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'video': ['.mp4', '.avi', '.mov', '.webm'],
    'planilha': ['.xls', '.xlsx', '.csv']
};

// Componente de Card de Documento
const DocumentCard = ({ document, onView, onDownload, onShare, onDelete }) => {
    const category = DOCUMENT_CATEGORIES[document.categoria];
    const type = DOCUMENT_TYPES[document.tipo];
    const CategoryIcon = category.icon;

    const getFileIcon = () => {
        const ext = document.nome.split('.').pop().toLowerCase();
        if (ACCEPTED_FORMATS.imagem.some(f => f.includes(ext))) return PhotoIcon;
        if (ACCEPTED_FORMATS.video.some(f => f.includes(ext))) return FilmIcon;
        if (ACCEPTED_FORMATS.planilha.some(f => f.includes(ext))) return DocumentChartBarIcon;
        return DocumentTextIcon;
    };

    const FileIcon = getFileIcon();

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className={`bg-white rounded-lg border ${category.borderColor} p-4 hover:shadow-md transition-all`}>
            <div className="flex items-start gap-3">
                {/* Ícone do arquivo */}
                <div className={`p-3 rounded-lg ${category.bgColor}`}>
                    <FileIcon className={`w-6 h-6 ${category.textColor}`} />
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                        {type?.label || document.nomeExibicao || document.nome}
                    </h4>

                    <p className="text-sm text-gray-500 truncate">
                        {document.nome}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{formatFileSize(document.tamanho)}</span>
                        <span>•</span>
                        <span>{formatDate(document.dataUpload)}</span>
                        {document.uploadPor && (
                            <>
                                <span>•</span>
                                <span>{document.uploadPor}</span>
                            </>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full 
                                       text-xs font-medium ${category.bgColor} ${category.textColor}`}>
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {category.label}
                        </span>

                        {document.obrigatorio && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full 
                                           text-xs font-medium bg-red-100 text-red-700">
                                Obrigatório
                            </span>
                        )}

                        {document.verificado && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full 
                                           text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircleSolid className="w-3 h-3 mr-1" />
                                Verificado
                            </span>
                        )}

                        {document.partilhado && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full 
                                           text-xs font-medium bg-blue-100 text-blue-700">
                                <ShareIcon className="w-3 h-3 mr-1" />
                                Partilhado
                            </span>
                        )}
                    </div>
                </div>

                {/* Ações */}
                <div className="flex gap-1">
                    <button
                        onClick={() => onView(document)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Visualizar"
                    >
                        <EyeIcon className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                        onClick={() => onDownload(document)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                        onClick={() => onShare(document)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Partilhar"
                    >
                        <ShareIcon className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                        onClick={() => onDelete(document)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente Principal
const DocumentsTab = ({ data = {}, onChange, opportunityType }) => {
    // Estado
    const [documents, setDocuments] = useState(data.documents || []);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyRequired, setShowOnlyRequired] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Estado do upload
    const [uploadData, setUploadData] = useState({
        files: [],
        categoria: 'outro',
        tipo: 'outro',
        descricao: '',
        obrigatorio: false,
        privado: false
    });

    // Estado da partilha
    const [shareData, setShareData] = useState({
        email: '',
        mensagem: '',
        prazoValidade: '',
        permitirDownload: true
    });

    // Drag and Drop
    const [isDragging, setIsDragging] = useState(false);

    // Documentos obrigatórios por tipo
    const getRequiredDocuments = () => {
        const required = [];

        if (opportunityType === 'comprador' || opportunityType === 'buyer') {
            required.push('cc', 'nif', 'pre_aprovacao', 'comprovativo_rendimentos');
        } else if (opportunityType === 'vendedor' || opportunityType === 'seller') {
            required.push('cc', 'nif', 'caderneta', 'certidao_permanente',
                'certificado_energetico', 'licenca_utilizacao');
        }

        return required;
    };

    // Verificar documentos em falta
    const getMissingDocuments = () => {
        const required = getRequiredDocuments();
        const uploaded = documents.map(d => d.tipo);
        return required.filter(req => !uploaded.includes(req));
    };

    // Filtrar documentos
    const getFilteredDocuments = () => {
        let filtered = [...documents];

        // Filtro por categoria
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(d => d.categoria === selectedCategory);
        }

        // Filtro por pesquisa
        if (searchTerm) {
            filtered = filtered.filter(d =>
                d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.nomeExibicao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                DOCUMENT_TYPES[d.tipo]?.label.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por obrigatórios
        if (showOnlyRequired) {
            const required = getRequiredDocuments();
            filtered = filtered.filter(d => required.includes(d.tipo) || d.obrigatorio);
        }

        // Ordenar por data
        filtered.sort((a, b) => new Date(b.dataUpload) - new Date(a.dataUpload));

        return filtered;
    };

    // Estatísticas
    const getStats = () => {
        const required = getRequiredDocuments();
        const uploaded = documents.map(d => d.tipo);
        const stats = {
            total: documents.length,
            obrigatorios: required.length,
            carregados: required.filter(req => uploaded.includes(req)).length,
            emFalta: required.filter(req => !uploaded.includes(req)).length,
            verificados: documents.filter(d => d.verificado).length,
            partilhados: documents.filter(d => d.partilhado).length,
            tamanhoTotal: documents.reduce((acc, d) => acc + (d.tamanho || 0), 0)
        };

        stats.percentagemCompleta = stats.obrigatorios > 0
            ? Math.round((stats.carregados / stats.obrigatorios) * 100)
            : 0;

        return stats;
    };

    // Handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFilesSelected(files);
    };

    const handleFilesSelected = (files) => {
        // Validar formatos
        const validFiles = files.filter(file => {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            return Object.values(ACCEPTED_FORMATS).flat().includes(ext);
        });

        if (validFiles.length !== files.length) {
            alert('Alguns ficheiros têm formato não suportado');
        }

        setUploadData({
            ...uploadData,
            files: validFiles
        });
        setShowUploadForm(true);
    };

    const handleUpload = async () => {
        if (uploadData.files.length === 0) {
            alert('Por favor selecione ficheiros para enviar');
            return;
        }

        try {
            // Simular upload (em produção seria upload real)
            const newDocuments = uploadData.files.map(file => ({
                id: Date.now().toString() + Math.random(),
                nome: file.name,
                nomeExibicao: DOCUMENT_TYPES[uploadData.tipo]?.label || file.name,
                tamanho: file.size,
                tipo: uploadData.tipo,
                categoria: uploadData.categoria,
                obrigatorio: uploadData.obrigatorio || DOCUMENT_TYPES[uploadData.tipo]?.obrigatorio,
                privado: uploadData.privado,
                verificado: false,
                partilhado: false,
                dataUpload: new Date().toISOString(),
                uploadPor: 'Utilizador Atual',
                url: URL.createObjectURL(file), // Em produção seria URL do storage
                descricao: uploadData.descricao
            }));

            const updatedDocuments = [...documents, ...newDocuments];
            setDocuments(updatedDocuments);

            onChange({
                ...data,
                documents: updatedDocuments
            });

            // Reset form
            setUploadData({
                files: [],
                categoria: 'outro',
                tipo: 'outro',
                descricao: '',
                obrigatorio: false,
                privado: false
            });
            setShowUploadForm(false);
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            alert('Erro ao fazer upload dos ficheiros');
        }
    };

    const handleView = (document) => {
        // Em produção abriria o visualizador apropriado
        window.open(document.url, '_blank');
    };

    const handleDownload = (document) => {
        // Em produção faria download do storage
        const link = document.createElement('a');
        link.href = document.url;
        link.download = document.nome;
        link.click();
    };

    const handleShare = (document) => {
        setSelectedDocument(document);
        setShareData({
            email: '',
            mensagem: '',
            prazoValidade: '',
            permitirDownload: true
        });
        setShowShareModal(true);
    };

    const handleSendShare = async () => {
        if (!shareData.email) {
            alert('Por favor insira o email do destinatário');
            return;
        }

        try {
            // Em produção enviaria email com link seguro
            console.log('Partilhar documento:', selectedDocument, shareData);

            // Marcar como partilhado
            const updatedDocuments = documents.map(d =>
                d.id === selectedDocument.id
                    ? { ...d, partilhado: true }
                    : d
            );

            setDocuments(updatedDocuments);
            onChange({
                ...data,
                documents: updatedDocuments
            });

            setShowShareModal(false);
            setSelectedDocument(null);
            alert('Documento partilhado com sucesso!');
        } catch (error) {
            console.error('Erro ao partilhar:', error);
            alert('Erro ao partilhar documento');
        }
    };

    const handleDelete = async (document) => {
        if (!confirm(`Tem certeza que deseja eliminar ${document.nome}?`)) return;

        try {
            const updatedDocuments = documents.filter(d => d.id !== document.id);
            setDocuments(updatedDocuments);

            onChange({
                ...data,
                documents: updatedDocuments
            });
        } catch (error) {
            console.error('Erro ao eliminar:', error);
            alert('Erro ao eliminar documento');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const stats = getStats();
    const filteredDocuments = getFilteredDocuments();
    const missingDocuments = getMissingDocuments();

    return (
        <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <DocumentTextIcon className="w-5 h-5 mr-2" />
                        Gestão de Documentos
                    </h3>
                    <button
                        onClick={() => document.getElementById('file-upload').click()}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white 
                                 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                        Carregar Documentos
                    </button>
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFilesSelected(Array.from(e.target.files))}
                    />
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-6 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.carregados}/{stats.obrigatorios}</div>
                        <div className="text-xs text-gray-500">Obrigatórios</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.emFalta}</div>
                        <div className="text-xs text-gray-500">Em Falta</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.verificados}</div>
                        <div className="text-xs text-gray-500">Verificados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.partilhados}</div>
                        <div className="text-xs text-gray-500">Partilhados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.percentagemCompleta}%</div>
                        <div className="text-xs text-gray-500">Completo</div>
                    </div>
                </div>

                {/* Barra de progresso */}
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${stats.percentagemCompleta}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Documentos em falta */}
            {missingDocuments.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-yellow-900">Documentos Obrigatórios em Falta</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {missingDocuments.map(docType => (
                                    <span key={docType} className="px-3 py-1 bg-yellow-100 text-yellow-800 
                                                                  rounded-full text-sm">
                                        {DOCUMENT_TYPES[docType]?.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex gap-4 items-center">
                    {/* Busca */}
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 
                                                          w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar documentos..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Categoria */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg 
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todas Categorias</option>
                        {Object.entries(DOCUMENT_CATEGORIES).map(([key, cat]) => (
                            <option key={key} value={key}>{cat.label}</option>
                        ))}
                    </select>

                    {/* Checkbox Obrigatórios */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="showRequired"
                            checked={showOnlyRequired}
                            onChange={(e) => setShowOnlyRequired(e.target.checked)}
                            className="rounded border-gray-300 text-blue-500 
                                     focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="showRequired" className="ml-2 text-sm text-gray-700">
                            Só obrigatórios
                        </label>
                    </div>
                </div>
            </div>

            {/* Área de Drag & Drop / Lista de Documentos */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`rounded-lg border-2 border-dashed transition-all ${isDragging
                        ? 'border-blue-400 bg-blue-50'
                        : documents.length === 0
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-200 bg-white'
                    }`}
            >
                {documents.length === 0 && !isDragging ? (
                    <div className="p-12 text-center">
                        <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                            Arraste ficheiros para aqui ou
                        </p>
                        <button
                            onClick={() => document.getElementById('file-upload').click()}
                            className="text-blue-500 hover:text-blue-600"
                        >
                            clique para selecionar
                        </button>
                        <p className="text-sm text-gray-500 mt-4">
                            Formatos aceites: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX
                        </p>
                    </div>
                ) : isDragging ? (
                    <div className="p-12 text-center">
                        <CloudArrowUpIcon className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-bounce" />
                        <p className="text-blue-600 font-medium">
                            Solte os ficheiros aqui
                        </p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {filteredDocuments.map(document => (
                            <DocumentCard
                                key={document.id}
                                document={document}
                                onView={handleView}
                                onDownload={handleDownload}
                                onShare={handleShare}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Upload */}
            {showUploadForm && uploadData.files.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            Carregar Documentos
                        </h3>

                        <div className="space-y-4">
                            {/* Ficheiros selecionados */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ficheiros Selecionados ({uploadData.files.length})
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {uploadData.files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between 
                                                                   bg-gray-50 px-3 py-2 rounded">
                                            <span className="text-sm truncate">{file.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {formatFileSize(file.size)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tipo de documento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Documento
                                </label>
                                <select
                                    value={uploadData.tipo}
                                    onChange={(e) => {
                                        const tipo = e.target.value;
                                        const categoria = DOCUMENT_TYPES[tipo]?.categoria || 'outro';
                                        setUploadData({
                                            ...uploadData,
                                            tipo,
                                            categoria,
                                            obrigatorio: DOCUMENT_TYPES[tipo]?.obrigatorio || false
                                        });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="outro">Outro</option>
                                    {Object.entries(DOCUMENT_TYPES).map(([key, type]) => (
                                        <option key={key} value={key}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Categoria */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoria
                                </label>
                                <select
                                    value={uploadData.categoria}
                                    onChange={(e) => setUploadData({ ...uploadData, categoria: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={uploadData.tipo !== 'outro'}
                                >
                                    {Object.entries(DOCUMENT_CATEGORIES).map(([key, cat]) => (
                                        <option key={key} value={key}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição (opcional)
                                </label>
                                <textarea
                                    value={uploadData.descricao}
                                    onChange={(e) => setUploadData({ ...uploadData, descricao: e.target.value })}
                                    rows="2"
                                    placeholder="Notas sobre o documento..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Opções */}
                            <div className="flex gap-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="obrigatorio"
                                        checked={uploadData.obrigatorio}
                                        onChange={(e) => setUploadData({ ...uploadData, obrigatorio: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-500"
                                        disabled={DOCUMENT_TYPES[uploadData.tipo]?.obrigatorio}
                                    />
                                    <label htmlFor="obrigatorio" className="ml-2 text-sm text-gray-700">
                                        Documento obrigatório
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="privado"
                                        checked={uploadData.privado}
                                        onChange={(e) => setUploadData({ ...uploadData, privado: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-500"
                                    />
                                    <label htmlFor="privado" className="ml-2 text-sm text-gray-700">
                                        Documento privado
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowUploadForm(false);
                                    setUploadData({
                                        files: [],
                                        categoria: 'outro',
                                        tipo: 'outro',
                                        descricao: '',
                                        obrigatorio: false,
                                        privado: false
                                    });
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 
                                         rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpload}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                                         hover:bg-blue-600"
                            >
                                Carregar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Partilha */}
            {showShareModal && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            Partilhar Documento
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {selectedDocument.nome}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email do Destinatário *
                                </label>
                                <input
                                    type="email"
                                    value={shareData.email}
                                    onChange={(e) => setShareData({ ...shareData, email: e.target.value })}
                                    placeholder="email@exemplo.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mensagem
                                </label>
                                <textarea
                                    value={shareData.mensagem}
                                    onChange={(e) => setShareData({ ...shareData, mensagem: e.target.value })}
                                    rows="3"
                                    placeholder="Mensagem para o destinatário..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prazo de Validade
                                </label>
                                <input
                                    type="date"
                                    value={shareData.prazoValidade}
                                    onChange={(e) => setShareData({ ...shareData, prazoValidade: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="permitirDownload"
                                    checked={shareData.permitirDownload}
                                    onChange={(e) => setShareData({ ...shareData, permitirDownload: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-500"
                                />
                                <label htmlFor="permitirDownload" className="ml-2 text-sm text-gray-700">
                                    Permitir download do documento
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowShareModal(false);
                                    setSelectedDocument(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 
                                         rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSendShare}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                                         hover:bg-blue-600"
                            >
                                Partilhar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsTab;