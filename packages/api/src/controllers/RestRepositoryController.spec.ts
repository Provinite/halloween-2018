import { Connection, Repository } from "typeorm";
import { RestRepositoryController } from "./RestRepositoryController";
class MockEntity {}
// tslint:disable-next-line
class MockRestRepository extends RestRepositoryController<MockEntity> {
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
});
