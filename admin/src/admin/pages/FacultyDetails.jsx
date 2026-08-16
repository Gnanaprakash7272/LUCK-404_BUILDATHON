import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { Avatar } from '../components/Avatar';
import { StatusBadge } from '../components/Badge';
import { DataTable } from '../components/DataTable';

const FacultyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allTimetable, setAllTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Subjects', 'Classes', 'Timetable', 'Students', 'Workload', 'Attendance', 'Leave'];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    const data = await adminApi.getFacultyById(id);
    if (!data) {
      navigate('/admin/faculty');
      return;
    }
    setFaculty(data);
    
    // Load related data
    setAllSubjects(await adminApi.getSubjects());
    setAllClasses(await adminApi.getClasses());
    setAllStudents(await adminApi.getStudents());
    setAllTimetable(await adminApi.getTimetable());

    setIsLoading(false);
  };

  if (isLoading) return <div className="p-8 text-center text-text-secondary">Loading profile...</div>;
  if (!faculty) return null;

  // Filter linked data for this faculty
  const mySubjects = allSubjects.filter(s => faculty.subjects.includes(s.id));
  const myClasses = allClasses.filter(c => faculty.classes.includes(c.id));
  const myStudents = allStudents.filter(s => s.mentor === faculty.name || s.advisor === faculty.name);
  const myTimetable = allTimetable.filter(t => t.facultyId === faculty.id);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-secondary-container to-surface-container-high opacity-50"></div>
        
        <div className="flex items-center gap-6 z-10 pt-4">
          <Avatar name={faculty.name} size="xl" color="secondary" />
          <div>
            <h1 className="font-display-lg text-[32px] font-bold text-on-surface">{faculty.name}</h1>
            <p className="text-[14px] text-text-secondary mb-2">{faculty.id} • {faculty.email} • {faculty.phone}</p>
            <div className="flex gap-2 items-center">
              <StatusBadge status={faculty.status} />
              <span className="px-2 py-1 rounded bg-surface-container-high text-[12px] font-medium text-on-surface-variant">
                {faculty.department} Dept
              </span>
              <span className="px-2 py-1 rounded bg-surface-container-high text-[12px] font-medium text-on-surface-variant">
                {faculty.designation}
              </span>
              {faculty.roles.map((r, i) => (
                <span key={i} className="px-2 py-1 rounded bg-primary text-on-primary text-[12px] font-medium tracking-wider uppercase">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 z-10 w-full md:w-auto">
          <button onClick={() => navigate('/admin/faculty')} className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium hover:bg-surface-container-low transition-colors w-full md:w-auto text-center">
            Back to List
          </button>
          <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium hover:bg-primary-fixed-variant transition-colors w-full md:w-auto flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content Area */}
      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm min-h-[400px]">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface border-b border-border-subtle pb-2">Academic Responsibilities</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
                  <p className="text-[12px] text-text-secondary mb-1">Total Subjects</p>
                  <p className="font-semibold text-on-surface text-[24px]">{faculty.subjects.length}</p>
                </div>
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
                  <p className="text-[12px] text-text-secondary mb-1">Total Classes</p>
                  <p className="font-semibold text-on-surface text-[24px]">{faculty.classes.length}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface border-b border-border-subtle pb-2">Institutional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
                  <p className="text-[12px] text-text-secondary mb-1">Joining Date</p>
                  <p className="font-medium text-on-surface">{faculty.joiningDate}</p>
                </div>
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
                  <p className="text-[12px] text-text-secondary mb-1">Mentorship Load</p>
                  <p className="font-medium text-on-surface">{myStudents.length} Students</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'Subjects' && (
          <DataTable 
            data={mySubjects} 
            selectable={false}
            columns={[
              { header: 'Subject Details', accessor: 'name', render: (item) => <div><p className="font-medium">{item.name}</p><p className="text-[12px] text-text-secondary">{item.code}</p></div> },
              { header: 'Credits', accessor: 'credits', render: (item) => <span className="text-[13px]">{item.credits} Credits</span> },
              { header: 'Type', accessor: 'type', render: (item) => <span className="text-[13px]">{item.type}</span> },
            ]} 
          />
        )}

        {activeTab === 'Classes' && (
          <DataTable 
            data={myClasses} 
            selectable={false}
            columns={[
              { header: 'Class Name', accessor: 'name', render: (item) => <p className="font-medium">{item.name}</p> },
              { header: 'Room', accessor: 'room', render: (item) => <span className="text-[13px]">{item.room}</span> },
              { header: 'Students', accessor: 'studentCount', render: (item) => <span className="text-[13px]">{item.studentCount}</span> },
            ]} 
          />
        )}

        {activeTab === 'Students' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-on-surface text-[18px]">Mentored / Advised Students</h3>
            <DataTable 
              data={myStudents} 
              selectable={false}
              onView={(s) => navigate(`/admin/students/${s.id}`)}
              columns={[
                { header: 'Student', accessor: 'name', render: (item) => <div><p className="font-medium">{item.name}</p><p className="text-[12px] text-text-secondary">{item.rollNumber}</p></div> },
                { header: 'Class', accessor: 'classId', render: (item) => <span className="text-[13px]">{item.classId}</span> },
                { header: 'GPA', accessor: 'gpa', render: (item) => <span className="text-[13px] font-medium">{item.gpa}</span> },
              ]} 
            />
          </div>
        )}

        {activeTab === 'Timetable' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-on-surface text-[18px]">Personal Schedule</h3>
            <DataTable 
              data={myTimetable} 
              selectable={false}
              columns={[
                { header: 'Day & Time', accessor: 'day', render: (item) => <div><p className="font-medium">{item.day}</p><p className="text-[12px] text-text-secondary">P{item.period}: {item.time}</p></div> },
                { header: 'Subject', accessor: 'subjectId', render: (item) => <p className="font-medium">{item.subjectId}</p> },
                { header: 'Class & Room', accessor: 'classId', render: (item) => <div><p className="font-medium">{item.classId}</p><p className="text-[12px] text-text-secondary">{item.roomId}</p></div> },
              ]} 
            />
          </div>
        )}

        {activeTab === 'Workload' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-on-surface text-[18px]">Teaching Hours Analysis</h3>
            <div className="flex gap-4 items-center border border-border-subtle p-6 rounded-lg bg-surface-container-lowest">
              <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center font-bold text-[20px] text-primary">
                {myClasses.length * 4}h
              </div>
              <div>
                <p className="font-medium text-on-surface">Weekly Teaching Load</p>
                <p className="text-[13px] text-text-secondary">Based on assigned classes</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="space-y-4 text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-success">check_circle</span>
            <h3 className="font-semibold text-[18px]">98% Present This Term</h3>
            <p className="text-[14px] text-text-secondary">Faculty attendance is fully compliant.</p>
          </div>
        )}

        {activeTab === 'Leave' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-on-surface text-[18px]">Leave History</h3>
            <p className="text-[13px] text-text-secondary">No leave requests found for this term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDetails;
