import fs from "node:fs";
import path from "node:path";

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    const value = match[2].replace(/^("|')(.*)\1$/, "$2");
    process.env[match[1]] = value;
  }
}

loadLocalEnv();

const isProductionBuild =
  process.env.EAS_BUILD_PROFILE === "production" ||
  process.env.RELEASE_VALIDATION === "1" ||
  process.env.npm_lifecycle_event === "release:validate";

if (!isProductionBuild) {
  console.log("Release config validation skipped outside a production build.");
  process.exit(0);
}

const required = [
  "EXPO_PUBLIC_API_BASE_URL",
  "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "EXPO_PUBLIC_PRIVACY_POLICY_URL",
  "EXPO_PUBLIC_TERMS_URL",
  "EXPO_PUBLIC_ACCOUNT_DELETION_URL",
  "EXPO_PUBLIC_PRIVACY_EMAIL",
  "EXPO_PUBLIC_SUPPORT_EMAIL",
];

const missing = required.filter((name) => !process.env[name]?.trim());
const failures = [...missing.map((name) => `${name} is missing`)];
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || "";
const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || "";
const legalUrls = [
  ["EXPO_PUBLIC_PRIVACY_POLICY_URL", process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim() || ""],
  ["EXPO_PUBLIC_TERMS_URL", process.env.EXPO_PUBLIC_TERMS_URL?.trim() || ""],
  ["EXPO_PUBLIC_ACCOUNT_DELETION_URL", process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL?.trim() || ""],
];

if (apiBaseUrl) {
  try {
    const url = new URL(apiBaseUrl);
    if (url.protocol !== "https:") failures.push("EXPO_PUBLIC_API_BASE_URL must use HTTPS");
    if (/^(localhost|127(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|10(?:\.\d{1,3}){3})$/i.test(url.hostname)) {
      failures.push("EXPO_PUBLIC_API_BASE_URL points to a local/private host");
    }
  } catch {
    failures.push("EXPO_PUBLIC_API_BASE_URL is not a valid URL");
  }
}

if (clerkKey && !clerkKey.startsWith("pk_live_")) {
  failures.push("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY must be a live Clerk key for production");
}

if (process.env.EXPO_PUBLIC_TENANT_SLUG?.trim()) {
  failures.push("EXPO_PUBLIC_TENANT_SLUG must be unset; tenant selection is backend-driven");
}

for (const [name, value] of legalUrls) {
  if (!value) continue;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") failures.push(`${name} must use HTTPS`);
  } catch {
    failures.push(`${name} is not a valid URL`);
  }
}

if (legalUrls[0][1] && legalUrls[2][1] && legalUrls[0][1] === legalUrls[2][1]) {
  failures.push("EXPO_PUBLIC_ACCOUNT_DELETION_URL must be a dedicated deletion workflow, not the privacy-policy URL");
}

for (const name of ["EXPO_PUBLIC_PRIVACY_EMAIL", "EXPO_PUBLIC_SUPPORT_EMAIL"]) {
  const value = process.env[name]?.trim() || "";
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    failures.push(`${name} is not a valid email address`);
  }
}

if (failures.length > 0) {
  console.error("Production release configuration is invalid:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Production release configuration passed validation.");
