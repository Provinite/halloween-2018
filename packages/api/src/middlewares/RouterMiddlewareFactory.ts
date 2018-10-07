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
export interface IRouteHandler {
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

function getRouteRegex(path: string): RegExp {
  const parts = path.split(/\{|\}/g);
  let pattern = "";
  const pathVariables: Array<{ name: string; value: any }> = [];
  for (let i = 0; i < parts.length; i++) {
    const isPathParam = i % 2 === 1;
    if (!isPathParam) {
      pattern += parts[i].replace(/\//g, "\\/");
    } else {
      pattern += "(.*?)";
    }
  }
  return new RegExp(`^${pattern}$`);
}

function getPathVariables(
  path: string
): Array<{ name: string; value: string }> {
  const parts = path.split(/\{|\}/g);
  const pathVariables: Array<{ name: string; value: string }> = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      continue;
    }
    pathVariables.push({
      name: parts[i],
      value: undefined
    });
  }

  return pathVariables;
}

const getHandler = (
  handlers: IRouteMap,
  requestPath: string
): {
  handler: IRouteHandler;
  pathVariables?: Array<{ name: string; value: string }>;
} => {
  // 1. Exact matches first
  if (handlers[requestPath]) {
    return {
      handler: handlers[requestPath]
    };
  }

  // 2. Regex matches otherwise
  for (const path in handlers) {
    if (path.includes("{")) {
      console.log(path);
      const regex = getRouteRegex(path);
      console.log(regex);
      const result = regex.exec(requestPath);
      console.log(result);
      if (!result) {
        continue;
      }

      const pathVariables = getPathVariables(path);
      let j = 0;
      for (const pathVariable of pathVariables) {
        pathVariable.value = result[j + 1];
        j++;
      }
      return { handler: handlers[path], pathVariables };
    }
  }
};
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
      const handler = getHandler(this.handlers, path);
      if (handler) {
        const { invokeOn: instance, fn: method } = handler.handler;
        if (handler.pathVariables) {
          handler.pathVariables.forEach(pathVariable => {
            requestContainer.register(
              pathVariable.name,
              asValue(pathVariable.value)
            );
          });
        }
        ctx.state.result = await requestContainer.build(
          asClassMethod(instance, method)
        );
      }
      await next();
    };
  }
}
