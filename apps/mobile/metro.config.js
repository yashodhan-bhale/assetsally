const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Find the project and workspace roaring
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// 3. Force Metro to resolve (and quickly skip) certain directories
config.resolver.blockList = [
  /.*\/apps\/web\/.*/,
  /.*\/apps\/api\/.*/,
  /.*\/dist\/.*/,
];

module.exports = config;
