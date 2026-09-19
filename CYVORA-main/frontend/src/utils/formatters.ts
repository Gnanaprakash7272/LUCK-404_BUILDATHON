export const formatNumber = (num: number, decimals: number = 0): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatDuration = (microseconds: number): string => {
  if (!microseconds || microseconds <= 0) return '0 µs';
  if (microseconds < 1000) return `${microseconds.toFixed(0)} µs`;
  if (microseconds < 1000000) return `${(microseconds / 1000).toFixed(2)} ms`;
  return `${(microseconds / 1000000).toFixed(2)} s`;
};

export const formatPercent = (decimal: number | null | undefined, decimals: number = 2): string => {
  if (decimal === null || decimal === undefined || isNaN(decimal)) return 'N/A';
  // If decimal is e.g. 0.9982, multiply by 100
  const value = decimal <= 1.0 ? decimal * 100 : decimal;
  return `${value.toFixed(decimals)}%`;
};

export const getTimestamp = (): string => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
};
