import supertest = require("supertest");

export function testApi() {
  return supertest(global.testAppInstance.context.webserver);
}
