// components/email/EmailList.jsx
import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  InboxIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  StarIcon as StarIconOutline,
  ArchiveBoxIcon,
  TrashIcon,
  CheckCircleIcon,
  UserIcon,
  UsersIcon,
  EllipsisVerticalIcon,
  PaperClipIcon,
  LinkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, InboxIcon as InboxIconSolid } from '@heroicons/react/24/solid';
import './EmailList.css';

const EmailList = ({ emails, selectedEmail, onEmailSelect, loading, selectedEmails: parentSelectedEmails, onEmailsSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [localSelectedEmails, setLocalSelectedEmails] = useState([]);
  const [starredEmails, setStarredEmails] = useState([]);
  const [showClientMenu, setShowClientMenu] = useState(null);

  // Use parent selection state if provided, otherwise use local
  const selectedEmails = parentSelectedEmails || localSelectedEmails;
  const setSelectedEmails = onEmailsSelect || setLocalSelectedEmails;

  const extractSenderName = (from) => {
    if (!from) return 'Unknown Sender';
    const match = from.match(/^(.+?)\s*</);
    return match ? match[1].trim() : from.split('@')[0];
  };

  const extractSenderEmail = (from) => {
    if (!from) return '';
    const match = from.match(/<(.+?)>/);
    return match ? match[1].trim() : from;
  };

  const getInitials = (name) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'short'
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'numeric',
        year: '2-digit'
      });
    }
  };

  const handleSelectEmail = (emailId, e) => {
    e.stopPropagation();
    setSelectedEmails(prev => {
      if (prev.includes(emailId)) {
        return prev.filter(id => id !== emailId);
      } else {
        return [...prev, emailId];
      }
    });
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(email => email.id || email.messageId));
    }
  };

  const handleStarEmail = (emailId, e) => {
    e.stopPropagation();
    setStarredEmails(prev => {
      if (prev.includes(emailId)) {
        return prev.filter(id => id !== emailId);
      } else {
        return [...prev, emailId];
      }
    });
  };

  const handleDeleteSelected = () => {
    // This would typically call a parent handler
    console.log('Delete selected emails:', selectedEmails);
  };

  const handleArchiveSelected = () => {
    // This would typically call a parent handler
    console.log('Archive selected emails:', selectedEmails);
  };

  const handleMarkAsReadSelected = () => {
    // This would typically call a parent handler
    console.log('Mark as read:', selectedEmails);
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = !searchTerm || 
      email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.snippet?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterType === 'unread') {
      matchesFilter = !email.isRead;
    } else if (filterType === 'starred') {
      matchesFilter = starredEmails.includes(email.id || email.messageId);
    } else if (filterType === 'clients') {
      matchesFilter = (email.clientIds && email.clientIds.length > 0) || 
                      (email.matchedClientIds && email.matchedClientIds.length > 0);
    }

    return matchesSearch && matchesFilter;
  });

  const unreadCount = emails.filter(e => !e.isRead).length;
  const starredCount = starredEmails.length;
  const clientCount = emails.filter(e => 
    (e.clientIds && e.clientIds.length > 0) || 
    (e.matchedClientIds && e.matchedClientIds.length > 0)
  ).length;

  if (loading) {
    return (
      <div className="email-list-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading emails...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-list-container">
      {/* Search Bar */}
      <div className="email-search">
        <div className="search-input-wrapper">
          <MagnifyingGlassIcon className="w-4 h-4 search-icon-hero" />
          <input
            type="text"
            className="search-input"
            placeholder="Search mail"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="email-filters">
        <button
          className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          <InboxIcon className="w-4 h-4 filter-icon-hero" />
          <span>Primary</span>
          {emails.length > 0 && <span className="filter-count">{emails.length}</span>}
        </button>
        <button
          className={`filter-tab ${filterType === 'unread' ? 'active' : ''}`}
          onClick={() => setFilterType('unread')}
        >
          <EnvelopeIcon className="w-4 h-4 filter-icon-hero" />
          <span>Unread</span>
          {unreadCount > 0 && <span className="filter-count">{unreadCount}</span>}
        </button>
        <button
          className={`filter-tab ${filterType === 'starred' ? 'active' : ''}`}
          onClick={() => setFilterType('starred')}
        >
          <StarIconOutline className="w-4 h-4 filter-icon-hero" />
          <span>Starred</span>
          {starredCount > 0 && <span className="filter-count">{starredCount}</span>}
        </button>
        <button
          className={`filter-tab ${filterType === 'clients' ? 'active' : ''}`}
          onClick={() => setFilterType('clients')}
        >
          <UsersIcon className="w-4 h-4 filter-icon-hero" />
          <span>Clients</span>
          {clientCount > 0 && <span className="filter-count">{clientCount}</span>}
        </button>
      </div>

      {/* Action Bar */}
      {selectedEmails.length > 0 && (
        <div className="action-bar">
          <div className="action-bar-left">
            <input
              type="checkbox"
              checked={selectedEmails.length === filteredEmails.length}
              onChange={handleSelectAll}
              className="select-all-checkbox"
            />
            <span className="selected-count">{selectedEmails.length} selected</span>
          </div>
          <div className="action-bar-right">
            <button className="action-btn" title="Archive" onClick={handleArchiveSelected}>
              <ArchiveBoxIcon className="w-5 h-5" />
            </button>
            <button className="action-btn btn-delete" title="Delete" onClick={handleDeleteSelected}>
              <TrashIcon className="w-5 h-5" />
            </button>
            <button className="action-btn" title="Mark as read" onClick={handleMarkAsReadSelected}>
              <CheckCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Email List */}
      <div className="email-list">
        {filteredEmails.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <InboxIcon className="w-16 h-16 text-gray-300" />
            </div>
            <div className="empty-title">No messages</div>
            <div className="empty-message">
              {searchTerm 
                ? `No emails match "${searchTerm}"`
                : filterType === 'unread'
                ? 'All caught up! No unread emails.'
                : filterType === 'starred'
                ? 'No starred emails yet.'
                : filterType === 'clients'
                ? 'No client emails yet.'
                : 'Your inbox is empty.'
              }
            </div>
          </div>
        ) : (
          filteredEmails.map((email) => {
            const emailId = email.id || email.messageId;
            const isSelected = selectedEmails.includes(emailId);
            const isStarred = starredEmails.includes(emailId);
            const isCurrentSelected = selectedEmail?.id === email.id || selectedEmail?.messageId === email.messageId;
            const hasClients = (email.clientIds && email.clientIds.length > 0) || 
                              (email.matchedClientIds && email.matchedClientIds.length > 0);

            return (
              <div
                key={emailId}
                className={`gmail-email-row ${!email.isRead ? 'unread' : ''} ${isCurrentSelected ? 'selected' : ''}`}
                onClick={() => onEmailSelect(email)}
              >
                {/* Checkbox */}
                <div className="email-checkbox-cell">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectEmail(emailId, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="email-checkbox"
                  />
                </div>

                {/* Star */}
                <div className="email-star-cell">
                  <button
                    className={`star-btn ${isStarred ? 'starred' : ''}`}
                    onClick={(e) => handleStarEmail(emailId, e)}
                    title={isStarred ? 'Unstar' : 'Star'}
                  >
                    {isStarred ? (
                      <StarIconSolid className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <StarIconOutline className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Sender Avatar */}
                <div className="email-avatar-cell">
                  <div className="sender-avatar">
                    {getInitials(extractSenderName(email.from))}
                  </div>
                </div>

                {/* Email Content */}
                <div className="email-content-cell">
                  <div className="email-sender">
                    {extractSenderName(email.from)}
                    {!email.isRead && (
                      <EnvelopeIcon className="w-3 h-3 inline ml-2 text-blue-600" />
                    )}
                  </div>
                  <div className="email-subject-snippet">
                    <span className="email-subject">{email.subject || '(No Subject)'}</span>
                    <span className="email-separator"> - </span>
                    <span className="email-snippet">{email.snippet || email.body?.substring(0, 100)}</span>
                  </div>
                </div>

                {/* Labels and Indicators */}
                <div className="email-indicators">
                  {hasClients && (
                    <div className="email-labels-cell">
                      <span className="email-label client-label">
                        <UserIcon className="w-3 h-3" />
                        <span>Client</span>
                      </span>
                    </div>
                  )}
                  {email.attachments && email.attachments.length > 0 && (
                    <PaperClipIcon className="w-4 h-4 text-gray-400" title="Has attachments" />
                  )}
                </div>

                {/* Time */}
                <div className="email-time-cell">
                  {formatTime(email.timestamp || email.date)}
                </div>

                {/* Actions Menu */}
                <div className="email-actions-cell">
                  <button
                    className="email-menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowClientMenu(showClientMenu === emailId ? null : emailId);
                    }}
                    title="More actions"
                  >
                    <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {showClientMenu === emailId && (
                    <div className="email-menu-dropdown">
                      <button className="menu-item">
                        <LinkIcon className="w-4 h-4" />
                        <span>Link to Client</span>
                      </button>
                      <button className="menu-item">
                        <ArchiveBoxIcon className="w-4 h-4" />
                        <span>Archive</span>
                      </button>
                      <button className="menu-item delete">
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EmailList;