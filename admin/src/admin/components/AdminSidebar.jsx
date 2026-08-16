import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => currentPath.startsWith(path) && (path !== '/admin' || currentPath === '/admin/dashboard');

  const navGroups = [
    {
      title: 'CORE',
      items: [
        { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/admin/departments', icon: 'account_balance', label: 'Departments' },
        { path: '/admin/faculty', icon: 'badge', label: 'Faculty & Staff' },
      ]
    },
    {
      title: 'ACADEMICS',
      items: [
        { path: '/admin/students', icon: 'school', label: 'Students' },
        { path: '/admin/parents', icon: 'family_restroom', label: 'Parents' },
        { path: '/admin/subjects', icon: 'menu_book', label: 'Subjects' },
        { path: '/admin/classes', icon: 'class', label: 'Classes' },
        { path: '/admin/academic-records', icon: 'assignment', label: 'Academic Records' },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { path: '/admin/timetable', icon: 'calendar_view_week', label: 'Timetable' },
        { path: '/admin/rooms', icon: 'meeting_room', label: 'Rooms' },
        { path: '/admin/workload', icon: 'work', label: 'Workload' },
        { path: '/admin/attendance', icon: 'rule', label: 'Attendance' },
        { path: '/admin/calendar', icon: 'event', label: 'Calendar' },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { path: '/admin/analytics', icon: 'bar_chart', label: 'Analytics' },
        { path: '/admin/reports', icon: 'description', label: 'Reports' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { path: '/admin/access', icon: 'admin_panel_settings', label: 'Access Roles' },
        { path: '/admin/audit', icon: 'history', label: 'Audit Logs' },
      ]
    }
  ];

  return (
    <nav className="bg-surface-white border-r border-border-subtle fixed left-0 top-0 h-full w-[260px] flex flex-col py-6 px-4 hidden md:flex z-40 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-8 px-3 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-lg">E</div>
        <div>
          <h1 className="font-headline-sm text-[20px] leading-[28px] font-bold text-primary">EduAdmin</h1>
          <p className="font-label-md text-[12px] text-text-secondary">Super Admin Console</p>
        </div>
      </div>
      
      <div className="flex-1 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[11px] font-bold tracking-wider text-text-secondary mb-2">{group.title}</p>
            <ul className="space-y-1">
              {group.items.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out ${
                      isActive(item.path)
                        ? 'bg-surface-container text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "'FILL' 0" }}>
                      {item.icon}
                    </span>
                    <span className="font-body-md text-[14px]">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default AdminSidebar;
