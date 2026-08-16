import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { StatusBadge } from '../components/Badge';
import { DataTable } from '../components/DataTable';

const DepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const tabs = ['Overview', 'Faculty', 'Students', 'Subjects', 'Classes', 'Timetable', 'Analytics', 'Reports'];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    const dept = await adminApi.getDepartmentById(id);
    if (!dept) {
      navigate('/admin/departments');
      return;
    }
    setDepartment(dept);

    // Fetch related data and filter by department code
    const allFaculty = await adminApi.getFaculty();
    const allStudents = await adminApi.getStudents();
    const allSubjects = await adminApi.getSubjects();
    const allClasses = await adminApi.getClasses();
    const allTimetable = await adminApi.getTimetable();

    setFaculty(allFaculty.filter(f => f.department === dept.code));
    setStudents(allStudents.filter(s => s.department === dept.code));
    setSubjects(allSubjects.filter(s => s.department === dept.code));
    setClasses(allClasses.filter(c => c.department === dept.code));
    
    // For timetable, filter classes that belong to this department
    const deptClassIds = allClasses.filter(c => c.department === dept.code).map(c => c.id);
    setTimetable(allTimetable.filter(t => deptClassIds.includes(t.classId) || t.subjectId.includes(dept.code)));
    
    setIsLoading(false);
  };

  if (isLoading) return <div className="p-8 text-center text-text-secondary">Loading department...</div>;
  if (!department) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Profile Section */}
      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-primary-container to-surface-container-high opacity-50"></div>
        
        <div className="flex items-center gap-6 z-10 pt-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-display-md text-[24px] shadow-sm">
            {department.code}
          </div>
          <div>
            <h1 className="font-display-lg text-[32px] font-bold text-on-surface">{department.name}</h1>
            <p className="text-[14px] text-text-secondary mb-2">Head of Department: <span className="font-medium text-on-surface">{department.hod}</span></p>
            <StatusBadge status={department.status} />
          </div>
        </div>

        <div className="flex gap-3 z-10 w-full md:w-auto">
          <button onClick={() => navigate('/admin/departments')} className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium hover:bg-surface-container-low transition-colors w-full md:w-auto text-center">
            Back to List
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium hover:bg-primary-fixed-variant transition-colors w-full md:w-auto flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Details
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

      {/* Tab Content Area */}
      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm min-h-[400px]">
        {activeTab === 'Overview' && <OverviewTab department={department} faculty={faculty} students={students} />}
        {activeTab === 'Faculty' && <FacultyTab faculty={faculty} navigate={navigate} />}
        {activeTab === 'Students' && <StudentsTab students={students} navigate={navigate} />}
        {activeTab === 'Subjects' && <SubjectsTab subjects={subjects} navigate={navigate} />}
        {activeTab === 'Classes' && <ClassesTab classes={classes} navigate={navigate} />}
        {activeTab === 'Timetable' && <TimetableTab timetable={timetable} classes={classes} faculty={faculty} />}
        {activeTab === 'Analytics' && <AnalyticsTab department={department} classes={classes} />}
        {activeTab === 'Reports' && <ReportsTab department={department} />}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditDepartmentModal 
          department={department} 
          onClose={() => setIsEditModalOpen(false)} 
          onSave={(data) => {
            // Update logic would go here
            setIsEditModalOpen(false);
          }} 
        />
      )}
    </div>
  );
};

/* --- TAB COMPONENTS --- */

const OverviewTab = ({ department, faculty, students }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="space-y-6">
      <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface border-b border-border-subtle pb-2">Department KPIs</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
          <p className="text-[12px] text-text-secondary mb-1">Total Faculty</p>
          <p className="font-semibold text-on-surface text-[24px]">{department.facultyCount}</p>
        </div>
        <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
          <p className="text-[12px] text-text-secondary mb-1">Total Students</p>
          <p className="font-semibold text-on-surface text-[24px]">{department.studentCount}</p>
        </div>
        <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
          <p className="text-[12px] text-text-secondary mb-1">Active Subjects</p>
          <p className="font-semibold text-on-surface text-[24px]">{department.courseCount}</p>
        </div>
        <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
          <p className="text-[12px] text-text-secondary mb-1">Active Classes</p>
          <p className="font-semibold text-on-surface text-[24px]">{department.classCount}</p>
        </div>
      </div>
    </div>

    <div className="space-y-6">
      <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface border-b border-border-subtle pb-2">Academic Health</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center text-[18px] font-bold text-primary mb-2">
            {department.avgAttendance}%
          </div>
          <p className="text-[12px] font-medium text-text-secondary">Avg Attendance</p>
        </div>
        <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-secondary flex items-center justify-center text-[18px] font-bold text-secondary mb-2">
            {department.avgPerformance}%
          </div>
          <p className="text-[12px] font-medium text-text-secondary">Avg Performance</p>
        </div>
      </div>
      <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex justify-between items-center">
        <div>
          <p className="text-error font-semibold text-[14px]">At-Risk Students</p>
          <p className="text-error/80 text-[12px]">Below thresholds</p>
        </div>
        <span className="text-[24px] font-bold text-error">{department.atRiskCount}</span>
      </div>
    </div>
  </div>
);

const FacultyTab = ({ faculty, navigate }) => {
  const columns = [
    {
      header: 'Faculty Profile',
      accessor: 'name',
      render: (item) => (
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/admin/faculty/${item.id}`)}>
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-medium">
            {item.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-on-surface group-hover:text-primary transition-colors">{item.name}</p>
            <p className="text-[12px] text-text-secondary">{item.id} • {item.designation}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Roles', 
      accessor: 'roles',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.roles.map((r, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold tracking-wider uppercase">{r}</span>
          ))}
          {item.roles.length === 0 && <span className="text-text-secondary text-[12px]">-</span>}
        </div>
      )
    },
    { 
      header: 'Subjects', 
      accessor: 'subjects',
      render: (item) => <span className="text-[13px] text-on-surface-variant">{item.subjects.join(', ')}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">Department Faculty</h3>
        <button className="px-3 py-1.5 bg-surface-container-low border border-border-subtle rounded text-[13px] font-medium hover:bg-surface-container-high transition-colors">Assign Faculty</button>
      </div>
      <DataTable data={faculty} columns={columns} selectable={false} onView={(f) => navigate(`/admin/faculty/${f.id}`)} />
    </div>
  );
};

const StudentsTab = ({ students, navigate }) => {
  const columns = [
    {
      header: 'Student Profile',
      accessor: 'name',
      render: (item) => (
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/admin/students/${item.id}`)}>
          <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-medium">
            {item.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-on-surface group-hover:text-primary transition-colors">{item.name}</p>
            <p className="text-[12px] text-text-secondary">{item.rollNumber}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Class / Sec', 
      accessor: 'classId',
      render: (item) => <span className="text-[13px] text-on-surface-variant font-medium">{item.classId}</span>
    },
    { 
      header: 'Academic', 
      accessor: 'gpa',
      render: (item) => (
        <div>
          <p className="text-[13px] font-medium text-on-surface">GPA: {item.gpa}</p>
          <p className="text-[12px] text-text-secondary">Att: {item.attendance}%</p>
        </div>
      )
    },
    {
      header: 'Risk',
      accessor: 'risk',
      render: (item) => {
        const color = item.risk === 'high' ? 'bg-error text-surface-white' : item.risk === 'medium' ? 'bg-warning text-surface-white' : 'bg-success/10 text-success';
        return <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${color}`}>{item.risk}</span>;
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">Department Students</h3>
      </div>
      <DataTable data={students} columns={columns} selectable={false} onView={(s) => navigate(`/admin/students/${s.id}`)} />
    </div>
  );
};

const SubjectsTab = ({ subjects, navigate }) => {
  const columns = [
    {
      header: 'Subject Details',
      accessor: 'name',
      render: (item) => (
        <div>
          <p className="font-medium text-on-surface">{item.name}</p>
          <p className="text-[12px] text-text-secondary">{item.code} • Sem {item.semester}</p>
        </div>
      )
    },
    { 
      header: 'Credits & Type', 
      accessor: 'type',
      render: (item) => (
        <div>
          <p className="text-[13px] text-on-surface-variant">{item.credits} Credits</p>
          <span className="px-1.5 py-0.5 bg-surface-container-high rounded text-[10px] font-medium text-text-secondary tracking-wider uppercase">{item.type}</span>
        </div>
      )
    },
    { 
      header: 'Assigned Faculty', 
      accessor: 'faculty',
      render: (item) => <span className="text-[13px] text-on-surface-variant font-medium">{item.faculty}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">Department Curriculum</h3>
      </div>
      <DataTable data={subjects} columns={columns} selectable={false} />
    </div>
  );
};

const ClassesTab = ({ classes, navigate }) => {
  const columns = [
    {
      header: 'Class Details',
      accessor: 'name',
      render: (item) => (
        <div className="cursor-pointer group" onClick={() => navigate(`/admin/classes/${item.id}`)}>
          <p className="font-medium text-on-surface group-hover:text-primary transition-colors">{item.name}</p>
          <p className="text-[12px] text-text-secondary">Year {item.year} • Sec {item.section}</p>
        </div>
      )
    },
    { 
      header: 'Leadership', 
      accessor: 'advisor',
      render: (item) => (
        <div>
          <p className="text-[12px] text-text-secondary">Adv: <span className="font-medium text-on-surface-variant">{item.advisor}</span></p>
          <p className="text-[12px] text-text-secondary">Men: <span className="font-medium text-on-surface-variant">{item.mentor}</span></p>
        </div>
      )
    },
    { 
      header: 'Students', 
      accessor: 'studentCount',
      render: (item) => <span className="text-[13px] text-on-surface-variant font-medium">{item.studentCount} Students</span>
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">Department Classes</h3>
      </div>
      <DataTable data={classes} columns={columns} selectable={false} onView={(c) => navigate(`/admin/classes/${c.id}`)} />
    </div>
  );
};

const TimetableTab = ({ timetable, classes, faculty }) => {
  // Build a simple grid for visualization
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  // Map conflicts
  const conflictMap = {};
  timetable.forEach(entry => {
    const key = `${entry.day}-${entry.period}-${entry.facultyId}`;
    if (!conflictMap[key]) conflictMap[key] = [];
    conflictMap[key].push(entry);
  });
  
  const getEntry = (day, period) => {
    const entries = timetable.filter(t => t.day === day && parseInt(t.period) === period);
    return entries;
  };

  return (
    <div className="space-y-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">Department Timetable Matrix</h3>
        <select className="px-3 py-1.5 bg-surface-container-low border border-border-subtle rounded text-[13px] font-medium">
          <option>All Classes</option>
          {classes.map(c => <option key={c.id}>{c.id}</option>)}
        </select>
      </div>

      <div className="min-w-[800px] border border-border-subtle rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest">
              <th className="p-3 border-b border-r border-border-subtle font-semibold text-[13px] text-text-secondary w-24">Day</th>
              {periods.map(p => (
                <th key={p} className="p-3 border-b border-border-subtle font-semibold text-[13px] text-text-secondary text-center">P{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day} className="border-b border-border-subtle last:border-0">
                <td className="p-3 border-r border-border-subtle font-medium text-[13px] text-on-surface bg-surface-container-lowest">{day}</td>
                {periods.map(p => {
                  const entries = getEntry(day, p);
                  return (
                    <td key={p} className="p-2 border-r border-border-subtle last:border-0 text-center align-top h-24 min-w-[100px]">
                      {entries.map((e, idx) => {
                        const isConflict = conflictMap[`${e.day}-${e.period}-${e.facultyId}`]?.length > 1;
                        return (
                          <div key={idx} className={`p-1.5 mb-1 rounded text-[11px] text-left border ${isConflict ? 'bg-error/10 border-error/20' : 'bg-surface-container-low border-border-subtle'}`}>
                            <p className="font-bold text-on-surface truncate">{e.subjectId}</p>
                            <p className="text-text-secondary truncate">{e.classId}</p>
                            <p className="text-text-secondary truncate">{e.roomId}</p>
                            {isConflict && <span className="text-error font-bold mt-1 block uppercase tracking-wider text-[9px]">Conflict</span>}
                          </div>
                        )
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AnalyticsTab = ({ department, classes }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-2">
        <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">Department Analytics</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-border-subtle rounded-xl p-6 bg-surface-white">
          <h4 className="font-medium text-[16px] mb-4 text-on-surface">Class Performance Comparison</h4>
          <div className="space-y-4">
            {classes.map(c => {
              // Mock varying widths based on id string length for visual difference
              const perf = 70 + (c.id.length * 2);
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="font-medium">{c.id}</span>
                    <span className="text-text-secondary">{perf}% Avg</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${perf}%` }}></div>
                  </div>
                </div>
              )
            })}
            {classes.length === 0 && <p className="text-[13px] text-text-secondary">No classes found.</p>}
          </div>
        </div>

        <div className="border border-border-subtle rounded-xl p-6 bg-surface-white">
          <h4 className="font-medium text-[16px] mb-4 text-on-surface">Overall Risk Distribution</h4>
          <div className="flex h-32 items-end gap-2">
            <div className="flex-1 bg-risk-low/20 hover:bg-risk-low/30 transition-colors rounded-t-lg relative group" style={{ height: '70%' }}>
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[12px] font-bold text-risk-low">70%</span>
              <p className="absolute bottom-2 left-0 w-full text-center text-[11px] font-medium text-risk-low">Low</p>
            </div>
            <div className="flex-1 bg-risk-medium/20 hover:bg-risk-medium/30 transition-colors rounded-t-lg relative group" style={{ height: '20%' }}>
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[12px] font-bold text-risk-medium">20%</span>
              <p className="absolute bottom-2 left-0 w-full text-center text-[11px] font-medium text-risk-medium">Med</p>
            </div>
            <div className="flex-1 bg-risk-high/20 hover:bg-risk-high/30 transition-colors rounded-t-lg relative group" style={{ height: '10%' }}>
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[12px] font-bold text-risk-high">10%</span>
              <p className="absolute bottom-2 left-0 w-full text-center text-[11px] font-medium text-risk-high">High</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportsTab = ({ department }) => {
  const reports = [
    { title: 'Student Performance', desc: 'Aggregated GPA and exam marks.' },
    { title: 'Attendance Trends', desc: 'Daily and weekly attendance logs.' },
    { title: 'Faculty Workload', desc: 'Teaching hours and responsibilities.' },
    { title: 'Academic Risk', desc: 'Students below minimum thresholds.' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">Department Reports</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="border border-border-subtle rounded-lg p-5 hover:border-primary/50 transition-colors bg-surface-container-lowest">
            <h4 className="font-semibold text-[16px] text-on-surface mb-1">{r.title}</h4>
            <p className="text-[13px] text-text-secondary mb-4">{r.desc}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-primary text-on-primary rounded text-[12px] font-medium hover:bg-primary-fixed-variant transition-colors">Generate PDF</button>
              <button className="px-3 py-1.5 bg-surface-white border border-border-subtle text-on-surface rounded text-[12px] font-medium hover:bg-surface-container-low transition-colors">Export CSV</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EditDepartmentModal = ({ department, onClose, onSave }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-surface-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
        <h3 className="font-semibold text-[18px] text-on-surface">Edit Department</h3>
        <button onClick={onClose} className="text-text-secondary hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
      </div>
      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        <div>
          <label className="block text-[13px] font-medium text-on-surface mb-1">Department Name</label>
          <input type="text" defaultValue={department.name} className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-on-surface mb-1">Department Code</label>
          <input type="text" defaultValue={department.code} className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-on-surface mb-1">Head of Department (HOD)</label>
          <input type="text" defaultValue={department.hod} className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div className="p-4 border-t border-border-subtle bg-surface-container-lowest flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium hover:bg-surface-container-low transition-colors">Cancel</button>
        <button onClick={() => onSave(department)} className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium hover:bg-primary/90 transition-colors">Save Changes</button>
      </div>
    </div>
  </div>
);

export default DepartmentDetails;
