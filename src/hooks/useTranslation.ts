// src/hooks/useTranslation.ts
import { useContext } from 'react';
import { I18nContext } from '../contexts/I18nContext';

type TranslationNamespace = 'common' | 'client' | 'deal' | 'report' | 'ai_assistant';

export const useTranslation = (namespace: TranslationNamespace = 'common') => {
 const context = useContext(I18nContext);
 
 if (!context) {
   throw new Error('useTranslation must be used within I18nProvider');
 }
 
 const { language, translations, changeLanguage, loading } = context;
 
 const t = (key: string, variables?: Record<string, string | number>): string => {
   if (loading) return key; // Return key while loading
   
   const keys = key.split('.');
   let translation = translations[language]?.[namespace];
   
   // Navigate through nested keys
   for (const k of keys) {
     translation = translation?.[k];
   }
   
   if (!translation || typeof translation !== 'string') {
     console.warn(\Translation key not found: \ in \ (\)\);
     return key; // Return key as fallback
   }
   
   // Replace variables in format {{variable}}
   if (variables) {
     return translation.replace(/\{\{(\w+)\}\}/g, (match: string, varName: string) => {
       return variables[varName]?.toString() || match;
     });
   }
   
   return translation;
 };
 
 const isRTL = ['ar', 'he', 'fa'].includes(language);
 
 return { 
   t, 
   language, 
   changeLanguage, 
   loading, 
   isRTL,
   availableLanguages: ['pt', 'en', 'fr', 'es', 'it'] as const
 };
};

// Helper hooks for common translations
export const useCommonTranslation = () => useTranslation('common');
export const useClientTranslation = () => useTranslation('client');
export const useDealTranslation = () => useTranslation('deal');
export const useReportTranslation = () => useTranslation('report');
export const useAITranslation = () => useTranslation('ai_assistant');
