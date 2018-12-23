import { Context, Middleware } from "koa";
import { AuthenticationFailureException } from "../auth/AuthenticationFailureException";
import { MethodNotSupportedError } from "../web/MethodNotSupportedError";
import { ResourceNotFoundError } from "../web/ResourceNotFoundError";
import { UnknownMethodError } from "../web/UnknownMethodError";
import { UnknownRouteError } from "../web/UnknownRouteError";
import { ErrorHandlerMiddlewareFactory } from "./ErrorHandlerMiddlewareFactory";

describe("ErrorHandlerMiddlewareFactory", () => {
  describe("create() middleware", () => {
    let middleware: Middleware;
    let mockContext: jest.Mocked<Context>;
    beforeEach(() => {
      middleware = new ErrorHandlerMiddlewareFactory().create();
      mockContext = {
        state: {}
      } as any;
    });
    it.each([
      [AuthenticationFailureException, 400],
      [UnknownRouteError, 404],
      [ResourceNotFoundError, 404],
      [UnknownMethodError, 501],
      [MethodNotSupportedError, 405],
      [Error, 500]
    ])("transforms %p -> HTTP %i", async (clazz, code) => {
      await middleware(mockContext, mockThrow(clazz));
      expect(mockContext.status).toEqual(code);
    });
  });
});

/**
 * Create a jest mock function that throws a new instance of the specified class.
 */
function mockThrow<T extends Error>(clazz: new () => T) {
  return jest.fn().mockImplementation(() => {
    throw new clazz();
  });
}
