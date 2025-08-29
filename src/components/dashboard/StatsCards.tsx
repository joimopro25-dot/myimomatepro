// src/components/dashboard/StatsCards.tsx
import React from 'react';
import { 
 UsersIcon, 
 BriefcaseIcon, 
 TrendingUpIcon, 
 EuroIcon 
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useTenant } from '../../hooks/useTenant';

interface StatCardProps {
 title: string;
 value: string | number;
 change?: {
   value: number;
   trend: 'up' | 'down' | 'neutral';
   period: string;
 };
 icon: React.ComponentType<any>;
 color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color }) => {
 const { theme } = useTheme();
 
 const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
   switch (trend) {
     case 'up': return theme.colors.success;
     case 'down': return theme.colors.error;
     default: return theme.colors.text.muted;
   }
 };

 return (
   <div 
     className="p-6 rounded-lg shadow-sm"
     style={{ 
       backgroundColor: theme.colors.background.primary,
       border: \1px solid \\
     }}
   >
     <div className="flex items-center justify-between">
       <div>
         <p className="text-sm font-medium"
            style={{ color: theme.colors.text.secondary }}>
           {title}
         </p>
         <p className="text-2xl font-bold mt-2"
            style={{ color: theme.colors.text.primary }}>
           {value}
         </p>
         
         {change && (
           <div className="flex items-center mt-2">
             <TrendingUpIcon 
               className={\w-4 h-4 mr-1 \\}
               style={{ color: getTrendColor(change.trend) }}
             />
             <span className="text-sm"
                   style={{ color: getTrendColor(change.trend) }}>
               {change.value > 0 ? '+' : ''}{change.value}% {change.period}
             </span>
           </div>
         )}
       </div>
       
       <div 
         className="p-3 rounded-full"
         style={{ backgroundColor: color + '20' }}
       >
         <Icon className="w-6 h-6" style={{ color }} />
       </div>
     </div>
   </div>
 );
};

export const StatsCards: React.FC = () => {
 const { theme } = useTheme();
 const { usage } = useTenant();
 
 // Mock data - will be replaced with real data
 const stats = [
   {
     title: 'Total de Clientes',
     value: usage.clients || 0,
     change: { value: 12, trend: 'up' as const, period: 'este mês' },
     icon: UsersIcon,
     color: theme.colors.primary[500]
   },
   {
     title: 'Negócios Ativos',
     value: usage.activeDeals || 0,
     change: { value: 8, trend: 'up' as const, period: 'esta semana' },
     icon: BriefcaseIcon,
     color: theme.colors.success
   },
   {
     title: 'Taxa de Conversão',
     value: '24%',
     change: { value: -2, trend: 'down' as const, period: 'este mês' },
     icon: TrendingUpIcon,
     color: theme.colors.info
   },
   {
     title: 'Comissões (Mês)',
     value: '€3,240',
     change: { value: 18, trend: 'up' as const, period: 'vs mês anterior' },
     icon: EuroIcon,
     color: theme.colors.warning
   }
 ];

 return (
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
     {stats.map((stat, index) => (
       <StatCard key={index} {...stat} />
     ))}
   </div>
 );
};
