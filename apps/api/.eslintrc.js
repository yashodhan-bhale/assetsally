module.exports = {
  extends: ["@assetsally/eslint-config/nest"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
};
