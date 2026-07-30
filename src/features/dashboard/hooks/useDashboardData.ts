import { useCallback, useEffect, useState } from "react";
import { DashboardDataPayload, fetchDashboardData } from "../services";
import {
  MOCK_FOCUS_NOW,
  MOCK_PERFORMANCE,
  MOCK_QUICK_ROUTES,
  MOCK_SIGNALS,
  MOCK_STATS_DATA,
  MOCK_STUDENT,
  MOCK_WELCOME_DATA,
} from "../constants";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useDashboardData(getToken?: GetToken) {
  const [data, setData] = useState<DashboardDataPayload>({
    student: MOCK_STUDENT,
    welcomeCard: MOCK_WELCOME_DATA,
    stats: MOCK_STATS_DATA,
    focusNow: MOCK_FOCUS_NOW,
    performance: MOCK_PERFORMANCE,
    signals: MOCK_SIGNALS,
    quickRoutes: MOCK_QUICK_ROUTES,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!getToken) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardData(getToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refresh: loadData,
  };
}
