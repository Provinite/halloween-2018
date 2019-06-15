/**
 * @file Tests for the integration of the RouteRegistry and RouteTransformationService
 * components.
 */
import { RoleLiteral } from "../auth/RoleLiteral";
import { ApplicationContext } from "../config/context/ApplicationContext";
import { RouteTransformationService } from "../config/RouteTransformationService";
import { HttpMethod } from "../HttpMethod";
import { createSafeContext } from "../test/testUtils";
import { MethodNotSupportedError } from "./MethodNotSupportedError";
import { RouteRegistry } from "./RouteRegistry";
import { UnknownRouteError } from "./UnknownRouteError";

describe("RouteRegistry", () => {
  let context: Pick<ApplicationContext, "routeTransformationService">;
  let registry: RouteRegistry;
  beforeEach(() => {
    context = createSafeContext<typeof context>({
      routeTransformationService: new RouteTransformationService()
    });
    registry = new RouteRegistry(context as ApplicationContext);
  });
  describe("construction", () => {
    it("doesn't blow up", () => {
      const registry = new RouteRegistry(context as ApplicationContext);
      expect(registry).toBeInstanceOf(RouteRegistry);
    });
  });

  describe("reading & writing", () => {
    it("throws an UnknownRouteError on unknown routes", () => {
      expect(() => registry.lookupRoute("/foo", HttpMethod.POST)).toThrowError(
        UnknownRouteError
      );
    });
    it("throws a MethodNotSupportedError on exact match", () => {
      const routeOptions = {
        allowedRoles: ["public"] as RoleLiteral[],
        methods: [HttpMethod.POST],
        resolver: jest.fn(),
        route: "/foo",
        router: {}
      };
      registry.registerRoute(routeOptions);
      expect(() =>
        registry.lookupRoute(routeOptions.route, HttpMethod.DELETE)
      ).toThrowError(MethodNotSupportedError);
    });
    it("throws a MethodNotSupportedError on wildcard match", () => {
      const template = "/foo/{id}";
      const uri = "/foo/123";

      const routeOptions = {
        allowedRoles: ["public"] as RoleLiteral[],
        methods: [HttpMethod.POST],
        resolver: jest.fn(),
        route: template,
        router: {}
      };
      registry.registerRoute(routeOptions);
      expect(() => registry.lookupRoute(uri, HttpMethod.DELETE)).toThrowError(
        MethodNotSupportedError
      );
    });
    it("returns an exact match", () => {
      const routeOptions = {
        allowedRoles: ["public"] as RoleLiteral[],
        methods: [HttpMethod.POST],
        resolver: jest.fn(),
        route: "/foo",
        router: { mockRouter: true }
      };
      registry.registerRoute(routeOptions);

      const route = registry.lookupRoute(
        routeOptions.route,
        routeOptions.methods[0]
      );

      expect(route.allowedRoles).toEqual(routeOptions.allowedRoles);
      expect(route.resolver).toBe(routeOptions.resolver);
      expect(route.router).toBe(routeOptions.router);
    });
    it("overwrites on write", () => {
      const routeOptions = {
        allowedRoles: ["public"] as RoleLiteral[],
        methods: [HttpMethod.POST],
        resolver: jest.fn(),
        route: "/foo",
        router: { mockRouter: true }
      };
      registry.registerRoute(routeOptions);

      const newRouteOptions = {
        ...routeOptions,
        resolver: jest.fn()
      };
      registry.registerRoute(newRouteOptions);
      const route = registry.lookupRoute(
        routeOptions.route,
        routeOptions.methods[0]
      );
      expect(route.resolver).toBe(newRouteOptions.resolver);
      expect(routeOptions.resolver).not.toBe(newRouteOptions.resolver);
    });
    it("does not overwrite on different methods", () => {
      const firstRouteOptions = {
        allowedRoles: ["public"] as RoleLiteral[],
        methods: [HttpMethod.POST],
        resolver: jest.fn(),
        route: "/foo",
        router: { mockRouter: true }
      };
      const secondRouteOptions = {
        ...firstRouteOptions,
        methods: [HttpMethod.GET],
        resolver: jest.fn(),
        router: { mockRouter2: "the squeaquel" }
      };
      registry.registerRoute(firstRouteOptions);
      registry.registerRoute(secondRouteOptions);
      const firstRoute = registry.lookupRoute(
        firstRouteOptions.route,
        firstRouteOptions.methods[0]
      );
      const secondRoute = registry.lookupRoute(
        secondRouteOptions.route,
        secondRouteOptions.methods[0]
      );

      expect(firstRoute.resolver).toBe(firstRouteOptions.resolver);
      expect(firstRoute.router).toBe(firstRouteOptions.router);

      expect(secondRoute.resolver).toBe(secondRouteOptions.resolver);
      expect(secondRoute.router).toBe(secondRouteOptions.router);
    });
    it("returns a wildcard match", () => {
      const template = "/foo/{id}";
      const uri = "/foo/123";

      const routeOptions = {
        allowedRoles: ["public"] as RoleLiteral[],
        methods: [HttpMethod.POST],
        resolver: jest.fn(),
        route: template,
        router: {}
      };
      registry.registerRoute(routeOptions);
      const route = registry.lookupRoute(uri, routeOptions.methods[0]);

      expect(route.allowedRoles).toEqual(routeOptions.allowedRoles);
      expect(route.resolver).toBe(routeOptions.resolver);
      expect(route.router).toBe(routeOptions.router);
      expect(route.pathVariables).toEqual({ id: "123" });
    });
  });
});
