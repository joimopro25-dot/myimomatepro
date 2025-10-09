/**
 * DOCUMENT STORAGE UTILS - MyImoMatePro
 * Firebase Storage utilities for opportunity documents
 * Path: src/utils/documentStorage.js
 */

import { storage } from '../firebase/config';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  getMetadata 
} from 'firebase/storage';

/**
 * Upload a document to Firebase Storage
 * @param {string} consultantId - Consultant ID
 * @param {string} clientId - Client ID
 * @param {string} opportunityId - Opportunity ID
 * @param {File} file - File to upload
 * @returns {Promise<Object>} Document metadata
 */
export const uploadOpportunityDocument = async (
  consultantId,
  clientId,
  opportunityId,
  file
) => {
  try {
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    
    // Create storage path
    const storagePath = `consultants/${consultantId}/clients/${clientId}/opportunities/${opportunityId}/documents/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        consultantId,
        clientId,
        opportunityId,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Return document metadata
    return {
      id: `doc_${timestamp}`,
      name: file.name,
      type: file.type,
      size: file.size,
      path: storagePath,
      downloadURL: downloadURL,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Falha ao carregar documento: ' + error.message);
  }
};

/**
 * Delete a document from Firebase Storage
 * @param {string} consultantId - Consultant ID
 * @param {string} clientId - Client ID
 * @param {string} opportunityId - Opportunity ID
 * @param {string} storagePath - Full storage path of the document
 * @returns {Promise<void>}
 */
export const deleteOpportunityDocument = async (
  consultantId,
  clientId,
  opportunityId,
  storagePath
) => {
  try {
    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Delete the file
    await deleteObject(storageRef);
    
    console.log('Document deleted successfully');
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Falha ao eliminar documento: ' + error.message);
  }
};

/**
 * Get download URL for a document
 * @param {string} storagePath - Full storage path of the document
 * @returns {Promise<string>} Download URL
 */
export const getDocumentDownloadURL = async (storagePath) => {
  try {
    const storageRef = ref(storage, storagePath);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw new Error('Falha ao obter URL de transferência: ' + error.message);
  }
};

/**
 * Get document metadata
 * @param {string} storagePath - Full storage path of the document
 * @returns {Promise<Object>} Document metadata
 */
export const getDocumentMetadata = async (storagePath) => {
  try {
    const storageRef = ref(storage, storagePath);
    const metadata = await getMetadata(storageRef);
    return metadata;
  } catch (error) {
    console.error('Error getting document metadata:', error);
    throw new Error('Falha ao obter metadados do documento: ' + error.message);
  }
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateDocument = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ]
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de ficheiro não suportado. Use PDF, Word ou imagens (JPG, PNG).'
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const limitMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Ficheiro demasiado grande. Limite: ${limitMB}MB`
    };
  }

  return { valid: true };
};

/**
 * Get file icon based on type
 * @param {string} mimeType - File MIME type
 * @returns {string} Icon name
 */
export const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'photo';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word')) return 'document';
  return 'file';
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};