import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Avatar } from './Avatar';

const AdminHeader = () => {
  const { user, logout } = useAdminAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotificationsOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await adminApi.getNotifications();
    setNotifications(data);
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 2) {
      setSearchOpen(true);
      // Mock global search aggregation
      const [students, faculty, subjects, departments] = await Promise.all([
        adminApi.getStudents(),
        adminApi.getFaculty(),
        adminApi.getSubjects(),
        adminApi.getDepartments()
      ]);
      
      const results = [
        ...students.filter(s => s.name.toLowerCase().includes(value.toLowerCase())).map(s => ({ ...s, type: 'Student', route: `/admin/students/${s.id}` })),
        ...faculty.filter(f => f.name.toLowerCase().includes(value.toLowerCase())).map(f => ({ ...f, type: 'Faculty', route: `/admin/faculty/${f.id}` })),
        ...subjects.filter(c => c.name.toLowerCase().includes(value.toLowerCase())).map(c => ({ ...c, type: 'Subject', route: '/admin/subjects' })),
        ...departments.filter(d => d.name.toLowerCase().includes(value.toLowerCase())).map(d => ({ ...d, type: 'Department', route: `/admin/departments/${d.id}` }))
      ].slice(0, 5); // Limit to top 5
      
      setSearchResults(results);
    } else {
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout(); // clears auth_token, admin_user, redirects to /login
  };

  return (
    <header className="bg-surface-white border-b border-border-subtle flex justify-between items-center w-full px-4 md:px-8 h-16 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors cursor-pointer">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="font-headline-md text-[20px] font-bold text-primary md:hidden">EduAdmin</span>
      </div>
      
      {/* Global Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block" ref={searchRef}>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-border-subtle rounded-full text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
            placeholder="Search students, teachers, courses..." 
            type="text" 
          />
          
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-white border border-border-subtle rounded-xl shadow-lg overflow-hidden py-2 animate-slide-up">
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-[14px] text-text-secondary text-center">No results found for "{searchTerm}"</div>
              ) : (
                searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchTerm('');
                      navigate(result.route);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-surface-container-low transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={result.name} size="sm" color={result.type === 'Student' ? 'primary' : 'secondary'} />
                      <div>
                        <p className="font-medium text-on-surface text-[14px]">{result.name}</p>
                        <p className="text-[12px] text-text-secondary">{result.id}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-1 bg-surface-container-high rounded text-on-surface-variant">
                      {result.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Notification Center */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="text-on-surface-variant p-2 rounded-full hover:bg-surface-container-low transition-colors relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-surface-white border border-border-subtle rounded-xl shadow-lg overflow-hidden animate-slide-up origin-top-right">
              <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
                <h3 className="font-semibold text-on-surface">Notifications</h3>
                <button className="text-[12px] text-primary hover:underline font-medium">Mark all as read</button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-4 border-b border-border-subtle hover:bg-surface-container-lowest transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}>
                    <div className="flex gap-3">
                      <span className={`material-symbols-outlined text-[20px] ${
                        notif.type === 'alert' ? 'text-error' :
                        notif.type === 'warning' ? 'text-orange-500' :
                        notif.type === 'success' ? 'text-green-500' : 'text-primary'
                      }`}>
                        {notif.type === 'alert' ? 'error' :
                         notif.type === 'warning' ? 'warning' :
                         notif.type === 'success' ? 'check_circle' : 'info'}
                      </span>
                      <div>
                        <p className={`text-[13px] font-medium ${!notif.read ? 'text-on-surface' : 'text-on-surface-variant'}`}>{notif.title}</p>
                        <p className="text-[12px] text-text-secondary mt-0.5">{notif.message}</p>
                        <p className="text-[11px] text-on-surface-variant mt-2">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-border-subtle bg-surface-container-lowest">
                <Link to="/admin/notifications" className="text-[13px] font-medium text-primary hover:underline">View All Activity</Link>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate('/admin/settings')}
          className="text-on-surface-variant p-2 rounded-full hover:bg-surface-container-low transition-colors hidden md:block"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
        
        <div className="relative ml-4" ref={dropdownRef}>
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 cursor-pointer transition-all duration-200"
          >
            <Avatar name={user?.name || 'Admin'} size="md" color="surface" />
            <div className="hidden md:block text-left">
              <p className="font-label-lg text-[14px] font-medium text-on-surface leading-tight">{user?.name || 'Admin'}</p>
              <p className="font-body-sm text-[12px] text-text-secondary leading-tight">Administrator</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant hidden md:block">expand_more</span>
          </div>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-surface-white border border-border-subtle rounded-xl shadow-lg py-2 animate-slide-up origin-top-right">
              <div className="px-4 py-3 border-b border-border-subtle mb-2">
                <p className="text-[14px] font-semibold text-on-surface">{user?.name || 'Admin'}</p>
                <p className="text-[12px] text-text-secondary">{user?.email || ''}</p>
              </div>
              <button onClick={() => { setProfileOpen(false); navigate('/admin/settings'); }} className="w-full text-left px-4 py-2 text-[14px] text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person</span>
                Profile Settings
              </button>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-[14px] text-error hover:bg-error/10 transition-colors flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
