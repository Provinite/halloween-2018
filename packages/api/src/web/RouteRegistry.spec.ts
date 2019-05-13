import { ApplicationContext } from "../config/context/ApplicationContext";
import { RouteTransformationService } from "../config/RouteTransformationService";
import { HttpMethod } from "../HttpMethod";
import { MethodNotSupportedError } from "./MethodNotSupportedError";
import { RouteRegistry } from "./RouteRegistry";
import { UnknownRouteError } from "./UnknownRouteError";

describe("service:RouteRegistry", () => {
  let context: ApplicationContext = {} as ApplicationContext;
  let routeRegistry: RouteRegistry;

  beforeEach(() => {
    context = {} as any;
    context.routeTransformationService = new RouteTransformationService();
    routeRegistry = new RouteRegistry(context);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("method:registerRoute", () => {
    it("returns this", () => {
      const result = routeRegistry.registerRoute(
        "/foo/bar",
        HttpMethod.GET,
        null,
        null,
        null
      );
      expect(result).toBe(routeRegistry);
    });
  });
  describe("writing & reading", () => {
    let insertedResolver: any;
    const method: HttpMethod = HttpMethod.GET;
    beforeEach(() => {
      insertedResolver = {};
    });
    it("returns the same resolver inserted on exact match", () => {
      routeRegistry.registerRoute(
        "/foo/bar",
        method,
        insertedResolver,
        null,
        null
      );
      const { resolver: returnedResolver } = routeRegistry.lookupRoute(
        "/foo/bar",
        method
      );
      expect(returnedResolver).toBe(insertedResolver);
    });
    it("works for wildcard routes", () => {
      routeRegistry.registerRoute(
        "/{foo}/",
        method,
        insertedResolver,
        null,
        null
      );
      const { resolver } = routeRegistry.lookupRoute("/bar/", method);
      expect(resolver).toBe(insertedResolver);
    });
    describe("method:lookupRoute", () => {
      it("properly extracts path variables", () => {
        routeRegistry.registerRoute(
          "/{user}/{action}",
          method,
          insertedResolver,
          null,
          null
        );
        const { pathVariables } = routeRegistry.lookupRoute(
          "/username/delete",
          method
        );
        expect(pathVariables).toEqual({
          user: "username",
          action: "delete"
        });
      });
      it("throws an UnknownRouteError", () => {
        try {
          routeRegistry.lookupRoute("/foo", method);
          throw new Error("The above line should have thrown.");
        } catch (e) {
          const isExpectedError = e instanceof UnknownRouteError;
          if (!isExpectedError) {
            throw e;
          }
        }
      });
      it("throws a MethodNotSupportedError with an appropriate allow array", () => {
        routeRegistry.registerRoute(
          "/foo",
          [HttpMethod.DELETE, HttpMethod.GET],
          {} as any,
          null,
          ["public"]
        );
        try {
          routeRegistry.lookupRoute("/foo", HttpMethod.POST);
          throw new Error("The above line should have thrown.");
        } catch (e) {
          const isExpectedError = e instanceof MethodNotSupportedError;
          if (isExpectedError) {
            expect(e.allow.sort()).toEqual(
              [HttpMethod.DELETE, HttpMethod.GET].sort()
            );
          } else {
            throw e;
          }
        }
      });
    });

    describe("method:registerRoute", () => {
      it("overwrites existing registrations", () => {
        routeRegistry.registerRoute("/", method, {} as any, null, null);
        routeRegistry.registerRoute("/", method, insertedResolver, null, null);
        const { resolver } = routeRegistry.lookupRoute("/", method);
        expect(resolver).toBe(insertedResolver);
      });
    });
  });
});
