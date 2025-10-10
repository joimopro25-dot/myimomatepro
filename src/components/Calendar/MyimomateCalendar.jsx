/**
 * MYIMOMATE CALENDAR - MyImoMatePro
 * Enhanced with Google Calendar sync
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  MagnifyingGlassIcon,
  CogIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CakeIcon,
  DocumentTextIcon,
  HomeIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

import EventModal from './EventModal';
import GoogleCalendarSettings from './GoogleCalendarSettings';
import { 
  EVENT_TYPES, 
  formatDate, 
  isSameDay, 
  getMonthDays, 
  getWeekDays,
  exportToICS
} from './CalendarUtils';

// Import Google Calendar Service
import {
  syncAllEvents,
  getSyncStats,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent
} from './googleCalendarService';

const MyimomateCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.uid) {
      loadEventsFromFirebase();
    }
  }, [currentUser]);

  // Auto-sync when events are loaded
  useEffect(() => {
    if (events.length > 0 && !loading) {
      checkAndAutoSync();
    }
  }, [events, loading]);

  const checkAndAutoSync = async () => {
    const accessToken = localStorage.getItem('googleCalendarToken');
    const autoSync = localStorage.getItem('googleCalendarAutoSync') === 'true';
    
    if (accessToken && autoSync) {
      const stats = getSyncStats();
      
      // Auto-sync if:
      // 1. Never synced before
      // 2. Last sync was more than 1 hour ago
      // 3. Number of events changed significantly
      const shouldSync = 
        !stats.lastSyncDate || 
        (Date.now() - stats.lastSyncDate.getTime() > 3600000) ||
        Math.abs(stats.syncedEventsCount - events.length) > 5;
      
      if (shouldSync) {
        console.log('🔄 Auto-sync triggered');
        await handleSyncToGoogle();
      }
    }
  };

  const handleSyncToGoogle = async () => {
    const accessToken = localStorage.getItem('googleCalendarToken');
    
    if (!accessToken) {
      setSyncStatus({
        type: 'error',
        message: 'Por favor, conecte-se ao Google Calendar primeiro'
      });
      return;
    }

    try {
      setSyncing(true);
      setSyncStatus({ type: 'info', message: 'Sincronizando eventos...' });
      setSyncProgress({ current: 0, total: events.length, percentage: 0 });

      const results = await syncAllEvents(accessToken, events, (progress) => {
        setSyncProgress(progress);
      });

      setSyncStatus({
        type: 'success',
        message: `✅ Sincronização concluída! ${results.created} criados, ${results.skipped} já existiam, ${results.errors} erros`
      });

      setTimeout(() => setSyncStatus(null), 5000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus({
        type: 'error',
        message: `Erro na sincronização: ${error.message}`
      });
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  const loadEventsFromFirebase = async () => {
    try {
      setLoading(true);
      const allEvents = [];
      const currentYear = new Date().getFullYear();
      const consultantId = currentUser.uid;

      console.log('🗓️ Loading calendar events...');

      const parseDate = (dateField) => {
        if (!dateField) return null;
        if (dateField.toDate) return dateField.toDate();
        if (dateField.seconds) return new Date(dateField.seconds * 1000);
        return new Date(dateField);
      };

      // ✅ LOAD CLIENTS
      try {
        const clientsRef = collection(db, 'consultants', consultantId, 'clients');
        const clientsSnapshot = await getDocs(clientsRef);
        
        console.log(`✅ Found ${clientsSnapshot.size} clients`);
        
        for (const clientDoc of clientsSnapshot.docs) {
          const client = { id: clientDoc.id, ...clientDoc.data() };
          
          // 1. CLIENT BIRTHDAYS
          const birthDateField = client.birthDate || client.dateOfBirth || client.dataNascimento || client.birthday;
          if (birthDateField) {
            const birthDate = parseDate(birthDateField);
            if (birthDate && !isNaN(birthDate.getTime())) {
              for (let year = currentYear - 2; year <= currentYear + 5; year++) {
                const yearsSince = year - birthDate.getFullYear();
                allEvents.push({
                  id: `birthday-${client.id}-${year}`,
                  type: 'birthday',
                  title: `🎂 ${client.name}${yearsSince > 0 ? ` (${yearsSince} anos)` : ''}`,
                  date: new Date(year, birthDate.getMonth(), birthDate.getDate()),
                  description: `Aniversário de ${client.name}`,
                  clientId: client.id,
                  clientName: client.name,
                  recurring: true,
                  priority: 'medium'
                });
              }
            }
          }
          
          // 2. OPPORTUNITIES
          try {
            const opportunitiesRef = collection(db, 'consultants', consultantId, 'clients', client.id, 'opportunities');
            const opportunitiesSnapshot = await getDocs(opportunitiesRef);
            
            for (const oppDoc of opportunitiesSnapshot.docs) {
              const opp = { id: oppDoc.id, ...oppDoc.data() };
              
              // Visit Date
              if (opp.visitDate) {
                const visitDate = parseDate(opp.visitDate);
                if (visitDate && !isNaN(visitDate.getTime())) {
                  allEvents.push({
                    id: `opp-visit-${opp.id}`,
                    type: 'visit',
                    title: `👁️ Visita: ${opp.propertyName || opp.title || 'Propriedade'}`,
                    date: visitDate,
                    time: opp.visitTime,
                    description: opp.notes || opp.description,
                    location: opp.address || opp.location,
                    clientId: client.id,
                    clientName: client.name,
                    opportunityId: opp.id,
                    priority: opp.priority || 'medium',
                    recurring: false
                  });
                }
              }

              // Follow-ups
              if (opp.followUpDate) {
                const followUpDate = parseDate(opp.followUpDate);
                if (followUpDate && !isNaN(followUpDate.getTime())) {
                  allEvents.push({
                    id: `followup-${opp.id}`,
                    type: 'followup',
                    title: `🔄 Follow-up: ${client.name}`,
                    date: followUpDate,
                    time: opp.followUpTime,
                    description: opp.followUpNotes || opp.notes,
                    clientId: client.id,
                    clientName: client.name,
                    opportunityId: opp.id,
                    priority: opp.priority || 'medium',
                    recurring: false
                  });
                }
              }
              
              // SELLER OPPORTUNITY VIEWINGS
              if (opp.type === 'seller' && opp.viewings && Array.isArray(opp.viewings)) {
                const propertyAddress = opp.property?.address || opp.address || 'Propriedade';
                
                opp.viewings.forEach((viewing, idx) => {
                  const viewingDate = parseDate(viewing.scheduledDate || viewing.date);
                  if (viewingDate && !isNaN(viewingDate.getTime())) {
                    allEvents.push({
                      id: `seller-viewing-${opp.id}-${viewing.id || idx}`,
                      type: 'visit',
                      title: `👁️ Visita (Venda): ${propertyAddress}`,
                      date: viewingDate,
                      time: viewing.scheduledTime || viewing.time,
                      description: `Vendedor: ${client.name}\nComprador: ${viewing.visitorName || 'Comprador'}\nStatus: ${viewing.status || 'agendada'}`,
                      location: propertyAddress,
                      clientId: client.id,
                      clientName: client.name,
                      opportunityId: opp.id,
                      priority: 'high',
                      recurring: false
                    });
                  }
                });
              }
              
              // SELLER OPPORTUNITY OFFERS
              if (opp.type === 'seller' && opp.offers && Array.isArray(opp.offers)) {
                const propertyAddress = opp.property?.address || opp.address || 'Propriedade';
                
                opp.offers.forEach((offer, idx) => {
                  const receivedDate = parseDate(offer.receivedDate || offer.receivedAt || offer.date);
                  if (receivedDate && !isNaN(receivedDate.getTime())) {
                    allEvents.push({
                      id: `seller-offer-received-${opp.id}-${offer.id || idx}`,
                      type: 'task',
                      title: `💰 Proposta Recebida: ${propertyAddress}`,
                      date: receivedDate,
                      description: `Vendedor: ${client.name}\nValor: €${offer.amount?.toLocaleString('pt-PT')}\nComprador: ${offer.buyerName || 'Comprador'}`,
                      clientId: client.id,
                      clientName: client.name,
                      opportunityId: opp.id,
                      priority: 'high',
                      recurring: false
                    });
                  }
                  
                  if (offer.status === 'countered' && offer.counteredAt) {
                    const counterDate = parseDate(offer.counteredAt);
                    if (counterDate && !isNaN(counterDate.getTime())) {
                      allEvents.push({
                        id: `seller-counter-${opp.id}-${offer.id || idx}`,
                        type: 'task',
                        title: `🔄 Contraproposta Enviada: ${propertyAddress}`,
                        date: counterDate,
                        description: `Vendedor: ${client.name}\nOriginal: €${offer.amount?.toLocaleString('pt-PT')}\nContraproposta: €${offer.counterAmount?.toLocaleString('pt-PT')}`,
                        clientId: client.id,
                        clientName: client.name,
                        opportunityId: opp.id,
                        priority: 'high',
                        recurring: false
                      });
                    }
                  }
                });
              }
              
              // SELLER TRANSACTION DATES
              if (opp.type === 'seller' && opp.transaction) {
                const propertyAddress = opp.property?.address || opp.address || 'Propriedade';
                const transaction = opp.transaction;
                
                const cpcvScheduled = parseDate(transaction.cpcv?.scheduledDate);
                if (cpcvScheduled && !isNaN(cpcvScheduled.getTime())) {
                  allEvents.push({
                    id: `seller-cpcv-scheduled-${opp.id}`,
                    type: 'cpcv',
                    title: `📋 CPCV Agendado (Venda): ${propertyAddress}`,
                    date: cpcvScheduled,
                    description: `Vendedor: ${client.name}`,
                    clientId: client.id,
                    clientName: client.name,
                    opportunityId: opp.id,
                    priority: 'high',
                    recurring: false
                  });
                }
                
                const escrituraScheduled = parseDate(transaction.escritura?.scheduledDate);
                if (escrituraScheduled && !isNaN(escrituraScheduled.getTime())) {
                  allEvents.push({
                    id: `seller-escritura-scheduled-${opp.id}`,
                    type: 'escritura',
                    title: `🏠 Escritura Agendada (Venda): ${propertyAddress}`,
                    date: escrituraScheduled,
                    description: `Vendedor: ${client.name}`,
                    clientId: client.id,
                    clientName: client.name,
                    opportunityId: opp.id,
                    priority: 'high',
                    recurring: false
                  });
                }
              }
              
              // 3. DEALS
              try {
                const dealsRef = collection(db, 'consultants', consultantId, 'clients', client.id, 'opportunities', opp.id, 'deals');
                const dealsSnapshot = await getDocs(dealsRef);
                
                for (const dealDoc of dealsSnapshot.docs) {
                  const deal = { id: dealDoc.id, ...dealDoc.data() };
                  const propertyAddress = deal.property?.address || deal.propertyAddress || 'Propriedade';
                  
                  // DEAL VIEWINGS
                  try {
                    const viewingsRef = collection(db, 'consultants', consultantId, 'clients', client.id, 'opportunities', opp.id, 'deals', deal.id, 'viewings');
                    const viewingsSnapshot = await getDocs(viewingsRef);
                    
                    viewingsSnapshot.forEach((viewingDoc) => {
                      const viewing = viewingDoc.data();
                      const viewingDate = parseDate(viewing.scheduledDate || viewing.date);
                      
                      if (viewingDate && !isNaN(viewingDate.getTime())) {
                        allEvents.push({
                          id: `viewing-${viewingDoc.id}`,
                          type: 'visit',
                          title: `🏠 Visita ao Imóvel: ${propertyAddress}`,
                          date: viewingDate,
                          time: viewing.time,
                          description: `Cliente: ${client.name}\nStatus: ${viewing.status || 'agendada'}`,
                          location: viewing.location || propertyAddress,
                          clientId: client.id,
                          clientName: client.name,
                          opportunityId: opp.id,
                          dealId: deal.id,
                          viewingId: viewingDoc.id,
                          priority: 'high',
                          recurring: false
                        });
                      }
                    });
                  } catch (error) {
                    console.error(`Error loading viewings:`, error);
                  }
                  
                  // DEAL OFFERS
                  try {
                    const offersRef = collection(db, 'consultants', consultantId, 'clients', client.id, 'opportunities', opp.id, 'deals', deal.id, 'offers');
                    const offersSnapshot = await getDocs(offersRef);
                    
                    offersSnapshot.forEach((offerDoc) => {
                      const offer = offerDoc.data();
                      
                      const sentDate = parseDate(offer.sentAt);
                      if (sentDate && !isNaN(sentDate.getTime())) {
                        allEvents.push({
                          id: `offer-sent-${offerDoc.id}`,
                          type: 'task',
                          title: `💰 Proposta Enviada: ${propertyAddress}`,
                          date: sentDate,
                          description: `Valor: €${offer.amount?.toLocaleString('pt-PT')}\nCliente: ${client.name}`,
                          clientId: client.id,
                          clientName: client.name,
                          opportunityId: opp.id,
                          dealId: deal.id,
                          offerId: offerDoc.id,
                          priority: 'high',
                          recurring: false
                        });
                      }
                      
                      const expiryDate = parseDate(offer.expiresAt);
                      if (expiryDate && !isNaN(expiryDate.getTime()) && offer.status === 'sent') {
                        allEvents.push({
                          id: `offer-expiry-${offerDoc.id}`,
                          type: 'task',
                          title: `⏰ Proposta Expira: ${propertyAddress}`,
                          date: expiryDate,
                          description: `Valor: €${offer.amount?.toLocaleString('pt-PT')}\nCliente: ${client.name}`,
                          clientId: client.id,
                          clientName: client.name,
                          opportunityId: opp.id,
                          dealId: deal.id,
                          offerId: offerDoc.id,
                          priority: 'high',
                          recurring: false
                        });
                      }
                    });
                  } catch (error) {
                    console.error(`Error loading offers:`, error);
                  }
                  
                  // TRANSACTION DATES
                  if (deal.transaction) {
                    const transaction = deal.transaction;
                    
                    const cpcvScheduled = parseDate(transaction.cpcv?.scheduledDate);
                    if (cpcvScheduled && !isNaN(cpcvScheduled.getTime())) {
                      allEvents.push({
                        id: `cpcv-scheduled-${deal.id}`,
                        type: 'cpcv',
                        title: `📋 CPCV Agendado: ${propertyAddress}`,
                        date: cpcvScheduled,
                        description: `Cliente: ${client.name}`,
                        clientId: client.id,
                        clientName: client.name,
                        opportunityId: opp.id,
                        dealId: deal.id,
                        priority: 'high',
                        recurring: false
                      });
                    }
                    
                    const escrituraScheduled = parseDate(transaction.escritura?.scheduledDate);
                    if (escrituraScheduled && !isNaN(escrituraScheduled.getTime())) {
                      allEvents.push({
                        id: `escritura-scheduled-${deal.id}`,
                        type: 'escritura',
                        title: `🏠 Escritura Agendada: ${propertyAddress}`,
                        date: escrituraScheduled,
                        description: `Cliente: ${client.name}`,
                        clientId: client.id,
                        clientName: client.name,
                        opportunityId: opp.id,
                        dealId: deal.id,
                        priority: 'high',
                        recurring: false
                      });
                    }
                  }
                }
              } catch (error) {
                console.error(`Error loading deals:`, error);
              }
            }
          } catch (error) {
            console.error(`Error loading opportunities:`, error);
          }
        }
      } catch (error) {
        console.error('❌ Error loading clients:', error);
      }

      console.log(`✅ Total events loaded: ${allEvents.length}`);
      setEvents(allEvents);
    } catch (error) {
      console.error('❌ Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(event =>
      event.title.toLowerCase().includes(query) ||
      (event.description && event.description.toLowerCase().includes(query))
    );
  }, [events, searchQuery]);

  const getEventsForDate = (date) => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  const handleSaveEvent = (updatedEvent) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setSelectedEvent(null);
  };

  const MonthView = () => {
    const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map(day => (
            <div key={day} className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const isToday = isSameDay(day.date, new Date());
            return (
              <div
                key={index}
                className={`bg-white min-h-[100px] p-1 ${
                  !day.isCurrentMonth ? 'bg-gray-50' : ''
                } ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  !day.isCurrentMonth ? 'text-gray-400' : 
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => {
                    const config = EVENT_TYPES[event.type];
                    return (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left px-1 py-0.5 rounded text-xs truncate ${config.lightColor} ${config.textColor} hover:opacity-80 transition-opacity`}
                      >
                        {event.priority === 'high' && '🔴 '}
                        {event.title}
                      </button>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const AgendaView = () => {
    const upcomingEvents = filteredEvents
      .filter(event => event.date >= new Date())
      .sort((a, b) => a.date - b.date)
      .slice(0, 50);

    const groupedEvents = upcomingEvents.reduce((groups, event) => {
      const dateKey = event.date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
      return groups;
    }, {});

    const iconMap = {
      birthday: CakeIcon,
      cpcv: DocumentTextIcon,
      escritura: HomeIcon,
      task: CheckCircleIcon,
      visit: EyeIcon,
      followup: ArrowPathIcon
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[600px] overflow-y-auto">
        {Object.entries(groupedEvents).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Nenhum evento próximo</p>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([date, events]) => (
            <div key={date} className="border-b border-gray-200 last:border-b-0">
              <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-900 sticky top-0">{date}</div>
              <div className="divide-y divide-gray-100">
                {events.map(event => {
                  const config = EVENT_TYPES[event.type];
                  const Icon = iconMap[event.type];
                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <div className={`${config.color} p-2 rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {event.priority === 'high' && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                          <span className="font-semibold text-gray-900">{event.title}</span>
                        </div>
                        {event.time && <div className="text-sm text-gray-500">{event.time}</div>}
                        {event.description && <div className="text-sm text-gray-600 mt-1">{event.description}</div>}
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar eventos do calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendário Myimomate</h1>
              <p className="text-sm text-gray-500">Toda a sua linha do tempo de negócios</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncToGoogle}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-4 h-4" />
                  Sincronizar
                </>
              )}
            </button>
            <button
              onClick={() => exportToICS(filteredEvents)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={filteredEvents.length === 0}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Exportar
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CogIcon className="w-4 h-4" />
              Google Calendar
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {syncStatus && (
          <div className={`mb-4 p-4 rounded-lg ${
            syncStatus.type === 'success' ? 'bg-green-50 border border-green-200' :
            syncStatus.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              {syncStatus.type === 'error' && <ExclamationCircleIcon className="w-5 h-5 text-red-600" />}
              {syncStatus.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
              {syncStatus.type === 'info' && <ArrowPathIcon className="w-5 h-5 text-blue-600" />}
              <p className={`text-sm font-medium ${
                syncStatus.type === 'success' ? 'text-green-800' :
                syncStatus.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {syncStatus.message}
              </p>
            </div>
            {syncProgress && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${syncProgress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {syncProgress.current} de {syncProgress.total} eventos ({syncProgress.percentage}%)
                </p>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Procurar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                view === 'month' ? newDate.setMonth(newDate.getMonth() - 1) : newDate.setDate(newDate.getDate() - 7);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                view === 'month' ? newDate.setMonth(newDate.getMonth() + 1) : newDate.setDate(newDate.getDate() + 7);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-lg font-bold text-gray-900 ml-4">
              {view === 'month' && currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
              {view === 'agenda' && 'Próximos Eventos'}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4 inline mr-1" />Mês
            </button>
            <button
              onClick={() => setView('agenda')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'agenda' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListBulletIcon className="w-4 h-4 inline mr-1" />Agenda
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          {Object.entries(EVENT_TYPES).map(([key, config]) => {
            const iconMap = { birthday: CakeIcon, cpcv: DocumentTextIcon, escritura: HomeIcon, task: CheckCircleIcon, visit: EyeIcon, followup: ArrowPathIcon };
            const Icon = iconMap[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <div className={`${config.color} p-1 rounded`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-700">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {view === 'month' && <MonthView />}
      {view === 'agenda' && <AgendaView />}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredEvents.length}</div>
            <div className="text-sm text-gray-500">Total de Eventos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredEvents.filter(e => e.type === 'birthday').length}</div>
            <div className="text-sm text-gray-500">Aniversários</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{filteredEvents.filter(e => e.type === 'visit').length}</div>
            <div className="text-sm text-gray-500">Visitas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{filteredEvents.filter(e => e.type === 'cpcv').length}</div>
            <div className="text-sm text-gray-500">CPCV</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{filteredEvents.filter(e => e.type === 'escritura').length}</div>
            <div className="text-sm text-gray-500">Escrituras</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{filteredEvents.filter(e => e.type === 'task').length}</div>
            <div className="text-sm text-gray-500">Propostas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">{filteredEvents.filter(e => e.type === 'followup').length}</div>
            <div className="text-sm text-gray-500">Follow-ups</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredEvents.filter(e => e.priority === 'high' && e.date >= new Date()).length}
            </div>
            <div className="text-sm text-gray-500">Urgentes</div>
          </div>
        </div>
      </div>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onSave={handleSaveEvent} />
      <GoogleCalendarSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default MyimomateCalendar;