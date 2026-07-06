import { appConfig } from "../config";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

type MobileApiOptions = {
  getToken: GetToken;
  tenantSlug: string;
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
  const token = await options.getToken({ template: "convex" });
  if (!token) {
    throw new Error("Unable to get Clerk token. Check sign-in and JWT template.");
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Tenant-Slug": options.tenantSlug,
    },
  });

  const payload = (await response.json()) as MobileApiResponse<TData>;
  if (!response.ok || !payload.ok) {
    throw new Error(payload.ok ? "Request failed." : payload.error.message);
  }

  return payload.data;
}
