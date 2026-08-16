import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Students', 'Timetable', 'Attendance', 'Performance'];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    const data = await adminApi.getClassById(id);
    if (!data) {
      navigate('/admin/classes');
      return;
    }
    setClassData(data);

    // Fetch related
    const allStudents = await adminApi.getStudents();
    const allTimetable = await adminApi.getTimetable();

    setStudents(allStudents.filter(s => s.classId === data.id));
    setTimetable(allTimetable.filter(t => t.classId === data.id));

    setIsLoading(false);
  };

  if (isLoading) return <div className="p-8 text-center text-text-secondary">Loading class details...</div>;
  if (!classData) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-primary-container to-surface-container-high opacity-50"></div>
        
        <div className="flex items-center gap-6 z-10 pt-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-display-md text-[24px] shadow-sm">
            {classData.section}
          </div>
          <div>
            <h1 className="font-display-lg text-[32px] font-bold text-on-surface">{classData.name}</h1>
            <p className="text-[14px] text-text-secondary mb-2">{classData.department} • {classData.program}</p>
            <div className="flex gap-2 items-center">
              <span className="px-2 py-1 rounded bg-surface-container-high text-[12px] font-medium text-on-surface-variant">
                Year {classData.year}
              </span>
              <span className="px-2 py-1 rounded bg-surface-container-high text-[12px] font-medium text-on-surface-variant">
                Sem {classData.semester}
              </span>
              <span className="px-2 py-1 rounded bg-surface-container-high text-[12px] font-medium text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                {classData.room}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 z-10 w-full md:w-auto">
          <button onClick={() => navigate('/admin/classes')} className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium hover:bg-surface-container-low transition-colors w-full md:w-auto text-center">
            Back to List
          </button>
          <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium hover:bg-primary-fixed-variant transition-colors w-full md:w-auto flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Details
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
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface border-b border-border-subtle pb-2">Class Leadership</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <p className="text-[12px] text-text-secondary mb-1">Class Advisor</p>
                  <p className="font-medium text-on-surface">{classData.advisor}</p>
                </div>
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <p className="text-[12px] text-text-secondary mb-1">Mentor</p>
                  <p className="font-medium text-on-surface">{classData.mentor}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface border-b border-border-subtle pb-2">Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4 flex flex-col items-center">
                  <div className="text-[32px] font-bold text-primary mb-1">
                    {classData.studentCount}
                  </div>
                  <p className="text-[12px] font-medium text-text-secondary">Enrolled Students</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Students' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">Enrolled Students</h3>
              <button className="px-3 py-1.5 bg-surface-container-low border border-border-subtle rounded text-[13px] font-medium hover:bg-surface-container-high transition-colors">Manage Roster</button>
            </div>
            <DataTable 
              data={students} 
              selectable={false}
              onView={(s) => navigate(`/admin/students/${s.id}`)}
              columns={[
                { header: 'Student', accessor: 'name', render: (item) => <div><p className="font-medium text-on-surface">{item.name}</p><p className="text-[12px] text-text-secondary">{item.rollNumber}</p></div> },
                { header: 'Attendance', accessor: 'attendance', render: (item) => <span className="text-[13px] font-medium text-on-surface-variant">{item.attendance}%</span> },
                { header: 'GPA', accessor: 'gpa', render: (item) => <span className="text-[13px] font-medium text-on-surface-variant">{item.gpa}</span> },
              ]} 
            />
          </div>
        )}

        {activeTab === 'Timetable' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-on-surface text-[18px]">Class Timetable</h3>
            <DataTable 
              data={timetable} 
              selectable={false}
              columns={[
                { header: 'Day & Time', accessor: 'day', render: (item) => <div><p className="font-medium text-on-surface">{item.day}</p><p className="text-[12px] text-text-secondary">P{item.period}: {item.time}</p></div> },
                { header: 'Subject', accessor: 'subjectId', render: (item) => <p className="font-medium text-on-surface">{item.subjectId}</p> },
                { header: 'Faculty', accessor: 'facultyId', render: (item) => <span className="text-[13px] text-on-surface-variant">{item.facultyId}</span> },
              ]} 
            />
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-on-surface text-[18px]">Aggregate Attendance</h3>
            <div className="flex gap-4 items-center border border-border-subtle p-6 rounded-lg bg-surface-container-lowest">
              <div className="w-16 h-16 rounded-full border-4 border-success flex items-center justify-center font-bold text-[20px] text-success">
                87%
              </div>
              <div>
                <p className="font-medium text-on-surface">Class Average Attendance</p>
                <p className="text-[13px] text-text-secondary">For the current semester</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Performance' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-on-surface text-[18px]">Class Performance Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-border-subtle p-6 rounded-lg bg-surface-container-lowest">
                <p className="font-medium text-on-surface mb-2">Average GPA</p>
                <p className="text-[32px] font-bold text-primary">7.8</p>
              </div>
              <div className="border border-border-subtle p-6 rounded-lg bg-surface-container-lowest">
                <p className="font-medium text-on-surface mb-2">Pass Rate</p>
                <p className="text-[32px] font-bold text-secondary">92%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetails;
