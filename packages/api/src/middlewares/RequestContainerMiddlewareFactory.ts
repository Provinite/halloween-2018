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
 * @configures query - The query string object for a request.
 * @configures {Context} ctx - The Koa request context.
 * @configures {AwilixContainer} container - Overwrites the "container' registry
 *  from the parent scope with a request-scoped container.
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
    requestContainer.register("query", asValue(ctx.request.query));
    this.requestParsingService.parse(ctx, requestContainer);

    ctx.state.requestContainer = requestContainer;
    await next();
  };
}

declare global {
  interface RequestContext {
    ctx: Context;
    query: any;
  }
}
