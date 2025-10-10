// components/ClientProfile/ClientEmailTab.jsx
// Shows emails matched to a specific client

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import emailSyncService from '../../services/emailSyncService';
import EmailViewer from '../EmailHub/EmailViewer';
import ComposeEmail from '../EmailHub/ComposeEmail';
import emailAccountService from '../../services/emailAccountService';
import './ClientEmailTab.css';

const ClientEmailTab = ({ client }) => {
  const { currentUser } = useAuth();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    loadClientEmails();
    loadAccounts();
  }, [client.id]);

  const loadClientEmails = async () => {
    try {
      setLoading(true);
      const emailsData = await emailSyncService.getClientEmails(
        currentUser.uid,
        client.id
      );
      setEmails(emailsData);
    } catch (error) {
      console.error('Error loading client emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const accountsData = await emailAccountService.getAccountsWithTokens(currentUser.uid);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleComposeToClient = () => {
    setShowCompose(true);
  };

  const handleEmailSent = async () => {
    setShowCompose(false);
    await loadClientEmails();
  };

  if (loading) {
    return (
      <div className="client-email-tab-loading">
        <div className="spinner"></div>
        <p>Loading emails...</p>
      </div>
    );
  }

  return (
    <div className="client-email-tab">
      {/* Header */}
      <div className="client-email-header">
        <h3>📧 Email History</h3>
        {client.email && (
          <button
            className="btn-compose-client"
            onClick={handleComposeToClient}
            disabled={accounts.length === 0}
          >
            ✉️ Email {client.name}
          </button>
        )}
      </div>

      {/* No client email warning */}
      {!client.email && (
        <div className="no-client-email">
          <p>⚠️ This client doesn't have an email address set.</p>
          <p>Add an email address to see matched conversations.</p>
        </div>
      )}

      {/* No emails */}
      {client.email && emails.length === 0 && (
        <div className="no-emails-found">
          <p>📭 No emails found for this client</p>
          <p>Emails will automatically appear here when you sync your inbox.</p>
        </div>
      )}

      {/* Email List */}
      {emails.length > 0 && (
        <div className="client-email-list">
          {emails.map((email) => (
            <div
              key={email.id}
              className={`client-email-item ${selectedEmail?.id === email.id ? 'selected' : ''}`}
              onClick={() => setSelectedEmail(email)}
            >
              <div className="email-item-header">
                <div className="email-direction">
                  {email.from.toLowerCase().includes(client.email.toLowerCase()) ? (
                    <span className="direction-badge incoming">← From Client</span>
                  ) : (
                    <span className="direction-badge outgoing">→ To Client</span>
                  )}
                </div>
                <div className="email-date">{formatDate(email.timestamp)}</div>
              </div>

              <div className="email-subject">
                {email.isUnread && <span className="unread-dot">●</span>}
                {email.subject || '(No Subject)'}
              </div>

              <div className="email-snippet">{email.snippet}</div>

              {email.attachments && email.attachments.length > 0 && (
                <div className="email-attachments-badge">
                  📎 {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Email Viewer Modal */}
      {selectedEmail && (
        <div className="client-email-viewer-modal">
          <div className="client-email-viewer-container">
            <EmailViewer
              email={selectedEmail}
              consultantId={currentUser.uid}
              onClose={() => setSelectedEmail(null)}
              onReply={() => {
                setSelectedEmail(null);
                setShowCompose(true);
              }}
            />
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
          defaultRecipient={client.email}
        />
      )}
    </div>
  );
};

export default ClientEmailTab;