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
    it("properly extracts path variables", () => {
      routeRegistry.registerRoute("/{user}/{action}", method, insertedResolver);
      const { pathVariables } = routeRegistry.lookupRoute(
        "/username/delete",
        method
      );
      expect(pathVariables).toEqual({
        user: "username",
        action: "delete"
      });
    });
  });
});
