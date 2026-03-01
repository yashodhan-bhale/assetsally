module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-modules-core|react-navigation|@react-navigation|@assetsally/shared|expo-router|@nozbe/watermelondb))",
  ],
  cacheDirectory: ".jest/cache",
  maxWorkers: "50%",
  testTimeout: 30000,
};
