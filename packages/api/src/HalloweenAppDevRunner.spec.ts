import * as Koa from "koa";
import { HalloweenAppDevRunner } from "./HalloweenAppDevRunner";
import { ExportPathScanner } from "./reflection/ExportPathScanner";

jest.mock("koa");
jest.mock("./reflection/ExportPathScanner");
describe.skip("HalloweenAppDevRunner", function() {
  let webserver: Koa;
  let runner: HalloweenAppDevRunner;

  beforeEach(function() {
    const mockScan = ExportPathScanner.scan as jest.Mock;
    mockScan.mockResolvedValue([]);
    process.env.PORT = "3000";
    webserver = new Koa();
    runner = new HalloweenAppDevRunner();
    runner.run();
  });

  afterEach(function() {
    webserver = null;
    runner = null;
  });

  it("listens on process.env.PORT", function() {
    expect(webserver.listen).toHaveBeenCalledTimes(1);
    expect(webserver.listen).toHaveBeenCalledWith(process.env.PORT);
  });

  it("registers a middleware", function() {
    expect(webserver.use).toHaveBeenCalled();
  });
});
