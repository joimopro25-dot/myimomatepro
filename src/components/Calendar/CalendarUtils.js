/**
 * CALENDAR UTILITIES - MyImoMatePro
 * Helper functions for date manipulation and calendar operations
 */

// Format date for display
export const formatDate = (date) => {
  return date.toLocaleDateString('pt-PT', { 
    day: 'numeric',
    month: 'long', 
    year: 'numeric' 
  });
};

// Format time for display
export const formatTime = (time) => {
  if (!time) return '';
  return time;
};

// Check if two dates are the same day
export const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

// Check if two dates are in the same month
export const isSameMonth = (date1, date2) => {
  return date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

// Get all days for a month (including overflow from prev/next months)
export const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days = [];
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }
  
  // Next month days to complete the grid (6 weeks = 42 days)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }
  
  return days;
};

// Get all days for a week
export const getWeekDays = (date) => {
  const days = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  
  return days;
};

// Event type configurations
export const EVENT_TYPES = {
  birthday: {
    label: 'Aniversário',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-500',
    editable: false,
    recurring: true
  },
  cpcv: {
    label: 'CPCV',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-500',
    editable: false,
    recurring: false
  },
  escritura: {
    label: 'Escritura',
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-500',
    editable: false,
    recurring: true
  },
  task: {
    label: 'Tarefa',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-500',
    editable: true,
    recurring: false
  },
  visit: {
    label: 'Visita',
    color: 'bg-pink-500',
    lightColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-500',
    editable: false,
    recurring: false
  },
  followup: {
    label: 'Follow-up',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-500',
    editable: true,
    recurring: false
  }
};

// Export calendar to ICS format
export const exportToICS = (events) => {
  let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Myimomate//Calendar//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n';
  
  events.forEach(event => {
    const eventConfig = EVENT_TYPES[event.type];
    const dateStr = event.date.toISOString().replace(/[-:]/g, '').split('.')[0];
    
    icsContent += 'BEGIN:VEVENT\n';
    icsContent += `UID:${event.id}@myimomate.com\n`;
    icsContent += `DTSTAMP:${dateStr}Z\n`;
    icsContent += `DTSTART:${dateStr}Z\n`;
    icsContent += `SUMMARY:${eventConfig.label}: ${event.title}\n`;
    
    if (event.description) {
      icsContent += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\n`;
    }
    
    if (event.location) {
      icsContent += `LOCATION:${event.location}\n`;
    }
    
    if (event.recurring) {
      icsContent += 'RRULE:FREQ=YEARLY\n';
    }
    
    icsContent += 'END:VEVENT\n';
  });
  
  icsContent += 'END:VCALENDAR';

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Myimomate_Calendar_${new Date().getFullYear()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Load events from CRM data
export const loadEventsFromCRM = () => {
  const allEvents = [];
  const currentYear = new Date().getFullYear();

  // Load clients for birthdays
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  clients.forEach(client => {
    if (client.birthDate) {
      const birthDate = new Date(client.birthDate);
      // Create recurring events for multiple years
      for (let year = currentYear - 2; year <= currentYear + 5; year++) {
        const yearsSince = year - birthDate.getFullYear();
        allEvents.push({
          id: `birthday-${client.id}-${year}`,
          type: 'birthday',
          title: `🎂 ${client.name}${yearsSince > 0 ? ` (${yearsSince} anos)` : ''}`,
          date: new Date(year, birthDate.getMonth(), birthDate.getDate()),
          description: `Aniversário de ${client.name}`,
          clientId: client.id,
          recurring: true,
          priority: 'medium'
        });
      }
    }
  });

  // Load properties for CPCV and Escritura
  const properties = JSON.parse(localStorage.getItem('properties') || '[]');
  properties.forEach(property => {
    if (property.cpcvDate) {
      const cpcvDate = new Date(property.cpcvDate);
      allEvents.push({
        id: `cpcv-${property.id}`,
        type: 'cpcv',
        title: `📝 CPCV: ${property.title}`,
        date: cpcvDate,
        description: `Contrato promessa para ${property.title}`,
        propertyId: property.id,
        location: property.address,
        recurring: false
      });
    }

    if (property.escrituraDate) {
      const escrituraDate = new Date(property.escrituraDate);
      // Create recurring events for anniversaries
      for (let year = currentYear - 2; year <= currentYear + 5; year++) {
        const yearsSince = year - escrituraDate.getFullYear();
        if (yearsSince >= 0) {
          allEvents.push({
            id: `escritura-${property.id}-${year}`,
            type: 'escritura',
            title: `🏠 ${property.title}${yearsSince > 0 ? ` - ${yearsSince} Anos` : ' - Escritura'}`,
            date: new Date(year, escrituraDate.getMonth(), escrituraDate.getDate()),
            description: yearsSince > 0 ? `${yearsSince} anos de propriedade` : 'Assinatura de escritura',
            propertyId: property.id,
            location: property.address,
            recurring: true,
            priority: yearsSince === 0 ? 'high' : 'medium'
          });
        }
      }
    }
  });

  // Load tasks
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  tasks.forEach(task => {
    if (task.dueDate) {
      allEvents.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        date: new Date(task.dueDate),
        time: task.dueTime,
        description: task.description,
        priority: task.priority || 'medium',
        recurring: false
      });
    }
  });

  return allEvents;
};