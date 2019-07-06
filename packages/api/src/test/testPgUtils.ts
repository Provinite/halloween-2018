import { IOrmConfiguration } from "../config/env/IOrmConfiguration";
import { Client, ClientConfig } from "pg";
import { PostgresErrorCodes } from "../db/PostgresErrorCodes";

/**
 * Connect to pg using the provided config and drop & recreate the "public" schema.
 * @param ormConfig - The ORM configuration for connecting.
 */
export async function truncateDatabase(
  ormConfig: IOrmConfiguration
): Promise<void> {
  const { database, host, username: user, password, port } = ormConfig;
  const testClientConfig: ClientConfig = {
    database,
    host,
    user,
    password,
    port
  };

  const testClient = new Client(testClientConfig);
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

/**
 * Connect to the "postgres" db on the specified server and create a database
 * with the provided name if it does not exist. Noop if it already exists
 * @param ormConfig - The ORM configuration for connecting. The database config
 *  option is ignored.
 * @param databaseName - The name of the database to create.
 * @return - True if the database was created, false if it already existed.
 */
export async function createDatabaseIfNotExists(
  ormConfig: Omit<IOrmConfiguration, "database">,
  databaseName: string
): Promise<boolean> {
  const { username: user, host, password, port } = ormConfig;
  const clientConfig: ClientConfig = {
    // connect to the admin db to create the test db
    database: "postgres",
    host,
    user,
    password,
    port
  };

  let didCreate = false;
  const client = new Client(clientConfig);
  await client.connect();
  try {
    // create the database if it doesn't exist
    try {
      await client.query(`CREATE DATABASE "${databaseName}"`);
      didCreate = true;
    } catch (e) {
      // swallow duplicate database errors
      if (e.code !== PostgresErrorCodes.duplicateDatabase) {
        throw e;
      }
    }
  } catch (e) {
    throw e;
  } finally {
    await client.end();
  }
  return didCreate;
}
