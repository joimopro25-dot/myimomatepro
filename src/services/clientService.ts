// src/services/clientService.ts
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
 Timestamp,
 DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Client {
 id?: string;
 // Campos obrigatórios
 name: string;
 email: string;
 phone: string;
 
 // Dados pessoais
 personalInfo?: {
   citizenCardNumber?: string;
   citizenCardValidity?: Date;
   nif?: string;
   birthDate?: Date;
   nationality?: string;
   birthPlace?: string;
   parish?: string;
   municipality?: string;
   profession?: string;
   maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'civil_union';
 };
 
 // Dados do cônjuge
 spouse?: {
   name?: string;
   email?: string;
   phone?: string;
   profession?: string;
   citizenCardNumber?: string;
   nif?: string;
 };
 
 // Morada
 address?: {
   street?: string;
   number?: string;
   floor?: string;
   postalCode?: string;
   city?: string;
   parish?: string;
   municipality?: string;
   district?: string;
 };
 
 // Informações financeiras
 financialInfo?: {
   monthlyIncome?: number;
   spouseMonthlyIncome?: number;
   totalHouseholdIncome?: number;
   availableCapital?: number;
   creditSituation?: 'no_credit' | 'mortgage' | 'personal_loan' | 'car_loan' | 'multiple_credits';
   primaryBank?: string;
   hasBankPreApproval?: boolean;
   preApprovalDetails?: string;
 };
 
 // Preferências de contacto
 contactPreferences?: {
   preferredMethod?: 'phone' | 'email' | 'whatsapp' | 'sms';
   bestTimeToCall?: string;
   daysAvailable?: string[];
 };
 
 // Tags e classificações
 tags?: string[];
 
 // Origem
 source?: {
   channel?: string;
   details?: string;
   referralSource?: string;
 };
 
 // Consentimentos GDPR
 gdprConsents?: {
   dataProcessing: boolean;
   marketing: boolean;
   consentDate: Date;
 };
 
 // Status e observações
 status: 'active' | 'inactive' | 'archived';
 notes?: string;
 consultorNotes?: string;
 nextContactDate?: Date;
 
 // Campos de sistema
 tenantId: string;
 createdAt: Date;
 updatedAt: Date;
 createdBy: string;
 updatedBy: string;
}

export interface ClientListOptions {
 page?: number;
 limit?: number;
 search?: string;
 status?: string;
 tags?: string[];
 sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'nextContactDate';
 sortOrder?: 'asc' | 'desc';
}

export interface ClientListResponse {
 clients: Client[];
 total: number;
 hasMore: boolean;
 nextPage?: number;
}

export class ClientService {
 private getClientCollection(tenantId: string) {
   return collection(db, \	enants/\/clients\);
 }
 
 // Criar novo cliente
 async createClient(tenantId: string, userId: string, clientData: Omit<Client, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Client> {
   try {
     const now = new Date();
     
     const client: Omit<Client, 'id'> = {
       ...clientData,
       tenantId,
       createdAt: now,
       updatedAt: now,
       createdBy: userId,
       updatedBy: userId,
       status: clientData.status || 'active'
     };
     
     const clientCollection = this.getClientCollection(tenantId);
     const docRef = await addDoc(clientCollection, {
       ...client,
       createdAt: Timestamp.fromDate(client.createdAt),
       updatedAt: Timestamp.fromDate(client.updatedAt),
       nextContactDate: client.nextContactDate ? Timestamp.fromDate(client.nextContactDate) : null,
       personalInfo: {
         ...client.personalInfo,
         birthDate: client.personalInfo?.birthDate ? Timestamp.fromDate(client.personalInfo.birthDate) : null,
         citizenCardValidity: client.personalInfo?.citizenCardValidity ? Timestamp.fromDate(client.personalInfo.citizenCardValidity) : null
       },
       gdprConsents: client.gdprConsents ? {
         ...client.gdprConsents,
         consentDate: Timestamp.fromDate(client.gdprConsents.consentDate)
       } : null
     });
     
     return { ...client, id: docRef.id };
   } catch (error) {
     console.error('Error creating client:', error);
     throw new Error('Falha ao criar cliente');
   }
 }
 
 // Obter cliente por ID
 async getClient(tenantId: string, clientId: string): Promise<Client | null> {
   try {
     const clientDoc = await getDoc(doc(this.getClientCollection(tenantId), clientId));
     
     if (!clientDoc.exists()) {
       return null;
     }
     
     const data = clientDoc.data();
     
     return {
       ...data,
       id: clientDoc.id,
       createdAt: data.createdAt?.toDate() || new Date(),
       updatedAt: data.updatedAt?.toDate() || new Date(),
       nextContactDate: data.nextContactDate?.toDate() || null,
       personalInfo: data.personalInfo ? {
         ...data.personalInfo,
         birthDate: data.personalInfo.birthDate?.toDate() || null,
         citizenCardValidity: data.personalInfo.citizenCardValidity?.toDate() || null
       } : undefined,
       gdprConsents: data.gdprConsents ? {
         ...data.gdprConsents,
         consentDate: data.gdprConsents.consentDate?.toDate() || new Date()
       } : undefined
     } as Client;
   } catch (error) {
     console.error('Error getting client:', error);
     throw new Error('Falha ao obter cliente');
   }
 }
 
 // Atualizar cliente
 async updateClient(tenantId: string, userId: string, clientId: string, updates: Partial<Client>): Promise<void> {
   try {
     const clientRef = doc(this.getClientCollection(tenantId), clientId);
     
     const updateData = {
       ...updates,
       updatedAt: Timestamp.fromDate(new Date()),
       updatedBy: userId
     };
     
     // Convert dates to Timestamps
     if (updates.nextContactDate) {
       updateData.nextContactDate = Timestamp.fromDate(updates.nextContactDate);
     }
     
     if (updates.personalInfo) {
       updateData.personalInfo = {
         ...updates.personalInfo,
         birthDate: updates.personalInfo.birthDate ? Timestamp.fromDate(updates.personalInfo.birthDate) : null,
         citizenCardValidity: updates.personalInfo.citizenCardValidity ? Timestamp.fromDate(updates.personalInfo.citizenCardValidity) : null
       };
     }
     
     if (updates.gdprConsents) {
       updateData.gdprConsents = {
         ...updates.gdprConsents,
         consentDate: Timestamp.fromDate(updates.gdprConsents.consentDate)
       };
     }
     
     await updateDoc(clientRef, updateData);
   } catch (error) {
     console.error('Error updating client:', error);
     throw new Error('Falha ao atualizar cliente');
   }
 }
 
 // Eliminar cliente (soft delete)
 async deleteClient(tenantId: string, userId: string, clientId: string): Promise<void> {
   try {
     await this.updateClient(tenantId, userId, clientId, {
       status: 'archived',
       updatedAt: new Date(),
       updatedBy: userId
     });
   } catch (error) {
     console.error('Error deleting client:', error);
     throw new Error('Falha ao arquivar cliente');
   }
 }
 
 // Eliminar definitivamente
 async permanentDeleteClient(tenantId: string, clientId: string): Promise<void> {
   try {
     const clientRef = doc(this.getClientCollection(tenantId), clientId);
     await deleteDoc(clientRef);
   } catch (error) {
     console.error('Error permanently deleting client:', error);
     throw new Error('Falha ao eliminar cliente definitivamente');
   }
 }
 
 // Listar clientes com filtros e paginação
 async getClients(tenantId: string, options: ClientListOptions = {}): Promise<ClientListResponse> {
   try {
     const {
       page = 1,
       limit: pageLimit = 20,
       search,
       status,
       tags,
       sortBy = 'name',
       sortOrder = 'asc'
     } = options;
     
     let baseQuery = query(this.getClientCollection(tenantId));
     
     // Filter by status
     if (status) {
       baseQuery = query(baseQuery, where('status', '==', status));
     } else {
       // Default: exclude archived
       baseQuery = query(baseQuery, where('status', '!=', 'archived'));
     }
     
     // Filter by tags
     if (tags && tags.length > 0) {
       baseQuery = query(baseQuery, where('tags', 'array-contains-any', tags));
     }
     
     // Sort
     baseQuery = query(baseQuery, orderBy(sortBy, sortOrder));
     
     // Limit
     baseQuery = query(baseQuery, limit(pageLimit + 1)); // +1 to check if there are more
     
     // Execute query
     const snapshot = await getDocs(baseQuery);
     const docs = snapshot.docs;
     
     // Check if there are more results
     const hasMore = docs.length > pageLimit;
     if (hasMore) {
       docs.pop(); // Remove the extra document
     }
     
     // Convert to Client objects
     const clients: Client[] = docs.map(doc => ({
       ...doc.data(),
       id: doc.id,
       createdAt: doc.data().createdAt?.toDate() || new Date(),
       updatedAt: doc.data().updatedAt?.toDate() || new Date(),
       nextContactDate: doc.data().nextContactDate?.toDate() || null,
       personalInfo: doc.data().personalInfo ? {
         ...doc.data().personalInfo,
         birthDate: doc.data().personalInfo.birthDate?.toDate() || null,
         citizenCardValidity: doc.data().personalInfo.citizenCardValidity?.toDate() || null
       } : undefined,
       gdprConsents: doc.data().gdprConsents ? {
         ...doc.data().gdprConsents,
         consentDate: doc.data().gdprConsents.consentDate?.toDate() || new Date()
       } : undefined
     })) as Client[];
     
     // Client-side search (for simplicity - could be moved to server-side)
     let filteredClients = clients;
     if (search) {
       const searchLower = search.toLowerCase();
       filteredClients = clients.filter(client =>
         client.name.toLowerCase().includes(searchLower) ||
         client.email.toLowerCase().includes(searchLower) ||
         client.phone.includes(search)
       );
     }
     
     return {
       clients: filteredClients,
       total: filteredClients.length, // This would need a separate count query in production
       hasMore,
       nextPage: hasMore ? page + 1 : undefined
     };
   } catch (error) {
     console.error('Error getting clients:', error);
     throw new Error('Falha ao obter lista de clientes');
   }
 }
 
 // Pesquisa rápida
 async searchClients(tenantId: string, searchTerm: string, limit = 10): Promise<Client[]> {
   try {
     const result = await this.getClients(tenantId, {
       search: searchTerm,
       limit,
       status: 'active'
     });
     
     return result.clients;
   } catch (error) {
     console.error('Error searching clients:', error);
     throw new Error('Falha na pesquisa de clientes');
   }
 }
 
 // Obter estatísticas de clientes
 async getClientStats(tenantId: string): Promise<{
   total: number;
   active: number;
   inactive: number;
   archived: number;
   thisMonth: number;
   thisWeek: number;
 }> {
   try {
     // This is a simplified version - in production, you'd want optimized queries
     const allClients = await this.getClients(tenantId, { limit: 1000 });
     const now = new Date();
     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
     const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
     
     const stats = {
       total: 0,
       active: 0,
       inactive: 0,
       archived: 0,
       thisMonth: 0,
       thisWeek: 0
     };
     
     allClients.clients.forEach(client => {
       stats.total++;
       
       switch (client.status) {
         case 'active':
           stats.active++;
           break;
         case 'inactive':
           stats.inactive++;
           break;
         case 'archived':
           stats.archived++;
           break;
       }
       
       if (client.createdAt >= startOfMonth) {
         stats.thisMonth++;
       }
       
       if (client.createdAt >= startOfWeek) {
         stats.thisWeek++;
       }
     });
     
     return stats;
   } catch (error) {
     console.error('Error getting client stats:', error);
     throw new Error('Falha ao obter estatísticas de clientes');
   }
 }
}

export const clientService = new ClientService();
