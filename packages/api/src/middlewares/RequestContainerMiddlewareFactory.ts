import { asValue } from "awilix";
import { Context } from "koa";
import {
  ApplicationContainer,
  ApplicationContext
} from "../config/context/ApplicationContext";
import { RequestContainer } from "../config/context/RequestContext";
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
  private requestParsingService: RequestParsingService;
  private container: ApplicationContainer;
  /** @inject */
  constructor({ container, requestParsingService }: ApplicationContext) {
    this.container = container;
    this.requestParsingService = requestParsingService;
  }
  create = () => async (ctx: Context, next: INextCallback) => {
    const requestContainer = this.container.createScope<RequestContainer>();
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
  interface RequestContextMembers {
    container: RequestContainer;
    ctx: Context;
    query: any;
  }
}
