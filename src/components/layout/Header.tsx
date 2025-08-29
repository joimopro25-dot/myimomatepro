// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { 
 BellIcon, 
 SunIcon, 
 MoonIcon, 
 GlobeIcon,
 LogOutIcon,
 SettingsIcon,
 UserIcon
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { useTenant } from '../../hooks/useTenant';
import { useAuth } from '../../hooks/useAuth'; // Assumindo que existe

interface NotificationBadgeProps {
 count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
 const { theme } = useTheme();
 
 if (count === 0) return null;
 
 return (
   <span 
     className=\"absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none rounded-full\"
     style={{
       backgroundColor: theme.colors.error,
       color: 'white',
       minWidth: '18px'
     }}
   >
     {count > 99 ? '99+' : count}
   </span>
 );
};

export const Header: React.FC = () => {
 const [showProfileMenu, setShowProfileMenu] = useState(false);
 const [showLanguageMenu, setShowLanguageMenu] = useState(false);
 const { theme, isDark, toggleTheme } = useTheme();
 const { t, language, changeLanguage, availableLanguages } = useTranslation();
 const { consultorName, getDaysUntilTrialExpires, plan } = useTenant();
 const { logout } = useAuth(); // Assumindo hook de auth
 
 const notificationCount = 3; // Mock data
 const trialDays = getDaysUntilTrialExpires();
 
 const languageNames = {
   pt: 'Português',
   en: 'English', 
   fr: 'Français',
   es: 'Español',
   it: 'Italiano'
 };

 return (
   <header 
     className=\"flex items-center justify-between px-6 py-4\"
     style={{ 
       backgroundColor: theme.colors.background.primary,
       borderBottom: \1px solid \\
     }}
   >
     {/* Breadcrumbs / Page title */}
     <div className=\"flex items-center space-x-4\">
       <h1 className=\"text-xl font-semibold\"
           style={{ color: theme.colors.text.primary }}>
         {t('nav.dashboard')}
       </h1>
       
       {/* Trial warning */}
       {trialDays !== null && trialDays <= 3 && (
         <div 
           className=\"px-3 py-1 rounded-md text-sm font-medium\"
           style={{ 
             backgroundColor: theme.colors.warning + '20',
             color: theme.colors.warning
           }}
         >
           Trial expira em {trialDays} dia{trialDays !== 1 ? 's' : ''}
         </div>
       )}
     </div>

     {/* Right side actions */}
     <div className=\"flex items-center space-x-4\">
       
       {/* Theme toggle */}
       <button
         onClick={toggleTheme}
         className=\"p-2 rounded-md transition-colors\"
         style={{ color: theme.colors.text.secondary }}
         onMouseEnter={(e) => {
           e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
         }}
         onMouseLeave={(e) => {
           e.currentTarget.style.backgroundColor = 'transparent';
         }}
         title={isDark ? 'Modo claro' : 'Modo escuro'}
       >
         {isDark ? <SunIcon className=\"w-5 h-5\" /> : <MoonIcon className=\"w-5 h-5\" />}
       </button>

       {/* Language selector */}
       <div className=\"relative\">
         <button
           onClick={() => setShowLanguageMenu(!showLanguageMenu)}
           className=\"p-2 rounded-md transition-colors\"
           style={{ color: theme.colors.text.secondary }}
           onMouseEnter={(e) => {
             e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.backgroundColor = 'transparent';
           }}
           title=\"Idioma\"
         >
           <GlobeIcon className=\"w-5 h-5\" />
         </button>
         
         {showLanguageMenu && (
           <div 
             className=\"absolute right-0 mt-2 w-40 rounded-md shadow-lg z-50\"
             style={{ 
               backgroundColor: theme.colors.background.primary,
               border: \1px solid \\
             }}
           >
             {availableLanguages.map((lang) => (
               <button
                 key={lang}
                 onClick={() => {
                   changeLanguage(lang);
                   setShowLanguageMenu(false);
                 }}
                 className={\w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-md last:rounded-b-md \\}
                 style={{
                   color: language === lang ? theme.colors.primary[600] : theme.colors.text.primary,
                   backgroundColor: language === lang ? theme.colors.primary[50] : 'transparent'
                 }}
                 onMouseEnter={(e) => {
                   if (language !== lang) {
                     e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
                   }
                 }}
                 onMouseLeave={(e) => {
                   if (language !== lang) {
                     e.currentTarget.style.backgroundColor = 'transparent';
                   } else {
                     e.currentTarget.style.backgroundColor = theme.colors.primary[50];
                   }
                 }}
               >
                 {languageNames[lang]}
               </button>
             ))}
           </div>
         )}
       </div>

       {/* Notifications */}
       <button
         className=\"p-2 rounded-md transition-colors relative\"
         style={{ color: theme.colors.text.secondary }}
         onMouseEnter={(e) => {
           e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
         }}
         onMouseLeave={(e) => {
           e.currentTarget.style.backgroundColor = 'transparent';
         }}
         title=\"Notificações\"
       >
         <BellIcon className=\"w-5 h-5\" />
         <NotificationBadge count={notificationCount} />
       </button>

       {/* Profile menu */}
       <div className=\"relative\">
         <button
           onClick={() => setShowProfileMenu(!showProfileMenu)}
           className=\"flex items-center space-x-2 p-1 rounded-md transition-colors\"
           onMouseEnter={(e) => {
             e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.backgroundColor = 'transparent';
           }}
         >
           <div 
             className=\"w-8 h-8 rounded-full flex items-center justify-center\"
             style={{ backgroundColor: theme.colors.primary[100] }}
           >
             <span className=\"text-xs font-medium\"
                   style={{ color: theme.colors.primary[700] }}>
               {consultorName.split(' ').map(n => n[0]).join('').toUpperCase()}
             </span>
           </div>
           <span className=\"text-sm font-medium hidden md:block\"
                 style={{ color: theme.colors.text.primary }}>
             {consultorName.split(' ')[0]}
           </span>
         </button>

         {showProfileMenu && (
           <div 
             className=\"absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50\"
             style={{ 
               backgroundColor: theme.colors.background.primary,
               border: \1px solid \\
             }}
           >
             <div className=\"px-4 py-3\"
                  style={{ borderBottom: \1px solid \\ }}>
               <p className=\"text-sm font-medium\"
                  style={{ color: theme.colors.text.primary }}>
                 {consultorName}
               </p>
               <p className=\"text-xs\"
                  style={{ color: theme.colors.text.secondary }}>
                 Plano {plan.charAt(0).toUpperCase() + plan.slice(1)}
               </p>
             </div>
             
             <div className=\"py-1\">
               <button
                 className=\"flex items-center w-full px-4 py-2 text-sm transition-colors\"
                 style={{ color: theme.colors.text.primary }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = 'transparent';
                 }}
               >
                 <UserIcon className=\"w-4 h-4 mr-3\" />
                 Perfil
               </button>
               
               <button
                 className=\"flex items-center w-full px-4 py-2 text-sm transition-colors\"
                 style={{ color: theme.colors.text.primary }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = 'transparent';
                 }}
               >
                 <SettingsIcon className=\"w-4 h-4 mr-3\" />
                 Configurações
               </button>
               
               <button
                 onClick={logout}
                 className=\"flex items-center w-full px-4 py-2 text-sm transition-colors\"
                 style={{ color: theme.colors.error }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor = theme.colors.error + '10';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = 'transparent';
                 }}
               >
                 <LogOutIcon className=\"w-4 h-4 mr-3\" />
                 Terminar sessão
               </button>
             </div>
           </div>
         )}
       </div>
     </div>
   </header>
 );
};
