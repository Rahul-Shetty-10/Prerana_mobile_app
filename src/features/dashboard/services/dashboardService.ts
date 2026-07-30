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
import {
  MOCK_FOCUS_NOW,
  MOCK_PERFORMANCE,
  MOCK_QUICK_ROUTES,
  MOCK_SIGNALS,
  MOCK_STATS_DATA,
  MOCK_STUDENT,
  MOCK_WELCOME_DATA,
} from "../constants";

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
      return {
        student: MOCK_STUDENT,
        welcomeCard: MOCK_WELCOME_DATA,
        stats: MOCK_STATS_DATA,
        focusNow: MOCK_FOCUS_NOW,
        performance: MOCK_PERFORMANCE,
        signals: MOCK_SIGNALS,
        quickRoutes: MOCK_QUICK_ROUTES,
      };
    }

    return {
      student: {
        userName: rawData.student?.userName || MOCK_STUDENT.userName,
        greeting: rawData.student?.greeting || MOCK_STUDENT.greeting,
        notificationCount: rawData.student?.notificationCount ?? MOCK_STUDENT.notificationCount,
        avatarUrl: rawData.student?.avatarUrl || MOCK_STUDENT.avatarUrl,
      },
      welcomeCard: {
        badgeText: rawData.welcomeCard?.badgeText || MOCK_WELCOME_DATA.badgeText,
        title: rawData.welcomeCard?.title || MOCK_WELCOME_DATA.title,
        description: rawData.welcomeCard?.description || MOCK_WELCOME_DATA.description,
        subjects: rawData.welcomeCard?.subjects || MOCK_WELCOME_DATA.subjects,
        selectedSubject:
          rawData.welcomeCard?.subjects?.[0] || MOCK_WELCOME_DATA.selectedSubject,
      },
      stats: rawData.stats && rawData.stats.length > 0 ? rawData.stats : MOCK_STATS_DATA,
      focusNow: rawData.focusNow || MOCK_FOCUS_NOW,
      performance: rawData.performance || MOCK_PERFORMANCE,
      signals: rawData.signals && rawData.signals.length > 0 ? rawData.signals : MOCK_SIGNALS,
      quickRoutes: rawData.quickRoutes && rawData.quickRoutes.length > 0 ? rawData.quickRoutes : MOCK_QUICK_ROUTES,
    };
  } catch (error) {
    // If API is unauthenticated or offline, gracefully return formatted fallback data
    return {
      student: MOCK_STUDENT,
      welcomeCard: MOCK_WELCOME_DATA,
      stats: MOCK_STATS_DATA,
      focusNow: MOCK_FOCUS_NOW,
      performance: MOCK_PERFORMANCE,
      signals: MOCK_SIGNALS,
      quickRoutes: MOCK_QUICK_ROUTES,
    };
  }
}
