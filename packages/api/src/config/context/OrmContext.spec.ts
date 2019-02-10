import { AwilixContainer } from "awilix";
import * as Awilix from "awilix";
import * as typeorm from "typeorm";
import { MODELS } from "../../models";
import { EnvService } from "../env/EnvService";
import { OrmContext } from "./OrmContext";
interface IMocks {
  container: jest.Mocked<AwilixContainer>;
  connection: jest.Mocked<typeorm.Connection>;
  envService: EnvService;
}
describe.only("config:OrmContext", () => {
  let mocks: IMocks;
  beforeEach(() => {
    mocks = {} as IMocks;
    /* Mocks */
    const MockContainer = jest.fn<AwilixContainer>(() => ({
      register: jest.fn(),
      build: jest.fn()
    }));
    const MockConnection = jest.fn<typeorm.Connection>(() => ({}));

    mocks.envService = {
      getOrmConfiguration: () => ({})
    } as EnvService;
    mocks.container = new MockContainer() as jest.Mocked<AwilixContainer>;
    mocks.connection = new MockConnection() as jest.Mocked<typeorm.Connection>;

    /* Stubs */
    jest.spyOn(typeorm, "createConnection").mockResolvedValue(mocks.connection);
    jest.spyOn(Awilix, "asValue").mockImplementation(_ => _);
  });
  afterEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });
  describe("static:configureContainer", () => {
    it("registers the connection as orm", async () => {
      await OrmContext.configureContainer(mocks.container, mocks.envService);
      expect(mocks.container.register).toHaveBeenCalledWith(
        "orm",
        mocks.connection
      );
    });

    it("registers a repository for each model", async () => {
      await OrmContext.configureContainer(mocks.container, mocks.envService);
      const calls = mocks.container.register.mock.calls;
      MODELS.forEach(model => {
        const modelName = model.name[0].toLowerCase() + model.name.substr(1);
        const isModelRepo = (call: any[]) => {
          const registeredName = call[0] as string;
          return registeredName === modelName + "Repository";
        };
        expect(calls.some(isModelRepo)).toBe(true);
      });
    });
  });
});
