import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentPortal = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center p-8 font-sans">
      <div className="bg-surface-white border border-border-subtle p-12 rounded-xl shadow-lg max-w-lg w-full text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
          <span className="material-symbols-outlined text-[40px]">school</span>
        </div>
        <div>
          <h1 className="font-display-lg text-[32px] font-bold text-on-surface mb-2">Student Portal</h1>
          <p className="text-text-secondary text-[16px]">Welcome to the Student Dashboard.</p>
        </div>
        <div className="bg-surface-container-low border border-border-subtle rounded-lg p-6 text-left space-y-4">
          <h3 className="font-semibold text-on-surface border-b border-border-subtle pb-2">Quick Links</h3>
          <ul className="space-y-3 text-[14px] text-primary">
            <li className="cursor-pointer hover:underline flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">menu_book</span> My Courses</li>
            <li className="cursor-pointer hover:underline flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">calendar_month</span> Timetable</li>
            <li className="cursor-pointer hover:underline flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">grade</span> Academic Records</li>
            <li className="cursor-pointer hover:underline flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">payments</span> Fee Payment</li>
          </ul>
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="w-full py-3 bg-surface-container-high hover:bg-border-subtle text-on-surface font-medium rounded-lg transition-colors">
          Back to Admin (Demo)
        </button>
      </div>
    </div>
  );
};

export default StudentPortal;
