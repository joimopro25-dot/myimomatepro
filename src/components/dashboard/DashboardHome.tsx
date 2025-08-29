// src/components/dashboard/DashboardHome.tsx
import React from 'react';
import { StatsCards } from './StatsCards';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { useTheme } from '../../hooks/useTheme';
import { useCommonTranslation } from '../../hooks/useTranslation';

export const DashboardHome: React.FC = () => {
 const { theme } = useTheme();
 const { t } = useCommonTranslation();

 return (
   <div className=\"p-6 space-y-6\">
     {/* Welcome section */}
     <div>
       <h1 className=\"text-2xl font-bold\"
           style={{ color: theme.colors.text.primary }}>
         {t('dashboard.welcome')}
       </h1>
       <p className=\"mt-1\"
          style={{ color: theme.colors.text.secondary }}>
         Visão geral da sua atividade imobiliária
       </p>
     </div>

     {/* Stats cards */}
     <StatsCards />

     {/* Main content grid */}
     <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
       
       {/* Quick actions */}
       <div className=\"lg:col-span-1\">
         <QuickActions />
       </div>
       
       {/* Recent activity */}
       <div className=\"lg:col-span-2\">
         <RecentActivity />
       </div>
     </div>
   </div>
 );
};
