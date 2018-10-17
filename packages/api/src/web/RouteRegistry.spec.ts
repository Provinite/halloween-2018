import { RouteTransformationService } from "../config/RouteTransformationService";
import { HttpMethod } from "../HttpMethod";
import { RouteRegistry } from "./RouteRegistry";

describe("service:RouteRegistry", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("method:registerRoute", () => {
    let routeRegistry: RouteRegistry;
    beforeEach(() => {
      const routeTransformationService = new RouteTransformationService();
      routeRegistry = new RouteRegistry(routeTransformationService);
    });
    it("returns this", () => {
      const result = routeRegistry.registerRoute(
        "/foo/bar",
        HttpMethod.GET,
        null
      );
      expect(result).toBe(routeRegistry);
    });
  });
  describe("writing & reading", () => {
    let routeRegistry: RouteRegistry;
    let insertedResolver: any;
    const method: HttpMethod = HttpMethod.GET;
    beforeEach(() => {
      const routeTransformationService = new RouteTransformationService();
      routeRegistry = new RouteRegistry(routeTransformationService);
      insertedResolver = {};
    });
    it("returns the same resolver inserted on exact match", () => {
      routeRegistry.registerRoute("/foo/bar", method, insertedResolver);
      const { resolver: returnedResolver } = routeRegistry.lookupRoute(
        "/foo/bar",
        method
      );
      expect(returnedResolver).toBe(insertedResolver);
    });
    it("works for wildcard routes", () => {
      routeRegistry.registerRoute("/{foo}/", method, insertedResolver);
      const { resolver } = routeRegistry.lookupRoute("/bar/", method);
      expect(resolver).toBe(insertedResolver);
    });
    describe("method:lookupRoute", () => {
      it("properly extracts path variables", () => {
        routeRegistry.registerRoute(
          "/{user}/{action}",
          method,
          insertedResolver
        );
        const { pathVariables, error } = routeRegistry.lookupRoute(
          "/username/delete",
          method
        );
        expect(error).toBeUndefined();
        expect(pathVariables).toEqual({
          user: "username",
          action: "delete"
        });
      });
      it("returns the ROUTE_NOT_SUPPORTED error appropriately", () => {
        const { error } = routeRegistry.lookupRoute("/foo", method);
        expect(error).toBe("ROUTE_NOT_SUPPORTED");
      });
      it("returns the METHOD_NOT_SUPPORTED error appropriately", () => {
        routeRegistry.registerRoute(
          "/foo",
          [HttpMethod.DELETE, HttpMethod.GET],
          {} as any
        );
        const { error } = routeRegistry.lookupRoute("/foo", HttpMethod.POST);
        expect(error).toBe("METHOD_NOT_SUPPORTED");
      });
      it("returns an allow array with METHOD_NOT_SUPPORTED", () => {
        routeRegistry.registerRoute(
          "/foo",
          [HttpMethod.GET, HttpMethod.DELETE],
          {} as any
        );
        const { error, allow } = routeRegistry.lookupRoute(
          "/foo",
          HttpMethod.POST
        );
        expect(allow.sort()).toEqual([HttpMethod.DELETE, HttpMethod.GET]);
      });
    });

    describe("method:registerRoute", () => {
      it("overwrites existing registrations", () => {
        routeRegistry.registerRoute("/", method, {} as any);
        routeRegistry.registerRoute("/", method, insertedResolver);
        const { resolver } = routeRegistry.lookupRoute("/", method);
        expect(resolver).toBe(insertedResolver);
      });
    });
  });
});
