module.exports = {
    extends: ["@assetsally/eslint-config/next"],
    parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
    },
};
