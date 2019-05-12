import { AwilixContainer } from "awilix";
import * as Awilix from "awilix";
import { Context, Middleware } from "koa";
import { RequestParsingService } from "../config/RequestParsingService";
import { mockAsValue } from "../test/AwilixMocks";
import { RequestContainerMiddlewareFactory } from "./RequestContainerMiddlewareFactory";
describe("RequestContainerMiddlewareFactory", () => {
  describe("create() middleware", () => {
    beforeEach(() => {
      jest.spyOn(Awilix, "asValue").mockImplementation(mockAsValue);
    });
    it("attaches a child-scoped container to request.state.requestContainer", async () => {
      const mockRequestContainer = {
        register: jest.fn()
      };
      const mockRequestParsingService = ({
        parse: jest.fn()
      } as unknown) as jest.Mocked<RequestParsingService>;
      const mockContainer = ({
        createScope: jest.fn().mockReturnValue(mockRequestContainer)
      } as unknown) as jest.Mocked<AwilixContainer>;
      const mockContext = {
        state: {},
        request: {
          query: {}
        }
      } as Context;
      const next = jest.fn();
      const factory = new RequestContainerMiddlewareFactory(
        mockContainer,
        mockRequestParsingService
      );
      const middleware: Middleware = factory.create();
      await middleware(mockContext, next);
      // it invokes next
      expect(next).toHaveBeenCalled();
      // it attaches the request container
      expect(mockContext.state.requestContainer).toBe(mockRequestContainer);
      // it registers the context as ctx
      let [name, resolver] = mockRequestContainer.register.mock.calls[0];
      expect(name).toEqual("ctx");
      expect(resolver).toBeMockValueResolverFor(mockContext);
      // it registers the container as container
      [name, resolver] = mockRequestContainer.register.mock.calls[1];
      expect(name).toEqual("container");
      expect(resolver).toBeMockValueResolverFor(mockRequestContainer);
    });
  });
});
