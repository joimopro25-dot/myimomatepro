// components/EmailHub/EmailViewer.jsx
// Email viewer component for displaying full email content

import React, { useState } from 'react';
import gmailService from '../../services/gmailService';
import emailAccountService from '../../services/emailAccountService';
import './EmailViewer.css';

const EmailViewer = ({ email, consultantId, onClose, onReply }) => {
  const [loading, setLoading] = useState(false);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = async () => {
    try {
      setLoading(true);
      const token = emailAccountService.getAccessToken(consultantId, email.accountId);
      await gmailService.markAsRead(token, email.id);
      email.isUnread = false;
    } catch (error) {
      console.error('Error marking as read:', error);
      alert('Failed to mark as read');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsUnread = async () => {
    try {
      setLoading(true);
      const token = emailAccountService.getAccessToken(consultantId, email.accountId);
      await gmailService.markAsUnread(token, email.id);
      email.isUnread = true;
    } catch (error) {
      console.error('Error marking as unread:', error);
      alert('Failed to mark as unread');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStar = async () => {
    try {
      setLoading(true);
      const token = emailAccountService.getAccessToken(consultantId, email.accountId);
      
      if (email.isStarred) {
        await gmailService.unstarEmail(token, email.id);
        email.isStarred = false;
      } else {
        await gmailService.starEmail(token, email.id);
        email.isStarred = true;
      }
    } catch (error) {
      console.error('Error toggling star:', error);
      alert('Failed to toggle star');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailBody = () => {
    if (email.htmlBody) {
      return (
        <div 
          className="email-html-body"
          dangerouslySetInnerHTML={{ __html: email.htmlBody }}
        />
      );
    } else {
      return (
        <div className="email-text-body">
          {email.body || email.snippet}
        </div>
      );
    }
  };

  return (
    <div className="email-viewer">
      {/* Header */}
      <div className="email-viewer-header">
        <div className="email-viewer-actions">
          <button onClick={onClose} title="Close">
            ✕
          </button>
          <button onClick={onReply} title="Reply">
            ↩️ Reply
          </button>
          <button 
            onClick={email.isUnread ? handleMarkAsRead : handleMarkAsUnread}
            disabled={loading}
            title={email.isUnread ? 'Mark as Read' : 'Mark as Unread'}
          >
            {email.isUnread ? '📧' : '📭'}
          </button>
          <button 
            onClick={handleToggleStar}
            disabled={loading}
            title={email.isStarred ? 'Unstar' : 'Star'}
          >
            {email.isStarred ? '⭐' : '☆'}
          </button>
        </div>
      </div>

      {/* Email Content */}
      <div className="email-viewer-content">
        {/* Subject */}
        <div className="email-subject-header">
          <h2>{email.subject || '(No Subject)'}</h2>
          {email.isUnread && <span className="unread-badge">Unread</span>}
        </div>

        {/* From/To/Date */}
        <div className="email-meta">
          <div className="email-meta-row">
            <span className="meta-label">From:</span>
            <span className="meta-value">{email.from}</span>
          </div>
          <div className="email-meta-row">
            <span className="meta-label">To:</span>
            <span className="meta-value">{email.to}</span>
          </div>
          {email.cc && (
            <div className="email-meta-row">
              <span className="meta-label">Cc:</span>
              <span className="meta-value">{email.cc}</span>
            </div>
          )}
          <div className="email-meta-row">
            <span className="meta-label">Date:</span>
            <span className="meta-value">{formatDate(email.timestamp)}</span>
          </div>
        </div>

        {/* Matched Clients Badge */}
        {email.matchedClientIds && email.matchedClientIds.length > 0 && (
          <div className="email-client-match">
            <span className="match-icon">👤</span>
            Matched to {email.matchedClientIds.length} client{email.matchedClientIds.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="email-attachments">
            <h3>📎 Attachments ({email.attachments.length})</h3>
            <div className="attachment-list">
              {email.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <span className="attachment-icon">📄</span>
                  <span className="attachment-name">{attachment.filename}</span>
                  <span className="attachment-size">
                    ({(attachment.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="email-body">
          {renderEmailBody()}
        </div>
      </div>
    </div>
  );
};

export default EmailViewer;