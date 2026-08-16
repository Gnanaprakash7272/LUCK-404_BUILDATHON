import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';

const Workload = () => {
  const [faculty, setFaculty] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    setIsLoading(true);
    const data = await adminApi.getFaculty();
    setFaculty(data);
    setIsLoading(false);
  };

  const columns = [
    {
      header: 'Faculty',
      accessor: 'name',
      render: (item) => (
        <div>
          <p className="font-medium text-on-surface">{item.name}</p>
          <p className="text-[12px] text-text-secondary">{item.department}</p>
        </div>
      )
    },
    { 
      header: 'Roles', 
      accessor: 'roles',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.roles.map((r, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold tracking-wider">{r}</span>
          ))}
          {item.roles.length === 0 && <span className="text-text-secondary text-[12px]">Standard</span>}
        </div>
      )
    },
    { 
      header: 'Teaching Load (Hrs/Wk)', 
      accessor: 'load',
      render: (item) => {
        // Mock load logic based on classes
        const load = item.classes.length * 4;
        const color = load > 15 ? 'bg-error text-surface-white' : (load > 10 ? 'bg-secondary text-surface-white' : 'bg-surface-container-high text-on-surface-variant');
        
        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden w-24">
              <div className={`h-full ${color.split(' ')[0]}`} style={{ width: `${Math.min(load / 20 * 100, 100)}%` }}></div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[12px] font-bold ${color}`}>{load} hrs</span>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => (
        item.status === 'on-leave' 
          ? <span className="px-2 py-1 rounded bg-warning/10 text-warning text-[12px] font-bold tracking-wider uppercase">On Leave</span>
          : <span className="px-2 py-1 rounded bg-success/10 text-success text-[12px] font-bold tracking-wider uppercase">Active</span>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Faculty Workload</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Monitor teaching hours, administrative roles, and leave statuses.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">rule</span>
            Manage Rules
          </button>
        </div>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading workload data...</div>
        ) : (
          <DataTable 
            data={faculty} 
            columns={columns} 
            selectable={false}
          />
        )}
      </div>
    </div>
  );
};

export default Workload;
