import { createApiClient, formatApiError } from './api';
import { API_CONFIG } from '../config/api';
import { BackendSecurityEvent, RecentEventsResponse, BackendStatsResponse, BackendStatsData } from '../types/api';
import axios from 'axios';

export interface RecentEventsResult {
  success: boolean;
  events: BackendSecurityEvent[];
  count: number;
  error?: string;
  isAuthError?: boolean;
  isUnavailable?: boolean;
}

export interface StatsResult {
  success: boolean;
  stats?: BackendStatsData;
  error?: string;
  isAuthError?: boolean;
  isUnavailable?: boolean;
}

export const fetchRecentEvents = async (limit: number = 50): Promise<RecentEventsResult> => {
  try {
    const client = createApiClient();
    const response = await client.get<RecentEventsResponse>(
      `${API_CONFIG.ENDPOINTS.EVENTS_RECENT}?limit=${limit}`
    );

    if (response.data && response.data.success && Array.isArray(response.data.events)) {
      return {
        success: true,
        events: response.data.events,
        count: response.data.count ?? response.data.events.length,
      };
    }

    return {
      success: false,
      events: [],
      count: 0,
      error: response.data?.error || 'Failed to parse recent events',
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        return {
          success: false,
          events: [],
          count: 0,
          error: 'Authentication required. Please log in with a valid JWT token.',
          isAuthError: true,
        };
      }
      if (err.response?.status === 503) {
        return {
          success: false,
          events: [],
          count: 0,
          error: 'PostgreSQL Database is unavailable.',
          isUnavailable: true,
        };
      }
    }
    return {
      success: false,
      events: [],
      count: 0,
      error: formatApiError(err),
      isUnavailable: true,
    };
  }
};

export const fetchStats = async (): Promise<StatsResult> => {
  try {
    const client = createApiClient();
    const response = await client.get<BackendStatsResponse>(API_CONFIG.ENDPOINTS.STATS);

    if (response.data && response.data.success && response.data.stats) {
      return {
        success: true,
        stats: response.data.stats,
      };
    }

    return {
      success: false,
      error: response.data?.error || 'Failed to retrieve stats',
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required for /stats',
          isAuthError: true,
        };
      }
      if (err.response?.status === 503) {
        return {
          success: false,
          error: 'Database unavailable for /stats',
          isUnavailable: true,
        };
      }
    }
    return {
      success: false,
      error: formatApiError(err),
      isUnavailable: true,
    };
  }
};

// Valid sample probe payload using the 54 base features
export const SAMPLE_PROBE_FEATURES: Record<string, number> = {
  'Destination Port': 80,
  'Flow Duration': 450000,
  'Total Fwd Packets': 12,
  'Total Backward Packets': 10,
  'Total Length of Fwd Packets': 620,
  'Total Length of Bwd Packets': 540,
  'Fwd Packet Length Max': 110,
  'Fwd Packet Length Min': 20,
  'Fwd Packet Length Mean': 50,
  'Fwd Packet Length Std': 10,
  'Bwd Packet Length Max': 100,
  'Bwd Packet Length Min': 20,
  'Bwd Packet Length Mean': 50,
  'Bwd Packet Length Std': 10,
  'Flow Bytes/s': 1200,
  'Flow Packets/s': 24,
  'Flow IAT Mean': 750,
  'Flow IAT Std': 80,
  'Flow IAT Max': 3500,
  'Flow IAT Min': 70,
  'Fwd IAT Total': 3500,
  'Fwd IAT Mean': 400,
  'Fwd IAT Std': 80,
  'Fwd IAT Max': 1600,
  'Fwd IAT Min': 70,
  'Bwd IAT Total': 3000,
  'Bwd IAT Mean': 400,
  'Bwd IAT Std': 80,
  'Bwd IAT Max': 1600,
  'Bwd IAT Min': 70,
  'Fwd PSH Flags': 0,
  'Fwd URG Flags': 0,
  'Fwd Header Length': 200,
  'Bwd Header Length': 160,
  'Fwd Packets/s': 12,
  'Bwd Packets/s': 10,
  'Min Packet Length': 20,
  'Max Packet Length': 110,
  'Packet Length Mean': 50,
  'Packet Length Std': 10,
  'Packet Length Variance': 100,
  'FIN Flag Count': 0,
  'SYN Flag Count': 0,
  'RST Flag Count': 0,
  'PSH Flag Count': 0,
  'ACK Flag Count': 1,
  'URG Flag Count': 0,
  'ECE Flag Count': 0,
  'Down/Up Ratio': 0.8,
  'Average Packet Size': 50,
  'Init_Win_bytes_forward': 4096,
  'Init_Win_bytes_backward': 4096,
  'act_data_pkt_fwd': 6,
  'min_seg_size_forward': 20,
};

export const injectProbeFlow = async (sourceId: string = 'SOC_PROBE_CONSOLE'): Promise<{ success: boolean; error?: string }> => {
  try {
    const client = createApiClient();
    const response = await client.post('/predict', {
      features: SAMPLE_PROBE_FEATURES,
      source_id: sourceId,
    });
    return { success: response.status === 200 };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 403 || err.response?.status === 429) {
        // Enforced block or rate-limit still created a security_event and prediction row!
        return { success: true };
      }
      return { success: false, error: err.response?.data?.detail || err.message };
    }
    return { success: false, error: 'Probe injection failed' };
  }
};
