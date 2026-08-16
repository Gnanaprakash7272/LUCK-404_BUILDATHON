import React, { useState } from 'react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Aug 2026 for mock

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // Mock events
  const events = {
    '2026-8-15': { title: 'Independence Day', type: 'holiday' },
    '2026-8-20': { title: 'Mid-Term Exams Begin', type: 'exam' },
    '2026-8-25': { title: 'Faculty Meeting', type: 'admin' },
  };

  const generateDays = () => {
    let days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-surface-container-lowest border border-border-subtle/50 opacity-50"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${d}`;
      const event = events[dateKey];
      
      let eventColor = '';
      if (event) {
        if (event.type === 'holiday') eventColor = 'bg-error/10 text-error border-error/20';
        if (event.type === 'exam') eventColor = 'bg-primary/10 text-primary border-primary/20';
        if (event.type === 'admin') eventColor = 'bg-secondary/10 text-secondary border-secondary/20';
      }

      days.push(
        <div key={d} className="h-24 p-2 bg-surface-white border border-border-subtle relative group hover:border-primary transition-colors cursor-pointer">
          <span className="text-[14px] font-medium text-text-secondary group-hover:text-primary transition-colors">{d}</span>
          {event && (
            <div className={`mt-2 p-1 border rounded text-[10px] font-bold truncate ${eventColor}`}>
              {event.title}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Academic Calendar</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Institutional events, holidays, and exam schedules.</p>
        </div>
        <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Event
        </button>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[24px] font-bold text-on-surface">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="w-10 h-10 rounded-lg border border-border-subtle flex items-center justify-center hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button onClick={() => changeMonth(1)} className="w-10 h-10 rounded-lg border border-border-subtle flex items-center justify-center hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border-subtle border border-border-subtle rounded-lg overflow-hidden">
          {dayNames.map(day => (
            <div key={day} className="bg-surface-container-lowest py-3 text-center text-[12px] font-semibold uppercase tracking-wider text-text-secondary">
              {day}
            </div>
          ))}
          {generateDays()}
        </div>
        
        <div className="flex gap-4 mt-6 p-4 border border-border-subtle rounded-lg bg-surface-container-lowest">
          <div className="flex items-center gap-2 text-[12px] font-medium"><div className="w-3 h-3 rounded bg-error/20 border border-error/30"></div> Holidays</div>
          <div className="flex items-center gap-2 text-[12px] font-medium"><div className="w-3 h-3 rounded bg-primary/20 border border-primary/30"></div> Exams</div>
          <div className="flex items-center gap-2 text-[12px] font-medium"><div className="w-3 h-3 rounded bg-secondary/20 border border-secondary/30"></div> Admin Events</div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
