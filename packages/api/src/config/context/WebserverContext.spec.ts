const mockWebserver = { webserver: true };
function mockKoaConstructor() {
  mockKoaConstructor.callCount++;
  return mockWebserver;
}
mockKoaConstructor.callCount = 0;
jest.setMock("koa", mockKoaConstructor);
import * as Awilix from "awilix";
import { WebserverContext } from "./WebserverContext";
const AwilixMock = Awilix as jest.Mocked<typeof Awilix>;
describe("context:Webserver", () => {
  beforeEach(() => {
    mockKoaConstructor.callCount = 0;
    jest
      .spyOn(Awilix, "asFunction")
      .mockReturnValue({ singleton: jest.fn() } as any);
  });
  describe("static:configureContainer", () => {
    it("it registers a lazy Koa instance as webserver", () => {
      const context = {
        container: {
          register: jest.fn()
        }
      };
      const mockSingleton = { mock_singleton: "yes" };
      const mockResolver = { singleton: jest.fn(() => mockSingleton) };
      AwilixMock.asFunction.mockReturnValue(mockResolver as any);

      WebserverContext.configureContainer(context as any);
      // it calls asFunction
      expect(AwilixMock.asFunction).toHaveBeenCalledWith(expect.any(Function));
      // .singleton()
      expect(mockResolver.singleton).toHaveBeenCalledTimes(1);
      // it registers the result of .singleton()
      expect(context.container.register).toHaveBeenCalledWith(
        "webserver",
        mockSingleton
      );

      // get the registered resolver function
      const registeredFn = AwilixMock.asFunction.mock.calls[0][0];

      // it shouldn't have created the webserver yet
      expect(mockKoaConstructor.callCount).toBe(0);
      const ws = registeredFn();
      expect(ws).toBe(mockWebserver);
      expect(mockKoaConstructor.callCount).toBe(1);
    });
  });
});
