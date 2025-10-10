/**
 * GOOGLE CALENDAR SETTINGS - MyImoMatePro
 * Real OAuth Integration with Google Calendar API
 */

import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CalendarIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function GoogleCalendarSettings({ isOpen, onClose }) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [autoSync, setAutoSync] = useState(true);
  const [syncStatus, setSyncStatus] = useState(null);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('googleCalendarToken');
    const savedUserInfo = localStorage.getItem('googleCalendarUserInfo');
    const savedAutoSync = localStorage.getItem('googleCalendarAutoSync');

    if (savedToken) {
      setAccessToken(savedToken);
      setIsConnected(true);
    }
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }
    if (savedAutoSync !== null) {
      setAutoSync(savedAutoSync === 'true');
    }
  }, []);

  // Google OAuth Login
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError(null);

        const token = tokenResponse.access_token;
        setAccessToken(token);
        localStorage.setItem('googleCalendarToken', token);

        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const userData = await userInfoResponse.json();
        
        setUserInfo(userData);
        localStorage.setItem('googleCalendarUserInfo', JSON.stringify(userData));
        
        setIsConnected(true);
        setSyncStatus({ type: 'success', message: 'Conectado com sucesso!' });
      } catch (err) {
        setError('Erro ao conectar com Google Calendar');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Erro na autenticação. Tente novamente.');
      setLoading(false);
    },
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
    flow: 'implicit'
  });

  const handleDisconnect = () => {
    localStorage.removeItem('googleCalendarToken');
    localStorage.removeItem('googleCalendarUserInfo');
    setAccessToken(null);
    setUserInfo(null);
    setIsConnected(false);
  };

  const handleToggleAutoSync = (enabled) => {
    setAutoSync(enabled);
    localStorage.setItem('googleCalendarAutoSync', enabled.toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl bg-white shadow-xl rounded-lg z-10">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Integração Google Calendar</h3>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className={`rounded-lg p-4 border-2 ${
              isConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isConnected ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 text-gray-400" />
                  )}
                  <div>
                    <p className="font-semibold">{isConnected ? 'Conectado' : 'Não Conectado'}</p>
                    {userInfo && <p className="text-sm text-gray-600">{userInfo.email}</p>}
                  </div>
                </div>
                {isConnected && (
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Desconectar</span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg p-4 bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Sincronização Automática</h4>
                    <p className="text-sm text-gray-600">Sincronizar novos eventos automaticamente</p>
                  </div>
                  <button
                    onClick={() => handleToggleAutoSync(!autoSync)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      autoSync ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      autoSync ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => login()}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium">Conectar Google Calendar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}