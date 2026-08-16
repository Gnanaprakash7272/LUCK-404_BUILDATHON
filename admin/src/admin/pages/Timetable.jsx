import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('Global');
  
  // Conflict detection state
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    setIsLoading(true);
    const data = await adminApi.getTimetable();
    setTimetable(data);
    
    // Process conflicts (Faculty assigned to multiple classes at the same time)
    const conflictMap = {};
    data.forEach(entry => {
      const key = `${entry.day}-${entry.period}-${entry.facultyId}`;
      if (!conflictMap[key]) {
        conflictMap[key] = [];
      }
      conflictMap[key].push(entry);
    });
    
    const detectedConflicts = Object.values(conflictMap).filter(entries => entries.length > 1);
    setConflicts(detectedConflicts);
    
    setIsLoading(false);
  };

  const columns = [
    { 
      header: 'Day & Time', 
      accessor: 'day',
      render: (item) => (
        <div>
          <p className="font-medium text-on-surface">{item.day}</p>
          <p className="text-[12px] text-text-secondary">P{item.period}: {item.time}</p>
        </div>
      )
    },
    { 
      header: 'Class & Room', 
      accessor: 'classId',
      render: (item) => (
        <div>
          <p className="font-medium text-on-surface">{item.classId}</p>
          <p className="text-[12px] text-text-secondary">Room: {item.roomId}</p>
        </div>
      )
    },
    { 
      header: 'Subject & Type', 
      accessor: 'subjectId',
      render: (item) => (
        <div>
          <p className="text-on-surface text-[13px] font-medium">{item.subjectId}</p>
          <p className="text-[12px] text-text-secondary">{item.type}</p>
        </div>
      )
    },
    { 
      header: 'Faculty', 
      accessor: 'facultyId',
      render: (item) => <span className="font-medium text-on-surface-variant">{item.facultyId}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => {
        const isConflict = conflicts.some(c => c.some(e => e.id === item.id));
        if (isConflict) {
          return <span className="px-2 py-1 rounded bg-error/10 text-error text-[12px] font-bold tracking-wider uppercase border border-error/20 flex items-center gap-1 w-max">
            <span className="material-symbols-outlined text-[14px]">warning</span> Conflict
          </span>;
        }
        return <span className="px-2 py-1 rounded bg-success/10 text-success text-[12px] font-bold tracking-wider uppercase">Active</span>;
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Global Timetable</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Manage master schedules and resolve conflicts.</p>
        </div>
        <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">event_available</span>
          Generate Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-white border border-border-subtle rounded-xl p-4 shadow-sm md:col-span-2">
          <div className="flex gap-2 border-b border-border-subtle mb-4">
            {['Global', 'Faculty View', 'Class View', 'Room View'].map(view => (
              <button 
                key={view} 
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 text-[14px] font-medium border-b-2 ${activeView === view ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-on-surface'} transition-colors`}
              >
                {view}
              </button>
            ))}
          </div>
          
          <div className="flex gap-4 mb-4">
            <select className="px-3 py-2 bg-surface-container-lowest border border-border-subtle rounded-lg text-[14px] text-on-surface outline-none">
              <option>Filter by Department</option>
              <option>CSE</option>
              <option>ECE</option>
            </select>
            <select className="px-3 py-2 bg-surface-container-lowest border border-border-subtle rounded-lg text-[14px] text-on-surface outline-none">
              <option>Filter by Day</option>
              <option>Monday</option>
              <option>Tuesday</option>
            </select>
          </div>
        </div>

        <div className="bg-error/5 border border-error/20 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-error mb-2">
            <span className="material-symbols-outlined">report</span>
            <h3 className="font-semibold text-[16px]">Conflict Resolution Center</h3>
          </div>
          {conflicts.length > 0 ? (
            <div className="space-y-3 mt-4">
              {conflicts.map((group, idx) => (
                <div key={idx} className="bg-surface-white p-3 rounded-lg border border-error/20 shadow-sm text-[13px]">
                  <p className="font-semibold text-on-surface mb-1">Double Booking Detected</p>
                  <p className="text-text-secondary mb-2">Faculty <span className="font-medium">{group[0].facultyId}</span> is assigned to {group.length} classes on {group[0].day} (P{group[0].period})</p>
                  <ul className="list-disc pl-4 text-error space-y-1">
                    {group.map(e => (
                      <li key={e.id}>{e.classId} in {e.roomId}</li>
                    ))}
                  </ul>
                  <button className="mt-3 px-3 py-1.5 bg-error text-surface-white rounded w-full font-medium hover:bg-error/90 transition-colors">Resolve</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-success text-[14px] mt-4 flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span> No active conflicts.
            </p>
          )}
        </div>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading timetable matrix...</div>
        ) : (
          <DataTable 
            data={timetable} 
            columns={columns} 
            selectable={true}
          />
        )}
      </div>
    </div>
  );
};

export default Timetable;
