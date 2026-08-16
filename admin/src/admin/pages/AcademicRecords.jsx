import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { useToast } from '../contexts/ToastContext';

const AcademicRecords = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Examinations');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const { addToast } = useToast();
  const tabs = ['Attendance', 'Assignments', 'Submissions', 'Examinations', 'Marks', 'Grades'];

  useEffect(() => {
    loadRecords();
  }, [activeTab]);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAcademicRecords();
      setRecords(data);
    } catch (error) {
      addToast('Failed to load academic records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = records.filter(record => 
    record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveMark = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    const newScore = formData.get('score');
    const reason = formData.get('reason');

    try {
      await adminApi.updateRecord('records', selectedRecord.id, { score: newScore });
      
      // Update local state
      setRecords(records.map(r => 
        r.id === selectedRecord.id 
          ? { ...r, score: newScore, grade: calculateGrade(newScore) } 
          : r
      ));
      
      addToast(`Mark updated successfully for ${selectedRecord.studentName}. Audit log created.`);
      setIsEditorOpen(false);
    } catch (error) {
      addToast('Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Mock grade calculator
  const calculateGrade = (score) => {
    const s = parseInt(score);
    if (s >= 90) return 'A';
    if (s >= 80) return 'B';
    if (s >= 70) return 'C';
    if (s >= 60) return 'D';
    return 'F';
  };

  const columns = [
    { header: 'Record ID', accessor: 'id' },
    { header: 'Student Name', accessor: 'studentName' },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Type', accessor: 'type' },
    { header: 'Score/Value', accessor: 'score' },
    {
      header: 'Grade',
      accessor: 'grade',
      render: (item) => (
        <span className={`font-bold ${item.grade.includes('F') || item.grade.includes('D') ? 'text-risk-high' : 'text-risk-low'}`}>
          {item.grade}
        </span>
      )
    },
    { header: 'Date', accessor: 'date' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Academic Records</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Comprehensive view and management of institutional academic data.</p>
        </div>
        <button className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Records
        </button>
      </div>

      <div className="flex border-b border-border-subtle overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-[14px] whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-on-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
            placeholder={`Search ${activeTab.toLowerCase()}...`} 
            type="text" 
          />
        </div>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading records...</div>
        ) : (
          <DataTable 
            data={filteredRecords} 
            columns={columns} 
            onEdit={(record) => {
              setSelectedRecord(record);
              setIsEditorOpen(true);
            }}
            onView={(record) => {
              setSelectedRecord(record);
              setIsEditorOpen(true);
            }}
          />
        )}
      </div>

      {/* Academic Record Editor Drawer */}
      <Drawer isOpen={isEditorOpen} onClose={() => !isSaving && setIsEditorOpen(false)} title="Edit Academic Record" width="max-w-xl">
        {selectedRecord && (
          <form onSubmit={handleSaveMark} className="space-y-6">
            <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4 space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[12px] text-text-secondary mb-1">Student</p>
                  <p className="font-semibold text-on-surface">{selectedRecord.studentName}</p>
                </div>
                <div>
                  <p className="text-[12px] text-text-secondary mb-1">Record ID</p>
                  <p className="font-medium text-on-surface">{selectedRecord.id}</p>
                </div>
                <div>
                  <p className="text-[12px] text-text-secondary mb-1">Subject</p>
                  <p className="font-medium text-on-surface">{selectedRecord.subject}</p>
                </div>
                <div>
                  <p className="text-[12px] text-text-secondary mb-1">Type</p>
                  <p className="font-medium text-on-surface">{selectedRecord.type}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="opacity-70">
                  <label className="block text-[14px] font-medium text-on-surface mb-1">Current Mark/Score</label>
                  <input type="text" disabled value={selectedRecord.score} className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-container-lowest cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-on-surface mb-1">New Mark/Score</label>
                  <input name="score" required type="text" defaultValue={selectedRecord.score} className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-primary border-primary/50" />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-on-surface mb-1">Reason for Change (Required for Audit Log)</label>
                <textarea name="reason" required rows="3" placeholder="e.g. Re-evaluation, data entry correction..." className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-primary resize-none"></textarea>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border-subtle flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsEditorOpen(false)} 
                disabled={isSaving}
                className="px-4 py-2 border border-border-subtle rounded-lg text-[14px] font-medium hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-lg text-[14px] font-medium hover:bg-primary-fixed-variant transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-surface-container-high rounded flex gap-2 items-start text-[12px] text-text-secondary">
              <span className="material-symbols-outlined text-[16px] shrink-0 text-on-surface-variant">info</span>
              <p>This action will be logged in the system Audit History. Ensure the new mark is correct before saving.</p>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
};

export default AcademicRecords;
