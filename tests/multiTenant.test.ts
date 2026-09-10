import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  InvalidMobileSessionError,
  isValidStoredSession,
  normalizeBackendSession,
} from "../src/shared/session/sessionValidation.ts";
import { resolveTenantHeader, shouldInvalidateSession } from "../src/api/mobileApiPolicy.ts";
import { getStorageKeyForIdentity } from "../src/shared/services/storageScope.ts";

const tenantA = {
  userId: "user_a",
  tenantId: "tenant_a",
  tenantSlug: "school-alpha",
  tenantName: "School Alpha",
  membershipId: "membership_a",
  role: "student",
};

const tenantB = {
  userId: "user_b",
  tenantId: "tenant_b",
  tenantSlug: "school-beta",
  tenantName: "School Beta",
  membershipId: "membership_b",
  role: "student",
};

test("Tenant A and Tenant B sessions remain distinct", () => {
  const a = normalizeBackendSession(tenantA, "user_a");
  const b = normalizeBackendSession(tenantB, "user_b");
  assert.equal(a.tenantSlug, "school-alpha");
  assert.equal(b.tenantSlug, "school-beta");
  assert.notEqual(getStorageKeyForIdentity("@learning", a.userId, a.tenantId), getStorageKeyForIdentity("@learning", b.userId, b.tenantId));
});

test("missing, invalid, or non-student memberships fail closed", () => {
  for (const payload of [
    {},
    { ...tenantA, tenantSlug: "" },
    { ...tenantA, role: "teacher" },
    { ...tenantA, membershipId: "" },
    { ...tenantA, membershipStatus: "revoked" },
  ]) {
    assert.throws(() => normalizeBackendSession(payload, "user_a"), InvalidMobileSessionError);
  }
});

test("a backend-provided seed/test slug is accepted when its membership is valid", () => {
  const session = normalizeBackendSession(
    { ...tenantA, tenantSlug: "seed-tenant-alpha" },
    "user_a",
  );
  assert.equal(session.tenantSlug, "seed-tenant-alpha");
});

test("multiple memberships are rejected instead of silently selected", () => {
  assert.throws(
    () => normalizeBackendSession({ memberships: [tenantA, tenantB] }, "user_a"),
    /Multiple tenant memberships/,
  );
});

test("a cached session for another Clerk user is invalid", () => {
  assert.equal(isValidStoredSession(tenantA, "user_b"), false);
  assert.equal(isValidStoredSession(tenantA, "user_a"), true);
});

test("session endpoint never receives a tenant header", () => {
  assert.equal(resolveTenantHeader("/session", null), null);
  assert.equal(resolveTenantHeader("/session?refresh=1", "school-alpha"), null);
});

test("tenant-scoped requests require an active validated tenant", () => {
  assert.throws(() => resolveTenantHeader("/student/profile", null), /active backend-validated tenant/);
  assert.equal(resolveTenantHeader("/student/profile", "school-alpha"), "school-alpha");
});

test("401 and 403 invalidate the local session; other statuses do not", () => {
  assert.equal(shouldInvalidateSession(401), true);
  assert.equal(shouldInvalidateSession(403), true);
  assert.equal(shouldInvalidateSession(404), false);
  assert.equal(shouldInvalidateSession(500), false);
});

test("sign-out/login storage scopes cannot collide", () => {
  const firstLogin = getStorageKeyForIdentity("@attempts", "user_a", "tenant_a");
  const secondLogin = getStorageKeyForIdentity("@attempts", "user_b", "tenant_b");
  assert.notEqual(firstLogin, secondLogin);
  assert.match(firstLogin, /user_a.*tenant_a/);
  assert.match(secondLogin, /user_b.*tenant_b/);
});

test("the mobile request surface has no fixed tenant override", () => {
  const root = process.cwd();
  const requestFiles = [
    "src/api/mobileApi.ts",
    "src/features/exercise/services/exerciseService.ts",
    "src/features/subjects/viewers/MindmapViewer.tsx",
    "src/features/subjects/viewers/ImageViewer.tsx",
    "src/features/subjects/viewers/PDFViewer.tsx",
    "src/features/subjects/viewers/SlideDeckViewer.tsx",
    "src/features/subjects/viewers/AudioViewer.tsx",
  ];
  const source = requestFiles.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
  assert.doesNotMatch(source, /appConfig\.tenantSlug/);
  assert.doesNotMatch(source, /seed-tenant-alpha/);
  assert.match(source, /getRequiredTenantSlug|resolveTenantHeader|getTenantAuthHeaders/);
});
