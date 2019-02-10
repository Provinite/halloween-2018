import { asValue, AwilixContainer } from "awilix";
import { Context } from "koa";
import { RequestParsingService } from "../config/RequestParsingService";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";

/**
 * @class RequestContainerMiddlewareFactory
 * @implements IMiddlewareFactory
 * Middlewarefactory for creating a request-scoped container. Attaches
 * the container to ctx.state.requestContainer.
 */
export class RequestContainerMiddlewareFactory implements IMiddlewareFactory {
  constructor(
    private container: AwilixContainer,
    private requestParsingService: RequestParsingService
  ) {}
  create = () => async (ctx: Context, next: INextCallback) => {
    const requestContainer: AwilixContainer = this.container.createScope();
    // register the context
    requestContainer.register("ctx", asValue(ctx));
    requestContainer.register("container", asValue(requestContainer));
    this.requestParsingService.parse(ctx, requestContainer);

    ctx.state.requestContainer = requestContainer;
    await next();
  };
}
