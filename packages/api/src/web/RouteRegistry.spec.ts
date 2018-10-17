import { HttpMethod } from "../HttpMethod";
import { RouteRegistry } from "./RouteRegistry";

describe("service:RouteRegistry", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("method:registerRoute", () => {
    let routeRegistry: RouteRegistry;
    beforeEach(() => {
      routeRegistry = new RouteRegistry();
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
    beforeEach(() => {
      routeRegistry = new RouteRegistry();
    });
    it("returns the same resolver inserted on exact match", () => {
      const resolver = {} as any;
      routeRegistry.registerRoute("/foo/bar", HttpMethod.GET, resolver);
      const { resolver: returnedResolver } = routeRegistry.lookupRoute(
        "/foo/bar",
        HttpMethod.GET
      );
      expect(returnedResolver).toBe(resolver);
    });
  });
});
