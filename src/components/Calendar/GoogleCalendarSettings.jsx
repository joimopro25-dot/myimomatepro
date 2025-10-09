/**
 * GOOGLE CALENDAR SETTINGS - MyImoMatePro
 * Modal for configuring Google Calendar integration
 */

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';

const GoogleCalendarSettings = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [calendarName, setCalendarName] = useState('Myimomate CRM');
  const [autoSync, setAutoSync] = useState(true);
  const [syncStats, setSyncStats] = useState({ lastSync: null, eventCount: 0 });

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = () => {
    const settings = localStorage.getItem('googleCalendarSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setIsConnected(parsed.connected || false);
      setCalendarName(parsed.calendarName || 'Myimomate CRM');
      setAutoSync(parsed.autoSync !== false);
      setSyncStats(parsed.syncStats || { lastSync: null, eventCount: 0 });
    }
  };

  const handleConnect = () => {
    const settings = {
      connected: true,
      calendarName,
      autoSync,
      connectedAt: new Date().toISOString(),
      syncStats: { lastSync: new Date().toISOString(), eventCount: 0 }
    };
    localStorage.setItem('googleCalendarSettings', JSON.stringify(settings));
    setIsConnected(true);
    setSyncStats({ lastSync: new Date().toISOString(), eventCount: 0 });
    alert('✅ Google Calendar conectado com sucesso!');
  };

  const handleDisconnect = () => {
    if (confirm('Tem certeza que deseja desconectar o Google Calendar?')) {
      const settings = {
        connected: false,
        calendarName: 'Myimomate CRM',
        autoSync: true,
        syncStats: { lastSync: null, eventCount: 0 }
      };
      localStorage.setItem('googleCalendarSettings', JSON.stringify(settings));
      setIsConnected(false);
      setSyncStats({ lastSync: null, eventCount: 0 });
    }
  };

  const handleSyncNow = () => {
    const settings = JSON.parse(localStorage.getItem('googleCalendarSettings') || '{}');
    settings.syncStats = { lastSync: new Date().toISOString(), eventCount: syncStats.eventCount };
    localStorage.setItem('googleCalendarSettings', JSON.stringify(settings));
    setSyncStats({ ...syncStats, lastSync: new Date().toISOString() });
    alert('✅ Calendário sincronizado com sucesso!');
  };

  const handleSaveSettings = () => {
    const settings = JSON.parse(localStorage.getItem('googleCalendarSettings') || '{}');
    settings.calendarName = calendarName;
    settings.autoSync = autoSync;
    localStorage.setItem('googleCalendarSettings', JSON.stringify(settings));
    alert('✅ Configurações guardadas!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            Integração Google Calendar
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Estado</span>
              <span className={`flex items-center gap-2 text-sm font-semibold ${
                isConnected ? 'text-green-600' : 'text-gray-500'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-600' : 'bg-gray-400'
                }`}></span>
                {isConnected ? 'Conectado' : 'Não Conectado'}
              </span>
            </div>
            {isConnected && (
              <div className="text-xs text-gray-600 space-y-1 mt-2">
                <div>Calendário: {calendarName}</div>
                {syncStats.lastSync && (
                  <div>Última sincronização: {new Date(syncStats.lastSync).toLocaleString('pt-PT')}</div>
                )}
              </div>
            )}
          </div>

          {/* Calendar Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Calendário no Google
            </label>
            <input
              type="text"
              value={calendarName}
              onChange={(e) => setCalendarName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Myimomate CRM"
              disabled={!isConnected}
            />
            <p className="mt-1 text-xs text-gray-500">
              Personalize o nome do calendário como aparecer no Google Calendar
            </p>
          </div>

          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Sincronização automática</div>
              <div className="text-sm text-gray-500">Sincronizar instantaneamente ao alterar eventos</div>
            </div>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoSync ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              disabled={!isConnected}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoSync ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Benefits */}
          {!isConnected && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="font-medium text-blue-900 mb-2">Benefícios:</div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Sincronização automática de todos os eventos do CRM</li>
                <li>• Nunca mais esqueça aniversários</li>
                <li>• Aniversários de propriedades no seu telemóvel</li>
                <li>• Tarefas e visitas num só lugar</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Conectar Google Calendar
              </button>
            ) : (
              <>
                <button
                  onClick={handleSyncNow}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🔄 Sincronizar Agora
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Guardar
                </button>
              </>
            )}
          </div>

          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Desconectar
            </button>
          )}

          {/* Info Note */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <strong>Nota:</strong> Para a integração completa com Google Calendar API, será necessário configurar as credenciais OAuth 2.0 no Google Cloud Console. Esta versão simula a sincronização localmente.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarSettings;