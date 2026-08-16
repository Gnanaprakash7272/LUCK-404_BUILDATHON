import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/Badge';

const Parents = () => {
  const [parents, setParents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    setIsLoading(true);
    const data = await adminApi.getParents();
    setParents(data);
    setIsLoading(false);
  };

  const filteredParents = parents.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Parent / Guardian Info',
      accessor: 'name',
      render: (item) => (
        <div>
          <p className="font-medium text-on-surface hover:text-primary cursor-pointer transition-colors">{item.name}</p>
          <p className="text-[12px] text-text-secondary">{item.relationship}</p>
        </div>
      )
    },
    { 
      header: 'Contact', 
      accessor: 'contact',
      render: (item) => (
        <div>
          <p className="text-on-surface text-[13px]">{item.email}</p>
          <p className="text-[12px] text-text-secondary">{item.phone}</p>
        </div>
      )
    },
    { 
      header: 'Linked Students', 
      accessor: 'students',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.students.map((s, i) => (
            <span key={i} className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[11px] font-medium">
              {s}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Parents & Guardians</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Manage parent accounts and student linkages.</p>
        </div>
        <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Parent
        </button>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
            placeholder="Search by parent name or email..." 
            type="text" 
          />
        </div>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading parents...</div>
        ) : (
          <DataTable 
            data={filteredParents} 
            columns={columns} 
            selectable={true}
          />
        )}
      </div>
    </div>
  );
};

export default Parents;
