import "reflect-metadata";
import { install } from "source-map-support";
import { HalloweenAppDevRunner } from "./HalloweenAppDevRunner";
install();
const runner = new HalloweenAppDevRunner();
// tslint:disable-next-line: no-floating-promises
runner.run();
