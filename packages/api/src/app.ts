import * as Koa from "koa";
import "reflect-metadata";
import { HalloweenAppDevRunner } from "./HalloweenAppDevRunner";
const runner: HalloweenAppDevRunner = new HalloweenAppDevRunner(new Koa());
runner.run();
