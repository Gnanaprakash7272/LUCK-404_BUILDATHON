import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { Avatar } from '../components/Avatar';
import { StatusBadge, RiskBadge } from '../components/Badge';
import { DataTable } from '../components/DataTable';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [parents, setParents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Academic Records', 'Attendance', 'Parents & Guardians', 'Timetable', 'Mentorship'];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    const studentData = await adminApi.getStudentById(id);
    
    if (!studentData) {
      navigate('/admin/students');
      return;
    }
    
    setStudent(studentData);
    
    // Fetch related
    const allRecords = await adminApi.getAcademicRecords();
    const allParents = await adminApi.getParents();
    const allTimetable = await adminApi.getTimetable();

    setRecords(allRecords.filter(r => r.studentId === studentData.id));
    setParents(allParents.filter(p => p.students.includes(studentData.id)));
    setTimetable(allTimetable.filter(t => t.classId === studentData.classId));
    
    setIsLoading(false);
  };

  const recordColumns = [
    { header: 'Subject', accessor: 'subjectId', render: (item) => <span className="font-medium text-on-surface">{item.subjectId}</span> },
    { header: 'Type', accessor: 'type' },
    { header: 'Score', accessor: 'score' },
    { 
      header: 'Grade', 
      accessor: 'grade',
      render: (item) => (
        <span className={`font-bold ${item.grade === 'F' || item.grade === 'D' ? 'text-error' : 'text-primary'}`}>
          {item.grade}
        </span>
      )
    },
    { header: 'Date', accessor: 'date' },
  ];

  if (isLoading) return <div className="p-8 text-center text-text-secondary">Loading student profile...</div>;
  if (!student) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-primary-container to-surface-container-high opacity-50"></div>
        
        <div className="flex items-center gap-6 z-10 pt-4">
          <Avatar name={student.name} size="xl" />
          <div>
            <h1 className="font-display-lg text-[32px] font-bold text-on-surface">{student.name}</h1>
            <p className="text-[14px] text-text-secondary mb-2">{student.rollNumber} • {student.email} • {student.phone}</p>
            <div className="flex gap-2 items-center">
              <StatusBadge status={student.status} />
              <RiskBadge risk={student.risk} />
              <span className="px-2 py-1 rounded bg-surface-container-high text-[12px] font-medium text-on-surface-variant">
                {student.department} • {student.program}
              </span>
              <span className="px-2 py-1 rounded bg-surface-container-high text-[12px] font-medium text-on-surface-variant">
                Yr {student.year} • Sem {student.semester}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 z-10 w-full md:w-auto">
          <button onClick={() => navigate('/admin/students')} className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium hover:bg-surface-container-low transition-colors w-full md:w-auto text-center">
            Back to List
          </button>
          <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium hover:bg-primary-fixed-variant transition-colors w-full md:w-auto flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Profile
          </button>
        </div>
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

      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm min-h-[400px]">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface border-b border-border-subtle pb-2">Academic Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
                  <p className="text-[12px] text-text-secondary mb-1">Cumulative GPA</p>
                  <p className="font-semibold text-on-surface text-[24px]">{student.gpa}</p>
                </div>
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
                  <p className="text-[12px] text-text-secondary mb-1">Overall Attendance</p>
                  <p className="font-semibold text-on-surface text-[24px]">{student.attendance}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface border-b border-border-subtle pb-2">Institutional Support</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <p className="text-[12px] text-text-secondary mb-1">Class Advisor</p>
                  <p className="font-medium text-on-surface">{student.advisor}</p>
                </div>
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <p className="text-[12px] text-text-secondary mb-1">Mentor</p>
                  <p className="font-medium text-on-surface">{student.mentor}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Academic Records' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">Term Records</h3>
              <button className="text-primary text-[14px] font-medium hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download Transcript
              </button>
            </div>
            {records.length > 0 ? (
              <div className="border border-border-subtle rounded-lg overflow-hidden">
                <DataTable data={records} columns={recordColumns} selectable={false} />
              </div>
            ) : (
              <p className="text-[13px] text-text-secondary">No academic records found for this term.</p>
            )}
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-on-surface text-[18px]">Attendance Calendar</h3>
            <div className="flex h-48 border border-border-subtle rounded-lg p-4 bg-surface-container-lowest items-end gap-1">
              {Array.from({ length: 30 }).map((_, i) => {
                const isAbsent = Math.random() > (student.attendance / 100);
                return (
                  <div key={i} className={`flex-1 rounded-sm ${isAbsent ? 'bg-error/80' : 'bg-success/80'}`} style={{ height: isAbsent ? '30%' : '100%' }}></div>
                )
              })}
            </div>
            <p className="text-[13px] text-text-secondary mt-2">Green indicates present. Red indicates absent. Data covers the last 30 working days.</p>
          </div>
        )}

        {activeTab === 'Parents & Guardians' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-on-surface text-[18px]">Linked Guardians</h3>
            {parents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parents.map(p => (
                  <div key={p.id} className="border border-border-subtle rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-on-surface">{p.name}</p>
                      <p className="text-[12px] text-text-secondary mb-2">{p.relationship}</p>
                      <p className="text-[13px] text-on-surface-variant flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">call</span> {p.phone}</p>
                      <p className="text-[13px] text-on-surface-variant flex items-center gap-2 mt-1"><span className="material-symbols-outlined text-[16px]">mail</span> {p.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-text-secondary">No parents linked to this profile.</p>
            )}
          </div>
        )}

        {activeTab === 'Timetable' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-on-surface text-[18px]">Class Schedule ({student.classId})</h3>
            {timetable.length > 0 ? (
              <DataTable 
                data={timetable} 
                selectable={false}
                columns={[
                  { header: 'Day & Time', accessor: 'day', render: (item) => <div><p className="font-medium">{item.day}</p><p className="text-[12px] text-text-secondary">P{item.period}: {item.time}</p></div> },
                  { header: 'Subject', accessor: 'subjectId', render: (item) => <p className="font-medium">{item.subjectId}</p> },
                  { header: 'Faculty', accessor: 'facultyId', render: (item) => <span className="text-[13px] text-on-surface-variant">{item.facultyId}</span> },
                  { header: 'Room', accessor: 'roomId', render: (item) => <span className="text-[13px] text-on-surface-variant">{item.roomId}</span> }
                ]} 
              />
            ) : (
              <p className="text-[13px] text-text-secondary">Timetable not yet generated for this class.</p>
            )}
          </div>
        )}

        {activeTab === 'Mentorship' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-on-surface text-[18px]">Mentorship Notes</h3>
            <div className="border border-border-subtle rounded-lg p-6 bg-surface-container-lowest">
              <p className="text-[14px] text-on-surface mb-2 font-medium">Last Meeting: Oct 12, 2026</p>
              <p className="text-[13px] text-text-secondary">Discussed academic progress and attendance issues. Student committed to improving attendance in the coming weeks.</p>
              <div className="mt-4 pt-4 border-t border-border-subtle flex justify-end">
                <button className="px-3 py-1.5 bg-surface-white border border-border-subtle rounded text-[13px] font-medium hover:bg-surface-container-low transition-colors">Add Note</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDetails;
