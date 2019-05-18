import "reflect-metadata";
import { HalloweenAppDevRunner } from "../HalloweenAppDevRunner";
require("../reflection/Symbols");
const runner: HalloweenAppDevRunner = new HalloweenAppDevRunner();
let teardown: any;
const p = runner.run();
beforeAll(async () => {
  // tslint:disable-next-line: no-floating-promises
  teardown = (await p).teardown;
});
afterAll(async () => {
  return await teardown();
});
