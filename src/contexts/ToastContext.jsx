/**
 * TOAST CONTEXT - RealEstateCRM Pro
 * Global notification/toast system
 * Shows success, error, warning, and info messages
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast types
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Default duration in milliseconds
const DEFAULT_DURATION = 5000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Generate unique ID for each toast
  const generateId = () => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add a new toast
  const addToast = useCallback((options) => {
    const toast = {
      id: generateId(),
      type: options.type || TOAST_TYPES.INFO,
      title: options.title || '',
      message: options.message || '',
      duration: options.duration !== undefined ? options.duration : DEFAULT_DURATION,
      action: options.action || null,
      onClose: options.onClose || null,
      persistent: options.persistent || false,
      timestamp: new Date()
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove toast after duration (unless persistent)
    if (!toast.persistent && toast.duration > 0) {
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    }

    return toast.id;
  }, []);

  // Remove a toast
  const removeToast = useCallback((id) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addToast({
      ...options,
      type: TOAST_TYPES.SUCCESS,
      title: options.title || 'Sucesso',
      message
    });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({
      ...options,
      type: TOAST_TYPES.ERROR,
      title: options.title || 'Erro',
      message,
      duration: options.duration !== undefined ? options.duration : 7000 // Longer for errors
    });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({
      ...options,
      type: TOAST_TYPES.WARNING,
      title: options.title || 'Aviso',
      message
    });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({
      ...options,
      type: TOAST_TYPES.INFO,
      title: options.title || 'Informação',
      message
    });
  }, [addToast]);

  // Promise toast helper
  const promise = useCallback(async (
    promiseFn,
    {
      loading = 'A processar...',
      success: successMsg = 'Concluído com sucesso!',
      error: errorMsg = 'Ocorreu um erro'
    }
  ) => {
    const toastId = addToast({
      type: TOAST_TYPES.INFO,
      title: 'A processar',
      message: loading,
      persistent: true
    });

    try {
      const result = await promiseFn();
      removeToast(toastId);
      success(successMsg);
      return result;
    } catch (err) {
      removeToast(toastId);
      error(typeof errorMsg === 'function' ? errorMsg(err) : errorMsg);
      throw err;
    }
  }, [addToast, removeToast, success, error]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    promise
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-0 right-0 z-[9998] p-4 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Individual Toast Component
function Toast({ toast, onClose }) {
  const { type, title, message, action } = toast;

  // Icon and color configuration
  const config = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-200',
      textColor: 'text-green-700 dark:text-green-300'
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      textColor: 'text-red-700 dark:text-red-300'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      iconColor: 'text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-800 dark:text-amber-200',
      textColor: 'text-amber-700 dark:text-amber-300'
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-800 dark:text-blue-200',
      textColor: 'text-blue-700 dark:text-blue-300'
    }
  };

  const currentConfig = config[type] || config.info;
  const Icon = currentConfig.icon;

  return (
    <div
      className={`
        pointer-events-auto
        max-w-sm w-full
        ${currentConfig.bgColor}
        border ${currentConfig.borderColor}
        rounded-lg shadow-lg
        transform transition-all duration-300
        animate-slide-in-right
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${currentConfig.iconColor}`} />
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            {title && (
              <h3 className={`text-sm font-medium ${currentConfig.titleColor}`}>
                {title}
              </h3>
            )}
            {message && (
              <p className={`mt-1 text-sm ${currentConfig.textColor}`}>
                {message}
              </p>
            )}
            
            {/* Action button */}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={`
                    text-sm font-medium 
                    ${currentConfig.iconColor} 
                    hover:underline focus:outline-none
                  `}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className={`
                inline-flex rounded-md 
                ${currentConfig.textColor}
                hover:opacity-70 focus:outline-none
              `}
            >
              <span className="sr-only">Fechar</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for handling API errors
export function useApiErrorToast() {
  const { error } = useToast();

  const showApiError = useCallback((err) => {
    let message = 'Ocorreu um erro inesperado';

    if (err.response) {
      // Server responded with error
      message = err.response.data?.message || message;
    } else if (err.request) {
      // Request was made but no response
      message = 'Erro de conexão. Verifique sua internet.';
    } else if (err.message) {
      // Something else happened
      message = err.message;
    }

    error(message);
  }, [error]);

  return showApiError;
}

// Custom hook for form submission with toast feedback
export function useFormToast() {
  const toast = useToast();

  const handleSubmit = useCallback(async (
    submitFn,
    {
      loadingMsg = 'A guardar...',
      successMsg = 'Guardado com sucesso!',
      errorMsg = 'Erro ao guardar'
    } = {}
  ) => {
    return toast.promise(
      submitFn,
      {
        loading: loadingMsg,
        success: successMsg,
        error: (err) => {
          console.error('Form submission error:', err);
          return errorMsg;
        }
      }
    );
  }, [toast]);

  return handleSubmit;
}

// Export toast types for external use
export const ToastTypes = TOAST_TYPES;

// CSS for slide-in animation (add to your global CSS)
const toastStyles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;

// Inject styles (you should add this to your global CSS file instead)
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = toastStyles;
  document.head.appendChild(styleEl);
}

export default ToastContext;