import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Custom Toast State
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    const data = await adminApi.getReports();
    setReports(data);
    setIsLoading(false);
  };

  const getIconForReport = (type) => {
    switch (type) {
      case 'performance': return 'trending_up';
      case 'attendance': return 'calendar_month';
      case 'risk': return 'warning';
      case 'faculty': return 'school';
      default: return 'summarize';
    }
  };

  const handleExport = (format) => {
    setToast(`Successfully generated ${format} export for: ${selectedReport?.title || 'Report'}. Check your downloads folder.`);
    setTimeout(() => setToast(null), 3000);
  };
  
  // Generate dummy data based on report title
  const generatePreviewData = () => {
    if (!selectedReport) return [];
    if (selectedReport.type === 'attendance') {
      return [
        { id: 1, name: 'Arun Kumar', metric: '92%', status: 'Good' },
        { id: 2, name: 'Priya Sharma', metric: '98%', status: 'Excellent' },
        { id: 3, name: 'Rahul Verma', metric: '65%', status: 'Critical' }
      ];
    }
    if (selectedReport.type === 'performance') {
      return [
        { id: 1, name: 'CSE-1A', metric: '8.5 GPA', status: 'Above Target' },
        { id: 2, name: 'ECE-1A', metric: '7.8 GPA', status: 'On Target' },
        { id: 3, name: 'CSE-1B', metric: '6.5 GPA', status: 'Below Target' }
      ];
    }
    return [
      { id: 1, name: 'Metric A', metric: '100', status: 'Normal' },
      { id: 2, name: 'Metric B', metric: '450', status: 'Normal' },
    ];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 bg-surface-white border-l-4 border-primary shadow-lg rounded px-4 py-3 z-50 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <p className="text-[14px] font-medium text-on-surface">{toast}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Reports Hub</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Generate and view automated institutional reports.</p>
        </div>
        <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Custom Report
        </button>
      </div>

      {!selectedReport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full p-12 text-center text-text-secondary">Loading available reports...</div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedReport(report)}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[24px]">{getIconForReport(report.type)}</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] font-semibold text-on-surface leading-snug mb-1">{report.title}</h3>
                    <p className="text-[12px] text-text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">update</span> {report.updated}
                    </p>
                  </div>
                </div>
                <p className="font-body-md text-[14px] text-text-secondary mb-6 flex-1 line-clamp-2">
                  {report.description}
                </p>
                <div className="pt-4 border-t border-border-subtle flex justify-between items-center">
                  <span className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">{report.type}</span>
                  <button className="text-primary text-[14px] font-medium hover:underline">View Report</button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedReport(null)}
            className="flex items-center gap-2 text-[14px] font-medium text-text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Hub
          </button>
          
          <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h3 className="font-headline-sm text-[24px] font-semibold text-on-surface mb-1">{selectedReport.title}</h3>
                <p className="text-text-secondary text-[14px]">{selectedReport.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExport('CSV')} className="px-3 py-1.5 border border-border-subtle rounded-md text-[13px] font-medium hover:bg-surface-container-low transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">csv</span> CSV
                </button>
                <button onClick={() => handleExport('PDF')} className="px-3 py-1.5 border border-border-subtle rounded-md text-[13px] font-medium hover:bg-surface-container-low transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span> PDF
                </button>
                <button onClick={() => window.print()} className="px-3 py-1.5 border border-border-subtle rounded-md text-[13px] font-medium hover:bg-surface-container-low transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">print</span> Print
                </button>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-6">
              <DataTable 
                data={generatePreviewData()} 
                selectable={false}
                columns={[
                  { header: 'Entity Name', accessor: 'name' },
                  { header: 'Metric Value', accessor: 'metric' },
                  { header: 'Status Flag', accessor: 'status', render: (item) => <span className={`font-medium ${item.status === 'Critical' || item.status === 'Below Target' ? 'text-error' : 'text-on-surface'}`}>{item.status}</span> },
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
