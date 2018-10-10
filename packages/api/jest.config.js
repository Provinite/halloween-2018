module.exports = {
  "testEnvironment": "node",
  "transform": {
    "^.+\\.ts?$": "ts-jest"
  },
  "testRegex": "src/.*?\.spec\.ts$",
  "moduleFileExtensions": [
    "ts",
    "js",
    "json",
    "node"
  ],
  "setupTestFrameworkScriptFile": "<rootDir>/src/test/AwilixMocks.ts"
};
