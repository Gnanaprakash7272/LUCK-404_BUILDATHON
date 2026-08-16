import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('overall'); // overall, class, comparative

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getAnalyticsOverview();
      // Backend returns: { total_students, total_teachers, total_courses,
      //   total_classes, avg_attendance_percentage, at_risk_students }
      // Map into chart-friendly shape for the UI
      setData({
        attendanceTrend: [
          { name: 'Overall', value: Math.round(result.avg_attendance_percentage || 0) },
        ],
        riskDistribution: [
          { name: 'At Risk', value: result.at_risk_students || 0, color: '#DC2626' },
          { name: 'On Track', value: (result.total_students || 0) - (result.at_risk_students || 0), color: '#16A34A' },
        ],
        subjectPerformance: [
          { subject: 'All Courses', score: Math.round(result.avg_attendance_percentage || 0) },
        ],
        summary: result,
      });
    } catch (error) {
      console.error('Analytics load failed:', error);
      setData({ attendanceTrend: [], riskDistribution: [], subjectPerformance: [], summary: {} });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return <div className="p-8 text-center text-text-secondary">Loading analytics data...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Academic Analytics</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Deep dive into institutional performance metrics.</p>
        </div>
        <div className="flex bg-surface-container-low rounded-lg p-1 border border-border-subtle">
          <button onClick={() => setView('overall')} className={`px-4 py-1.5 rounded-md text-[14px] font-medium transition-colors ${view === 'overall' ? 'bg-surface-white shadow-sm text-primary' : 'text-text-secondary hover:text-on-surface'}`}>Overall View</button>
          <button onClick={() => setView('class')} className={`px-4 py-1.5 rounded-md text-[14px] font-medium transition-colors ${view === 'class' ? 'bg-surface-white shadow-sm text-primary' : 'text-text-secondary hover:text-on-surface'}`}>Class View</button>
          <button onClick={() => setView('comparative')} className={`px-4 py-1.5 rounded-md text-[14px] font-medium transition-colors ${view === 'comparative' ? 'bg-surface-white shadow-sm text-primary' : 'text-text-secondary hover:text-on-surface'}`}>Comparative</button>
        </div>
      </div>

      {view === 'overall' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm">
            <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface mb-6">Attendance Trend (8 Weeks)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCE4EF" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #DCE4EF', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="value" stroke="#0037b0" strokeWidth={3} dot={{ r: 4, fill: '#0037b0' }} activeDot={{ r: 6 }} name="Attendance %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm">
            <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface mb-6">Risk Categorization</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm">
            <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface mb-6">Subject Performance Analysis</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.subjectPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCE4EF" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip cursor={{ fill: '#f1f3ff' }} contentStyle={{ borderRadius: '8px', border: '1px solid #DCE4EF' }} />
                  <Bar dataKey="score" fill="#3e5d9d" radius={[4, 4, 0, 0]} barSize={40} name="Average Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {view !== 'overall' && (
        <div className="bg-surface-white border border-border-subtle rounded-xl p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-[48px] text-text-secondary mb-4">construction</span>
          <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface mb-2">Detailed Views in Progress</h3>
          <p className="text-text-secondary">The {view} analytics views are currently being aggregated by the data pipeline.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
