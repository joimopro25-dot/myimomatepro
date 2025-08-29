// src/components/dashboard/RecentActivity.tsx
import React from 'react';
import { 
 ClockIcon, 
 PhoneIcon, 
 MailIcon, 
 CalendarIcon,
 FileTextIcon,
 UserIcon
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ActivityItem {
 id: string;
 type: 'call' | 'email' | 'meeting' | 'document' | 'client_added';
 title: string;
 description: string;
 timestamp: Date;
 clientName?: string;
}

const ActivityIcon: React.FC<{ type: ActivityItem['type']; color: string }> = ({ type, color }) => {
 const iconProps = { className: 'w-4 h-4', style: { color } };
 
 switch (type) {
   case 'call': return <PhoneIcon {...iconProps} />;
   case 'email': return <MailIcon {...iconProps} />;
   case 'meeting': return <CalendarIcon {...iconProps} />;
   case 'document': return <FileTextIcon {...iconProps} />;
   case 'client_added': return <UserIcon {...iconProps} />;
   default: return <ClockIcon {...iconProps} />;
 }
};

const ActivityItem: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
 const { theme } = useTheme();
 
 const getRelativeTime = (date: Date) => {
   const now = new Date();
   const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
   
   if (diffInMinutes < 1) return 'Agora';
   if (diffInMinutes < 60) return \\m atrás\;
   
   const diffInHours = Math.floor(diffInMinutes / 60);
   if (diffInHours < 24) return \\h atrás\;
   
   const diffInDays = Math.floor(diffInHours / 24);
   return \\d atrás\;
 };

 return (
   <div className="flex items-start space-x-3 p-3 rounded-lg transition-colors"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}>
     
     <div 
       className="p-2 rounded-full flex-shrink-0"
       style={{ backgroundColor: theme.colors.primary[50] }}
     >
       <ActivityIcon type={activity.type} color={theme.colors.primary[500]} />
     </div>
     
     <div className="flex-1 min-w-0">
       <p className="text-sm font-medium"
          style={{ color: theme.colors.text.primary }}>
         {activity.title}
       </p>
       <p className="text-sm mt-1"
          style={{ color: theme.colors.text.secondary }}>
         {activity.description}
       </p>
       {activity.clientName && (
         <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full"
               style={{ 
                 backgroundColor: theme.colors.primary[100],
                 color: theme.colors.primary[700]
               }}>
           {activity.clientName}
         </span>
       )}
     </div>
     
     <div className="flex-shrink-0">
       <span className="text-xs"
             style={{ color: theme.colors.text.muted }}>
         {getRelativeTime(activity.timestamp)}
       </span>
     </div>
   </div>
 );
};

export const RecentActivity: React.FC = () => {
 const { theme } = useTheme();
 
 // Mock data - will be replaced with real data from Firestore
 const activities: ActivityItem[] = [
   {
     id: '1',
     type: 'call',
     title: 'Chamada telefónica',
     description: 'Contacto inicial sobre apartamento T2',
     timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
     clientName: 'João Silva'
   },
   {
     id: '2',
     type: 'document',
     title: 'Proposta gerada',
     description: 'CPCV para imóvel em Braga criado',
     timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
     clientName: 'Maria Santos'
   },
   {
     id: '3',
     type: 'meeting',
     title: 'Reunião agendada',
     description: 'Visita ao imóvel marcada para amanhã às 14h',
     timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
     clientName: 'Pedro Costa'
   },
   {
     id: '4',
     type: 'client_added',
     title: 'Novo cliente',
     description: 'Cliente adicionado ao CRM como investidor',
     timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h ago
     clientName: 'Ana Ferreira'
   },
   {
     id: '5',
     type: 'email',
     title: 'Email enviado',
     description: 'Documentos de financiamento enviados',
     timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
     clientName: 'Carlos Mendes'
   }
 ];

 return (
   <div className="space-y-4">
     <div className="flex items-center justify-between">
       <h3 className="text-lg font-semibold"
           style={{ color: theme.colors.text.primary }}>
         Atividade Recente
       </h3>
       <button className="text-sm hover:underline"
               style={{ color: theme.colors.primary[600] }}>
         Ver tudo
       </button>
     </div>
     
     <div 
       className="rounded-lg overflow-hidden"
       style={{ 
         backgroundColor: theme.colors.background.primary,
         border: \1px solid \\
       }}
     >
       {activities.length > 0 ? (
         <div className="divide-y" style={{ borderColor: theme.colors.border.light }}>
           {activities.map((activity) => (
             <ActivityItem key={activity.id} activity={activity} />
           ))}
         </div>
       ) : (
         <div className="p-8 text-center">
           <ClockIcon className="w-12 h-12 mx-auto mb-4"
                      style={{ color: theme.colors.text.muted }} />
           <p className="font-medium"
              style={{ color: theme.colors.text.primary }}>
             Nenhuma atividade recente
           </p>
           <p className="text-sm mt-1"
              style={{ color: theme.colors.text.secondary }}>
             As suas interações aparecerão aqui
           </p>
         </div>
       )}
     </div>
   </div>
 );
};
