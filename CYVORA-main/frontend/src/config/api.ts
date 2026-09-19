// Centralized API configuration for CYVORA SOC Frontend

export const API_CONFIG = {
  // Default development backend URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  TIMEOUT_MS: 8000,
  POLL_INTERVAL_MS: 5000,
  ENDPOINTS: {
    ROOT: '/',
    HEALTH: '/health',
    MODEL_INFO: '/model-info',
    API_STATUS: '/api/status',
    PREDICT: '/predict',
    PREVENTION_STATUS: '/prevention/status',
    EVENTS_RECENT: '/events/recent',
    STATS: '/stats',
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    AUTH_ME: '/auth/me',
  },
} as const;

export const getApiBaseUrl = (): string => {
  const customUrl = localStorage.getItem('cyvora_api_base_url');
  if (customUrl && customUrl.includes(':8001')) {
    const fixedUrl = customUrl.replace(':8001', ':8000');
    localStorage.setItem('cyvora_api_base_url', fixedUrl);
    return fixedUrl;
  }
  return customUrl || API_CONFIG.BASE_URL;
};

export const setApiBaseUrl = (url: string): void => {
  localStorage.setItem('cyvora_api_base_url', url);
};
