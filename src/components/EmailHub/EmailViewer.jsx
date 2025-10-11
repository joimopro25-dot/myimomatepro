// components/EmailHub/EmailViewer.jsx
// Email viewer component for displaying full email content

import React, { useState } from 'react';
import { 
  XMarkIcon, 
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  TrashIcon,
  ArchiveBoxIcon,
  StarIcon as StarIconOutline,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  PaperClipIcon,
  UserIcon,
  UsersIcon,
  DocumentIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import gmailService from '../../services/gmailService';
import emailAccountService from '../../services/emailAccountService';
import './EmailViewer.css';

const EmailViewer = ({ email, consultantId, onClose, onReply, onDelete }) => {
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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      try {
        setLoading(true);
        if (onDelete) {
          await onDelete(email);
        }
        onClose();
      } catch (error) {
        console.error('Error deleting email:', error);
        alert('Failed to delete email');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleArchive = async () => {
    try {
      setLoading(true);
      // Add archive logic here
      console.log('Archiving email:', email.id);
      onClose();
    } catch (error) {
      console.error('Error archiving email:', error);
      alert('Failed to archive email');
    } finally {
      setLoading(false);
    }
  };

  const handleReplyAll = () => {
    // Add reply all logic
    console.log('Reply all to email');
  };

  const handleForward = () => {
    // Add forward logic
    console.log('Forward email');
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
      {/* Header with Actions */}
      <div className="email-viewer-header">
        <div className="email-viewer-top">
          <div className="email-subject-section">
            <h2>{email.subject || '(No Subject)'}</h2>
            {email.isUnread && <span className="unread-badge">Unread</span>}
          </div>
          
          <button 
            onClick={onClose} 
            className="btn-close"
            title="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="email-viewer-actions">
          <div className="action-group-primary">
            <button 
              onClick={onReply} 
              className="btn-action btn-primary"
              title="Reply"
              disabled={loading}
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
              <span>Reply</span>
            </button>
            
            <button 
              onClick={handleReplyAll}
              className="btn-action"
              title="Reply All"
              disabled={loading}
            >
              <ShareIcon className="w-4 h-4" />
              <span>Reply All</span>
            </button>
            
            <button 
              onClick={handleForward}
              className="btn-action"
              title="Forward"
              disabled={loading}
            >
              <ArrowUturnRightIcon className="w-4 h-4" />
              <span>Forward</span>
            </button>
          </div>

          <div className="action-group-secondary">
            <button 
              onClick={handleArchive}
              className="btn-action"
              title="Archive"
              disabled={loading}
            >
              <ArchiveBoxIcon className="w-4 h-4" />
              <span>Archive</span>
            </button>
            
            <button 
              onClick={handleDelete}
              className="btn-action btn-danger"
              title="Delete"
              disabled={loading}
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <div className="action-divider"></div>
            
            <button 
              onClick={email.isUnread ? handleMarkAsRead : handleMarkAsUnread}
              className="btn-icon"
              disabled={loading}
              title={email.isUnread ? 'Mark as Read' : 'Mark as Unread'}
            >
              {email.isUnread ? (
                <EnvelopeIcon className="w-5 h-5" />
              ) : (
                <EnvelopeOpenIcon className="w-5 h-5" />
              )}
            </button>
            
            <button 
              onClick={handleToggleStar}
              className="btn-icon"
              disabled={loading}
              title={email.isStarred ? 'Unstar' : 'Star'}
            >
              {email.isStarred ? (
                <StarIconSolid className="w-5 h-5 text-yellow-500" />
              ) : (
                <StarIconOutline className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="email-viewer-content">
        {/* Clean Metadata Display */}
        <div className="email-meta-card">
          <div className="email-meta-row">
            <span className="meta-label">From</span>
            <span className="meta-value">{email.from}</span>
          </div>
          <div className="email-meta-row">
            <span className="meta-label">To</span>
            <span className="meta-value">{email.to}</span>
          </div>
          {email.cc && (
            <div className="email-meta-row">
              <span className="meta-label">Cc</span>
              <span className="meta-value">{email.cc}</span>
            </div>
          )}
          <div className="email-meta-row">
            <span className="meta-label">Date</span>
            <span className="meta-value">{formatDate(email.timestamp)}</span>
          </div>
        </div>

        {/* Matched Clients Badge */}
        {email.matchedClientIds && email.matchedClientIds.length > 0 && (
          <div className="email-client-match">
            {email.matchedClientIds.length > 1 ? (
              <UsersIcon className="w-5 h-5 text-green-600" />
            ) : (
              <UserIcon className="w-5 h-5 text-green-600" />
            )}
            <span>
              Matched to {email.matchedClientIds.length} client{email.matchedClientIds.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Client IDs if available */}
        {email.clientIds && email.clientIds.length > 0 && (
          <div className="email-client-association">
            <UsersIcon className="w-4 h-4 text-blue-600" />
            <span className="client-badge">Associated with {email.clientIds.length} client(s)</span>
          </div>
        )}

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="email-attachments">
            <div className="attachments-header">
              <PaperClipIcon className="w-5 h-5 text-gray-600" />
              <h3>Attachments ({email.attachments.length})</h3>
            </div>
            <div className="attachment-list">
              {email.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <DocumentIcon className="w-4 h-4 text-gray-500" />
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