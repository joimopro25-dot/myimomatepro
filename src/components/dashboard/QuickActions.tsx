// src/components/dashboard/QuickActions.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
 UserPlusIcon, 
 BriefcaseIcon, 
 DocumentTextIcon, 
 CalendarIcon,
 ArrowRightIcon 
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCommonTranslation } from '../../hooks/useTranslation';

interface QuickActionProps {
 title: string;
 description: string;
 icon: React.ComponentType<any>;
 to: string;
 color: string;
}

const QuickActionCard: React.FC<QuickActionProps> = ({ 
 title, 
 description, 
 icon: Icon, 
 to, 
 color 
}) => {
 const { theme } = useTheme();
 
 return (
   <Link 
     to={to}
     className="block p-4 rounded-lg transition-all duration-200 group"
     style={{ 
       backgroundColor: theme.colors.background.primary,
       border: \1px solid \\
     }}
     onMouseEnter={(e) => {
       e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
       e.currentTarget.style.borderColor = color;
     }}
     onMouseLeave={(e) => {
       e.currentTarget.style.backgroundColor = theme.colors.background.primary;
       e.currentTarget.style.borderColor = theme.colors.border.light;
     }}
   >
     <div className="flex items-start justify-between">
       <div className="flex items-start space-x-3">
         <div 
           className="p-2 rounded-lg"
           style={{ backgroundColor: color + '20' }}
         >
           <Icon className="w-5 h-5" style={{ color }} />
         </div>
         
         <div className="flex-1">
           <h4 className="font-medium"
               style={{ color: theme.colors.text.primary }}>
             {title}
           </h4>
           <p className="text-sm mt-1"
              style={{ color: theme.colors.text.secondary }}>
             {description}
           </p>
         </div>
       </div>
       
       <ArrowRightIcon 
         className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
         style={{ color: theme.colors.text.muted }}
       />
     </div>
   </Link>
 );
};

export const QuickActions: React.FC = () => {
 const { theme } = useTheme();
 const { t } = useCommonTranslation();
 
 const actions = [
   {
     title: 'Novo Cliente',
     description: 'Adicionar um novo cliente ao CRM',
     icon: UserPlusIcon,
     to: '/clients/new',
     color: theme.colors.primary[500]
   },
   {
     title: 'Novo Negócio',
     description: 'Criar uma nova oportunidade',
     icon: BriefcaseIcon,
     to: '/deals/new',
     color: theme.colors.success
   },
   {
     title: 'Gerar Documento',
     description: 'Criar proposta ou contrato',
     icon: DocumentTextIcon,
     to: '/documents/generate',
     color: theme.colors.info
   },
   {
     title: 'Agendar Visita',
     description: 'Marcar visita com cliente',
     icon: CalendarIcon,
     to: '/visits/new',
     color: theme.colors.warning
   }
 ];

 return (
   <div className="space-y-4">
     <div className="flex items-center justify-between">
       <h3 className="text-lg font-semibold"
           style={{ color: theme.colors.text.primary }}>
         Ações Rápidas
       </h3>
     </div>
     
     <div className="space-y-2">
       {actions.map((action, index) => (
         <QuickActionCard key={index} {...action} />
       ))}
     </div>
   </div>
 );
};
