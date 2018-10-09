import { RouteTransformationService } from "./RouteTransformationService";

describe("service:RouteTransformationService", () => {
  const tests = [
    ["/{a}/{b}", "/foo/bar", { a: "foo", b: "bar" }],
    ["/user/{id}", "/foo/bar", undefined],
    ["/step/{step}", "/step/123", { step: "123" }]
  ];
  const spec = (
    routeDefinition: string,
    requestPath: string,
    expectedVariables: { [variable: string]: string }
  ) => {
    it("properly parses" + routeDefinition, () => {
      const svc = new RouteTransformationService();
      const parsedRoute = svc.parseRoute(routeDefinition);
      const pathVariables = svc.getPathVariables(parsedRoute, requestPath);
      expect(pathVariables).toEqual(expectedVariables);
    });
  };
  for (const args of tests) {
    (spec as any)(...args);
  }
});
