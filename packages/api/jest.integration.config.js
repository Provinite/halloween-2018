module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest"
  },
  testRegex: "src/.*?.ispec.ts$",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  setupFiles: ["<rootDir>/src/test/integrationPresetup.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/test/integrationSetup.ts"]
};
