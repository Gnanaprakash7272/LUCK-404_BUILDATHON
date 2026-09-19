import { createApiClient } from './api';
import { HealthResponse, ModelInfoResponse, ApiStatusResponse } from '../types/api';

export interface HealthCheckResult {
  isBackendConnected: boolean;
  responseTimeMs: number;
  healthData?: HealthResponse;
  modelInfo?: ModelInfoResponse;
  apiStatus?: ApiStatusResponse;
  errorMessage?: string;
  timestamp: string;
}

export const checkBackendHealth = async (): Promise<HealthCheckResult> => {
  const startTime = performance.now();
  const timestamp = new Date().toLocaleTimeString();

  try {
    const client = createApiClient();
    
    // Check root and health endpoints
    const [healthRes, modelRes, statusRes] = await Promise.all([
      client.get<HealthResponse>('/health'),
      client.get<ModelInfoResponse>('/model-info').catch(() => null),
      client.get<ApiStatusResponse>('/api/status').catch(() => null),
    ]);

    const duration = Math.round(performance.now() - startTime);

    return {
      isBackendConnected: true,
      responseTimeMs: duration,
      healthData: healthRes.data,
      modelInfo: modelRes?.data,
      apiStatus: statusRes?.data,
      timestamp,
    };
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    return {
      isBackendConnected: false,
      responseTimeMs: duration,
      errorMessage: error instanceof Error ? error.message : 'Backend offline',
      timestamp,
    };
  }
};
