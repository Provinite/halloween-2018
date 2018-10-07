import {
  asFunction,
  asValue,
  AwilixContainer,
  AwilixResolutionError,
  InjectionMode
} from "awilix";
import { Context, Middleware } from "koa";
import { asClassMethod } from "../AwilixHelpers";
import { IRouter } from "../reflection/IRouterClass";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";
interface IRouteHandler {
  methodName?: string;
  invokeOn?: IRouter;
  fn?: (...args: any[]) => any;
}
export interface IRouteMap {
  [route: string]: IRouteHandler;
}

export function classMethodHandler(
  instance: any,
  method: (...args: any[]) => any
): IRouteHandler {
  return {
    methodName: method.name,
    invokeOn: instance,
    fn: method
  };
}
export class RouterMiddlewareFactory implements IMiddlewareFactory {
  private handlers: IRouteMap;
  private container: AwilixContainer;
  constructor(handlers: IRouteMap, container: AwilixContainer) {
    this.handlers = handlers;
    this.container = container;
  }
  create(): Middleware {
    return async (ctx: Context, next: INextCallback) => {
      const path: string = ctx.path;
      // Create a request-scoped DI container
      // this is a good start, but we should elevate this
      // that way we can have other middlewares interact with the container
      // for example, we'll probably want a security middleware that can
      // provide user information to the container.
      const requestContainer: AwilixContainer = this.container.createScope();

      // Register the koa context to the request-scoped DI container
      requestContainer.register("ctx", asValue(ctx));
      if (this.handlers[path]) {
        const { invokeOn: instance, fn: method } = this.handlers[path];
        ctx.state.result = await requestContainer.build(
          asClassMethod(instance, method)
        );
      }
      await next();
    };
  }
}
