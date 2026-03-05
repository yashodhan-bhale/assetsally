module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/test/setup.ts",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-modules-core|react-navigation|@react-navigation|expo-router|@nozbe/watermelondb))",
  ],
  cacheDirectory: ".jest/cache",
  maxWorkers: "50%",
  testTimeout: 30000,
};
