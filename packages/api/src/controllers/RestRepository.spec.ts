import { Connection, Repository } from "typeorm";
import { HttpMethod } from "../HttpMethod";
import * as RouterMiddlewareFactory from "../middlewares/RouterMiddlewareFactory";
import { RestRepository } from "./RestRepository";
class MockEntity {}
// tslint:disable-next-line
class MockRestRepository extends RestRepository<MockEntity> {
  getRoutes() {
    const { baseRoute, listRoute } = this;
    return { baseRoute, listRoute };
  }
}

interface IMocks {
  orm: jest.Mocked<Connection>;
  repository: jest.Mocked<Repository<MockEntity>>;
  listRoute: string;
  baseRoute: string;
}

describe("util:RestRepository", () => {
  let ctrl: MockRestRepository;
  let mocks: Partial<IMocks>;
  beforeEach(() => {
    /* Mocks */
    mocks = {};
    mocks.repository = ({
      find: jest.fn(),
      save: jest.fn()
    } as unknown) as jest.Mocked<Repository<MockEntity>>;

    mocks.orm = ({
      getRepository: jest.fn()
    } as unknown) as jest.Mocked<Connection>;

    mocks.baseRoute = "/mockEntity";
    mocks.listRoute = "/mockEntities";
    /* Stubs */
    mocks.orm.getRepository.mockImplementation(() => mocks.repository);

    /* Default Controller */
    ctrl = new MockRestRepository(mocks.orm, MockEntity);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("construction", () => {
    describe("route determination", () => {
      const mockClass = (name: string) =>
        ({ name } as new (...args: any[]) => any);
      [
        ["User", "/user", "/users"],
        ["Philly", "/philly", "/phillies"],
        ["FooBar", "/fooBar", "/fooBars"],
        ["Boss", "/boss", "/bosses"]
      ].forEach(test => {
        const [className, expectedBaseRoute, expectedListRoute] = test;
        const clazz = mockClass(className);

        it("properly sets the list route", () => {
          ctrl = new MockRestRepository(mocks.orm, clazz);
          const { listRoute } = ctrl.getRoutes();
          expect(listRoute).toBe(expectedListRoute);
        });

        it("properly sets the baseRoute", () => {
          ctrl = new MockRestRepository(mocks.orm, clazz);
          const { baseRoute } = ctrl.getRoutes();
          expect(baseRoute).toBe(expectedBaseRoute);
        });
      });
    });
  });
  describe("method:registerRoutes", () => {
    beforeEach(() => {
      jest
        .spyOn(RouterMiddlewareFactory, "classMethodHandler")
        .mockImplementation((instance: any, fn: (...args: any[]) => any) => {
          return {
            instance,
            fn
          };
        });
    });

    it("uses the classMethodHandler helper", () => {
      ctrl.registerRoutes({} as any);
      expect(RouterMiddlewareFactory.classMethodHandler).toHaveBeenCalled();
    });

    it("registers getAll as a GET handler for its listRoute", () => {
      const handlers = {} as any;
      ctrl.registerRoutes(handlers);
      expect(handlers[mocks.listRoute]).toBeTruthy();
      expect(handlers[mocks.listRoute][HttpMethod.GET]).toEqual({
        instance: ctrl,
        fn: ctrl.getAll
      });
    });

    it("registers createOne as a POST handler for its listRoute", () => {
      const handlers = {} as any;
      ctrl.registerRoutes(handlers);
      expect(handlers[mocks.listRoute]).toBeTruthy();
      expect(handlers[mocks.listRoute][HttpMethod.POST]).toEqual({
        instance: ctrl,
        fn: ctrl.createOne
      });
    });
  });
});
