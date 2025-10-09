/**
 * CALENDAR PAGE - MyImoMatePro
 * Page wrapper for the calendar with sidebar layout
 */

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MyimomateCalendar from '../components/Calendar/MyimomateCalendar';

const CalendarPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <MyimomateCalendar />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;