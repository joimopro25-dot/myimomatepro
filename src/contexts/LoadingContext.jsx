/**
 * LOADING CONTEXT - RealEstateCRM Pro
 * Global loading states management
 * Handles loading overlays, spinners, and progress indicators
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const LoadingContext = createContext();

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

export function LoadingProvider({ children }) {
  const [loadingStates, setLoadingStates] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Start loading for a specific key
  const startLoading = useCallback((key, message = '') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { isLoading: true, message }
    }));
  }, []);

  // Stop loading for a specific key
  const stopLoading = useCallback((key) => {
    setLoadingStates(prev => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);

  // Check if a specific key is loading
  const isLoading = useCallback((key) => {
    return !!loadingStates[key]?.isLoading;
  }, [loadingStates]);

  // Get loading message for a key
  const getLoadingMessage = useCallback((key) => {
    return loadingStates[key]?.message || '';
  }, [loadingStates]);

  // Check if any loading is active
  const isAnyLoading = useCallback(() => {
    return globalLoading || Object.keys(loadingStates).length > 0;
  }, [globalLoading, loadingStates]);

  // Show global loading overlay
  const showGlobalLoading = useCallback((message = 'Loading...') => {
    setGlobalLoading(true);
    setLoadingMessage(message);
  }, []);

  // Hide global loading overlay
  const hideGlobalLoading = useCallback(() => {
    setGlobalLoading(false);
    setLoadingMessage('');
  }, []);

  // Wrap async function with loading state
  const withLoading = useCallback((key, asyncFn, message) => {
    return async (...args) => {
      startLoading(key, message);
      try {
        const result = await asyncFn(...args);
        return result;
      } finally {
        stopLoading(key);
      }
    };
  }, [startLoading, stopLoading]);

  const value = {
    // State
    loadingStates,
    globalLoading,
    loadingMessage,
    
    // Actions
    startLoading,
    stopLoading,
    showGlobalLoading,
    hideGlobalLoading,
    
    // Helpers
    isLoading,
    getLoadingMessage,
    isAnyLoading,
    withLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {globalLoading && <GlobalLoadingOverlay message={loadingMessage} />}
    </LoadingContext.Provider>
  );
}

// Global Loading Overlay Component
function GlobalLoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          
          {/* Message */}
          {message && (
            <p className="mt-4 text-gray-700 dark:text-gray-300 text-center font-medium">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <ArrowPathIcon 
      className={`animate-spin ${sizeClasses[size]} ${className}`}
    />
  );
}

// Loading Button Component
export function LoadingButton({ 
  loading, 
  loadingText = 'Loading...', 
  children, 
  className = '',
  disabled,
  ...props 
}) {
  return (
    <button
      disabled={loading || disabled}
      className={`
        relative inline-flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Loading Card Component
export function LoadingCard({ loading, children, className = '' }) {
  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return children;
}

// Skeleton Loader Component
export function SkeletonLoader({ 
  type = 'text', 
  lines = 1, 
  className = '' 
}) {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
              i < lines - 1 ? 'mb-2' : ''
            } ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
          />
        ));
      
      case 'title':
        return (
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
        );
      
      case 'avatar':
        return (
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        );
      
      case 'image':
        return (
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        );
      
      case 'card':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
}

// Table Skeleton Loader
export function TableSkeletonLoader({ rows = 5, columns = 4 }) {
  return (
    <div className="overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="border-b border-gray-100 dark:border-gray-800"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Progress Bar Component
export function ProgressBar({ 
  value, 
  max = 100, 
  className = '',
  color = 'primary',
  showLabel = false,
  label = ''
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    danger: 'bg-red-600'
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default LoadingContext;