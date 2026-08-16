import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/Badge';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getDepartments();
      setDepartments(data);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Department',
      accessor: 'name',
      render: (item) => (
        <div>
          <p 
            className="font-medium text-on-surface hover:text-primary cursor-pointer transition-colors" 
            onClick={() => navigate(`/admin/departments/${item.id}`)}
          >
            {item.name}
          </p>
          <p className="text-[12px] text-text-secondary">Code: {item.code}</p>
        </div>
      )
    },
    { 
      header: 'HOD', 
      accessor: 'hod',
      render: (item) => <span className="font-medium text-on-surface-variant">{item.hod}</span>
    },
    { 
      header: 'Staff / Students', 
      accessor: 'counts',
      render: (item) => (
        <div className="flex gap-4 text-[13px]">
          <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-text-secondary">school</span> {item.facultyCount}</div>
          <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-text-secondary">group</span> {item.studentCount}</div>
        </div>
      )
    },
    { 
      header: 'Performance', 
      accessor: 'avgPerformance',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${item.avgPerformance}%` }}></div>
          </div>
          <span className="text-[12px] font-medium text-on-surface-variant">{item.avgPerformance}%</span>
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
      <div className="flex justify-between items-end pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Departments</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Manage academic departments and organizational units.</p>
        </div>
        <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Department
        </button>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-4 shadow-sm flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
            placeholder="Search departments..." 
            type="text" 
          />
        </div>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading departments...</div>
        ) : (
          <DataTable 
            data={filteredDepartments} 
            columns={columns} 
            selectable={false}
            onEdit={(dept) => navigate(`/admin/departments/${dept.id}`)}
            onView={(dept) => navigate(`/admin/departments/${dept.id}`)}
          />
        )}
      </div>
    </div>
  );
};

export default Departments;
