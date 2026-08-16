import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/Badge';
import { Modal, ConfirmDialog } from '../components/Modal';
import { Avatar } from '../components/Avatar';
import { useToast } from '../contexts/ToastContext';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getFaculty();
      setFaculty(data);
    } catch (error) {
      addToast('Failed to load faculty', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(f.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    await adminApi.deleteRecord('faculty', selectedFaculty.id);
    setFaculty(faculty.filter(f => f.id !== selectedFaculty.id));
    setIsDeleteModalOpen(false);
    addToast('Faculty member removed successfully', 'success');
  };

  const handleBulkDeactivate = () => {
    setFaculty(faculty.map(f => selectedItems.includes(f.id) ? { ...f, status: 'inactive' } : f));
    setSelectedItems([]);
    addToast(`${selectedItems.length} faculty deactivated successfully`);
  };

  const columns = [
    {
      header: 'Faculty Info',
      accessor: 'name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.name} size="sm" color="secondary" />
          <div>
            <p className="font-medium text-on-surface hover:text-primary cursor-pointer transition-colors" onClick={() => navigate(`/admin/faculty/${item.id}`)}>{item.name}</p>
            <p className="text-[12px] text-text-secondary">{item.id} • {item.email}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Department', 
      accessor: 'department',
      render: (item) => <span className="font-medium text-on-surface-variant">{item.department}</span>
    },
    {
      header: 'Designation & Roles',
      accessor: 'designation',
      render: (item) => (
        <div>
          <p className="text-on-surface text-[13px]">{item.designation || 'Faculty'}</p>
          <div className="flex gap-1 mt-1">
            {(item.roles || ['TEACHER']).map((r, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold tracking-wider">{r}</span>
            ))}
          </div>
        </div>
      )
    },
    {
      header: 'Department / Subjects',
      accessor: 'subjects',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {(item.subjects || [item.department]).filter(Boolean).map((s, i) => (
            <span key={i} className="px-2 py-0.5 bg-surface-container-high rounded text-[11px] text-on-surface-variant font-medium">
              {s}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => <StatusBadge status={item.status || 'active'} />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Faculty & Staff</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Manage institutional faculty, designations, and roles.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Faculty
        </button>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
              placeholder="Search faculty by name, ID, or department..." 
              type="text" 
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-colors w-full sm:w-auto justify-center">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filters
            </button>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center justify-between bg-primary-container text-on-primary-container px-4 py-3 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 font-medium text-[14px]">
              <span className="material-symbols-outlined text-[18px]">check_box</span>
              {selectedItems.length} faculty selected
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleBulkDeactivate}
                className="px-3 py-1.5 bg-surface-white text-on-surface rounded text-[13px] font-medium hover:bg-surface-container-low transition-colors border border-border-subtle shadow-sm"
              >
                Deactivate Selected
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading faculty records...</div>
        ) : (
          <DataTable 
            data={filteredFaculty} 
            columns={columns} 
            selectable={true}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onEdit={(f) => navigate(`/admin/faculty/${f.id}`)}
            onView={(f) => navigate(`/admin/faculty/${f.id}`)}
            onDelete={(f) => {
              setSelectedFaculty(f);
              setIsDeleteModalOpen(true);
            }}
          />
        )}
      </div>

      <ConfirmDialog 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remove Faculty"
        message={`Are you sure you want to remove ${selectedFaculty?.name}?`}
        confirmText="Remove"
      />
    </div>
  );
};

export default Faculty;
