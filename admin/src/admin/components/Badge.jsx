import React from 'react';

export const RiskBadge = ({ level }) => {
  const getRiskStyles = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-risk-low border-green-200';
      case 'medium': return 'bg-yellow-100 text-risk-medium border-yellow-200';
      case 'high': return 'bg-red-100 text-risk-high border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full font-medium text-[12px] border ${getRiskStyles(level)} inline-flex items-center gap-1`}>
      {level?.toLowerCase() === 'high' && <span className="material-symbols-outlined text-[14px]">warning</span>}
      {level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown'}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-surface-container-high text-primary';
      case 'on-leave': return 'bg-gray-100 text-gray-600';
      case 'at-risk': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full font-medium text-[12px] ${getStatusStyles(status)} inline-flex items-center gap-1`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};
