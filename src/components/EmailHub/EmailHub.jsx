// components/EmailHub/EmailHub.jsx
// Main Email Hub component with unified inbox

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../Layout';
import emailSyncService from '../../services/emailSyncService';
import emailAccountService from '../../services/emailAccountService';
import EmailList from './EmailList';
import EmailViewer from './EmailViewer';
import ComposeEmail from './ComposeEmail';
import AccountManager from './AccountManager';
import './EmailHub.css';

const EmailHub = () => {
  const { currentUser } = useAuth();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, starred
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadEmailsAndAccounts();
    }
  }, [currentUser]);

  const loadEmailsAndAccounts = async () => {
    try {
      setLoading(true);
      const [emailsData, accountsData] = await Promise.all([
        emailSyncService.getAllEmails(currentUser.uid),
        emailAccountService.getAccountsWithTokens(currentUser.uid)
      ]);
      setEmails(emailsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      let totalSynced = 0;
      let totalMatched = 0;

      for (const account of accounts) {
        if (!account.hasToken) continue;

        const token = emailAccountService.getAccessToken(currentUser.uid, account.id);
        
        await emailAccountService.updateSyncStatus(
          currentUser.uid,
          account.id,
          'syncing'
        );

        const result = await emailSyncService.syncEmailAccount(
          currentUser.uid,
          account.id,
          token,
          50
        );

        totalSynced += result.synced;
        totalMatched += result.matched;

        await emailAccountService.updateSyncStatus(
          currentUser.uid,
          account.id,
          'completed',
          new Date().toISOString()
        );
      }

      alert(`Sync completed! ${totalSynced} emails synced, ${totalMatched} matched to clients.`);
      await loadEmailsAndAccounts();
    } catch (error) {
      console.error('Error syncing emails:', error);
      alert('Error syncing emails. Please check console for details.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadEmailsAndAccounts();
      return;
    }

    try {
      setLoading(true);
      const results = await emailSyncService.searchEmails(currentUser.uid, searchQuery);
      setEmails(results);
    } catch (error) {
      console.error('Error searching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSent = async () => {
    setShowCompose(false);
    await loadEmailsAndAccounts();
  };

  const filteredEmails = emails.filter(email => {
    if (filter === 'unread') return email.isUnread;
    if (filter === 'starred') return email.isStarred;
    return true;
  });

  if (loading && emails.length === 0) {
    return (
      <Layout>
        <div className="email-hub-loading">
          <div className="spinner"></div>
          <p>Loading emails...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="email-hub">
        {/* Header */}
        <div className="email-hub-header">
          <h1>📧 Email Hub</h1>
          <div className="email-hub-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowCompose(true)}
            >
              ✉️ Compose
            </button>
            <button 
              className="btn-secondary"
              onClick={handleSyncAll}
              disabled={syncing || accounts.length === 0}
            >
              {syncing ? '🔄 Syncing...' : '🔄 Sync All'}
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setShowAccountManager(true)}
            >
              ⚙️ Accounts ({accounts.length})
            </button>
          </div>
        </div>

      {/* Search and Filter Bar */}
      <div className="email-hub-toolbar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>🔍 Search</button>
        </div>
        
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'unread' ? 'active' : ''}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button
            className={filter === 'starred' ? 'active' : ''}
            onClick={() => setFilter('starred')}
          >
            Starred
          </button>
        </div>
      </div>

      {/* No accounts warning */}
      {accounts.length === 0 && (
        <div className="email-hub-empty">
          <h2>📮 No Email Accounts Connected</h2>
          <p>Connect your Gmail account to start syncing emails</p>
          <button 
            className="btn-primary"
            onClick={() => setShowAccountManager(true)}
          >
            Connect Gmail Account
          </button>
        </div>
      )}

      {/* Email Content */}
      {accounts.length > 0 && (
        <div className="email-hub-content">
          <div className="email-list-panel">
            <EmailList
              emails={filteredEmails}
              selectedEmail={selectedEmail}
              onSelectEmail={setSelectedEmail}
            />
          </div>
          
          <div className="email-viewer-panel">
            {selectedEmail ? (
              <EmailViewer
                email={selectedEmail}
                consultantId={currentUser.uid}
                onClose={() => setSelectedEmail(null)}
                onReply={() => {
                  setShowCompose(true);
                }}
              />
            ) : (
              <div className="no-email-selected">
                <p>Select an email to view</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <ComposeEmail
          consultantId={currentUser.uid}
          accounts={accounts}
          onClose={() => setShowCompose(false)}
          onEmailSent={handleEmailSent}
          replyTo={selectedEmail}
        />
      )}

      {/* Account Manager Modal */}
      {showAccountManager && (
        <AccountManager
          consultantId={currentUser.uid}
          onClose={() => setShowAccountManager(false)}
          onAccountsChanged={loadEmailsAndAccounts}
        />
      )}
    </div>
    </Layout>
  );
};

export default EmailHub;