import { createApiClient, formatApiError } from './api';
import { PreventionStatusResponse, PreventionStatusData } from '../types/api';

export interface PreventionCheckResult {
  isConnected: boolean;
  data: PreventionStatusData | null;
  errorMessage?: string;
  timestamp: string;
}

export const fetchPreventionStatus = async (): Promise<PreventionCheckResult> => {
  const timestamp = new Date().toLocaleTimeString();
  try {
    const client = createApiClient();
    const response = await client.get<PreventionStatusResponse>('/prevention/status');

    if (response.data && response.data.success && response.data.prevention) {
      return {
        isConnected: true,
        data: response.data.prevention,
        timestamp,
      };
    }

    throw new Error('Invalid prevention status response structure');
  } catch (error) {
    const formattedError = formatApiError(error);
    const isDisconnected = formattedError.includes('Backend Unavailable') || formattedError.includes('ERR_NETWORK') || formattedError.includes('ECONNABORTED');
    
    return {
      isConnected: false,
      data: null,
      errorMessage: isDisconnected ? 'Backend Disconnected' : formattedError,
      timestamp,
    };
  }
};
