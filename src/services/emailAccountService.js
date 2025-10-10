// services/emailAccountService.js
// Manage multiple Gmail account connections

import { collection, doc, setDoc, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import gmailService from './gmailService';

class EmailAccountService {
  /**
   * Connect a new Gmail account
   * @param {string} consultantId - Consultant UID
   * @param {string} accessToken - OAuth access token
   */
  async connectAccount(consultantId, accessToken) {
    try {
      // Get Gmail profile info
      const profile = await gmailService.getUserProfile(accessToken);

      // Create account document
      const accountId = profile.emailAddress.replace(/[@.]/g, '_');
      const accountRef = doc(db, `consultants/${consultantId}/emailAccounts/${accountId}`);

      const accountData = {
        id: accountId,
        email: profile.emailAddress,
        connectedAt: new Date().toISOString(),
        lastSyncAt: null,
        isActive: true,
        syncStatus: 'pending',
        messagesTotal: profile.messagesTotal || 0,
        threadsTotal: profile.threadsTotal || 0
      };

      await setDoc(accountRef, accountData);

      // Store access token in localStorage (per agent)
      this.storeAccessToken(consultantId, accountId, accessToken);

      console.log(`Gmail account connected: ${profile.emailAddress}`);

      return accountData;
    } catch (error) {
      console.error('Error connecting Gmail account:', error);
      throw error;
    }
  }

  /**
   * Get all connected email accounts for consultant
   * @param {string} consultantId - Consultant UID
   */
  async getAccounts(consultantId) {
    try {
      const accountsRef = collection(db, `consultants/${consultantId}/emailAccounts`);
      const querySnapshot = await getDocs(accountsRef);
      const accounts = [];

      querySnapshot.forEach((doc) => {
        accounts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return accounts;
    } catch (error) {
      console.error('Error fetching email accounts:', error);
      throw error;
    }
  }

  /**
   * Get a specific email account
   */
  async getAccount(consultantId, accountId) {
    try {
      const accountRef = doc(db, `consultants/${consultantId}/emailAccounts/${accountId}`);
      const accountDoc = await getDoc(accountRef);

      if (!accountDoc.exists()) {
        throw new Error('Account not found');
      }

      return {
        id: accountDoc.id,
        ...accountDoc.data()
      };
    } catch (error) {
      console.error('Error fetching email account:', error);
      throw error;
    }
  }

  /**
   * Disconnect (remove) an email account
   * @param {string} consultantId - Consultant UID
   * @param {string} accountId - Account ID to remove
   */
  async disconnectAccount(consultantId, accountId) {
    try {
      const accountRef = doc(db, `consultants/${consultantId}/emailAccounts/${accountId}`);
      await deleteDoc(accountRef);

      // Remove access token from localStorage
      this.removeAccessToken(consultantId, accountId);

      console.log(`Gmail account disconnected: ${accountId}`);

      return true;
    } catch (error) {
      console.error('Error disconnecting Gmail account:', error);
      throw error;
    }
  }

  /**
   * Update account sync status
   */
  async updateSyncStatus(consultantId, accountId, status, lastSyncAt = null) {
    try {
      const accountRef = doc(db, `consultants/${consultantId}/emailAccounts/${accountId}`);
      const updateData = {
        syncStatus: status
      };

      if (lastSyncAt) {
        updateData.lastSyncAt = lastSyncAt;
      }

      await setDoc(accountRef, updateData, { merge: true });

      return true;
    } catch (error) {
      console.error('Error updating sync status:', error);
      throw error;
    }
  }

  /**
   * Store access token in localStorage
   * Format: gmail_token_{consultantId}_{accountId}
   */
  storeAccessToken(consultantId, accountId, accessToken) {
    const key = `gmail_token_${consultantId}_${accountId}`;
    localStorage.setItem(key, accessToken);
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(consultantId, accountId) {
    const key = `gmail_token_${consultantId}_${accountId}`;
    return localStorage.getItem(key);
  }

  /**
   * Remove access token from localStorage
   */
  removeAccessToken(consultantId, accountId) {
    const key = `gmail_token_${consultantId}_${accountId}`;
    localStorage.removeItem(key);
  }

  /**
   * Check if account has valid access token
   */
  hasAccessToken(consultantId, accountId) {
    const token = this.getAccessToken(consultantId, accountId);
    return token !== null && token !== '';
  }

  /**
   * Get all accounts with their tokens
   */
  async getAccountsWithTokens(consultantId) {
    const accounts = await this.getAccounts(consultantId);
    return accounts.map(account => ({
      ...account,
      hasToken: this.hasAccessToken(consultantId, account.id)
    }));
  }
}

export default new EmailAccountService();