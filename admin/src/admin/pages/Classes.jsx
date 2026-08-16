import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setIsLoading(true);
    const data = await adminApi.getClasses();
    setClasses(data);
    setIsLoading(false);
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Class / Section',
      accessor: 'name',
      render: (item) => (
        <div>
          <p 
            className="font-medium text-on-surface hover:text-primary cursor-pointer transition-colors" 
            onClick={() => navigate(`/admin/classes/${item.id}`)}
          >
            {item.name}
          </p>
          <p className="text-[12px] text-text-secondary">{item.program} • {item.department}</p>
        </div>
      )
    },
    { 
      header: 'Academic Details', 
      accessor: 'year',
      render: (item) => (
        <div>
          <p className="text-on-surface text-[13px] font-medium">Year {item.year}, Sem {item.semester}</p>
          <p className="text-[12px] text-text-secondary">Section: {item.section}</p>
        </div>
      )
    },
    { 
      header: 'Leadership', 
      accessor: 'advisor',
      render: (item) => (
        <div>
          <p className="text-on-surface text-[13px]"><span className="text-text-secondary">Adv:</span> {item.advisor}</p>
          <p className="text-on-surface text-[13px]"><span className="text-text-secondary">Men:</span> {item.mentor}</p>
        </div>
      )
    },
    { 
      header: 'Room', 
      accessor: 'room',
      render: (item) => <span className="font-medium text-on-surface-variant">{item.room}</span>
    },
    { 
      header: 'Students', 
      accessor: 'studentCount',
      render: (item) => (
        <div className="flex items-center gap-1 font-medium text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">group</span>
          {item.studentCount}
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Classes & Sections</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Manage class groups, assigned rooms, and advisors.</p>
        </div>
        <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Class
        </button>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-4 shadow-sm">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
            placeholder="Search classes..." 
            type="text" 
          />
        </div>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading classes...</div>
        ) : (
          <DataTable 
            data={filteredClasses} 
            columns={columns} 
            selectable={false}
            onEdit={(c) => navigate(`/admin/classes/${c.id}`)}
            onView={(c) => navigate(`/admin/classes/${c.id}`)}
          />
        )}
      </div>
    </div>
  );
};

export default Classes;
