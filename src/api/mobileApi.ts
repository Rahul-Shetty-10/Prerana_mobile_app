import { appConfig } from "../config";
import { getMobileSession } from "../shared/session/sessionStore";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

type MobileApiOptions = {
  getToken: GetToken;
  tenantSlug?: string | null;
};

type MobileApiSuccess<TData> = {
  ok: true;
  data: TData;
};

type MobileApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type MobileApiResponse<TData> = MobileApiSuccess<TData> | MobileApiFailure;

export type MobileSessionData = {
  viewer: unknown;
  tenantId: string | null;
  tenantSlug: string | null;
  membershipId: string | null;
  role: string | null;
};

export async function mobileApi<TData>(path: string, options: MobileApiOptions): Promise<TData> {
  const startTime = Date.now();
  console.log(`[MOBILE_API] Start request: ${path}`);
  console.log("[PERF][AUTH] getToken started");
  
  let token: string | null = null;
  try {
    const tokenPromise = options.getToken({ template: "convex" });
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Clerk token retrieval timed out")), 10000)
    );
    token = await Promise.race([tokenPromise, timeoutPromise]);
    const getTokenDuration = Date.now() - startTime;
    console.log(`[PERF][AUTH] getToken completed: ${getTokenDuration}ms`);
    console.log(`[MOBILE_API] GetToken completed in ${getTokenDuration}ms. Token length: ${token?.length || 0}`);
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`[MOBILE_API] GetToken failed or timed out in ${duration}ms:`, err?.message || err);
    console.warn(`\n[API][ERROR]\nendpoint=${path}\nmethod=GET_TOKEN\nstatus=TIMEOUT_OR_FAILED\nduration=${duration}ms\nerror=${err?.message || String(err)}\n`);
    throw err;
  }

  if (!token) {
    const duration = Date.now() - startTime;
    console.warn(`\n[API][ERROR]\nendpoint=${path}\nmethod=GET_TOKEN\nstatus=MISSING_TOKEN\nduration=${duration}ms\nerror=Unable to get Clerk token. Check sign-in and JWT template.\n`);
    throw new Error("Unable to get Clerk token. Check sign-in and JWT template.");
  }

  const fetchStartTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`[MOBILE_API] Request to ${path} timed out after 10s. Aborting.`);
    controller.abort();
  }, 10000); // 10 seconds timeout

  const resolvedTenantSlug =
    options.tenantSlug !== undefined
      ? options.tenantSlug
      : getMobileSession()?.tenantSlug;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  if (resolvedTenantSlug) {
    headers["X-Tenant-Slug"] = resolvedTenantSlug;
  }

  try {
    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const duration = Date.now() - fetchStartTime;
    console.log(`[MOBILE_API] Fetch completed in ${duration}ms. Status: ${response.status}`);

    let payload: MobileApiResponse<TData> | null = null;
    try {
      payload = (await response.json()) as MobileApiResponse<TData>;
    } catch {
      throw new Error(`Server returned an invalid response (HTTP ${response.status}).`);
    }

    if (!response.ok || !payload.ok) {
      const errMsg = payload.ok ? "Request failed." : payload.error.message;
      console.warn(`\n[API][ERROR]\nendpoint=${path}\nmethod=GET\nstatus=${response.status}\nduration=${duration}ms\nerror=${errMsg}\n`);
      throw new Error(errMsg);
    }

    return payload.data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    const duration = Date.now() - fetchStartTime;
    console.error(`[MOBILE_API] Request to ${path} failed/aborted in ${duration}ms:`, err?.message || err);
    console.warn(`\n[API][ERROR]\nendpoint=${path}\nmethod=GET\nstatus=FAILED\nduration=${duration}ms\nerror=${err?.message || String(err)}\n`);
    throw err;
  }
}
