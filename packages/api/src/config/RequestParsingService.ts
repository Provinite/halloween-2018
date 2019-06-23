import { asValue } from "awilix";
import { Context } from "koa";
import { Component } from "../reflection/Component";
import { ContextContainer } from "./context/ApplicationContext";
import { RequestContext } from "./context/RequestContext";

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
  parse<T extends Pick<RequestContext, "requestBody">>(
    ctx: Context,
    container: ContextContainer<T>
  ) {
    const body = ctx.request.body as RequestContextMembers["requestBody"];
    container.register("requestBody", asValue(body));
  }
}

declare global {
  interface ApplicationContextMembers {
    /**
     * Service responsible for populating request data into the application
     * context.
     */
    requestParsingService: RequestParsingService;
  }
  interface RequestContextMembers {
    /** Parsed body for this request */
    requestBody: { [key: string]: any };
  }
}
