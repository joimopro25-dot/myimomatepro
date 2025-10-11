// components/email/AccountManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import emailAccountService from '../../services/emailAccountService';
import gmailService from '../../services/gmailService';
import './AccountManager.css';

const AccountManager = ({ isOpen, onClose, onAccountConnected, onAccountDisconnected }) => {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      loadAccounts();
    }
  }, [isOpen, currentUser]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      // FIXED: Using getAccounts method
      const fetchedAccounts = await emailAccountService.getAccounts(currentUser.uid);
      setAccounts(fetchedAccounts);
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError('Failed to load email accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async () => {
    setConnecting(true);
    setError('');

    try {
      // Initialize Google API
      await gmailService.initializeGoogleAPI();
      
      // Request access token
      const accessToken = await gmailService.requestAccessToken();
      
      // Connect account with the service
      const newAccount = await emailAccountService.connectAccount(
        currentUser.uid,
        accessToken
      );

      // Reload accounts
      await loadAccounts();
      
      // Notify parent
      if (onAccountConnected) {
        onAccountConnected(newAccount);
      }

      alert('Gmail account connected successfully!');
    } catch (err) {
      console.error('Error connecting account:', err);
      setError(err.message || 'Failed to connect Gmail account');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    const confirmed = window.confirm(
      'Are you sure you want to disconnect this email account? This will also remove all synced emails.'
    );

    if (!confirmed) return;

    try {
      // FIXED: Using disconnectAccount method
      await emailAccountService.disconnectAccount(currentUser.uid, accountId);
      
      // Reload accounts
      await loadAccounts();
      
      // Notify parent
      if (onAccountDisconnected) {
        onAccountDisconnected();
      }

      alert('Email account disconnected successfully');
    } catch (err) {
      console.error('Error disconnecting account:', err);
      setError('Failed to disconnect account');
    }
  };

  const handleToggleActive = async (accountId, currentStatus) => {
    try {
      const accountRef = emailAccountService.getAccount(currentUser.uid, accountId);
      
      // Update active status
      await emailAccountService.updateSyncStatus(
        currentUser.uid,
        accountId,
        currentStatus ? 'inactive' : 'active'
      );

      // Reload accounts
      await loadAccounts();
    } catch (err) {
      console.error('Error toggling account status:', err);
      setError('Failed to update account status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="account-manager-overlay" onClick={onClose}>
      <div className="account-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="account-manager-header">
          <h2>Manage Email Accounts</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="account-manager-content">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError('')}>×</button>
            </div>
          )}

          <div className="connect-section">
            <button
              className="btn-connect"
              onClick={handleConnectAccount}
              disabled={connecting}
            >
              {connecting ? '🔄 Connecting...' : '➕ Connect Gmail Account'}
            </button>
            <p className="connect-help">
              Connect your Gmail account to sync and manage emails
            </p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="empty-accounts">
              <div className="empty-icon">📧</div>
              <p>No email accounts connected yet</p>
            </div>
          ) : (
            <div className="accounts-list">
              <h3>Connected Accounts ({accounts.length})</h3>
              {accounts.map((account) => (
                <div key={account.id} className="account-card">
                  <div className="account-info">
                    <div className="account-header">
                      <div className="account-email">
                        <span className="email-icon">📧</span>
                        <strong>{account.email}</strong>
                      </div>
                      <div className={`account-status ${account.isActive ? 'active' : 'inactive'}`}>
                        {account.isActive ? '● Active' : '○ Inactive'}
                      </div>
                    </div>

                    <div className="account-details">
                      <div className="detail-row">
                        <span className="detail-label">Connected:</span>
                        <span className="detail-value">{formatDate(account.connectedAt)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Last Sync:</span>
                        <span className="detail-value">{formatDate(account.lastSyncAt)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Messages:</span>
                        <span className="detail-value">{account.messagesTotal || 0}</span>
                      </div>
                      {account.signature && (
                        <div className="detail-row">
                          <span className="detail-label">Signature:</span>
                          <span className="detail-value signature-indicator">✓ Configured</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="account-actions">
                    <button
                      className="btn-disconnect"
                      onClick={() => handleDisconnectAccount(account.id)}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="account-manager-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountManager;