/**
 * GOOGLE CALENDAR SERVICE - MyImoMatePro
 * Complete service for syncing events with Google Calendar API
 */

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

/**
 * Convert MyImoMatePro event to Google Calendar format
 */
const convertToGoogleEvent = (event) => {
  const startDateTime = new Date(event.date);
  
  // If event has time, use dateTime, otherwise use date (all-day event)
  let start, end;
  
  if (event.time) {
    // Parse time (format: "14:30" or "14:30:00")
    const [hours, minutes] = event.time.split(':');
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + 1); // Default 1 hour duration
    
    start = { dateTime: startDateTime.toISOString(), timeZone: 'Europe/Lisbon' };
    end = { dateTime: endDateTime.toISOString(), timeZone: 'Europe/Lisbon' };
  } else {
    // All-day event
    const dateString = startDateTime.toISOString().split('T')[0];
    start = { date: dateString };
    end = { date: dateString };
  }

  const googleEvent = {
    summary: event.title,
    description: event.description || '',
    start,
    end,
    location: event.location || '',
    colorId: getColorId(event.type),
    extendedProperties: {
      private: {
        myimomateId: event.id,
        myimomateType: event.type,
        clientId: event.clientId || '',
        opportunityId: event.opportunityId || '',
        dealId: event.dealId || ''
      }
    }
  };

  // Add recurrence for recurring events (birthdays, etc)
  if (event.recurring) {
    googleEvent.recurrence = ['RRULE:FREQ=YEARLY'];
  }

  return googleEvent;
};

/**
 * Get Google Calendar color ID based on event type
 */
const getColorId = (eventType) => {
  const colorMap = {
    birthday: '9',      // Blue
    cpcv: '5',          // Yellow
    escritura: '10',    // Green
    task: '3',          // Purple
    visit: '4',         // Pink
    followup: '6'       // Orange
  };
  return colorMap[eventType] || '1'; // Default gray
};

/**
 * Get event mapping from localStorage
 */
const getEventMapping = () => {
  const mapping = localStorage.getItem('googleCalendarEventMapping');
  return mapping ? JSON.parse(mapping) : {};
};

/**
 * Save event mapping to localStorage
 */
const saveEventMapping = (mapping) => {
  localStorage.setItem('googleCalendarEventMapping', JSON.stringify(mapping));
};

/**
 * Add event mapping
 */
const addEventMapping = (myimomateId, googleEventId) => {
  const mapping = getEventMapping();
  mapping[myimomateId] = googleEventId;
  saveEventMapping(mapping);
};

/**
 * Remove event mapping
 */
const removeEventMapping = (myimomateId) => {
  const mapping = getEventMapping();
  delete mapping[myimomateId];
  saveEventMapping(mapping);
};

/**
 * Get Google Calendar ID (default is 'primary')
 */
const getCalendarId = () => {
  return localStorage.getItem('googleCalendarId') || 'primary';
};

/**
 * List all calendars for the user
 */
export const listCalendars = async (accessToken) => {
  try {
    const response = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list calendars: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error listing calendars:', error);
    throw error;
  }
};

/**
 * Create a new event in Google Calendar
 */
export const createGoogleCalendarEvent = async (accessToken, event) => {
  try {
    const calendarId = getCalendarId();
    const googleEvent = convertToGoogleEvent(event);

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleEvent)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create event: ${errorData.error?.message || response.status}`);
    }

    const createdEvent = await response.json();
    
    // Save mapping
    addEventMapping(event.id, createdEvent.id);
    
    console.log('✅ Event created in Google Calendar:', createdEvent.id);
    return createdEvent;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
};

/**
 * Update an existing event in Google Calendar
 */
export const updateGoogleCalendarEvent = async (accessToken, myimomateEventId, event) => {
  try {
    const calendarId = getCalendarId();
    const mapping = getEventMapping();
    const googleEventId = mapping[myimomateEventId];

    if (!googleEventId) {
      console.log('Event not found in mapping, creating new event');
      return await createGoogleCalendarEvent(accessToken, event);
    }

    const googleEvent = convertToGoogleEvent(event);

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${googleEventId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleEvent)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update event: ${errorData.error?.message || response.status}`);
    }

    const updatedEvent = await response.json();
    console.log('✅ Event updated in Google Calendar:', updatedEvent.id);
    return updatedEvent;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw error;
  }
};

/**
 * Delete an event from Google Calendar
 */
export const deleteGoogleCalendarEvent = async (accessToken, myimomateEventId) => {
  try {
    const calendarId = getCalendarId();
    const mapping = getEventMapping();
    const googleEventId = mapping[myimomateEventId];

    if (!googleEventId) {
      console.log('Event not found in mapping, nothing to delete');
      return;
    }

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${googleEventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete event: ${response.status}`);
    }

    // Remove from mapping
    removeEventMapping(myimomateEventId);
    
    console.log('✅ Event deleted from Google Calendar:', googleEventId);
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw error;
  }
};

/**
 * Sync all events to Google Calendar
 * This is a FULL sync - it will create all events that don't exist yet
 */
export const syncAllEvents = async (accessToken, events, onProgress = null) => {
  try {
    console.log('🔄 Starting full sync of', events.length, 'events...');
    
    const mapping = getEventMapping();
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      
      try {
        // Check if event already exists in Google Calendar
        if (mapping[event.id]) {
          // Event exists, skip (or optionally update)
          results.skipped++;
          console.log(`⏭️ Skipping existing event: ${event.title}`);
        } else {
          // Event doesn't exist, create it
          await createGoogleCalendarEvent(accessToken, event);
          results.created++;
          console.log(`✅ Created: ${event.title}`);
        }

        // Report progress
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: events.length,
            percentage: Math.round(((i + 1) / events.length) * 100)
          });
        }

        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.errors++;
        console.error(`❌ Error syncing event ${event.title}:`, error);
      }
    }

    console.log('✅ Sync completed:', results);
    
    // Save last sync time
    localStorage.setItem('googleCalendarLastSync', new Date().toISOString());
    
    return results;
  } catch (error) {
    console.error('Error in syncAllEvents:', error);
    throw error;
  }
};

/**
 * Clear all synced events (remove mapping)
 */
export const clearSyncMapping = () => {
  localStorage.removeItem('googleCalendarEventMapping');
  console.log('✅ Sync mapping cleared');
};

/**
 * Get sync statistics
 */
export const getSyncStats = () => {
  const mapping = getEventMapping();
  const lastSync = localStorage.getItem('googleCalendarLastSync');
  
  return {
    syncedEventsCount: Object.keys(mapping).length,
    lastSyncDate: lastSync ? new Date(lastSync) : null
  };
};

/**
 * Check if token is still valid
 */
export const checkTokenValidity = async (accessToken) => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + accessToken
    );
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.expires_in > 0;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};