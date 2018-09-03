import * as Koa from "koa";
import { HalloweenAppDevRunner } from "./HalloweenAppDevRunner";
jest.mock("koa");

describe("HalloweenAppDevRunner", function() {
  let webserver: Koa;
  let runner: HalloweenAppDevRunner;

  beforeEach(function() {
    jest.resetAllMocks();
    webserver = new Koa();
    runner = new HalloweenAppDevRunner(webserver);
    runner.run();
  });

  afterEach(function() {
    webserver = null;
    runner = null;
  });

  it("listens on 8081", function() {
    expect(webserver.listen).toHaveBeenCalledTimes(1);
    expect(webserver.listen).toHaveBeenCalledWith(8081);
  });

  it("registers a middleware", function() {
    expect(webserver.use).toHaveBeenCalledTimes(1);
  });
});
