// components/EmailHub/ComposeEmail.jsx
// Compose and send email modal

import React, { useState, useEffect } from 'react';
import gmailService from '../../services/gmailService';
import emailAccountService from '../../services/emailAccountService';
import './ComposeEmail.css';

const ComposeEmail = ({ consultantId, accounts, onClose, onEmailSent, replyTo }) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  useEffect(() => {
    // Pre-fill form if replying
    if (replyTo) {
      const replyEmail = gmailService.extractEmail(replyTo.from);
      setTo(replyEmail);
      setSubject(replyTo.subject?.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`);
      
      // Add quoted original message
      const quotedBody = `\n\n---\nOn ${new Date(replyTo.timestamp).toLocaleString()}, ${replyTo.from} wrote:\n\n${replyTo.body || replyTo.snippet}`;
      setBody(quotedBody);
    }

    // Select first available account
    if (accounts.length > 0 && !selectedAccount) {
      const firstAccount = accounts.find(acc => acc.hasToken);
      if (firstAccount) {
        setSelectedAccount(firstAccount.id);
      }
    }
  }, [replyTo, accounts, selectedAccount]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!selectedAccount) {
      alert('Please select a sender account');
      return;
    }

    if (!to.trim()) {
      alert('Please enter recipient email address');
      return;
    }

    try {
      setSending(true);

      const token = emailAccountService.getAccessToken(consultantId, selectedAccount);
      
      if (!token) {
        alert('No access token found for this account. Please reconnect.');
        return;
      }

      const emailData = {
        to: to.trim(),
        cc: cc.trim() || undefined,
        bcc: bcc.trim() || undefined,
        subject: subject.trim() || '(No Subject)',
        body: body.replace(/\n/g, '<br>'), // Convert line breaks to HTML
        inReplyTo: replyTo?.id,
        references: replyTo?.id
      };

      await gmailService.sendEmail(token, emailData);

      alert('Email sent successfully!');
      onEmailSent();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const availableAccounts = accounts.filter(acc => acc.hasToken);

  if (availableAccounts.length === 0) {
    return (
      <div className="compose-email-modal">
        <div className="compose-email-container">
          <div className="compose-header">
            <h2>Compose Email</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="compose-no-accounts">
            <p>⚠️ No email accounts connected</p>
            <p>Please connect a Gmail account first to send emails.</p>
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="compose-email-modal">
      <div className="compose-email-container">
        <div className="compose-header">
          <h2>{replyTo ? 'Reply to Email' : 'Compose Email'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSend} className="compose-form">
          {/* From (Account Selector) */}
          <div className="form-row">
            <label>From:</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              required
            >
              <option value="">Select sender account...</option>
              {availableAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.email}
                </option>
              ))}
            </select>
          </div>

          {/* To */}
          <div className="form-row">
            <label>To:</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              required
              multiple
            />
            <div className="cc-bcc-toggles">
              {!showCc && (
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowCc(true)}
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowBcc(true)}
                >
                  Bcc
                </button>
              )}
            </div>
          </div>

          {/* Cc */}
          {showCc && (
            <div className="form-row">
              <label>Cc:</label>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc@example.com"
                multiple
              />
            </div>
          )}

          {/* Bcc */}
          {showBcc && (
            <div className="form-row">
              <label>Bcc:</label>
              <input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="bcc@example.com"
                multiple
              />
            </div>
          )}

          {/* Subject */}
          <div className="form-row">
            <label>Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          {/* Body */}
          <div className="form-row form-row-body">
            <label>Message:</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              rows={12}
              required
            />
          </div>

          {/* Actions */}
          <div className="compose-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={sending}
            >
              {sending ? '📤 Sending...' : '📤 Send'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={sending}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeEmail;