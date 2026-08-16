import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AuditHistory = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    const data = await adminApi.getAuditLogs();
    setLogs(data);
    setIsLoading(false);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Edit': return { icon: 'edit', bg: 'bg-orange-100', color: 'text-orange-700' };
      case 'Assignment': return { icon: 'assignment_ind', bg: 'bg-blue-100', color: 'text-blue-700' };
      case 'Create': return { icon: 'add_circle', bg: 'bg-green-100', color: 'text-green-700' };
      default: return { icon: 'history', bg: 'bg-surface-container-high', color: 'text-on-surface' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Audit History</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Chronological record of administrative actions.</p>
        </div>
        <button className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Logs
        </button>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading audit trail...</div>
        ) : (
          <div className="space-y-6">
            {logs.map((log, index) => {
              const style = getIconForType(log.type);
              return (
                <div key={log.id} className="relative pl-6">
                  {/* Timeline connecting line */}
                  {index !== logs.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-border-subtle"></div>
                  )}
                  
                  <div className="flex gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${style.bg} ${style.color}`}>
                      <span className="material-symbols-outlined text-[14px]">{style.icon}</span>
                    </div>
                    <div className="flex-1 bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-[14px] text-on-surface">{log.action}</h4>
                        <span className="text-[12px] text-text-secondary whitespace-nowrap">{log.date}</span>
                      </div>
                      <p className="text-[13px] text-text-secondary mb-3">{log.detail}</p>
                      <div className="flex items-center gap-2 text-[12px] font-medium text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">account_circle</span>
                        By {log.user}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditHistory;
