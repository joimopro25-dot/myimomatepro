// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
 HomeIcon, 
 UsersIcon, 
 UserPlusIcon, 
 BriefcaseIcon,
 DocumentTextIcon,
 ChartBarIcon,
 CogIcon,
 ChevronLeftIcon,
 ChevronRightIcon
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCommonTranslation } from '../../hooks/useTranslation';
import { useTenant } from '../../hooks/useTenant';

interface NavItem {
 name: string;
 href: string;
 icon: React.ComponentType<any>;
 translationKey: string;
 badge?: number;
}

export const Sidebar: React.FC = () => {
 const [collapsed, setCollapsed] = useState(false);
 const { theme } = useTheme();
 const { t } = useCommonTranslation();
 const { consultorName, usage } = useTenant();
 const location = useLocation();

 const navigation: NavItem[] = [
   {
     name: 'Dashboard',
     href: '/dashboard',
     icon: HomeIcon,
     translationKey: 'nav.dashboard'
   },
   {
     name: 'Clientes',
     href: '/clients',
     icon: UsersIcon,
     translationKey: 'nav.clients',
     badge: usage.clients
   },
   {
     name: 'Leads',
     href: '/leads',
     icon: UserPlusIcon,
     translationKey: 'nav.leads'
   },
   {
     name: 'Negócios',
     href: '/deals',
     icon: BriefcaseIcon,
     translationKey: 'nav.deals',
     badge: usage.activeDeals
   },
   {
     name: 'Documentos',
     href: '/documents',
     icon: DocumentTextIcon,
     translationKey: 'nav.documents'
   },
   {
     name: 'Relatórios',
     href: '/reports',
     icon: ChartBarIcon,
     translationKey: 'nav.reports'
   },
   {
     name: 'Configurações',
     href: '/settings',
     icon: CogIcon,
     translationKey: 'nav.settings'
   }
 ];

 const isCurrentPage = (href: string) => {
   return location.pathname === href || location.pathname.startsWith(href + '/');
 };

 return (
   <div 
     className={\lex flex-col transition-all duration-300 \\}
     style={{ 
       backgroundColor: theme.colors.background.primary,
       borderRight: \1px solid \\
     }}
   >
     {/* Logo e toggle */}
     <div className=\"flex items-center justify-between p-4\"
          style={{ borderBottom: \1px solid \\ }}>
       {!collapsed && (
         <div className=\"flex items-center space-x-2\">
           <div className=\"w-8 h-8 rounded-lg flex items-center justify-center\"
                style={{ backgroundColor: theme.colors.primary[500] }}>
             <span className=\"text-white font-bold text-sm\">MI</span>
           </div>
           <span className=\"font-bold text-lg\"
                 style={{ color: theme.colors.text.primary }}>
             MyImoMate
           </span>
         </div>
       )}
       
       <button
         onClick={() => setCollapsed(!collapsed)}
         className=\"p-1 rounded-md transition-colors\"
         style={{ 
           color: theme.colors.text.secondary,
           ':hover': { backgroundColor: theme.colors.background.tertiary }
         }}
       >
         {collapsed ? (
           <ChevronRightIcon className=\"w-5 h-5\" />
         ) : (
           <ChevronLeftIcon className=\"w-5 h-5\" />
         )}
       </button>
     </div>

     {/* Informações do consultor */}
     {!collapsed && (
       <div className=\"px-4 py-3\"
            style={{ borderBottom: \1px solid \\ }}>
         <div className=\"flex items-center space-x-3\">
           <div className=\"w-10 h-10 rounded-full flex items-center justify-center\"
                style={{ backgroundColor: theme.colors.primary[100] }}>
             <span className=\"text-sm font-medium\"
                   style={{ color: theme.colors.primary[700] }}>
               {consultorName.split(' ').map(n => n[0]).join('').toUpperCase()}
             </span>
           </div>
           <div className=\"flex-1 min-w-0\">
             <p className=\"text-sm font-medium truncate\"
                style={{ color: theme.colors.text.primary }}>
               {consultorName}
             </p>
             <p className=\"text-xs truncate\"
                style={{ color: theme.colors.text.secondary }}>
               Consultor Imobiliário
             </p>
           </div>
         </div>
       </div>
     )}

     {/* Navegação */}
     <nav className=\"flex-1 px-3 py-4 space-y-1\">
       {navigation.map((item) => {
         const Icon = item.icon;
         const isActive = isCurrentPage(item.href);
         
         return (
           <Link
             key={item.href}
             to={item.href}
             className={\group flex items-center rounded-md text-sm font-medium transition-colors \\}
             style={{
               color: isActive ? theme.colors.primary[600] : theme.colors.text.secondary,
               backgroundColor: isActive ? theme.colors.primary[50] : 'transparent'
             }}
             onMouseEnter={(e) => {
               if (!isActive) {
                 e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
               }
             }}
             onMouseLeave={(e) => {
               if (!isActive) {
                 e.currentTarget.style.backgroundColor = 'transparent';
               }
             }}
           >
             <Icon className=\"w-5 h-5 flex-shrink-0\" />
             
             {!collapsed && (
               <>
                 <span className=\"ml-3 truncate\">{t(item.translationKey)}</span>
                 {item.badge !== undefined && item.badge > 0 && (
                   <span 
                     className=\"ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium\"
                     style={{
                       backgroundColor: theme.colors.primary[100],
                       color: theme.colors.primary[700]
                     }}
                   >
                     {item.badge}
                   </span>
                 )}
               </>
             )}
           </Link>
         );
       })}
     </nav>

     {/* Footer com versão */}
     {!collapsed && (
       <div className=\"px-4 py-3\"
            style={{ borderTop: \1px solid \\ }}>
         <p className=\"text-xs text-center\"
            style={{ color: theme.colors.text.muted }}>
           MyImoMatePro v1.0
         </p>
       </div>
     )}
   </div>
 );
};
