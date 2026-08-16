import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { authService } from '../services/authService';
import { Settings, User, Bell, Lock, Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const teacher = authService.getCurrentUser();

  const [name, setName] = useState(teacher.name);
  const [department, setDepartment] = useState(teacher.department);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [submissionAlerts, setSubmissionAlerts] = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Faculty Settings & Preferences</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage profile details, system notification alerts, and security settings</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Faculty settings updated successfully!</span>
          </div>
        )}

        {/* Profile Settings */}
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Faculty Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={teacher.email}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Alert & Notification Preferences</h2>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">AI Risk Escalation Notifications</span>
                <span className="text-slate-500">Receive high-priority alerts when backend AI flags a student as HIGH RISK</span>
              </div>
              <input
                type="checkbox"
                checked={riskAlerts}
                onChange={(e) => setRiskAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Assignment Submission Triggers</span>
                <span className="text-slate-500">Get notified when new student assignment submissions are uploaded</span>
              </div>
              <input
                type="checkbox"
                checked={submissionAlerts}
                onChange={(e) => setSubmissionAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>
      </div>
    </Layout>
  );
};
