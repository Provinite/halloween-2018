import { HalloweenAppDevRunner } from "./HalloweenAppDevRunner";
import { ExportPathScanner } from "./reflection/ExportPathScanner";
import * as AwilixHelpers from "./AwilixHelpers";
import { ApplicationContainer } from "./config/context/ApplicationContext";
import * as Awilix from "awilix";
import { applyMockResolvers } from "./test/AwilixMocks";
import { EnvService } from "./config/env/EnvService";
import { Lifetime } from "awilix";
import { exactly } from "./test/jestUtils";
import { OrmContext } from "./config/context/OrmContext";
import { WebserverContext } from "./config/context/WebserverContext";
import { ComponentRegistrar } from "./config/context/ComponentRegistrar";

jest.mock("./reflection/ExportPathScanner");
jest.mock("./config/context/WebserverContext");
jest.mock("./config/context/OrmContext");
jest.mock("./config/context/ComponentRegistrar");

const ExportPathScannerMock = ExportPathScanner as jest.Mocked<
  typeof ExportPathScanner
>;
const AwilixHelpersMock = AwilixHelpers as jest.Mocked<typeof AwilixHelpers>;
const AwilixMock = applyMockResolvers(Awilix);

describe("HalloweenAppDevRunner", () => {
  describe("method:run", () => {
    let runner: HalloweenAppDevRunner;
    let container: jest.Mocked<ApplicationContainer>;

    beforeEach(async () => {
      applyMockResolvers(AwilixMock);

      container = {
        register: jest.fn(),
        build: jest.fn(),
        resolve: jest.fn(() => ({}))
      } as any;
      ExportPathScannerMock.scan.mockResolvedValue([]);
      jest
        .spyOn(AwilixHelpersMock, "createApplicationContainer")
        .mockReturnValue(container);
      process.env.PORT = "3000";
      runner = new HalloweenAppDevRunner();
      await runner.run();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("creates a container", () => {
      expect(
        AwilixHelpersMock.createApplicationContainer
      ).toHaveBeenCalledTimes(1);
    });

    it("registers process.env as NODE_ENV", async () => {
      expect(container.register).toHaveBeenCalledWith(
        "NODE_ENV",
        expect.asValue(process.env, false)
      );
    });

    it("registers the container as container", async () => {
      expect(container.register).toHaveBeenCalledWith(
        "container",
        expect.asValue(container)
      );
    });

    it("registers the envService", () => {
      expect(container.register).toHaveBeenCalledWith(
        "envService",
        expect.asClass(EnvService, Lifetime.SINGLETON)
      );
    });

    it("builds the ORM context", () => {
      expect(container.build).toHaveBeenCalledWith(
        exactly(OrmContext.configureContainer)
      );
    });

    it("builds the webserver context", () => {
      expect(container.build).toHaveBeenCalledWith(
        exactly(WebserverContext.configureContainer)
      );
    });

    it("registers @components", async () => {
      jest.clearAllMocks();
      const mocks = {};
      ExportPathScannerMock.scan.mockReturnValue(mocks as any);
      await runner.run();
      expect(ComponentRegistrar.configureContainer).toHaveBeenCalledWith(
        exactly(container),
        exactly(mocks)
      );
    });

    it("builds koaConfiguration.configure", async () => {
      const mockKoaConfig = { configure: {} };
      container.resolve.mockImplementation(name => {
        return name === "koaConfiguration" ? mockKoaConfig : {};
      });
      jest.clearAllMocks();
      await runner.run();
      expect(container.resolve).toHaveBeenCalledWith("koaConfiguration");
      expect(container.build).toHaveBeenCalledWith(
        exactly(mockKoaConfig.configure)
      );
    });
  });
});
