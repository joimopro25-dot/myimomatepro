// components/email/EmailHub.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import emailAccountService from '../../services/emailAccountService';
import emailSyncService from '../../services/emailSyncService';
import Layout from '../Layout';
import EmailList from './EmailList';
import EmailViewer from './EmailViewer';
import ComposeEmail from './ComposeEmail';
import AccountManager from './AccountManager';
import UnmatchedEmailReview from './UnmatchedEmailReview';
import './EmailHub.css';

const EmailHub = () => {
  const { currentUser } = useAuth();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showUnmatchedReview, setShowUnmatchedReview] = useState(false);
  const [unmatchedEmails, setUnmatchedEmails] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadEmailAccounts();
      loadEmails();
    }
  }, [currentUser]);

  const loadEmailAccounts = async () => {
    try {
      const accounts = await emailAccountService.getAccounts(currentUser.uid);
      setEmailAccounts(accounts);
      
      if (accounts.length === 0) {
        setShowAccountManager(true);
      }
    } catch (err) {
      console.error('Error loading email accounts:', err);
      setError('Failed to load email accounts');
    }
  };

  const loadEmails = async () => {
    setLoading(true);
    try {
      const fetchedEmails = await emailSyncService.getEmails(currentUser.uid);
      
      // Sort by timestamp (newest first)
      const sortedEmails = fetchedEmails.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      setEmails(sortedEmails);
    } catch (err) {
      console.error('Error loading emails:', err);
      setError('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (emailAccounts.length === 0) {
      alert('Please connect an email account first');
      setShowAccountManager(true);
      return;
    }

    const activeAccount = emailAccounts.find(acc => acc.isActive);
    if (!activeAccount) {
      alert('No active email account found');
      return;
    }

    setSyncing(true);
    setError('');

    try {
      // Sync emails with selective storage
      const syncResult = await emailSyncService.syncEmails(
        currentUser.uid,
        activeAccount.id,
        50 // Max results
      );

      // Store results for review modal
      setMatchedCount(syncResult.matched.length);
      setUnmatchedEmails(syncResult.unmatched);

      // Reload emails list to show newly saved matched emails
      await loadEmails();

      // Show review modal if there are unmatched emails
      if (syncResult.unmatched.length > 0) {
        setShowUnmatchedReview(true);
      } else {
        // All emails matched - show success message
        alert(`Sync complete! ${syncResult.matched.length} emails matched and saved.`);
      }
    } catch (err) {
      console.error('Error syncing emails:', err);
      setError('Failed to sync emails. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleUnmatchedReviewComplete = async () => {
    // Reload emails after user completes review
    await loadEmails();
    setShowUnmatchedReview(false);
    setUnmatchedEmails([]);
    setMatchedCount(0);
  };

  const handleAccountConnected = async () => {
    await loadEmailAccounts();
    setShowAccountManager(false);
  };

  const handleAccountDisconnected = async () => {
    await loadEmailAccounts();
  };

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
  };

  const handleReply = (email) => {
    setSelectedEmail(null);
    setShowCompose(true);
  };

  const handleComposeNew = () => {
    setShowCompose(true);
  };

  const activeAccount = emailAccounts.find(acc => acc.isActive);

  return (
    <Layout>
      <div className="email-hub">
        <div className="email-hub-header">
          <div className="header-title">
            <h1>Email Hub</h1>
            {activeAccount && (
              <span className="connected-account">
                Connected: {activeAccount.email}
              </span>
            )}
          </div>
          
          <div className="header-actions">
            <button 
              className="btn-compose"
              onClick={handleComposeNew}
              disabled={emailAccounts.length === 0}
            >
              ✉️ Compose
            </button>
            
            <button 
              className="btn-sync"
              onClick={handleSync}
              disabled={syncing || emailAccounts.length === 0}
            >
              {syncing ? '🔄 Syncing...' : '🔄 Sync Emails'}
            </button>
            
            <button 
              className="btn-accounts"
              onClick={() => setShowAccountManager(true)}
            >
              ⚙️ Manage Accounts
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {emailAccounts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📧</div>
            <h2>No Email Account Connected</h2>
            <p>Connect your Gmail account to start managing emails</p>
            <button 
              className="btn-primary"
              onClick={() => setShowAccountManager(true)}
            >
              Connect Gmail Account
            </button>
          </div>
        ) : (
          <div className="email-hub-content">
            <div className="email-list-panel">
              <EmailList
                emails={emails}
                selectedEmail={selectedEmail}
                onEmailSelect={handleEmailSelect}
                loading={loading}
              />
            </div>

            <div className="email-viewer-panel">
              {selectedEmail ? (
                <EmailViewer
                  email={selectedEmail}
                  onReply={handleReply}
                  onClose={() => setSelectedEmail(null)}
                />
              ) : (
                <div className="no-email-selected">
                  <div className="placeholder-icon">✉️</div>
                  <p>Select an email to view</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        <AccountManager
          isOpen={showAccountManager}
          onClose={() => setShowAccountManager(false)}
          onAccountConnected={handleAccountConnected}
          onAccountDisconnected={handleAccountDisconnected}
        />

        <ComposeEmail
          isOpen={showCompose}
          onClose={() => setShowCompose(false)}
        />

        <UnmatchedEmailReview
          isOpen={showUnmatchedReview}
          onClose={() => setShowUnmatchedReview(false)}
          unmatchedEmails={unmatchedEmails}
          matchedCount={matchedCount}
          onComplete={handleUnmatchedReviewComplete}
        />
      </div>
    </Layout>
  );
};

export default EmailHub;