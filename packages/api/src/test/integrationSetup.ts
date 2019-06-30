import { ENV_VARS } from "../config/env/ENV_VARS";
import {
  HalloweenAppDevRunner,
  ApplicationInstance
} from "../HalloweenAppDevRunner";
import { EnvService } from "../config/env/EnvService";
import { ApplicationContext } from "../config/context/ApplicationContext";
import * as pg from "pg";

jest.setTimeout(30000);

async function createTestDatabase(envOverrides: Partial<ENV_VARS>) {
  const envService = new EnvService({
    NODE_ENV: process.env,
    ENV_OVERRIDES: envOverrides
  } as ApplicationContext);
  const ormConfig = envService.getOrmConfiguration();
  const clientConfig = {
    database: "postgres",
    host: ormConfig.host,
    user: ormConfig.username,
    password: ormConfig.password,
    port: ormConfig.port
  };
  const testClientConfig = { ...clientConfig, database: ormConfig.database };

  const pgClient = new pg.Client(clientConfig);
  await pgClient.connect();
  try {
    // create the database if it doesn't exist
    try {
      await pgClient.query(`CREATE DATABASE "${ormConfig.database}"`);
    } catch (e) {
      // swallow "DUPLICATE DATABASE" error
      if (e.code !== "42P04") {
        throw e;
      }
    }
  } catch (e) {
    // we only try..catch for the finally block here
    throw e;
  } finally {
    await pgClient.end();
  }
  const testClient = new pg.Client(testClientConfig);
  try {
    await testClient.connect();
    await testClient.query(`DROP SCHEMA IF EXISTS "public" CASCADE;`);
    await testClient.query(`CREATE SCHEMA "public";`);
  } catch (e) {
    // we only try..catch for the finally block here
    throw e;
  } finally {
    await testClient.end();
  }
}

beforeAll(async () => {
  console.log("BeforeAll. . .");
  const envOverrides: Partial<ENV_VARS> = {
    cch2018_orm_database: "TEST",
    cch2018_orm_synchronize: "true"
  };
  try {
    await createTestDatabase(envOverrides);
  } catch (e) {
    console.log("Unable to initialize database.");
    e;
    throw e;
  }
  const runner = new HalloweenAppDevRunner();
  console.log("Starting runner. . .");
  console.log(process.cwd());
  const instance = await runner.run({
    envOverrides,
    scanPath: "./src/**/!(test|mocks)/!(*.ispec|*.spec|app).ts"
  });
  global.testAppInstance = instance;
});

afterAll(async () => {
  if (global.testAppInstance) {
    global.testAppInstance.shutdown();
  }
});

declare global {
  namespace NodeJS {
    interface Global {
      testAppInstance: ApplicationInstance;
    }
  }
}
