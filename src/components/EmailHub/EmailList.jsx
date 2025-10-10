// components/EmailHub/EmailList.jsx
// Email list view component

import React from 'react';
import './EmailList.css';

const EmailList = ({ emails, selectedEmail, onSelectEmail }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const extractName = (emailString) => {
    if (!emailString) return 'Unknown';
    
    // Extract name from "Name <email@domain.com>" format
    const match = emailString.match(/^(.+?)\s*<.+>$/);
    if (match) {
      return match[1].replace(/['"]/g, '').trim();
    }
    
    // If no name, return email address
    const emailMatch = emailString.match(/<(.+?)>/);
    return emailMatch ? emailMatch[1] : emailString;
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (emails.length === 0) {
    return (
      <div className="email-list-empty">
        <p>📭 No emails found</p>
      </div>
    );
  }

  return (
    <div className="email-list">
      {emails.map((email) => (
        <div
          key={email.id}
          className={`email-item ${selectedEmail?.id === email.id ? 'selected' : ''} ${
            email.isUnread ? 'unread' : ''
          }`}
          onClick={() => onSelectEmail(email)}
        >
          <div className="email-item-header">
            <div className="email-from">
              {email.isStarred && <span className="star-icon">⭐</span>}
              <strong>{extractName(email.from)}</strong>
            </div>
            <div className="email-date">{formatDate(email.timestamp)}</div>
          </div>
          
          <div className="email-subject">
            {email.isUnread && <span className="unread-dot">●</span>}
            {email.subject || '(No Subject)'}
          </div>
          
          <div className="email-snippet">
            {truncateText(email.snippet)}
          </div>

          {email.matchedClientIds && email.matchedClientIds.length > 0 && (
            <div className="email-badges">
              <span className="badge-client">
                👤 {email.matchedClientIds.length} client{email.matchedClientIds.length > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {email.attachments && email.attachments.length > 0 && (
            <div className="email-badges">
              <span className="badge-attachment">
                📎 {email.attachments.length}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EmailList;