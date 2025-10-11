// components/email/ComposeEmail.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import gmailService from '../../services/gmailService';
import emailAccountService from '../../services/emailAccountService';
import './ComposeEmail.css';

const ComposeEmail = ({ isOpen, onClose, replyTo = null, clientEmail = null }) => {
  const { currentUser } = useAuth();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [useSignature, setUseSignature] = useState(true);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadEmailAccounts();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (replyTo) {
      setTo(replyTo.from || '');
      setSubject(replyTo.subject?.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`);
    } else if (clientEmail) {
      setTo(clientEmail);
    }
  }, [replyTo, clientEmail]);

  const loadEmailAccounts = async () => {
    try {
      // FIXED: Changed from getEmailAccounts to getAccounts
      const accounts = await emailAccountService.getAccounts(currentUser.uid);
      const activeAccounts = accounts.filter(acc => acc.isActive);
      setEmailAccounts(activeAccounts);
      
      if (activeAccounts.length > 0) {
        setSelectedAccount(activeAccounts[0]);
      }
    } catch (err) {
      console.error('Error loading email accounts:', err);
    }
  };

  const getEmailBodyWithSignature = () => {
    let finalBody = body;
    
    if (useSignature && selectedAccount?.signature) {
      // Add line breaks before signature
      const signature = `<br><br>${selectedAccount.signature}`;
      finalBody = body + signature;
    }
    
    return finalBody;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!to.trim() || !subject.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!selectedAccount) {
      setError('No email account selected');
      return;
    }

    setSending(true);
    setError('');

    try {
      // Get access token for this account
      const accessToken = emailAccountService.getAccessToken(currentUser.uid, selectedAccount.id);
      
      if (!accessToken) {
        setError('No access token found. Please reconnect your account.');
        setSending(false);
        return;
      }

      // Initialize Gmail API
      await gmailService.initializeGoogleAPI();
      
      // Set the access token
      window.gapi.client.setToken({ access_token: accessToken });

      // Get final body with signature
      const finalBody = getEmailBodyWithSignature();

      // Send email
      const threadId = replyTo?.threadId || null;
      await gmailService.sendEmail(to, subject, finalBody, threadId);

      // Reset form
      setTo('');
      setSubject('');
      setBody('');
      setError('');
      
      onClose();
      alert('Email sent successfully!');
    } catch (err) {
      console.error('Error sending email:', err);
      setError('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setTo('');
    setSubject('');
    setBody('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="compose-email-overlay" onClick={handleClose}>
      <div className="compose-email-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compose-email-header">
          <h2>{replyTo ? 'Reply to Email' : 'Compose New Email'}</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSend} className="compose-email-form">
          {emailAccounts.length > 1 && (
            <div className="form-group">
              <label>From:</label>
              <select
                value={selectedAccount?.id || ''}
                onChange={(e) => {
                  const account = emailAccounts.find(acc => acc.id === e.target.value);
                  setSelectedAccount(account);
                }}
                className="form-select"
              >
                {emailAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>To: *</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              required
              disabled={!!replyTo || !!clientEmail}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Subject: *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Message: *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here..."
              required
              className="form-textarea"
              rows="10"
            />
          </div>

          {selectedAccount?.signature && (
            <div className="signature-options">
              <label className="signature-toggle">
                <input
                  type="checkbox"
                  checked={useSignature}
                  onChange={(e) => setUseSignature(e.target.checked)}
                />
                <span>Include signature</span>
              </label>
              
              {useSignature && (
                <div className="signature-preview">
                  <div className="signature-preview-label">Signature Preview:</div>
                  <div 
                    className="signature-content" 
                    dangerouslySetInnerHTML={{ __html: selectedAccount.signature }}
                  />
                </div>
              )}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={sending}
            >
              {sending ? 'Sending...' : replyTo ? 'Send Reply' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeEmail;