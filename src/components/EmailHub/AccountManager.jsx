// components/EmailHub/AccountManager.jsx
// Manage multiple Gmail account connections

import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import emailAccountService from '../../services/emailAccountService';
import emailSyncService from '../../services/emailSyncService';
import './AccountManager.css';

const AccountManager = ({ consultantId, onClose, onAccountsChanged }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accountsData = await emailAccountService.getAccountsWithTokens(consultantId);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login for Gmail
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setConnecting(true);
        
        // Connect account to Firebase
        await emailAccountService.connectAccount(consultantId, tokenResponse.access_token);
        
        alert('Gmail account connected successfully!');
        
        // Reload accounts
        await loadAccounts();
        onAccountsChanged();
      } catch (error) {
        console.error('Error connecting account:', error);
        alert('Failed to connect Gmail account. Please try again.');
      } finally {
        setConnecting(false);
      }
    },
    onError: (error) => {
      console.error('OAuth error:', error);
      alert('Failed to authenticate with Google. Please try again.');
      setConnecting(false);
    },
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify',
    flow: 'implicit',
    ux_mode: 'popup', // Use popup mode
    redirect_uri: window.location.origin // Use current origin as redirect
  });

  const handleConnectAccount = () => {
    googleLogin();
  };

  const handleDisconnectAccount = async (accountId, email) => {
    if (!confirm(`Are you sure you want to disconnect ${email}?`)) {
      return;
    }

    try {
      await emailAccountService.disconnectAccount(consultantId, accountId);
      alert('Account disconnected successfully');
      await loadAccounts();
      onAccountsChanged();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      alert('Failed to disconnect account');
    }
  };

  const handleSyncAccount = async (account) => {
    if (!account.hasToken) {
      alert('This account needs to be reconnected. Please disconnect and connect again.');
      return;
    }

    try {
      const token = emailAccountService.getAccessToken(consultantId, account.id);
      
      await emailAccountService.updateSyncStatus(consultantId, account.id, 'syncing');
      setAccounts(prev => prev.map(acc => 
        acc.id === account.id ? { ...acc, syncStatus: 'syncing' } : acc
      ));

      const result = await emailSyncService.syncEmailAccount(
        consultantId,
        account.id,
        token,
        50
      );

      await emailAccountService.updateSyncStatus(
        consultantId,
        account.id,
        'completed',
        new Date().toISOString()
      );

      alert(`Sync completed! ${result.synced} emails synced, ${result.matched} matched to clients.`);
      
      await loadAccounts();
      onAccountsChanged();
    } catch (error) {
      console.error('Error syncing account:', error);
      alert('Failed to sync account');
      
      await emailAccountService.updateSyncStatus(consultantId, account.id, 'error');
      await loadAccounts();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="account-manager-modal">
        <div className="account-manager-container">
          <div className="loading">Loading accounts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-manager-modal">
      <div className="account-manager-container">
        <div className="account-manager-header">
          <h2>⚙️ Email Account Management</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="account-manager-content">
          {/* Connected Accounts */}
          <div className="accounts-section">
            <h3>Connected Accounts ({accounts.length})</h3>
            
            {accounts.length === 0 ? (
              <div className="no-accounts">
                <p>No Gmail accounts connected yet</p>
              </div>
            ) : (
              <div className="accounts-list">
                {accounts.map(account => (
                  <div key={account.id} className="account-card">
                    <div className="account-info">
                      <div className="account-email">
                        <span className="email-icon">📧</span>
                        <strong>{account.email}</strong>
                      </div>
                      <div className="account-details">
                        <div className="detail-row">
                          <span>Connected:</span>
                          <span>{formatDate(account.connectedAt)}</span>
                        </div>
                        <div className="detail-row">
                          <span>Last Sync:</span>
                          <span>{formatDate(account.lastSyncAt)}</span>
                        </div>
                        <div className="detail-row">
                          <span>Status:</span>
                          <span className={`status-badge status-${account.syncStatus}`}>
                            {account.syncStatus || 'pending'}
                          </span>
                        </div>
                        {!account.hasToken && (
                          <div className="detail-row warning">
                            <span>⚠️ Token expired - reconnection needed</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="account-actions">
                      <button
                        className="btn-sync"
                        onClick={() => handleSyncAccount(account)}
                        disabled={!account.hasToken || account.syncStatus === 'syncing'}
                      >
                        {account.syncStatus === 'syncing' ? '🔄 Syncing...' : '🔄 Sync Now'}
                      </button>
                      <button
                        className="btn-disconnect"
                        onClick={() => handleDisconnectAccount(account.id, account.email)}
                      >
                        🗑️ Disconnect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connect New Account */}
          <div className="connect-section">
            <h3>Connect New Gmail Account</h3>
            <p>Connect additional Gmail accounts to sync and manage all your emails in one place.</p>
            <button
              className="btn-connect"
              onClick={handleConnectAccount}
              disabled={connecting}
            >
              {connecting ? '⏳ Connecting...' : '➕ Connect Gmail Account'}
            </button>
          </div>

          {/* Info Section */}
          <div className="info-section">
            <h4>ℹ️ About Email Sync</h4>
            <ul>
              <li>Sync fetches your latest 50 emails from each account</li>
              <li>Emails are automatically matched to clients by email address</li>
              <li>You can send emails from any connected account</li>
              <li>All data is stored securely in Firebase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManager;