import { AwilixContainer } from "awilix";
import * as Awilix from "awilix";
import { Context } from "koa";
import { mockAsValue } from "../test/AwilixMocks";
import { RequestParsingService } from "./RequestParsingService";

describe("service:RequestParsingService", () => {
  describe("method:parse", () => {
    it("registers the provided body as requestBody", () => {
      jest.spyOn(Awilix, "asValue").mockImplementation(mockAsValue as any);
      const container = ({
        register: jest.fn()
      } as unknown) as jest.Mocked<AwilixContainer>;
      const ctx = {
        request: {
          body: {}
        }
      } as Context;
      const service = new RequestParsingService();
      service.parse(ctx, container);
      expect(container.register).toHaveBeenCalledWith(
        "requestBody",
        expect.anything()
      );
      const args = container.register.mock.calls[0];
      const registeredValue = (args as any)[1];
      expect(registeredValue).toBeMockValueResolverFor(ctx.request.body);
    });
  });
});
