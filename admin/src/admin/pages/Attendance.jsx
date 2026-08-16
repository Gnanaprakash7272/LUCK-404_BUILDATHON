import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const Attendance = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const depts = await adminApi.getDepartments();
    setDepartments(depts);
    if(depts.length > 0) setSelectedDept(depts[0].code);
  };

  const getHeatmapColor = (val) => {
    if (val >= 90) return 'bg-success/80';
    if (val >= 75) return 'bg-warning/80';
    return 'bg-error/80';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Global Attendance</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Monitor institutional attendance trends across departments.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedDept} 
            onChange={e => setSelectedDept(e.target.value)}
            className="px-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-[14px] font-medium outline-none shadow-sm"
          >
            {departments.map(d => (
              <option key={d.id} value={d.code}>{d.code} Department</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm space-y-6">
        <h3 className="font-semibold text-on-surface text-[18px]">Department Attendance Heatmap (Last 30 Days)</h3>
        
        <div className="space-y-4">
          {/* Mock classes for the selected department */}
          {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-24 text-[13px] font-medium text-text-secondary">{selectedDept} - {yr}</div>
              <div className="flex-1 flex gap-1 h-8">
                {Array.from({ length: 30 }).map((_, i) => {
                  // Generate a somewhat realistic pattern based on index and year
                  const base = 85 + Math.sin(i) * 10;
                  const val = base - (idx * 2) - (Math.random() * 5); // higher years slightly lower attendance
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-sm cursor-pointer hover:opacity-75 transition-opacity ${getHeatmapColor(val)}`}
                      title={`Day ${i+1}: ${Math.round(val)}%`}
                    ></div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 mt-8 pt-6 border-t border-border-subtle">
          <div className="flex items-center gap-2 text-[12px] font-medium"><div className="w-4 h-4 rounded-sm bg-success/80"></div> Above 90% (Good)</div>
          <div className="flex items-center gap-2 text-[12px] font-medium"><div className="w-4 h-4 rounded-sm bg-warning/80"></div> 75% - 89% (Warning)</div>
          <div className="flex items-center gap-2 text-[12px] font-medium"><div className="w-4 h-4 rounded-sm bg-error/80"></div> Below 75% (Critical)</div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
