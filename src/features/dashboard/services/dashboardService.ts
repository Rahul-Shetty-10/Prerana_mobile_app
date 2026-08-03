import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import {
  FocusNowProps,
  HeaderProps,
  LatestSignalsProps,
  PerformanceOverviewProps,
  QuickRouteItem,
  StatCardProps,
  WelcomeCardProps,
} from "../types";

export class DashboardError extends Error {
  constructor(public code: 'NETWORK_FAILURE' | 'UNAUTHORIZED' | 'SERVER_ERROR' | 'EMPTY_DATA', message: string) {
    super(message);
    this.name = 'DashboardError';
  }
}

export interface DashboardApiResponse {
  student?: {
    userName?: string;
    greeting?: string;
    notificationCount?: number;
    avatarUrl?: string;
  };
  welcomeCard?: {
    badgeText?: string;
    title?: string;
    description?: string;
    subjects?: string[];
    selectedSubject?: string;
  };
  stats?: StatCardProps[];
  focusNow?: FocusNowProps;
  performance?: PerformanceOverviewProps;
  signals?: LatestSignalsProps["signals"];
  quickRoutes?: QuickRouteItem[];
}

export interface DashboardDataPayload {
  student: HeaderProps;
  welcomeCard: WelcomeCardProps;
  stats: StatCardProps[];
  focusNow: FocusNowProps;
  performance: PerformanceOverviewProps;
  signals: LatestSignalsProps["signals"];
  quickRoutes: QuickRouteItem[];
}

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export async function fetchDashboardData(getToken: GetToken): Promise<DashboardDataPayload> {
  try {
    const rawData = await mobileApi<DashboardApiResponse>("/student/dashboard", {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });

    if (!rawData) {
      throw new DashboardError('EMPTY_DATA', 'No data returned from the server');
    }

    return {
      student: {
        userName: rawData.student?.userName || "",
        greeting: rawData.student?.greeting || "",
        notificationCount: rawData.student?.notificationCount ?? 0,
        avatarUrl: rawData.student?.avatarUrl,
      },
      welcomeCard: {
        badgeText: rawData.welcomeCard?.badgeText || "",
        title: rawData.welcomeCard?.title || "",
        description: rawData.welcomeCard?.description || "",
        subjects: rawData.welcomeCard?.subjects || [],
        selectedSubject: rawData.welcomeCard?.selectedSubject || rawData.welcomeCard?.subjects?.[0] || "",
      },
      stats: rawData.stats || [],
      focusNow: {
        nextChapter: rawData.focusNow?.nextChapter ? {
          subjectName: rawData.focusNow.nextChapter.subjectName || "",
          chapterTitle: rawData.focusNow.nextChapter.chapterTitle || "",
          progressPercentage: rawData.focusNow.nextChapter.progressPercentage ?? 0,
          estimatedMinutes: rawData.focusNow.nextChapter.estimatedMinutes ?? 0,
        } : undefined,
        libraryStatus: rawData.focusNow?.libraryStatus ? {
          savedResourcesCount: rawData.focusNow.libraryStatus.savedResourcesCount ?? 0,
          activeLabsCount: rawData.focusNow.libraryStatus.activeLabsCount ?? 0,
        } : undefined,
      },
      performance: {
        overallAccuracy: rawData.performance?.overallAccuracy ?? 0,
        masteryLevel: rawData.performance?.masteryLevel || "",
        subjectsPerformance: rawData.performance?.subjectsPerformance || [],
      },
      signals: rawData.signals || [],
      quickRoutes: rawData.quickRoutes || [],
    };
  } catch (error) {
    console.error("[SUBJECTS][DASHBOARD] error in fetchDashboardData:", error);
    if (error instanceof DashboardError) {
      throw error;
    }
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("unauthorized") || msg.includes("unauthenticated") || msg.includes("clerk token")) {
        throw new DashboardError('UNAUTHORIZED', error.message);
      } else if (msg.includes("network") || msg.includes("fetch")) {
        throw new DashboardError('NETWORK_FAILURE', error.message);
      } else {
        throw new DashboardError('SERVER_ERROR', error.message);
      }
    }
    throw new DashboardError('SERVER_ERROR', 'Unexpected dashboard service failure');
  }
}
