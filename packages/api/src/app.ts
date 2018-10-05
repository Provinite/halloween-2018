import * as Koa from "koa";
import "reflect-metadata";
import { install } from "source-map-support";
import { HalloweenAppDevRunner } from "./HalloweenAppDevRunner";
install();
const runner: HalloweenAppDevRunner = new HalloweenAppDevRunner();
runner.run();
