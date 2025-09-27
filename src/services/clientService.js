/**
 * CLIENT SERVICE - RealEstateCRM Pro
 * Handles all client operations with multi-tenant isolation
 * Includes qualification and opportunity management
 */

import { BaseService } from './baseService';
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
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  validateClientData, 
  calculateClientScore, 
  generateClientTitle,
  CLIENT_CATEGORIES
} from '../models/clientModel';
import { validateNIF, validatePhone, validateEmail } from '../utils/validation';
import { opportunityService } from './opportunityService';
import { subscriptionService } from './subscriptionService';

class ClientService extends BaseService {
  constructor() {
    super('clients');
  }

  /**
   * Quick Add Client - Minimal data capture
   */
  async quickAddClient(consultantId, { name, phone, email }) {
    try {
      // Check subscription limits
      const canAdd = await subscriptionService.canAddClient(consultantId);
      if (!canAdd) {
        throw new Error('Client limit reached for your subscription plan');
      }

      // Validate minimal data
      if (!name || name.trim().length < 2) {
        throw new Error('Name is required (minimum 2 characters)');
      }

      if (phone && !validatePhone(phone)) {
        throw new Error('Invalid phone number format');
      }

      if (email && !validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Check for duplicates
      const duplicates = await this.checkDuplicates(consultantId, { phone, email });
      if (duplicates.length > 0) {
        throw new Error(`Duplicate client found: ${duplicates[0].name}`);
      }

      // Create client document
      const clientData = {
        name: name.trim(),
        phone: phone || null,
        email: email ? email.toLowerCase() : null,
        consultantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isQuickAdd: true,
        profileComplete: false,
        qualifications: [],
        tags: [],
        clientScore: {
          engagement: 0,
          financial: 0,
          urgency: 0,
          overall: 0,
          category: 'C'
        },
        metadata: {
          lastContactedAt: null,
          nextFollowUp: null,
          totalDeals: 0,
          totalValue: 0
        }
      };

      const docRef = await addDoc(this.getCollectionRef(consultantId), clientData);

      // Update consultant's client count
      await subscriptionService.incrementClientCount(consultantId, 1);

      return {
        id: docRef.id,
        ...clientData
      };
    } catch (error) {
      console.error('Error in quickAddClient:', error);
      throw error;
    }
  }

  /**
   * Create Complete Client Profile
   */
  async createClient(consultantId, clientData) {
    try {
      // Check subscription limits
      const canAdd = await subscriptionService.canAddClient(consultantId);
      if (!canAdd) {
        throw new Error('Client limit reached for your subscription plan');
      }

      // Validate complete data
      const validation = validateClientData(clientData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check for duplicates
      const duplicates = await this.checkDuplicates(consultantId, {
        email: clientData.email,
        phone: clientData.phone,
        nif: clientData.nif
      });
      
      if (duplicates.length > 0) {
        throw new Error(`Duplicate client found: ${duplicates[0].name}`);
      }

      // Calculate initial score
      const scoreData = calculateClientScore(clientData);

      // Prepare client document
      const completeClientData = {
        ...clientData,
        consultantId,
        clientScore: scoreData,
        profileComplete: true,
        isQuickAdd: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metadata: {
          lastContactedAt: null,
          nextFollowUp: null,
          totalDeals: 0,
          totalValue: 0
        }
      };

      // Create client
      const docRef = await addDoc(this.getCollectionRef(consultantId), completeClientData);
      const newClientId = docRef.id;

      // If client has qualifications, create opportunities
      if (clientData.qualifications && clientData.qualifications.length > 0) {
        for (const qualification of clientData.qualifications) {
          if (qualification.active) {
            await this.addQualification(consultantId, newClientId, qualification);
          }
        }
      }

      // Update consultant's client count
      await subscriptionService.incrementClientCount(consultantId, 1);

      return {
        id: newClientId,
        ...completeClientData
      };
    } catch (error) {
      console.error('Error in createClient:', error);
      throw error;
    }
  }

  /**
   * Update Client
   */
  async updateClient(consultantId, clientId, updates) {
    try {
      // Remove system fields from updates
      const { id, consultantId: _, createdAt, ...validUpdates } = updates;

      // If updating NIF, validate it
      if (validUpdates.nif && !validateNIF(validUpdates.nif)) {
        throw new Error('Invalid NIF format');
      }

      // If updating phone, validate it
      if (validUpdates.phone && !validatePhone(validUpdates.phone)) {
        throw new Error('Invalid phone number format');
      }

      // Add update timestamp
      validUpdates.updatedAt = serverTimestamp();

      // If profile data is being completed, mark as complete
      if (validUpdates.nif && validUpdates.address && validUpdates.dateOfBirth) {
        validUpdates.profileComplete = true;
        validUpdates.isQuickAdd = false;
      }

      // Recalculate score if relevant data changed
      if (validUpdates.annualIncome || validUpdates.qualifications) {
        const currentClient = await this.getById(consultantId, clientId);
        const updatedClient = { ...currentClient, ...validUpdates };
        validUpdates.clientScore = calculateClientScore(updatedClient);
      }

      await updateDoc(
        doc(this.getCollectionRef(consultantId), clientId),
        validUpdates
      );

      return { id: clientId, ...validUpdates };
    } catch (error) {
      console.error('Error in updateClient:', error);
      throw error;
    }
  }

  /**
   * Get Client by ID
   */
  async getClientById(consultantId, clientId) {
    try {
      const docSnap = await getDoc(
        doc(this.getCollectionRef(consultantId), clientId)
      );

      if (!docSnap.exists()) {
        throw new Error('Client not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error in getClientById:', error);
      throw error;
    }
  }

  /**
   * List Clients with filters and pagination
   */
  async listClients(consultantId, options = {}) {
    try {
      const {
        filterBy = {},
        sortBy = 'createdAt',
        sortOrder = 'desc',
        pageSize = 20,
        lastDoc = null
      } = options;

      let q = query(
        this.getCollectionRef(consultantId),
        orderBy(sortBy, sortOrder),
        limit(pageSize)
      );

      // Apply filters
      if (filterBy.category) {
        q = query(q, where('clientScore.category', '==', filterBy.category));
      }
      
      if (filterBy.qualification) {
        q = query(q, where('qualifications', 'array-contains', filterBy.qualification));
      }

      if (filterBy.profileComplete !== undefined) {
        q = query(q, where('profileComplete', '==', filterBy.profileComplete));
      }

      if (filterBy.tags && filterBy.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filterBy.tags));
      }

      // Pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const clients = [];
      let lastVisible = null;

      snapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data()
        });
        lastVisible = doc;
      });

      return {
        clients,
        lastDoc: lastVisible,
        hasMore: clients.length === pageSize
      };
    } catch (error) {
      console.error('Error in listClients:', error);
      throw error;
    }
  }

  /**
   * Add Qualification to Client (auto-creates opportunity)
   */
  async addQualification(consultantId, clientId, qualification) {
    const batch = writeBatch(db);
    
    try {
      const clientRef = doc(this.getCollectionRef(consultantId), clientId);
      const client = await this.getClientById(consultantId, clientId);

      // Create qualification with ID
      const newQualification = {
        ...qualification,
        id: `qual_${Date.now()}`,
        active: true,
        createdAt: serverTimestamp()
      };

      // Update client's qualifications
      const updatedQualifications = [...(client.qualifications || []), newQualification];
      
      batch.update(clientRef, {
        qualifications: updatedQualifications,
        updatedAt: serverTimestamp()
      });

      // Auto-create opportunity
      const opportunity = await opportunityService.createFromQualification(
        consultantId,
        client,
        newQualification
      );

      // Update qualification with opportunity ID
      newQualification.opportunityId = opportunity.id;
      
      batch.update(clientRef, {
        qualifications: updatedQualifications.map(q => 
          q.id === newQualification.id ? newQualification : q
        )
      });

      await batch.commit();

      return {
        qualification: newQualification,
        opportunity
      };
    } catch (error) {
      console.error('Error in addQualification:', error);
      throw error;
    }
  }

  /**
   * Remove Qualification from Client
   */
  async removeQualification(consultantId, clientId, qualificationId) {
    try {
      const client = await this.getClientById(consultantId, clientId);
      const updatedQualifications = client.qualifications.filter(
        q => q.id !== qualificationId
      );

      await this.updateClient(consultantId, clientId, {
        qualifications: updatedQualifications
      });

      // Also cancel the related opportunity if exists
      const qualification = client.qualifications.find(q => q.id === qualificationId);
      if (qualification?.opportunityId) {
        await opportunityService.cancelOpportunity(
          consultantId, 
          qualification.opportunityId
        );
      }

      return true;
    } catch (error) {
      console.error('Error in removeQualification:', error);
      throw error;
    }
  }

  /**
   * Link Spouse as Separate Client
   */
  async linkSpouseAsClient(consultantId, clientId) {
    try {
      const client = await this.getClientById(consultantId, clientId);
      
      if (!client.spouse || !client.spouse.name) {
        throw new Error('Client has no spouse data');
      }

      // Check if spouse already exists as client
      const duplicates = await this.checkDuplicates(consultantId, {
        nif: client.spouse.nif,
        email: client.spouse.email
      });

      if (duplicates.length > 0) {
        // Link existing client
        await this.updateClient(consultantId, clientId, {
          'spouse.isAlsoClient': true,
          'spouse.linkedClientId': duplicates[0].id
        });
        return duplicates[0];
      }

      // Create new client from spouse data
      const spouseClient = await this.createClient(consultantId, {
        name: client.spouse.name,
        nif: client.spouse.nif,
        ccNumber: client.spouse.ccNumber,
        ccExpiryDate: client.spouse.ccExpiryDate,
        dateOfBirth: client.spouse.dateOfBirth,
        nationality: client.spouse.nationality,
        phone: client.spouse.phone,
        email: client.spouse.email,
        occupation: client.spouse.occupation,
        annualIncome: client.spouse.annualIncome,
        address: client.address, // Same address as main client
        source: 'spouse',
        referredBy: client.name,
        relationshipStatus: client.relationshipStatus,
        spouse: {
          name: client.name,
          isAlsoClient: true,
          linkedClientId: clientId
        }
      });

      // Update original client with link
      await this.updateClient(consultantId, clientId, {
        'spouse.isAlsoClient': true,
        'spouse.linkedClientId': spouseClient.id
      });

      return spouseClient;
    } catch (error) {
      console.error('Error in linkSpouseAsClient:', error);
      throw error;
    }
  }

  /**
   * Search Clients
   */
  async searchClients(consultantId, searchTerm) {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      const searchLower = searchTerm.toLowerCase();
      
      // Get all clients (limited to 100 for performance)
      const snapshot = await getDocs(
        query(
          this.getCollectionRef(consultantId),
          limit(100)
        )
      );

      const clients = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const searchableFields = [
          data.name,
          data.email,
          data.phone,
          data.nif,
          data.ccNumber
        ].filter(Boolean).map(field => field.toLowerCase());

        // Check if any field contains search term
        if (searchableFields.some(field => field.includes(searchLower))) {
          clients.push({
            id: doc.id,
            ...data
          });
        }
      });

      return clients;
    } catch (error) {
      console.error('Error in searchClients:', error);
      throw error;
    }
  }

  /**
   * Check for Duplicate Clients
   */
  async checkDuplicates(consultantId, { email, phone, nif }) {
    try {
      const duplicates = [];
      
      // Check by email
      if (email) {
        const emailQuery = query(
          this.getCollectionRef(consultantId),
          where('email', '==', email.toLowerCase())
        );
        const emailSnapshot = await getDocs(emailQuery);
        emailSnapshot.forEach(doc => {
          duplicates.push({ id: doc.id, ...doc.data(), matchField: 'email' });
        });
      }

      // Check by phone
      if (phone && duplicates.length === 0) {
        const phoneQuery = query(
          this.getCollectionRef(consultantId),
          where('phone', '==', phone)
        );
        const phoneSnapshot = await getDocs(phoneQuery);
        phoneSnapshot.forEach(doc => {
          duplicates.push({ id: doc.id, ...doc.data(), matchField: 'phone' });
        });
      }

      // Check by NIF
      if (nif && duplicates.length === 0) {
        const nifQuery = query(
          this.getCollectionRef(consultantId),
          where('nif', '==', nif)
        );
        const nifSnapshot = await getDocs(nifQuery);
        nifSnapshot.forEach(doc => {
          duplicates.push({ id: doc.id, ...doc.data(), matchField: 'nif' });
        });
      }

      return duplicates;
    } catch (error) {
      console.error('Error in checkDuplicates:', error);
      throw error;
    }
  }

  /**
   * Update client contact timestamp
   */
  async recordContact(consultantId, clientId, contactType = 'general') {
    try {
      await this.updateClient(consultantId, clientId, {
        'metadata.lastContactedAt': serverTimestamp(),
        'metadata.lastContactType': contactType
      });
    } catch (error) {
      console.error('Error in recordContact:', error);
      throw error;
    }
  }

  /**
   * Set next follow-up date
   */
  async setFollowUp(consultantId, clientId, followUpDate, notes) {
    try {
      await this.updateClient(consultantId, clientId, {
        'metadata.nextFollowUp': followUpDate,
        'metadata.followUpNotes': notes || null
      });
    } catch (error) {
      console.error('Error in setFollowUp:', error);
      throw error;
    }
  }

  /**
   * Get clients needing follow-up
   */
  async getFollowUpClients(consultantId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const q = query(
        this.getCollectionRef(consultantId),
        where('metadata.nextFollowUp', '<=', today),
        orderBy('metadata.nextFollowUp', 'asc')
      );

      const snapshot = await getDocs(q);
      const clients = [];

      snapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return clients;
    } catch (error) {
      console.error('Error in getFollowUpClients:', error);
      throw error;
    }
  }

  /**
   * Bulk update client tags
   */
  async bulkUpdateTags(consultantId, clientIds, tags, operation = 'add') {
    const batch = writeBatch(db);

    try {
      for (const clientId of clientIds) {
        const clientRef = doc(this.getCollectionRef(consultantId), clientId);
        const client = await this.getClientById(consultantId, clientId);
        
        let updatedTags = [...(client.tags || [])];
        
        if (operation === 'add') {
          // Add tags (avoiding duplicates)
          tags.forEach(tag => {
            if (!updatedTags.includes(tag)) {
              updatedTags.push(tag);
            }
          });
        } else if (operation === 'remove') {
          // Remove tags
          updatedTags = updatedTags.filter(tag => !tags.includes(tag));
        } else if (operation === 'replace') {
          // Replace all tags
          updatedTags = tags;
        }

        batch.update(clientRef, {
          tags: updatedTags,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error in bulkUpdateTags:', error);
      throw error;
    }
  }

  /**
   * Delete Client (soft delete)
   */
  async deleteClient(consultantId, clientId) {
    try {
      await this.updateClient(consultantId, clientId, {
        isDeleted: true,
        deletedAt: serverTimestamp()
      });

      // Update consultant's client count
      await subscriptionService.incrementClientCount(consultantId, -1);

      return true;
    } catch (error) {
      console.error('Error in deleteClient:', error);
      throw error;
    }
  }

  /**
   * Get client statistics
   */
  async getClientStats(consultantId) {
    try {
      const snapshot = await getDocs(this.getCollectionRef(consultantId));
      
      const stats = {
        total: 0,
        byCategory: { A: 0, B: 0, C: 0 },
        byQualification: {},
        quickAdd: 0,
        complete: 0,
        withSpouse: 0,
        needsFollowUp: 0
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      snapshot.forEach((doc) => {
        const client = doc.data();
        
        if (!client.isDeleted) {
          stats.total++;
          
          // By category
          const category = client.clientScore?.category || 'C';
          stats.byCategory[category]++;
          
          // By qualification
          if (client.qualifications) {
            client.qualifications.forEach(qual => {
              if (qual.active) {
                stats.byQualification[qual.type] = 
                  (stats.byQualification[qual.type] || 0) + 1;
              }
            });
          }
          
          // Profile status
          if (client.isQuickAdd) {
            stats.quickAdd++;
          } else if (client.profileComplete) {
            stats.complete++;
          }
          
          // With spouse
          if (client.spouse?.name) {
            stats.withSpouse++;
          }
          
          // Needs follow-up
          if (client.metadata?.nextFollowUp && 
              new Date(client.metadata.nextFollowUp) <= today) {
            stats.needsFollowUp++;
          }
        }
      });

      return stats;
    } catch (error) {
      console.error('Error in getClientStats:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const clientService = new ClientService();