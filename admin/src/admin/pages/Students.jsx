import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { StatusBadge, RiskBadge } from '../components/Badge';
import { Modal, ConfirmDialog } from '../components/Modal';
import { Avatar } from '../components/Avatar';
import { useToast } from '../contexts/ToastContext';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection & Modals
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const raw = await adminApi.getStudents();
      // Backend returns: { id (number), name, email, roll_number, created_at }
      // Map to shape the UI columns expect. Fields absent from backend → null.
      const adapted = raw.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        rollNumber: s.roll_number || '—',
        // Not provided by backend — display '—', not invented values
        department: null,
        program: null,
        year: null,
        semester: null,
        section: null,
        attendance: null,
        gpa: null,
        risk: null,
        status: null,
      }));
      setStudents(adapted);
    } catch (error) {
      addToast('Failed to load students', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(student.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    await adminApi.deleteRecord('students', selectedStudent.id);
    setStudents(students.filter(s => s.id !== selectedStudent.id));
    setIsDeleteModalOpen(false);
    addToast('Student deleted successfully', 'success');
  };

  const handleBulkDeactivate = () => {
    setStudents(students.map(s => selectedItems.includes(s.id) ? { ...s, status: 'inactive' } : s));
    setSelectedItems([]);
    addToast(`${selectedItems.length} students deactivated successfully`);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newStudent = {
      name: formData.get('name'),
      email: formData.get('email'),
      class: formData.get('class'),
      status: formData.get('status'),
      avatar: formData.get('name'),
      id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      course: 'General Track',
      attendance: '100%',
      score: 'N/A',
      risk: 'low'
    };
    
    const result = await adminApi.addRecord('students', newStudent);
    setStudents([result.data, ...students]);
    setIsAddModalOpen(false);
    addToast('New student created successfully');
  };

  const columns = [
    {
      header: 'Student Info',
      accessor: 'name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.name} size="sm" />
          <div>
            <p className="font-medium text-on-surface hover:text-primary cursor-pointer transition-colors" onClick={() => navigate(`/admin/students/${item.id}`)}>{item.name}</p>
            <p className="text-[12px] text-text-secondary">{item.rollNumber} • {item.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Academic Group',
      accessor: 'department',
      render: (item) => (
        <div>
          <p className="text-on-surface text-[13px] font-medium">
            {item.department || '—'}
          </p>
          <p className="text-[12px] text-text-secondary">
            {item.year ? `Year ${item.year}, Sem ${item.semester}, Sec ${item.section}` : 'Not assigned'}
          </p>
        </div>
      )
    },
    {
      header: 'Attendance',
      accessor: 'attendance',
      render: (item) => (
        <span className="text-on-surface-variant">
          {item.attendance != null ? `${item.attendance}%` : '—'}
        </span>
      )
    },
    {
      header: 'GPA',
      accessor: 'gpa',
      render: (item) => (
        <span className="font-medium text-on-surface-variant">
          {item.gpa != null ? item.gpa : '—'}
        </span>
      )
    },
    {
      header: 'Risk Level',
      accessor: 'risk',
      render: (item) => <RiskBadge level={item.risk || undefined} />
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => <StatusBadge status={item.status || undefined} />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Students Management</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">View and manage student records.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Student
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface-white border border-border-subtle rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
              placeholder="Search students by name or ID..." 
              type="text" 
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-colors w-full sm:w-auto justify-center">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filters
            </button>
            <button className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-colors w-full sm:w-auto justify-center">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedItems.length > 0 && (
          <div className="flex items-center justify-between bg-primary-container text-on-primary-container px-4 py-3 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 font-medium text-[14px]">
              <span className="material-symbols-outlined text-[18px]">check_box</span>
              {selectedItems.length} students selected
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

      {/* Table Area */}
      <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading students...</div>
        ) : (
          <DataTable 
            data={filteredStudents} 
            columns={columns} 
            selectable={true}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onEdit={(student) => navigate(`/admin/students/${student.id}`)}
            onView={(student) => navigate(`/admin/students/${student.id}`)}
            onDelete={(student) => {
              setSelectedStudent(student);
              setIsDeleteModalOpen(true);
            }}
          />
        )}
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Student">
        <form className="space-y-4" onSubmit={handleSaveStudent}>
          <div>
            <label className="block text-[14px] font-medium text-on-surface mb-1">Full Name</label>
            <input name="name" required type="text" className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-primary" placeholder="Enter full name" />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-on-surface mb-1">Email</label>
            <input name="email" required type="email" className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-primary" placeholder="Enter student email" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-on-surface mb-1">Class</label>
              <select name="class" className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-primary">
                <option value="Grade 10A">Grade 10A</option>
                <option value="Grade 11B">Grade 11B</option>
                <option value="Grade 12C">Grade 12C</option>
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-on-surface mb-1">Status</label>
              <select name="status" className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-primary">
                <option value="active">Active</option>
                <option value="on-leave">On-Leave</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-border-subtle">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-border-subtle rounded-lg text-[14px] font-medium hover:bg-surface-container-low transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-[14px] font-medium hover:bg-primary-fixed-variant transition-colors">Save Student</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${selectedStudent?.name}? This action cannot be undone.`}
        confirmText="Delete Student"
      />
    </div>
  );
};

export default Students;
