// services/emailSyncService.js
// Sync emails from Gmail API to Firebase

import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import gmailService from './gmailService';

class EmailSyncService {
  /**
   * Sync emails for a specific Gmail account
   * @param {string} consultantId - Consultant UID
   * @param {string} accountId - Email account ID
   * @param {string} accessToken - OAuth access token
   * @param {number} maxEmails - Max emails to sync per batch
   */
  async syncEmailAccount(consultantId, accountId, accessToken, maxEmails = 50) {
    try {
      console.log(`Starting sync for account ${accountId}...`);

      // Fetch emails from Gmail API
      const gmailData = await gmailService.fetchEmails(accessToken, maxEmails);
      
      if (!gmailData.messages || gmailData.messages.length === 0) {
        console.log('No emails to sync');
        return { synced: 0, matched: 0 };
      }

      let syncedCount = 0;
      let matchedCount = 0;

      // Fetch full details for each email and save to Firebase
      for (const message of gmailData.messages) {
        try {
          // Check if email already exists
          const emailRef = doc(db, `consultants/${consultantId}/emails/${message.id}`);
          const emailDoc = await getDoc(emailRef);
          
          if (emailDoc.exists()) {
            console.log(`Email ${message.id} already synced, skipping...`);
            continue;
          }

          // Fetch full email details
          const emailData = await gmailService.fetchEmailById(accessToken, message.id);

          // Match with clients
          const matchedClientIds = await this.matchEmailToClients(consultantId, emailData);

          // Save to Firebase
          const emailToSave = {
            ...emailData,
            accountId: accountId,
            consultantId: consultantId,
            matchedClientIds: matchedClientIds,
            syncedAt: new Date().toISOString(),
            createdAt: new Date(emailData.timestamp).toISOString()
          };

          await setDoc(emailRef, emailToSave);
          syncedCount++;

          if (matchedClientIds.length > 0) {
            matchedCount++;
          }

          console.log(`Synced email: ${emailData.subject} (matched: ${matchedClientIds.length} clients)`);
        } catch (error) {
          console.error(`Error syncing email ${message.id}:`, error);
        }
      }

      console.log(`Sync complete: ${syncedCount} emails synced, ${matchedCount} matched to clients`);

      return {
        synced: syncedCount,
        matched: matchedCount,
        total: gmailData.messages.length
      };
    } catch (error) {
      console.error('Error syncing emails:', error);
      throw error;
    }
  }

  /**
   * Match email to existing clients by email address
   * @param {string} consultantId - Consultant UID
   * @param {Object} emailData - Parsed email data
   * @returns {Array} - Array of matched client IDs
   */
  async matchEmailToClients(consultantId, emailData) {
    try {
      // Extract all email addresses from the email
      const emailAddresses = this.extractAllEmails(emailData);

      if (emailAddresses.length === 0) {
        return [];
      }

      // Query clients collection for matching emails
      const clientsRef = collection(db, `consultants/${consultantId}/clients`);
      const matchedClientIds = [];

      for (const email of emailAddresses) {
        const q = query(
          clientsRef,
          where('email', '==', email)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          if (!matchedClientIds.includes(doc.id)) {
            matchedClientIds.push(doc.id);
          }
        });
      }

      return matchedClientIds;
    } catch (error) {
      console.error('Error matching email to clients:', error);
      return [];
    }
  }

  /**
   * Extract all email addresses from email data (from, to, cc, bcc)
   */
  extractAllEmails(emailData) {
    const emails = [];
    const fields = ['from', 'to', 'cc', 'bcc'];

    fields.forEach(field => {
      if (emailData[field]) {
        // Handle multiple recipients (comma-separated)
        const recipients = emailData[field].split(',');
        recipients.forEach(recipient => {
          const email = gmailService.extractEmail(recipient.trim());
          if (email && !emails.includes(email)) {
            emails.push(email);
          }
        });
      }
    });

    return emails;
  }

  /**
   * Get emails for a specific client
   * @param {string} consultantId - Consultant UID
   * @param {string} clientId - Client ID
   */
  async getClientEmails(consultantId, clientId) {
    try {
      const emailsRef = collection(db, `consultants/${consultantId}/emails`);
      const q = query(
        emailsRef,
        where('matchedClientIds', 'array-contains', clientId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const emails = [];

      querySnapshot.forEach((doc) => {
        emails.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return emails;
    } catch (error) {
      console.error('Error fetching client emails:', error);
      throw error;
    }
  }

  /**
   * Get all emails for consultant (unified inbox)
   * @param {string} consultantId - Consultant UID
   * @param {number} limitCount - Max emails to fetch
   */
  async getAllEmails(consultantId, limitCount = 100) {
    try {
      const emailsRef = collection(db, `consultants/${consultantId}/emails`);
      const q = query(
        emailsRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const emails = [];

      querySnapshot.forEach((doc) => {
        emails.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return emails;
    } catch (error) {
      console.error('Error fetching all emails:', error);
      throw error;
    }
  }

  /**
   * Get emails for a specific account
   */
  async getAccountEmails(consultantId, accountId, limitCount = 100) {
    try {
      const emailsRef = collection(db, `consultants/${consultantId}/emails`);
      const q = query(
        emailsRef,
        where('accountId', '==', accountId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const emails = [];

      querySnapshot.forEach((doc) => {
        emails.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return emails;
    } catch (error) {
      console.error('Error fetching account emails:', error);
      throw error;
    }
  }

  /**
   * Search emails by query string
   */
  async searchEmails(consultantId, searchQuery) {
    try {
      const emailsRef = collection(db, `consultants/${consultantId}/emails`);
      const q = query(
        emailsRef,
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const emails = [];

      // Client-side filtering (Firestore doesn't support full-text search)
      const searchLower = searchQuery.toLowerCase();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.subject?.toLowerCase().includes(searchLower) ||
          data.from?.toLowerCase().includes(searchLower) ||
          data.to?.toLowerCase().includes(searchLower) ||
          data.body?.toLowerCase().includes(searchLower)
        ) {
          emails.push({
            id: doc.id,
            ...data
          });
        }
      });

      return emails;
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  }
}

export default new EmailSyncService();