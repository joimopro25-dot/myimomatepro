// src/contexts/I18nContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';

type SupportedLanguage = 'pt' | 'en' | 'fr' | 'es' | 'it';
type TranslationNamespace = 'common' | 'client' | 'deal' | 'report' | 'ai_assistant';

interface I18nContextType {
 language: SupportedLanguage;
 translations: Record<SupportedLanguage, Record<TranslationNamespace, any>>;
 changeLanguage: (language: SupportedLanguage) => void;
 loading: boolean;
 error: string | null;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
 children: ReactNode;
 defaultLanguage?: SupportedLanguage;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
 children, 
 defaultLanguage = 'pt' 
}) => {
 const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage);
 const [translations, setTranslations] = useState<Record<SupportedLanguage, Record<TranslationNamespace, any>>>({} as any);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const loadTranslations = async (lang: SupportedLanguage) => {
   setLoading(true);
   setError(null);
   
   try {
     // Load all namespaces for the language
     const [common, client, deal, report, ai] = await Promise.all([
       import(\../locales/\it/common.json\).then(m => m.default),
       import(\../locales/\it/client.json\).then(m => m.default).catch(() => ({})),
       import(\../locales/\it/deal.json\).then(m => m.default).catch(() => ({})),
       import(\../locales/\it/report.json\).then(m => m.default).catch(() => ({})),
       import(\../locales/\it/ai.json\).then(m => m.default).catch(() => ({}))
     ]);

     setTranslations(prev => ({
       ...prev,
       [lang]: {
         common: common || {},
         client: client || {},
         deal: deal || {},
         report: report || {},
         ai_assistant: ai || {}
       }
     }));
     
     console.log(\Translations loaded for \it\);
   } catch (error) {
     console.error(\Failed to load translations for \it:\, error);
     setError(\Failed to load translations for \it\);
     
     // Fallback to Portuguese if not already
     if (lang !== 'pt') {
       console.log('Falling back to Portuguese...');
       await loadTranslations('pt');
       return;
     }
   } finally {
     setLoading(false);
   }
 };

 const changeLanguage = async (newLanguage: SupportedLanguage) => {
   if (newLanguage === language) return;
   
   setLanguage(newLanguage);
   localStorage.setItem('myimomatepro-language', newLanguage);
   
   // Load translations if not already loaded
   if (!translations[newLanguage]) {
     await loadTranslations(newLanguage);
   }
 };

 // Initialize language from localStorage or browser
 useEffect(() => {
   const savedLanguage = localStorage.getItem('myimomatepro-language') as SupportedLanguage;
   const browserLanguage = navigator.language.split('-')[0] as SupportedLanguage;
   
   const supportedLanguages: SupportedLanguage[] = ['pt', 'en', 'fr', 'es', 'it'];
   
   let initialLanguage = defaultLanguage;
   
   if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
     initialLanguage = savedLanguage;
   } else if (supportedLanguages.includes(browserLanguage)) {
     initialLanguage = browserLanguage;
   }
   
   setLanguage(initialLanguage);
 }, [defaultLanguage]);

 // Load translations when language changes
 useEffect(() => {
   loadTranslations(language);
 }, [language]);

 const value: I18nContextType = {
   language,
   translations,
   changeLanguage,
   loading,
   error
 };

 return (
   <I18nContext.Provider value={value}>
     {children}
   </I18nContext.Provider>
 );
};

// HOC for components that need translations
export const withTranslation = <P extends object>(
 Component: React.ComponentType<P>
) => {
 return (props: P) => (
   <I18nProvider>
     <Component {...props} />
   </I18nProvider>
 );
};
