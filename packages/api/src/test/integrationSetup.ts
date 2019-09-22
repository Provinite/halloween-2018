import { ENV_VARS } from "../config/env/ENV_VARS";
import {
  HalloweenAppDevRunner,
  ApplicationInstance
} from "../HalloweenAppDevRunner";
import { EnvService } from "../config/env/EnvService";
import { ApplicationContext } from "../config/context/ApplicationContext";
import { createDatabaseIfNotExists, truncateDatabase } from "./testPgUtils";

jest.setTimeout(30000);

async function createTestDatabase(envOverrides: Partial<ENV_VARS>) {
  const envService = new EnvService({
    NODE_ENV: process.env,
    ENV_OVERRIDES: envOverrides
  } as ApplicationContext);
  const ormConfig = envService.getOrmConfiguration();

  // create the test database if it's not there
  const justCreatedDb = await createDatabaseIfNotExists(
    ormConfig,
    ormConfig.database
  );

  // truncate the database if it already existed
  if (!justCreatedDb) {
    await truncateDatabase(ormConfig);
  }
}

beforeAll(async () => {
  const envOverrides: Partial<ENV_VARS> = {
    cch2018_orm_database: "TEST",
    cch2018_orm_synchronize: "true"
  };
  await createTestDatabase(envOverrides);
  const runner = new HalloweenAppDevRunner();
  const instance = await runner.run({
    envOverrides,
    scanPath: "./src/**/!(test|mocks)/!(*.ispec|*.spec|app).ts"
  });
  global.testAppInstance = instance;
});

afterAll(async () => {
  if (global.testAppInstance) {
    await global.testAppInstance.shutdown();
  }
});

declare global {
  namespace NodeJS {
    interface Global {
      testAppInstance: ApplicationInstance;
    }
  }
}
