import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    const data = await adminApi.getAIInsights();
    setInsights(data);
    setIsLoading(false);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'risk': return { icon: 'warning', color: 'text-risk-high', bg: 'bg-red-100' };
      case 'positive': return { icon: 'trending_up', color: 'text-risk-low', bg: 'bg-green-100' };
      case 'anomaly': return { icon: 'insights', color: 'text-primary', bg: 'bg-primary-container' };
      default: return { icon: 'lightbulb', color: 'text-text-secondary', bg: 'bg-surface-container-high' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-border-subtle/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display-lg text-[36px] font-bold text-on-surface">AI Insights Portal</h2>
            <span className="px-2 py-0.5 bg-primary-container text-on-primary-container text-[12px] font-bold rounded uppercase tracking-wider">Beta</span>
          </div>
          <p className="font-body-lg text-[16px] text-text-secondary">Machine learning models actively analyzing institutional data for patterns.</p>
        </div>
        <button onClick={loadInsights} className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Regenerate Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-text-secondary">Running analysis models...</div>
        ) : (
          insights.map((insight) => {
            const style = getIconForType(insight.type);
            return (
              <div key={insight.id} className="bg-surface-white border border-border-subtle rounded-xl flex flex-col shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}>
                      <span className="material-symbols-outlined">{style.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface leading-tight mb-1">{insight.title}</h3>
                      <span className={`text-[12px] font-medium uppercase tracking-wider ${style.color}`}>
                        {insight.type} Detected
                      </span>
                    </div>
                  </div>
                  <p className="font-body-md text-[14px] text-text-secondary mb-4 flex-1">
                    {insight.description}
                  </p>
                  <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-3 mb-4">
                    <p className="text-[12px] font-medium text-on-surface mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-text-secondary">policy</span>
                      Primary Evidence
                    </p>
                    <p className="text-[12px] text-text-secondary">{insight.evidence}</p>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low border-t border-border-subtle">
                  <p className="text-[12px] font-medium text-primary mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                    AI Recommendation
                  </p>
                  <p className="text-[13px] text-on-surface-variant font-medium">{insight.recommendation}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AIInsights;
