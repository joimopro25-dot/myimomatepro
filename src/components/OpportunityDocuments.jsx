/**
 * OPPORTUNITY DOCUMENTS COMPONENT - MyImoMatePro
 * Document management for seller opportunities
 * Supports file uploads (PDF, Word, Images) and external links
 */

import React, { useState } from 'react';
import {
  DocumentTextIcon,
  LinkIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { 
  uploadOpportunityDocument, 
  deleteOpportunityDocument,
  getDocumentDownloadURL 
} from '../utils/documentStorage';

export default function OpportunityDocuments({ 
  documents = [], 
  externalLinks = [],
  opportunityId,
  clientId,
  consultantId,
  onUpdate 
}) {
  const [uploading, setUploading] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [selectedImage, setSelectedImage] = useState(null);

  // File upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de ficheiro não suportado. Use PDF, Word ou imagens (JPG, PNG).');
      return;
    }

    // Validate file size
    const maxSize = file.type.startsWith('image/') ? 500 * 1024 : 5 * 1024 * 1024; // 500KB for images, 5MB for docs
    if (file.size > maxSize) {
      const limit = file.type.startsWith('image/') ? '500KB' : '5MB';
      alert(`Ficheiro demasiado grande. Limite: ${limit}`);
      return;
    }

    try {
      setUploading(true);
      
      const result = await uploadOpportunityDocument(
        consultantId,
        clientId,
        opportunityId,
        file
      );

      // Update parent component
      const updatedDocuments = [...documents, result];
      onUpdate({ documents: updatedDocuments });

      // Reset input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Erro ao carregar ficheiro. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const handleDeleteDocument = async (doc) => {
    if (!confirm('Tem a certeza que deseja eliminar este documento?')) return;

    try {
      await deleteOpportunityDocument(
        consultantId,
        clientId,
        opportunityId,
        doc.path
      );

      const updatedDocuments = documents.filter(d => d.id !== doc.id);
      onUpdate({ documents: updatedDocuments });
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Erro ao eliminar documento.');
    }
  };

  // Add external link
  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) {
      alert('Por favor preencha o título e URL do link.');
      return;
    }

    // Validate URL
    try {
      new URL(newLink.url);
    } catch {
      alert('URL inválido. Use um formato como: https://example.com');
      return;
    }

    const linkData = {
      id: `link_${Date.now()}`,
      title: newLink.title,
      url: newLink.url,
      createdAt: new Date().toISOString()
    };

    const updatedLinks = [...externalLinks, linkData];
    onUpdate({ externalLinks: updatedLinks });

    setNewLink({ title: '', url: '' });
    setShowAddLink(false);
  };

  // Delete external link
  const handleDeleteLink = (linkId) => {
    const updatedLinks = externalLinks.filter(l => l.id !== linkId);
    onUpdate({ externalLinks: updatedLinks });
  };

  // Download document
  const handleDownload = async (doc) => {
    try {
      const url = await getDocumentDownloadURL(doc.path);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Erro ao transferir documento.');
    }
  };

  // View image
  const handleViewImage = (doc) => {
    setSelectedImage(doc);
  };

  // Get file icon
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <PhotoIcon className="w-5 h-5 text-purple-600" />;
    }
    return <DocumentTextIcon className="w-5 h-5 text-blue-600" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Documentos</h2>
        <div className="flex gap-2">
          <label className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Carregar
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </label>
          <button
            onClick={() => setShowAddLink(true)}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <LinkIcon className="w-4 h-4" />
            Link
          </button>
        </div>
      </div>

      {/* Uploading indicator */}
      {uploading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">A carregar documento...</span>
          </div>
        </div>
      )}

      {/* Add Link Modal */}
      {showAddLink && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Adicionar Link Externo</h3>
            <button
              onClick={() => {
                setShowAddLink(false);
                setNewLink({ title: '', url: '' });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                placeholder="Ex: Pasta do Google Drive"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddLink}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setShowAddLink(false);
                  setNewLink({ title: '', url: '' });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {documents.length === 0 && externalLinks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhum documento ou link adicionado</p>
          </div>
        ) : (
          <>
            {/* Uploaded Documents */}
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(doc.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {doc.type.startsWith('image/') && (
                    <button
                      onClick={() => handleViewImage(doc)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      title="Ver imagem"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Transferir"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* External Links */}
            {externalLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <LinkIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {link.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {link.url}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="Abrir link"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* File size limits info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Limites:</strong> Documentos até 5MB • Imagens até 500KB • Formatos: PDF, Word, JPG, PNG
        </p>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <img
              src={selectedImage.downloadURL}
              alt={selectedImage.name}
              className="max-w-full max-h-[90vh] rounded-lg"
            />
            <div className="mt-2 text-center text-white">
              <p className="font-medium">{selectedImage.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}