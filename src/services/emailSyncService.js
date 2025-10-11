// services/emailSyncService.js
// Sync emails from Gmail API to Firebase (only save matched emails)

import { db } from '../firebase/config';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc, // added
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import gmailService from './gmailService';

class EmailSyncService {
  // New selective sync using GAPI. Saves only matched emails.
  async syncEmails(userId, accountId, maxResults = 50) {
    try {
      // Initialize Gmail API (GAPI)
      await gmailService.initializeGoogleAPI();
      await gmailService.requestAccessToken();

      const messagesList = await gmailService.listMessages(maxResults);

      if (!messagesList.messages || messagesList.messages.length === 0) {
        await this.updateAccountSyncTime(userId, accountId);
        return { matched: [], unmatched: [], totalSynced: 0 };
      }

      const matchedEmails = [];
      const unmatchedEmails = [];

      for (const message of messagesList.messages) {
        try {
          const emailData = await gmailService.getMessage(message.id);
          const headers = gmailService.parseHeaders(emailData.payload.headers);
          const body = gmailService.decodeBody(emailData);

          // Extract addresses from headers
          const emailAddresses = this.extractAllEmailAddresses(headers);

          // Try to match with clients
          const matchedClients = await this.matchEmailToClients(userId, emailAddresses);

          // Build email object
          const emailObject = {
            messageId: emailData.id,
            threadId: emailData.threadId,
            accountId: accountId,
            from: headers.from || '',
            to: headers.to || '',
            cc: headers.cc || '',
            bcc: headers.bcc || '',
            subject: headers.subject || '(No Subject)',
            date: headers.date || '',
            timestamp: new Date(parseInt(emailData.internalDate)).toISOString(),
            body: body,
            snippet: emailData.snippet || '',
            labelIds: emailData.labelIds || [],
            isRead: !emailData.labelIds?.includes('UNREAD'),
          };

          if (matchedClients.length > 0) {
            emailObject.clientIds = matchedClients;
            emailObject.matchedAt = serverTimestamp();
            await this.saveEmail(userId, emailObject);
            matchedEmails.push({ ...emailObject });
          } else {
            unmatchedEmails.push(emailObject);
          }
        } catch (err) {
          console.error(`Error processing message ${message.id}:`, err);
        }
      }

      await this.updateAccountSyncTime(userId, accountId);

      return {
        matched: matchedEmails,
        unmatched: unmatchedEmails,
        totalSynced: messagesList.messages.length,
      };
    } catch (error) {
      console.error('Error syncing emails:', error);
      throw error;
    }
  }

  // Backwards-compatible wrapper (used by AccountManager). Returns counts like before.
  async syncEmailAccount(consultantId, accountId, _accessToken, maxEmails = 50) {
    const res = await this.syncEmails(consultantId, accountId, maxEmails);
    return {
      synced: res.matched.length,  // we only save matched emails
      matched: res.matched.length,
      total: res.totalSynced,
    };
    // Note: res.unmatched contains items not saved, should you want to display/suggest linking later.
  }

  // Extract all email addresses from headers via gmailService helper
  extractAllEmailAddresses(headers) {
    const fields = ['from', 'to', 'cc', 'bcc'];
    const all = [];

    fields.forEach((field) => {
      if (headers[field]) {
        const extracted = gmailService.extractEmailAddresses(headers[field]);
        if (extracted && extracted.length) {
          all.push(...extracted.map(e => e.toLowerCase()));
        }
      }
    });

    return [...new Set(all)];
  }

  // Match email to clients by email address
  async matchEmailToClients(userId, emailAddresses) {
    try {
      if (!emailAddresses || emailAddresses.length === 0) return [];

      const clientsRef = collection(db, 'consultants', userId, 'clients');
      const matchedClientIds = new Set();

      for (const email of emailAddresses) {
        const q = query(clientsRef, where('email', '==', email));
        const snapshot = await getDocs(q);
        snapshot.forEach((d) => matchedClientIds.add(d.id));
      }

      return Array.from(matchedClientIds);
    } catch (error) {
      console.error('Error matching email to clients:', error);
      return [];
    }
  }

  // Save matched email to Firestore
  async saveEmail(userId, emailData) {
    try {
      const emailsRef = collection(db, 'consultants', userId, 'emails');
      const emailRef = doc(emailsRef, emailData.messageId);
      await setDoc(emailRef, { ...emailData, savedAt: serverTimestamp() }, { merge: true });
      return emailRef.id;
    } catch (error) {
      console.error('Error saving email:', error);
      throw error;
    }
  }

  // Delete a single email from Firestore
  async deleteEmail(userId, emailId) {
    try {
      console.log('Attempting to delete email:', emailId, 'for user:', userId);
      const emailRef = doc(db, 'consultants', userId, 'emails', emailId);
      await deleteDoc(emailRef);
      console.log('Successfully deleted email:', emailId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting email:', emailId, error);
      throw error;
    }
  }

  // Bulk delete emails from Firestore
  async bulkDeleteEmails(userId, emailIds) {
    try {
      console.log('Bulk deleting emails:', emailIds);

      const results = [];
      for (const emailId of emailIds) {
        try {
          await this.deleteEmail(userId, emailId);
          results.push({ emailId, success: true });
        } catch (error) {
          console.error(`Failed to delete email ${emailId}:`, error);
          results.push({ emailId, success: false, error });
        }
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`Deleted ${successCount} of ${emailIds.length} emails`);

      return { success: true, deletedCount: successCount, results };
    } catch (error) {
      console.error('Error bulk deleting emails:', error);
      throw error;
    }
  }

  // Manually link an unmatched email to a client (saves it)
  async linkEmailToClient(userId, emailData, clientId) {
    try {
      const emailWithClient = {
        ...emailData,
        clientIds: [clientId],
        matchedAt: serverTimestamp(),
        manuallyLinked: true,
      };
      await this.saveEmail(userId, emailWithClient);
      return { success: true, emailId: emailData.messageId };
    } catch (error) {
      console.error('Error linking email to client:', error);
      throw error;
    }
  }

  // Bulk link
  async bulkLinkEmails(userId, emailsData, clientId) {
    try {
      const linkedIds = [];
      for (const emailData of emailsData) {
        await this.linkEmailToClient(userId, emailData, clientId);
        linkedIds.push(emailData.messageId);
      }
      return { success: true, linkedCount: linkedIds.length, emailIds: linkedIds };
    } catch (error) {
      console.error('Error bulk linking emails:', error);
      throw error;
    }
  }

  // Update account last sync time
  async updateAccountSyncTime(userId, accountId) {
    try {
      const accountRef = doc(db, 'consultants', userId, 'emailAccounts', accountId);
      await setDoc(accountRef, { lastSyncAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error('Error updating account sync time:', error);
    }
  }

  // Convenience getters (unchanged behavior)
  async getEmails(userId) {
    try {
      const emailsRef = collection(db, 'consultants', userId, 'emails');
      const snapshot = await getDocs(emailsRef);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  async getClientEmails(userId, clientId) {
    try {
      const emailsRef = collection(db, 'consultants', userId, 'emails');
      const q = query(emailsRef, where('clientIds', 'array-contains', clientId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error fetching client emails:', error);
      throw error;
    }
  }
}

export default new EmailSyncService();