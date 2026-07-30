const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("csv");
config.resolver.assetExts.push("pdf");
config.resolver.assetExts.push("xlsx");
config.resolver.assetExts.push("m4a");

// Disable package exports to bypass the Metro explicit extension resolution bug
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
