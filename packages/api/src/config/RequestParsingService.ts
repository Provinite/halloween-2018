import { asValue, AwilixContainer } from "awilix";
import { Context } from "koa";
import { Component } from "../reflection/Component";

/**
 * Service used for parsing incoming requests into useful data.
 * NOTE: Relies upon the BodyParser middleware coming before it in the chain.
 */
@Component()
export class RequestParsingService {
  /**
   * Parse the current request, and register information to the DI container
   * for consumption by controllers etc.
   * 1. Registers the request body to the container as "requestBody".
   * @param ctx - The Koa context.
   * @param container - The container to register request data to.
   */
  parse(ctx: Context, container: AwilixContainer) {
    container.register("requestBody", asValue(ctx.request.body));
  }
}

declare global {
  interface ApplicationContext {
    /**
     * Service responsible for populating request data into the application
     * context.
     */
    requestParsingService: RequestParsingService;
  }
  interface RequestContext {
    /** Parsed body for this request */
    requestBody: { [key: string]: any };
  }
}
