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
  const dashStartTime = Date.now();
  console.log("[PERF][DASHBOARD] GET /student/dashboard started");
  try {
    const rawData = await mobileApi<DashboardApiResponse>("/student/dashboard", {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });
    const elapsed = Date.now() - dashStartTime;
    console.log(`[PERF][DASHBOARD] GET /student/dashboard completed: ${elapsed}ms`);
    console.log("[PERF][DASHBOARD] status=200");

    if (!rawData) {
      throw new DashboardError('EMPTY_DATA', 'No data returned from the server');
    }

    let realSubjects: string[] = [];
    try {
      const rawSnapshot = await mobileApi<any>("/student/learning-snapshot", {
        getToken,
        tenantSlug: appConfig.tenantSlug,
      });
      if (rawSnapshot) {
        let subjects: any[] = [];
        if (rawSnapshot.snapshot && Array.isArray(rawSnapshot.snapshot.subjects)) {
          subjects = rawSnapshot.snapshot.subjects;
        } else if (Array.isArray(rawSnapshot.subjects)) {
          subjects = rawSnapshot.subjects;
        } else if (rawSnapshot.snapshot && Array.isArray(rawSnapshot.snapshot)) {
          subjects = rawSnapshot.snapshot;
        }
        if (subjects.length > 0) {
          realSubjects = subjects.map((s: any) => s.subjectName || s.name || "").filter(Boolean);
        }
      }
    } catch (e) {
      console.warn("[DASHBOARD] Could not fetch real subjects list for dashboard:", e);
    }

    const welcomeCardSubjects = realSubjects.length > 0
      ? realSubjects
      : (rawData.welcomeCard?.subjects ?? []);

    return {
      student: {
        userName: rawData.student?.userName || "",
        greeting: rawData.student?.greeting || "",
        notificationCount: rawData.student?.notificationCount ?? 0,
        avatarUrl: rawData.student?.avatarUrl,
      },
      welcomeCard: {
        badgeText: rawData.welcomeCard?.badgeText || "STUDENT DASHBOARD",
        title: rawData.welcomeCard?.title || (rawData.student?.userName ? `Welcome Back, ${rawData.student.userName}!` : "Welcome Back!"),
        description: rawData.welcomeCard?.description || "Ready to excel in your exams? Pick up where you left off or dive into targeted study modules.",
        subjects: welcomeCardSubjects,
        selectedSubject: rawData.welcomeCard?.selectedSubject || welcomeCardSubjects[0] || "",
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
