import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    const logs = await adminApi.getAuditLogs();
    setRecentActivity(logs.slice(0, 5)); // Just take top 5
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Overview Dashboard</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Real-time institutional performance metrics.</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button className="px-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-on-surface text-[12px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            This Term
          </button>
          <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[12px] font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Departments" value="13" icon="account_balance" color="text-primary" />
        <StatCard title="Total Students" value="1,240" icon="school" color="text-secondary" trend="+2.4%" />
        <StatCard title="Total Faculty" value="112" icon="badge" color="text-tertiary" />
        <StatCard title="Total Rooms" value="84" icon="meeting_room" color="text-on-surface-variant" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Overview */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Action Required Section */}
          <div className="bg-surface-white border border-error/20 rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-4 border-b border-error/20 bg-error/5 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">warning</span>
              <h3 className="font-headline-sm text-[18px] font-semibold text-error">Action Required</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionAlert 
                title="12 Students High Risk" 
                desc="Below attendance and grade thresholds" 
                onClick={() => navigate('/admin/students')} 
              />
              <ActionAlert 
                title="3 Classes Missing Teacher" 
                desc="No lead teacher assigned" 
                onClick={() => navigate('/admin/classes')} 
              />
              <ActionAlert 
                title="Pending Grade Corrections" 
                desc="5 grades flagged for review" 
                onClick={() => navigate('/admin/academic-records')} 
              />
            </div>
          </div>

          {/* Academic Overview Charts */}
          <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden flex flex-col shadow-sm flex-1">
            <div className="p-6 border-b border-border-subtle flex justify-between items-center">
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">Academic Overview</h3>
              <button className="text-primary hover:bg-surface-container-low p-1 rounded transition-colors">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
              <GaugeCard label="Attendance" value="94%" color="#1d4ed8" offset="15.07" />
              <GaugeCard label="Assignment Perf" value="82%" color="#0037b0" offset="45.21" />
              <GaugeCard label="Exam Perf" value="78%" color="#D97706" offset="55.26" />
              <GaugeCard label="Overall" value="85%" color="#2151da" offset="37.68" outline />
            </div>
          </div>
        </div>

        {/* Risk Intelligence & Activity */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm">
            <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface mb-6">Risk Distribution</h3>
            <div className="space-y-4">
              <RiskBar label="High Risk" percent="12%" color="bg-risk-high" textClass="text-risk-high" />
              <RiskBar label="Medium Risk" percent="28%" color="bg-risk-medium" textClass="text-risk-medium" />
              <RiskBar label="Low Risk" percent="60%" color="bg-risk-low" textClass="text-risk-low" />
            </div>
          </div>

          <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">Recent Activity</h3>
              <button onClick={() => navigate('/admin/audit')} className="text-[12px] font-medium text-primary hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">history</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-on-surface">{activity.action}</p>
                    <p className="text-[11px] text-text-secondary">{activity.date} • {activity.user}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-[13px] text-text-secondary text-center py-4">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionAlert = ({ title, desc, onClick }) => (
  <div onClick={onClick} className="p-3 border border-border-subtle rounded-lg bg-surface-white hover:bg-surface-container-low cursor-pointer transition-colors shadow-sm flex justify-between items-center group">
    <div>
      <p className="font-semibold text-[14px] text-on-surface">{title}</p>
      <p className="text-[12px] text-text-secondary">{desc}</p>
    </div>
    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
  </div>
);

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-surface-white border border-border-subtle rounded-xl p-6 flex flex-col shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      {trend && (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-label-md text-[10px] flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">trending_up</span> {trend}
        </span>
      )}
    </div>
    <p className="font-body-md text-[14px] text-text-secondary mb-1">{title}</p>
    <h3 className="font-display-lg text-[36px] font-bold text-on-surface">{value}</h3>
  </div>
);

const GaugeCard = ({ label, value, color, offset, outline }) => (
  <div className={`flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-lg ${outline ? 'border-2 border-primary/10' : ''}`}>
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#e1e8ff" strokeWidth="8"></circle>
        <circle cx="50" cy="50" fill="transparent" r="40" stroke={color} strokeDasharray="251.2" strokeDashoffset={offset} strokeWidth="8"></circle>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline-md text-[20px] font-semibold text-on-surface">{value}</span>
      </div>
    </div>
    <p className={`mt-4 text-[12px] font-medium uppercase tracking-wider ${outline ? 'text-primary font-bold' : 'text-text-secondary'}`}>{label}</p>
  </div>
);

const RiskBar = ({ label, percent, color, textClass }) => (
  <div>
    <div className="flex justify-between text-[12px] font-medium mb-1">
      <span className={textClass}>{label}</span>
      <span className="text-text-secondary">{percent}</span>
    </div>
    <div className="w-full bg-surface-container-highest rounded-full h-2">
      <div className={`${color} h-2 rounded-full`} style={{ width: percent }}></div>
    </div>
  </div>
);

export default AdminDashboard;
