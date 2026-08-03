import { useCallback, useEffect, useState } from "react";
import { DashboardDataPayload, fetchDashboardData, DashboardError } from "../services";

const DEFAULT_EMPTY_DATA: DashboardDataPayload = {
  student: {
    userName: "",
    greeting: "",
    notificationCount: 0,
    avatarUrl: undefined,
  },
  welcomeCard: {
    badgeText: "",
    title: "",
    description: "",
    subjects: [],
    selectedSubject: "",
  },
  stats: [],
  focusNow: {
    nextChapter: undefined,
    libraryStatus: undefined,
  },
  performance: {
    overallAccuracy: 0,
    masteryLevel: "",
    subjectsPerformance: [],
  },
  signals: [],
  quickRoutes: [],
};

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useDashboardData(getToken?: GetToken) {
  const [data, setData] = useState<DashboardDataPayload>(DEFAULT_EMPTY_DATA);
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
      console.error("[SUBJECTS][DASHBOARD] loadData hook caught error:", err);
      if (err instanceof DashboardError) {
        if (err.code === 'NETWORK_FAILURE') {
          setError("Network connection issue. Please check your connection and retry.");
        } else if (err.code === 'UNAUTHORIZED') {
          setError("Session expired. Please sign in again.");
        } else {
          setError("Failed to load dashboard data. Please check your connection and try again.");
        }
      } else {
        setError("Failed to load dashboard data. Please check your connection and try again.");
      }
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
