import { Connection, Repository } from "typeorm";
import { RestRepositoryController } from "./RestRepositoryController";
class MockEntity {}
/**
 * Minimal implementation of RestRepositoryController used to test
 * fallback implementations.
 */
// tslint:disable-next-line
class MockRestRepository extends RestRepositoryController<MockEntity> {
  getRoutes() {
    const { baseRoute, listRoute, detailRoute } = this;
    return { baseRoute, listRoute, detailRoute };
  }
}

interface IMocks {
  orm: jest.Mocked<Connection>;
  repository: jest.Mocked<Repository<MockEntity>>;
  listRoute: string;
  baseRoute: string;
}

describe("abstract:RestRepositoryController", () => {
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
      /**
       * Create a mock class with the given name.
       * @param name - The name of the mock class
       */
      const createMockClass = (name: string) =>
        ({ name } as new (...args: any[]) => any);

      const testCases = [
        ["User", "/user", "/users", "/users/{id}"], // +s pluralization
        ["Philly", "/philly", "/phillies", "/phillies/{id}"], // -y +ies pluralization
        ["FooBar", "/fooBar", "/fooBars", "/fooBars/{id}"], // camelCase check
        ["Boss", "/boss", "/bosses", "/bosses/{id}"] // +es pluralization
      ];

      const routeCreationSpec: any = (
        className: string,
        expectedBaseRoute: string,
        expectedListRoute: string,
        expectedDetailRoute: string
      ) => {
        const clazz = createMockClass(className);

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

        it("properly sets the detailRoute", () => {
          ctrl = new MockRestRepository(mocks.orm, clazz);
          const { detailRoute } = ctrl.getRoutes();
          expect(detailRoute).toBe(expectedDetailRoute);
        });
      };

      testCases.forEach(testCase => routeCreationSpec(...testCase));
    });
  });
});
