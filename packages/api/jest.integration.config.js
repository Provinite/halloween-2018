module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest"
  },
  testRegex: "src/.*?.ispec.ts$",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  setupFilesAfterEnv: [
    "<rootDir>/src/test/AwilixMocks.ts",
    "<rootDir>/src/test/integrationSetup.ts"
  ]
};
