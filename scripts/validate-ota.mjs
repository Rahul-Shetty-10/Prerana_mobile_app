import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

const app = readJson("app.json").expo;
const eas = readJson("eas.json");
const packageJson = readJson("package.json");
const failures = [];
const projectId = app?.extra?.eas?.projectId;
const expectedUpdatesUrl = projectId ? `https://u.expo.dev/${projectId}` : "";

if (!packageJson.dependencies?.["expo-updates"]?.startsWith("~57.")) {
  failures.push("expo-updates must be installed at an Expo SDK 57-compatible version");
}

if (app?.updates?.url !== expectedUpdatesUrl) {
  failures.push(`updates.url must be ${expectedUpdatesUrl}`);
}

if (app?.runtimeVersion?.policy !== "fingerprint") {
  failures.push("runtimeVersion.policy must be fingerprint");
}

for (const [profile, expectedChannel] of [
  ["development", "development"],
  ["preview", "preview"],
  ["apk", "apk"],
  ["production", "production"],
]) {
  if (eas.build?.[profile]?.channel !== expectedChannel) {
    failures.push(`EAS build.${profile}.channel must be ${expectedChannel}`);
  }
}

if (failures.length > 0) {
  console.error("OTA configuration is invalid:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("OTA configuration passed validation.");
