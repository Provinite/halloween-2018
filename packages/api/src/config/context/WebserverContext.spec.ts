import * as Awilix from "awilix";
import * as Koa from "koa";
import { WebserverContext } from "./WebserverContext";
interface IMocks {
  container: {
    register: jest.Mock;
  };
}
describe("config:WebserverContext", () => {
  let mocks: Partial<IMocks>;
  beforeEach(() => {
    mocks = {};
    /* Mocks */
    mocks.container = {
      register: jest.fn()
    };

    /* Stubs */
    jest.spyOn(Awilix, "createContainer").mockReturnValue(mocks.container);
    jest.spyOn(Awilix, "asFunction").mockImplementation(fn => ({
      type: "function",
      value: fn
    }));
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
      expect(mocks.container.register).toBeCalledWith("webserver", {
        type: "function",
        value: expect.any(Function)
      });
      const registeredFunction: () => Koa =
        mocks.container.register.mock.calls[0][1].value;
      const webserver = registeredFunction();
      expect(webserver.listen).toEqual(expect.any(Function));
      expect(webserver.use).toEqual(expect.any(Function));
    });
  });
});
