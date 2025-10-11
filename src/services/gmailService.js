// services/gmailService.js
// Gmail API service for fetching and managing emails

const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1';

class GmailService {
  constructor() {
    this.currentAccessToken = null;
  }

  /**
   * Set the current access token for API calls
   */
  setAccessToken(token) {
    this.currentAccessToken = token;
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders(accessToken = null) {
    const token = accessToken || this.currentAccessToken;
    if (!token) {
      throw new Error('No access token available');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetch emails from Gmail API
   * @param {string} accessToken - OAuth access token
   * @param {number} maxResults - Max number of emails to fetch
   * @param {string} pageToken - Page token for pagination
   */
  async fetchEmails(accessToken, maxResults = 50, pageToken = null) {
    try {
      let url = `${GMAIL_API_BASE}/users/me/messages?maxResults=${maxResults}`;
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      const response = await fetch(url, {
        headers: this.getAuthHeaders(accessToken)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gmail API error: ${error.error?.message || response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  /**
   * Fetch detailed email by ID
   * @param {string} accessToken - OAuth access token
   * @param {string} messageId - Gmail message ID
   */
  async fetchEmailById(accessToken, messageId) {
    try {
      const url = `${GMAIL_API_BASE}/users/me/messages/${messageId}?format=full`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders(accessToken)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gmail API error: ${error.error?.message || response.status}`);
      }

      const data = await response.json();
      return this.parseEmailData(data);
    } catch (error) {
      console.error('Error fetching email by ID:', error);
      throw error;
    }
  }

  /**
   * Parse Gmail API message data into usable format
   */
  parseEmailData(message) {
    const headers = message.payload.headers;
    const getHeader = (name) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    // Extract email body
    let body = '';
    let htmlBody = '';

    const extractBody = (part) => {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body = this.decodeBase64(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body.data) {
        htmlBody = this.decodeBase64(part.body.data);
      } else if (part.parts) {
        part.parts.forEach(extractBody);
      }
    };

    if (message.payload.parts) {
      message.payload.parts.forEach(extractBody);
    } else if (message.payload.body.data) {
      body = this.decodeBase64(message.payload.body.data);
    }

    // Extract attachments
    const attachments = [];
    const extractAttachments = (part) => {
      if (part.filename && part.body.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size,
          attachmentId: part.body.attachmentId
        });
      }
      if (part.parts) {
        part.parts.forEach(extractAttachments);
      }
    };

    if (message.payload.parts) {
      message.payload.parts.forEach(extractAttachments);
    }

    return {
      id: message.id,
      threadId: message.threadId,
      labelIds: message.labelIds || [],
      snippet: message.snippet,
      from: getHeader('From'),
      to: getHeader('To'),
      cc: getHeader('Cc'),
      bcc: getHeader('Bcc'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      timestamp: parseInt(message.internalDate),
      body: body || htmlBody,
      htmlBody: htmlBody,
      attachments: attachments,
      isUnread: message.labelIds?.includes('UNREAD') || false,
      isStarred: message.labelIds?.includes('STARRED') || false,
      isRead: !message.labelIds?.includes('UNREAD')
    };
  }

  /**
   * Decode base64 encoded email content
   */
  decodeBase64(data) {
    try {
      // Gmail uses URL-safe base64
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
      console.error('Error decoding base64:', error);
      return '';
    }
  }

  /**
   * Send email via Gmail API
   * @param {string} accessToken - OAuth access token
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body (HTML)
   * @param {string} threadId - Optional thread ID for replies
   */
  async sendEmail(accessToken, to, subject, body, threadId = null) {
    try {
      // Create email in RFC 2822 format
      const emailLines = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        body
      ];

      const email = emailLines.join('\r\n');
      
      // Encode to base64 URL-safe
      const encodedEmail = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const requestBody = {
        raw: encodedEmail
      };

      if (threadId) {
        requestBody.threadId = threadId;
      }

      const response = await fetch(`${GMAIL_API_BASE}/users/me/messages/send`, {
        method: 'POST',
        headers: this.getAuthHeaders(accessToken),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to send email: ${error.error?.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Get user profile info
   */
  async getUserProfile(accessToken) {
    try {
      const response = await fetch(`${GMAIL_API_BASE}/users/me/profile`, {
        headers: this.getAuthHeaders(accessToken)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to fetch profile: ${error.error?.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Gmail profile:', error);
      throw error;
    }
  }

  /**
   * Fetch Gmail signature and related "send as" info
   * @param {string} accessToken - OAuth access token
   * @returns {{signature: string, displayName: string, replyToAddress: string}}
   */
  async getSignature(accessToken) {
    try {
      const response = await fetch(`${GMAIL_API_BASE}/users/me/settings/sendAs`, {
        headers: this.getAuthHeaders(accessToken)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to fetch sendAs settings: ${error.error?.message || response.status}`);
      }

      const data = await response.json();
      const sendAs = data.sendAs || [];
      const primary = sendAs.find(a => a.isPrimary) || sendAs[0];

      if (primary) {
        return {
          signature: primary.signature || '',
          displayName: primary.displayName || '',
          replyToAddress: primary.replyToAddress || primary.sendAsEmail || ''
        };
      }

      return { signature: '', displayName: '', replyToAddress: '' };
    } catch (error) {
      console.error('Error fetching Gmail signature:', error);
      return { signature: '', displayName: '', replyToAddress: '' };
    }
  }

  /**
   * Modify email labels (mark as read/unread, star, etc.)
   */
  async modifyEmail(accessToken, messageId, addLabels = [], removeLabels = []) {
    try {
      const response = await fetch(
        `${GMAIL_API_BASE}/users/me/messages/${messageId}/modify`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(accessToken),
          body: JSON.stringify({
            addLabelIds: addLabels,
            removeLabelIds: removeLabels
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to modify email: ${error.error?.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error modifying email:', error);
      throw error;
    }
  }

  /**
   * Mark email as read
   */
  async markAsRead(accessToken, messageId) {
    return this.modifyEmail(accessToken, messageId, [], ['UNREAD']);
  }

  /**
   * Mark email as unread
   */
  async markAsUnread(accessToken, messageId) {
    return this.modifyEmail(accessToken, messageId, ['UNREAD'], []);
  }

  /**
   * Star email
   */
  async starEmail(accessToken, messageId) {
    return this.modifyEmail(accessToken, messageId, ['STARRED'], []);
  }

  /**
   * Unstar email
   */
  async unstarEmail(accessToken, messageId) {
    return this.modifyEmail(accessToken, messageId, [], ['STARRED']);
  }

  /**
   * Extract email address from "Name <email@domain.com>" format
   */
  extractEmail(emailString) {
    if (!emailString) return null;
    const match = emailString.match(/<(.+?)>/);
    return match ? match[1].toLowerCase() : emailString.toLowerCase();
  }

  /**
   * Extract all email addresses from a header value (supports multiple emails)
   */
  extractEmailAddresses(headerValue) {
    if (!headerValue) return [];
    
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const matches = headerValue.match(emailRegex);
    return matches ? matches.map(e => e.toLowerCase()) : [];
  }

  /**
   * Parse email headers into a map
   */
  parseHeaders(headers) {
    const headerMap = {};
    headers.forEach((header) => {
      headerMap[header.name.toLowerCase()] = header.value;
    });
    return headerMap;
  }

  /**
   * Decode email body from message object (for compatibility with emailSyncService)
   */
  decodeBody(message) {
    let body = '';
    
    if (message.payload.parts) {
      const htmlPart = message.payload.parts.find(
        (part) => part.mimeType === 'text/html'
      );
      const textPart = message.payload.parts.find(
        (part) => part.mimeType === 'text/plain'
      );
      
      const part = htmlPart || textPart;
      if (part && part.body.data) {
        body = this.decodeBase64(part.body.data);
      }
    } else if (message.payload.body.data) {
      body = this.decodeBase64(message.payload.body.data);
    }
    
    return body;
  }
}

export default new GmailService();