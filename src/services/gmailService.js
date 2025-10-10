// services/gmailService.js
// Gmail API service for fetching and managing emails

const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1';

class GmailService {
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
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status}`);
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
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status}`);
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
      isStarred: message.labelIds?.includes('STARRED') || false
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
   * @param {Object} emailData - Email content (to, subject, body, etc.)
   */
  async sendEmail(accessToken, emailData) {
    try {
      const email = this.createEmailMessage(emailData);
      const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await fetch(`${GMAIL_API_BASE}/users/me/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: encodedEmail
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Create RFC 2822 formatted email message
   */
  createEmailMessage({ to, cc, bcc, subject, body, inReplyTo, references }) {
    const lines = [];
    lines.push(`To: ${to}`);
    if (cc) lines.push(`Cc: ${cc}`);
    if (bcc) lines.push(`Bcc: ${bcc}`);
    lines.push(`Subject: ${subject}`);
    if (inReplyTo) lines.push(`In-Reply-To: ${inReplyTo}`);
    if (references) lines.push(`References: ${references}`);
    lines.push('Content-Type: text/html; charset=utf-8');
    lines.push('');
    lines.push(body);

    return lines.join('\r\n');
  }

  /**
   * Get user profile info
   */
  async getUserProfile(accessToken) {
    try {
      const response = await fetch(`${GMAIL_API_BASE}/users/me/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Gmail profile:', error);
      throw error;
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
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            addLabelIds: addLabels,
            removeLabelIds: removeLabels
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to modify email: ${response.status}`);
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
}

export default new GmailService();