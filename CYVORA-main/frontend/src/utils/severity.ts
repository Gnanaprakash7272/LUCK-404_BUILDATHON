import { SeverityLevel } from '../types/threat';

export const getSeverityBadgeClasses = (severity: SeverityLevel): string => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-pink-500/10 text-pink-400 border border-pink-500/30';
    case 'HIGH':
      return 'bg-red-500/10 text-red-400 border border-red-500/30';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    case 'LOW':
    default:
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
  }
};

export const getSeverityColorHex = (severity: SeverityLevel): string => {
  switch (severity) {
    case 'CRITICAL':
      return '#EC4899';
    case 'HIGH':
      return '#EF4444';
    case 'MEDIUM':
      return '#F59E0B';
    case 'LOW':
    default:
      return '#10B981';
  }
};

export const getAttackClassSeverity = (className: string): SeverityLevel => {
  const name = className.toLowerCase();
  if (name.includes('benign')) return 'LOW';
  if (name.includes('heartbleed') || name.includes('infiltration') || name.includes('sql injection') || name.includes('ddos')) {
    return 'CRITICAL';
  }
  if (name.includes('xss') || name.includes('brute force') || name.includes('hulk') || name.includes('goldeneye') || name.includes('patator') || name.includes('bot')) {
    return 'HIGH';
  }
  if (name.includes('slowhttptest') || name.includes('slowloris') || name.includes('portscan')) {
    return 'MEDIUM';
  }
  return 'LOW';
};
