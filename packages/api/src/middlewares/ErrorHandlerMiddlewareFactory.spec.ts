import { Context, Middleware } from "koa";
import { AuthenticationFailureException } from "../auth/AuthenticationFailureException";
import { HttpMethod } from "../HttpMethod";
import { MethodNotSupportedError } from "../web/MethodNotSupportedError";
import { ResourceNotFoundError } from "../web/ResourceNotFoundError";
import { UnknownMethodError } from "../web/UnknownMethodError";
import { UnknownRouteError } from "../web/UnknownRouteError";
import { ErrorHandlerMiddlewareFactory } from "./ErrorHandlerMiddlewareFactory";

describe("ErrorHandlerMiddlewareFactory", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe("create() middleware", () => {
    let middleware: Middleware;
    let mockContext: jest.Mocked<Context>;
    beforeEach(() => {
      middleware = new ErrorHandlerMiddlewareFactory().create();
      mockContext = {
        state: {},
        set: jest.fn(),
        method: "GET"
      } as any;
    });
    it.each([
      [AuthenticationFailureException, 400, []],
      [UnknownRouteError, 404, []],
      [ResourceNotFoundError, 404, []],
      [UnknownMethodError, 501, []],
      [MethodNotSupportedError, 405, [[]]],
      [Error, 500, []]
    ])("transforms %p -> HTTP %i", async (clazz, code, errorArgs) => {
      await middleware(mockContext, mockThrow(clazz, ...errorArgs));
      expect(mockContext.status).toEqual(code);
    });
    it("sets the allow header for MethodNotSupportedErrors", async () => {
      const err = new MethodNotSupportedError([
        HttpMethod.GET,
        HttpMethod.POST
      ]);
      await middleware(mockContext, () => {
        throw err;
      });
      expect(mockContext.set).toHaveBeenCalledWith("Allow", "GET, POST");
      expect(mockContext.status).toEqual(405);
    });
    it("sets the response status to 200 for OPTIONS requests that throw MethodNotSupported errors", async () => {
      mockContext.method = "OPTIONS" as any;
      const err = new MethodNotSupportedError([
        HttpMethod.GET,
        HttpMethod.POST
      ]);
      await middleware(mockContext, () => {
        throw err;
      });
      expect(mockContext.status).toEqual(200);
      expect(mockContext.set).toHaveBeenCalledWith("Allow", "GET, POST");
    });
  });
});

/**
 * Create a jest mock function that throws a new instance of the specified class.
 */
function mockThrow<T extends Error>(
  clazz: new (...args: any[]) => T,
  ...args: any[]
) {
  return jest.fn().mockImplementation(() => {
    throw new clazz(...args);
  });
}
