// components/email/EmailHub.jsx
import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon,
  PlusIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  XMarkIcon,
  TrashIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  UserIcon,
  PaperAirplaneIcon,
  InboxIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
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
  
  // New state for enhanced features
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, clients, unassigned
  const [searchTerm, setSearchTerm] = useState('');

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

  // New handlers for bulk actions
  const handleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(e => e.id || e.messageId));
    }
  };

  // Call delete service to remove emails from Firestore and reload
  const handleBulkDelete = async (emailIds) => {
    if (emailIds.length === 0) return;

    console.log('EmailHub: Attempting to delete:', emailIds);

    const confirmed = window.confirm(`Delete ${emailIds.length} email(s) from your CRM? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setLoading(true);

      // Delete from Firebase
      const result = await emailSyncService.bulkDeleteEmails(currentUser.uid, emailIds);
      console.log('Delete result:', result);

      // Reload emails from Firebase to ensure state is accurate
      await loadEmails();

      // Clear selected email if it was deleted
      if (selectedEmail && emailIds.includes(selectedEmail.id || selectedEmail.messageId)) {
        setSelectedEmail(null);
      }

      alert(`✅ ${result.deletedCount} email(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting emails:', error);
      alert('❌ Failed to delete emails: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedEmails.length === 0) return;
    await handleBulkDelete(selectedEmails);
    setSelectedEmails([]);
  };

  const handleArchiveSelected = async () => {
    if (selectedEmails.length === 0) return;
    
    try {
      setLoading(true);
      // Add your archive logic here
      console.log('Archiving emails:', selectedEmails);
      
      alert(`${selectedEmails.length} email(s) archived successfully`);
      setSelectedEmails([]);
    } catch (error) {
      console.error('Error archiving emails:', error);
      alert('Failed to archive emails');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmail = async (email) => {
    try {
      // Add delete logic here
      setEmails(prev => prev.filter(e => e.id !== email.id));
      setSelectedEmail(null);
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  };

  // Filter emails based on search and filter type
  const filteredEmails = emails.filter(email => {
    const matchesSearch = !searchTerm || 
      email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.snippet?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterType === 'clients') {
      matchesFilter = (email.clientIds && email.clientIds.length > 0) || 
                      (email.matchedClientIds && email.matchedClientIds.length > 0);
    } else if (filterType === 'unassigned') {
      matchesFilter = (!email.clientIds || email.clientIds.length === 0) && 
                      (!email.matchedClientIds || email.matchedClientIds.length === 0);
    }
    
    return matchesSearch && matchesFilter;
  });

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
              <PlusIcon className="w-4 h-4" />
              <span>Compose</span>
            </button>
            
            <button 
              className="btn-sync"
              onClick={handleSync}
              disabled={syncing || emailAccounts.length === 0}
            >
              <ArrowPathIcon className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Emails'}</span>
            </button>
            
            <button 
              className="btn-accounts"
              onClick={() => setShowAccountManager(true)}
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span>Manage Accounts</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="btn-close-error">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {emailAccounts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <InboxIcon className="w-16 h-16 text-gray-400" />
            </div>
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
                emails={filteredEmails}
                selectedEmail={selectedEmail}
                onEmailSelect={handleEmailSelect}
                loading={loading}
                selectedEmails={selectedEmails}
                onEmailsSelect={setSelectedEmails}
                onBulkDelete={handleBulkDelete}  // ✅ ADD THIS LINE
              />
            </div>

            <div className="email-viewer-panel">
              {selectedEmail ? (
                <EmailViewer
                  email={selectedEmail}
                  consultantId={currentUser.uid}
                  onReply={handleReply}
                  onClose={() => setSelectedEmail(null)}
                  onDelete={handleDeleteEmail}
                />
              ) : (
                <div className="no-email-selected">
                  <div className="placeholder-icon">
                    <EnvelopeIcon className="w-16 h-16 text-gray-300" />
                  </div>
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