import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/Modal';

const AccessManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAccessUsers();
      setUsers(data);
    } catch (error) {
      addToast('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    // Mock API call
    await adminApi.updateRecord('users', selectedUser.id, { status: 'Inactive' });
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'Inactive' } : u));
    addToast(`${selectedUser.name} deactivated successfully.`);
    setIsDeactivateOpen(false);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (item) => (
        <div>
          <p className="font-medium text-on-surface">{item.name}</p>
          <p className="text-[12px] text-text-secondary">{item.id}</p>
        </div>
      )
    },
    { header: 'Role', accessor: 'role' },
    { header: 'Access Level', accessor: 'accessLevel' },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => (
        <span className={`px-2 py-1 rounded text-[12px] font-medium ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-surface-container-high text-on-surface-variant'}`}>
          {item.status}
        </span>
      )
    },
    { header: 'Last Login', accessor: 'lastLogin' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Access Management</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Manage user roles, permissions, and system access.</p>
        </div>
        <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Invite User
        </button>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
            placeholder="Search users..." 
            type="text" 
          />
        </div>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading users...</div>
        ) : (
          <DataTable 
            data={filteredUsers} 
            columns={columns}
            onEdit={(user) => {
              addToast(`Editing permissions for ${user.name}`, 'info');
            }}
            onDelete={(user) => {
              setSelectedUser(user);
              setIsDeactivateOpen(true);
            }}
          />
        )}
      </div>

      <ConfirmDialog 
        isOpen={isDeactivateOpen} 
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${selectedUser?.name}? They will lose access to the system.`}
        confirmText="Deactivate"
      />
    </div>
  );
};

export default AccessManagement;
