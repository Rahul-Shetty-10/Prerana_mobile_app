const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("csv");
config.resolver.assetExts.push("pdf");
config.resolver.assetExts.push("xlsx");
config.resolver.assetExts.push("m4a");

// Clerk Core 3 publishes package subpath exports (for example @clerk/react/internal).
// Keep Metro package exports enabled so those modules resolve in native release bundles.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
