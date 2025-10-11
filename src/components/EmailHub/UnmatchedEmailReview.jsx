// components/email/UnmatchedEmailReview.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import emailSyncService from '../../services/emailSyncService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './UnmatchedEmailReview.css';

const UnmatchedEmailReview = ({ isOpen, onClose, unmatchedEmails, matchedCount, onComplete }) => {
  const { currentUser } = useAuth();
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [processing, setProcessing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedEmailDetail, setSelectedEmailDetail] = useState(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadClients();
    }
  }, [isOpen, currentUser]);

  const loadClients = async () => {
    try {
      const clientsRef = collection(db, 'consultants', currentUser.uid, 'clients');
      const snapshot = await getDocs(clientsRef);
      
      const clientsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setClients(clientsList);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleSelectEmail = (emailId) => {
    setSelectedEmails(prev => {
      if (prev.includes(emailId)) {
        return prev.filter(id => id !== emailId);
      } else {
        return [...prev, emailId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === unmatchedEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(unmatchedEmails.map(email => email.messageId));
    }
  };

  const handleLinkToClient = async () => {
    if (!selectedClient || selectedEmails.length === 0) {
      alert('Please select a client and at least one email');
      return;
    }

    setProcessing(true);

    try {
      const emailsToLink = unmatchedEmails.filter(email => 
        selectedEmails.includes(email.messageId)
      );

      await emailSyncService.bulkLinkEmails(
        currentUser.uid,
        emailsToLink,
        selectedClient
      );

      alert(`Successfully linked ${emailsToLink.length} email(s) to client`);
      
      // Reset selections
      setSelectedEmails([]);
      setSelectedClient('');
      
      // Close and notify parent
      onComplete();
    } catch (error) {
      console.error('Error linking emails:', error);
      alert('Failed to link emails. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDiscardSelected = () => {
    if (selectedEmails.length === 0) {
      alert('Please select at least one email to discard');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to discard ${selectedEmails.length} email(s)? They will not be saved.`
    );

    if (confirmed) {
      setSelectedEmails([]);
      alert('Selected emails discarded');
    }
  };

  const handleDiscardAll = () => {
    const confirmed = window.confirm(
      `Are you sure you want to discard all ${unmatchedEmails.length} unmatched emails? They will not be saved.`
    );

    if (confirmed) {
      onComplete();
    }
  };

  const handleViewDetail = (email) => {
    setSelectedEmailDetail(email);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedEmailDetail(null);
  };

  const extractSenderName = (from) => {
    const match = from.match(/^(.+?)\s*</);
    return match ? match[1].trim() : from;
  };

  const extractSenderEmail = (from) => {
    const match = from.match(/<(.+?)>/);
    return match ? match[1].trim() : from;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="unmatched-review-overlay" onClick={onClose}>
      <div className="unmatched-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="unmatched-review-header">
          <div>
            <h2>Email Sync Complete</h2>
            <p className="sync-summary">
              ✅ <strong>{matchedCount}</strong> emails auto-matched and saved
              {unmatchedEmails.length > 0 && (
                <> • ❓ <strong>{unmatchedEmails.length}</strong> emails need review</>
              )}
            </p>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {unmatchedEmails.length === 0 ? (
          <div className="no-unmatched">
            <div className="success-icon">✓</div>
            <h3>All emails matched!</h3>
            <p>All synced emails were automatically matched to existing clients.</p>
            <button className="btn-primary" onClick={onComplete}>
              Done
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="unmatched-review-content">
                <div className="review-info">
                  <p>The following emails did not match any existing clients. You can:</p>
                  <ul>
                    <li>Link them to a client manually</li>
                    <li>Discard them (they won't be saved)</li>
                  </ul>
                </div>

                <div className="bulk-actions">
                  <button 
                    className="btn-select-all" 
                    onClick={handleSelectAll}
                  >
                    {selectedEmails.length === unmatchedEmails.length ? 'Deselect All' : 'Select All'}
                  </button>
                  
                  {selectedEmails.length > 0 && (
                    <span className="selection-count">
                      {selectedEmails.length} selected
                    </span>
                  )}
                </div>

                <div className="unmatched-emails-list">
                  {unmatchedEmails.map(email => (
                    <div key={email.messageId} className="unmatched-email-item">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(email.messageId)}
                        onChange={() => handleSelectEmail(email.messageId)}
                        className="email-checkbox"
                      />
                      
                      <div className="email-info" onClick={() => handleViewDetail(email)}>
                        <div className="email-from">
                          <strong>{extractSenderName(email.from)}</strong>
                          <span className="email-address">{extractSenderEmail(email.from)}</span>
                        </div>
                        <div className="email-subject">{email.subject}</div>
                        <div className="email-snippet">{email.snippet}</div>
                        <div className="email-date">{formatDate(email.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="review-actions">
                  <div className="link-section">
                    <label>Link selected to client:</label>
                    <div className="link-controls">
                      <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="client-select"
                        disabled={selectedEmails.length === 0}
                      >
                        <option value="">Select a client...</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn-link"
                        onClick={handleLinkToClient}
                        disabled={!selectedClient || selectedEmails.length === 0 || processing}
                      >
                        {processing ? 'Linking...' : 'Link to Client'}
                      </button>
                    </div>
                  </div>

                  <div className="discard-section">
                    <button
                      className="btn-discard-selected"
                      onClick={handleDiscardSelected}
                      disabled={selectedEmails.length === 0}
                    >
                      Discard Selected
                    </button>
                    <button
                      className="btn-discard-all"
                      onClick={handleDiscardAll}
                    >
                      Discard All Unmatched
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="email-detail-view">
                <button className="btn-back" onClick={handleBackToList}>
                  ← Back to List
                </button>
                
                <div className="email-detail-header">
                  <h3>{selectedEmailDetail.subject}</h3>
                  <div className="detail-meta">
                    <div><strong>From:</strong> {selectedEmailDetail.from}</div>
                    <div><strong>To:</strong> {selectedEmailDetail.to}</div>
                    {selectedEmailDetail.cc && (
                      <div><strong>CC:</strong> {selectedEmailDetail.cc}</div>
                    )}
                    <div><strong>Date:</strong> {formatDate(selectedEmailDetail.timestamp)}</div>
                  </div>
                </div>

                <div className="email-detail-body">
                  <div dangerouslySetInnerHTML={{ __html: selectedEmailDetail.body || selectedEmailDetail.snippet }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UnmatchedEmailReview;