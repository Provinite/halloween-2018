import { asValue, AwilixContainer } from "awilix";
import { Context } from "koa";
import { Component } from "../reflection/Component";

@Component()
export class RequestParsingService {
  parse(ctx: Context, container: AwilixContainer) {
    container.register("requestBody", asValue(ctx.request.body));
  }
}
