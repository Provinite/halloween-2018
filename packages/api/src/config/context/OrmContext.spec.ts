import * as Awilix from "awilix";
import * as typeorm from "typeorm";
import { MODELS } from "../../models";
import { createSafeContext } from "../../test/testUtils";
import { EnvService } from "../env/EnvService";
import { ApplicationContainer, ApplicationContext } from "./ApplicationContext";
import { OrmContext } from "./OrmContext";
let context: {
  envService: jest.Mocked<EnvService>;
  container: jest.Mocked<ApplicationContainer>;
};
let mocks: { connection: jest.Mocked<typeorm.Connection> };
describe("config:OrmContext", () => {
  beforeEach(() => {
    /* Mocks */
    context = {
      envService: {
        getOrmConfiguration: () => ({})
      } as any,
      container: {
        register: jest.fn(),
        build: jest.fn()
      } as any
    };
    context = createSafeContext(context);
    mocks = {
      connection: {
        mock: "connection"
      } as any
    };

    /* Stubs */
    jest.spyOn(typeorm, "createConnection").mockResolvedValue(mocks.connection);
    jest.spyOn(Awilix, "asValue").mockImplementation(_ => _ as any);
  });
  afterEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });
  describe("static:configureContainer", () => {
    it("registers the connection as orm", async () => {
      await OrmContext.configureContainer(
        (context as any) as ApplicationContext
      );
      expect(context.container.register).toHaveBeenCalledWith(
        "orm",
        mocks.connection
      );
    });

    it("registers a repository for each model", async () => {
      await OrmContext.configureContainer(
        (context as any) as ApplicationContext
      );
      const calls = context.container.register.mock.calls;
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
