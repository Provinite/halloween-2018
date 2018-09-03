module.exports = {
  "automock": false,
  "testEnvironment": "node",
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "moduleFileExtensions": [
    "ts",
    "js",
    "json",
    "node"
  ]
};
