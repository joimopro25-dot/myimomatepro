/**
 * FORGOT PASSWORD PAGE - RealEstateCRM Pro
 * Password recovery functionality
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateEmail } from '../../utils/validation';
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess(false);
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setEmail(''); // Clear email field
    } catch (error) {
      console.error('Password reset error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError(t('auth.userNotFound'));
          break;
        case 'auth/invalid-email':
          setError(t('validation.email'));
          break;
        case 'auth/too-many-requests':
          setError(t('auth.tooManyRequests'));
          break;
        default:
          setError(t('messages.error.general'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <BuildingOfficeIcon className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">
              {t('app.name')}
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">
            {t('auth.resetPassword')}
          </h1>
          <p className="text-gray-400">
            {success 
              ? t('auth.checkYourEmail')
              : t('auth.enterEmailToReset')
            }
          </p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-2">
                {t('auth.emailSent')}
              </h2>
              
              <p className="text-gray-400 mb-6">
                {t('auth.checkEmailInstructions')}
              </p>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  {t('auth.backToLogin')}
                </Link>
                
                <button
                  onClick={() => setSuccess(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {t('auth.sendAnotherEmail')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Reset Form */
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(''); // Clear error when typing
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('auth.emailPlaceholder')}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-3 px-4 rounded-lg font-medium
                  transition-all duration-200
                  ${loading 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
                  }
                `}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t('common.loading')}
                  </span>
                ) : (
                  t('auth.sendResetEmail')
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>{t('auth.backToLogin')}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {t('auth.needHelp')}{' '}
            <a 
              href="mailto:support@realestatecrm.pro" 
              className="text-primary-400 hover:text-primary-300 transition-colors duration-200"
            >
              {t('common.contactSupport')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}