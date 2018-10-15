import * as Awilix from "awilix";
import * as Koa from "koa";
import { EnvService } from "../env/EnvService";
import { WebserverContext } from "./WebserverContext";
interface IMocks {
  container: {
    register: jest.Mock;
  };
  envService: EnvService;
}
describe("config:WebserverContext", () => {
  let mocks: Partial<IMocks>;
  beforeEach(() => {
    mocks = {};
    /* Mocks */
    mocks.container = {
      register: jest.fn()
    };

    mocks.envService = {
      getWebserverConfig: () => ({
        port: 8081
      })
    } as EnvService;

    /* Stubs */
    jest.spyOn(Awilix, "createContainer").mockReturnValue(mocks.container);
    const mockAsFunction = (fn: any) => ({
      type: "function",
      value: fn,
      singleton: () => mockAsFunction(fn)
    });
    jest.spyOn(Awilix, "asFunction").mockImplementation(mockAsFunction);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("static:configureContainer", () => {
    it("returns the container", () => {
      const result = WebserverContext.configureContainer(
        Awilix.createContainer()
      );
      expect(result).toBe(mocks.container);
    });

    it("registers a webserver as a function that returns a Koa", () => {
      WebserverContext.configureContainer(Awilix.createContainer());
      expect(mocks.container.register).toBeCalledWith(
        "webserver",
        expect.objectContaining({
          type: "function",
          value: expect.any(Function)
        })
      );
      const registeredFunction: () => Koa =
        mocks.container.register.mock.calls[0][1].value;
      const webserver = registeredFunction();
      expect(webserver.listen).toEqual(expect.any(Function));
      expect(webserver.use).toEqual(expect.any(Function));
    });
  });
});
