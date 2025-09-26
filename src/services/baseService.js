/**
 * BASE SERVICE - RealEstateCRM Pro
 * Foundation service class ensuring multi-tenant data isolation
 * All services should extend this base class
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';

export class BaseService {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  /**
   * Get the collection reference for a specific consultant
   * CRITICAL: This ensures data isolation
   */
  getCollectionRef(consultantId) {
    if (!consultantId) {
      throw new Error('ConsultantId is required for all operations');
    }
    return collection(db, 'consultants', consultantId, this.collectionName);
  }

  /**
   * Get a document reference
   */
  getDocRef(consultantId, docId) {
    if (!consultantId) {
      throw new Error('ConsultantId is required for all operations');
    }
    return doc(db, 'consultants', consultantId, this.collectionName, docId);
  }

  /**
   * Create a new document
   */
  async create(consultantId, data, options = {}) {
    try {
      const collectionRef = this.getCollectionRef(consultantId);
      
      // Add metadata
      const documentData = {
        ...data,
        consultantId, // Always include consultantId
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: consultantId,
        isDeleted: false
      };

      // Check for unique constraints if specified
      if (options.uniqueFields) {
        await this.checkUniqueConstraints(consultantId, options.uniqueFields, data);
      }

      const docRef = await addDoc(collectionRef, documentData);
      
      return {
        success: true,
        id: docRef.id,
        data: { id: docRef.id, ...documentData }
      };
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get a single document by ID
   */
  async getById(consultantId, docId) {
    try {
      const docRef = this.getDocRef(consultantId, docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Document not found'
        };
      }

      const data = docSnap.data();
      
      // Security check: ensure document belongs to consultant
      if (data.consultantId !== consultantId) {
        return {
          success: false,
          error: 'Unauthorized access'
        };
      }

      return {
        success: true,
        data: { id: docSnap.id, ...data }
      };
    } catch (error) {
      console.error(`Error getting ${this.collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update a document
   */
  async update(consultantId, docId, data) {
    try {
      const docRef = this.getDocRef(consultantId, docId);
      
      // First verify the document belongs to this consultant
      const existing = await this.getById(consultantId, docId);
      if (!existing.success) {
        return existing;
      }

      // Remove fields that shouldn't be updated
      const { id, consultantId: _, createdAt, createdBy, ...updateData } = data;

      const documentData = {
        ...updateData,
        updatedAt: serverTimestamp(),
        updatedBy: consultantId
      };

      await updateDoc(docRef, documentData);

      return {
        success: true,
        data: { id: docId, ...documentData }
      };
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Soft delete a document (mark as deleted but keep in database)
   */
  async softDelete(consultantId, docId) {
    try {
      const docRef = this.getDocRef(consultantId, docId);
      
      // Verify ownership
      const existing = await this.getById(consultantId, docId);
      if (!existing.success) {
        return existing;
      }

      await updateDoc(docRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: consultantId
      });

      return {
        success: true,
        message: 'Document deleted successfully'
      };
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Hard delete a document (permanent removal)
   */
  async hardDelete(consultantId, docId) {
    try {
      const docRef = this.getDocRef(consultantId, docId);
      
      // Verify ownership
      const existing = await this.getById(consultantId, docId);
      if (!existing.success) {
        return existing;
      }

      await deleteDoc(docRef);

      return {
        success: true,
        message: 'Document permanently deleted'
      };
    } catch (error) {
      console.error(`Error permanently deleting ${this.collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List documents with filters and pagination
   */
  async list(consultantId, options = {}) {
    try {
      const {
        filters = [],
        orderByField = 'createdAt',
        orderDirection = 'desc',
        pageSize = 20,
        lastDoc = null,
        includeDeleted = false
      } = options;

      const collectionRef = this.getCollectionRef(consultantId);
      let q = query(collectionRef);

      // Always filter out deleted unless explicitly requested
      if (!includeDeleted) {
        q = query(q, where('isDeleted', '==', false));
      }

      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Apply ordering
      q = query(q, orderBy(orderByField, orderDirection));

      // Apply pagination
      q = query(q, limit(pageSize));
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Security check
        if (data.consultantId === consultantId) {
          documents.push({ id: doc.id, ...data });
        }
      });

      return {
        success: true,
        data: documents,
        hasMore: documents.length === pageSize,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
      };
    } catch (error) {
      console.error(`Error listing ${this.collectionName}:`, error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Count documents matching criteria
   */
  async count(consultantId, filters = []) {
    try {
      const collectionRef = this.getCollectionRef(consultantId);
      let q = query(collectionRef, where('isDeleted', '==', false));

      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      const querySnapshot = await getDocs(q);
      
      return {
        success: true,
        count: querySnapshot.size
      };
    } catch (error) {
      console.error(`Error counting ${this.collectionName}:`, error);
      return {
        success: false,
        error: error.message,
        count: 0
      };
    }
  }

  /**
   * Search documents by text
   */
  async search(consultantId, searchTerm, searchFields = ['name']) {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return {
          success: true,
          data: []
        };
      }

      const collectionRef = this.getCollectionRef(consultantId);
      const allDocs = await getDocs(query(
        collectionRef,
        where('isDeleted', '==', false)
      ));

      const searchLower = searchTerm.toLowerCase();
      const results = [];

      allDocs.forEach((doc) => {
        const data = doc.data();
        
        // Security check
        if (data.consultantId !== consultantId) return;

        // Search in specified fields
        const matches = searchFields.some(field => {
          const value = data[field];
          if (!value) return false;
          return value.toString().toLowerCase().includes(searchLower);
        });

        if (matches) {
          results.push({ id: doc.id, ...data });
        }
      });

      return {
        success: true,
        data: results
      };
    } catch (error) {
      console.error(`Error searching ${this.collectionName}:`, error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(consultantId, callback, options = {}) {
    const {
      filters = [],
      orderByField = 'createdAt',
      orderDirection = 'desc',
      includeDeleted = false
    } = options;

    const collectionRef = this.getCollectionRef(consultantId);
    let q = query(collectionRef);

    if (!includeDeleted) {
      q = query(q, where('isDeleted', '==', false));
    }

    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });

    q = query(q, orderBy(orderByField, orderDirection));

    return onSnapshot(q, 
      (snapshot) => {
        const documents = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Security check
          if (data.consultantId === consultantId) {
            documents.push({ id: doc.id, ...data });
          }
        });
        callback({ success: true, data: documents });
      },
      (error) => {
        console.error(`Error in subscription for ${this.collectionName}:`, error);
        callback({ success: false, error: error.message, data: [] });
      }
    );
  }

  /**
   * Batch operations for better performance
   */
  async batchCreate(consultantId, documents) {
    try {
      const batch = writeBatch(db);
      const results = [];

      for (const data of documents) {
        const docRef = doc(this.getCollectionRef(consultantId));
        const documentData = {
          ...data,
          consultantId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: consultantId,
          isDeleted: false
        };
        
        batch.set(docRef, documentData);
        results.push({ id: docRef.id, ...documentData });
      }

      await batch.commit();

      return {
        success: true,
        data: results,
        count: results.length
      };
    } catch (error) {
      console.error(`Error in batch create for ${this.collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check unique constraints
   */
  async checkUniqueConstraints(consultantId, fields, data) {
    const collectionRef = this.getCollectionRef(consultantId);

    for (const field of fields) {
      if (!data[field]) continue;

      const q = query(
        collectionRef,
        where(field, '==', data[field]),
        where('isDeleted', '==', false)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        throw new Error(`${field} already exists: ${data[field]}`);
      }
    }
  }

  /**
   * Get statistics for the collection
   */
  async getStats(consultantId) {
    try {
      const collectionRef = this.getCollectionRef(consultantId);
      
      const [totalSnapshot, activeSnapshot] = await Promise.all([
        getDocs(query(collectionRef)),
        getDocs(query(collectionRef, where('isDeleted', '==', false)))
      ]);

      return {
        success: true,
        stats: {
          total: totalSnapshot.size,
          active: activeSnapshot.size,
          deleted: totalSnapshot.size - activeSnapshot.size
        }
      };
    } catch (error) {
      console.error(`Error getting stats for ${this.collectionName}:`, error);
      return {
        success: false,
        error: error.message,
        stats: { total: 0, active: 0, deleted: 0 }
      };
    }
  }
}

export default BaseService;