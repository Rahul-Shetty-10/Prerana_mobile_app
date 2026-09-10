export type TenantMembership = {
  membershipId: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: string;
};

export type MobileSession = TenantMembership & {
  userId: string;
};

export class InvalidMobileSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMobileSessionError";
  }
}

function isRecord(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new InvalidMobileSessionError(`Backend session is missing ${field}.`);
  }
  return value.trim();
}

export function normalizeBackendSession(data: unknown, clerkUserId: string): MobileSession {
  if (!clerkUserId.trim() || !isRecord(data)) {
    throw new InvalidMobileSessionError("Backend session response is invalid.");
  }

  const memberships = Array.isArray(data.memberships) ? data.memberships : undefined;
  if (memberships && memberships.length !== 1) {
    throw new InvalidMobileSessionError(
      memberships.length === 0
        ? "No active student membership was found."
        : "Multiple tenant memberships require an explicit tenant-selection flow.",
    );
  }

  const membership = memberships?.[0] && isRecord(memberships[0]) ? memberships[0] : undefined;
  const viewer = isRecord(data.viewer) ? data.viewer : undefined;
  const responseUserId = data.userId ?? data.clerkUserId ?? viewer?.userId ?? viewer?.id;
  if (responseUserId !== undefined && responseUserId !== clerkUserId) {
    throw new InvalidMobileSessionError("Backend session user does not match the signed-in user.");
  }

  const role = requiredString(data.role ?? membership?.role, "student role").toLowerCase();
  if (role !== "student") {
    throw new InvalidMobileSessionError("This account does not have a student membership.");
  }

  const membershipStatus = membership?.status ?? data.membershipStatus;
  if (membershipStatus !== undefined && !["active", "approved"].includes(String(membershipStatus).toLowerCase())) {
    throw new InvalidMobileSessionError("The student membership is not active.");
  }

  const tenantId = requiredString(data.tenantId ?? membership?.tenantId, "tenantId");
  const tenantSlug = requiredString(data.tenantSlug ?? membership?.tenantSlug, "tenantSlug");
  const tenantName = requiredString(data.tenantName ?? membership?.tenantName, "tenantName");
  const membershipId = requiredString(
    data.membershipId ?? membership?.id ?? membership?._id,
    "membershipId",
  );

  return {
    userId: clerkUserId,
    membershipId,
    tenantId,
    tenantSlug,
    tenantName,
    role,
  };
}

export function isValidStoredSession(candidate: unknown, clerkUserId: string): candidate is MobileSession {
  if (!isRecord(candidate) || candidate.userId !== clerkUserId) return false;
  try {
    requiredString(candidate.userId, "userId");
    requiredString(candidate.membershipId, "membershipId");
    requiredString(candidate.tenantId, "tenantId");
    requiredString(candidate.tenantSlug, "tenantSlug");
    requiredString(candidate.tenantName, "tenantName");
    if (candidate.role !== "student") return false;
    return true;
  } catch {
    return false;
  }
}
