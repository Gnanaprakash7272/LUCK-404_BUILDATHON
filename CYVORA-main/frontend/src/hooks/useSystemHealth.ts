import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth, HealthCheckResult } from '../services/healthService';
import { API_CONFIG } from '../config/api';

export const useSystemHealth = (pollIntervalMs: number = API_CONFIG.POLL_INTERVAL_MS) => {
  const [healthResult, setHealthResult] = useState<HealthCheckResult>({
    isBackendConnected: false,
    responseTimeMs: 0,
    timestamp: new Date().toLocaleTimeString(),
  });
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const check = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await checkBackendHealth();
      setHealthResult(result);
    } catch (err) {
      console.error('Failed health check:', err);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, pollIntervalMs);
    return () => clearInterval(interval);
  }, [check, pollIntervalMs]);

  return {
    ...healthResult,
    isChecking,
    refetch: check,
  };
};
