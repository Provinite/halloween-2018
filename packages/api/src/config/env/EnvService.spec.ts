import { ENV_VARS } from "./ENV_VARS";
import { ApplicationContext } from "../context/ApplicationContext";
import { createSafeContext } from "../../test/testUtils";
import { EnvService } from "./EnvService";
import { IOrmConfiguration } from "./IOrmConfiguration";

describe("EnvService", () => {
  /** Minimal environment, only includes required params */
  let NODE_ENV: Partial<ENV_VARS>;
  let context: ApplicationContext;
  const requiredEnvVars: (keyof ENV_VARS)[] = [
    "cch2018_da_client_id",
    "cch2018_da_client_secret",
    "cch2018_da_redirect_uri",
    "cch2018_token_secret"
  ];
  const createService = () => new EnvService(context);
  beforeEach(() => {
    NODE_ENV = {
      cch2018_da_client_id: 42069,
      cch2018_da_client_secret: "BESURETODRINKYOUROVALTINE",
      cch2018_token_secret: "THEYAREEATINGHER",
      cch2018_da_redirect_uri: "http://yeet.me/outside?howbow=dat"
    };
    context = createSafeContext({ NODE_ENV }) as any;
  });
  describe("construction", () => {
    it("does not throw with minimal environment", () => {
      new EnvService(context);
    });
    it.each(requiredEnvVars)("throws if %p is not provided", envVar => {
      delete NODE_ENV[envVar];
      expect(createService).toThrowError(new RegExp(envVar));
    });
  });
  describe("method:getDeviantartApiConsumerConfig", () => {
    it("provides the expected defaults", () => {
      const service = new EnvService(context);
      const config = service.getDeviantartApiConsumerConfig();
      expect(config.baseRoute).toMatchInlineSnapshot(
        `"https://www.deviantart.com/api/v1/oauth2/"`
      );
      expect(config.oauthEndpoint).toMatchInlineSnapshot(
        `"https://www.deviantart.com/oauth2/token"`
      );
      expect(config).toEqual({
        baseRoute: config.baseRoute, // covered by snapshot
        oauthEndpoint: config.oauthEndpoint, // covered by snapshot
        clientId: NODE_ENV.cch2018_da_client_id,
        clientSecret: NODE_ENV.cch2018_da_client_secret,
        redirectUri: NODE_ENV.cch2018_da_redirect_uri
      });
    });
    it("overwrites defaults", () => {
      NODE_ENV.cch2018_da_baseroute = "http://private.api.mock/";
      NODE_ENV.cch2018_da_oauth_endpoint = "http://private.api.mock/oauth";
      const service = new EnvService(context);
      const config = service.getDeviantartApiConsumerConfig();
      expect(config).toEqual({
        baseRoute: NODE_ENV.cch2018_da_baseroute,
        oauthEndpoint: NODE_ENV.cch2018_da_oauth_endpoint,
        clientId: NODE_ENV.cch2018_da_client_id,
        clientSecret: NODE_ENV.cch2018_da_client_secret,
        redirectUri: NODE_ENV.cch2018_da_redirect_uri
      });
    });
  });
  describe("method:getTokenConfiguration", () => {
    it("provides expected config", () => {
      const service = new EnvService(context);
      const config = service.getTokenConfiguration();
      expect(config).toEqual({ secret: NODE_ENV.cch2018_token_secret });
    });
  });
  describe("method:getOrmConfiguration", () => {
    it("provides expected defaults", () => {
      const service = new EnvService(context);
      const config = service.getOrmConfiguration();
      expect(config.database).toMatchInlineSnapshot(`"halloween2018"`);
      expect(config.host).toMatchInlineSnapshot(`"localhost"`);
      expect(config.username).toMatchInlineSnapshot(`"halloween2018"`);
      expect(config.password).toMatchInlineSnapshot(`"halloween-password"`);
      expect(config.type).toMatchInlineSnapshot(`"postgres"`);
      expect(config.port).toMatchInlineSnapshot(`5432`);
      const expectedConfig: IOrmConfiguration = {
        database: expect.anything(),
        host: expect.anything(),
        username: expect.anything(),
        password: expect.anything(),
        type: expect.anything(),
        port: expect.anything(),
        synchronize: false
      };
      expect(config).toEqual(expectedConfig);
    });
    it("overwrites defaults", () => {
      NODE_ENV.cch2018_orm_database = "theDatabase";
      NODE_ENV.cch2018_orm_host = "theHost";
      NODE_ENV.cch2018_orm_username = "theUsername";
      NODE_ENV.cch2018_orm_password = "thePassword";
      NODE_ENV.cch2018_orm_synchronize = "true";
      NODE_ENV.cch2018_orm_port = "1337";

      const service = new EnvService(context);
      const config = service.getOrmConfiguration();
      const expectedConfig: IOrmConfiguration = {
        database: NODE_ENV.cch2018_orm_database,
        host: NODE_ENV.cch2018_orm_host,
        username: NODE_ENV.cch2018_orm_username,
        password: NODE_ENV.cch2018_orm_password,
        port: Number(NODE_ENV.cch2018_orm_port),
        type: expect.anything(), // covered by other test
        synchronize: true
      };
      expect(config).toEqual(expectedConfig);
    });
    it("accepts DATABASE_URL in place of individual env vars", () => {
      const username = "theUser";
      const host = "theHost";
      const port = 4040;
      const password = "thePassword";
      const database = "theDatabase";
      NODE_ENV.DATABASE_URL = `postgres://${username}:${password}@${host}:${port}/${database}`;

      const expectedConfig: IOrmConfiguration = {
        username,
        password,
        host,
        port,
        database,
        type: expect.anything(),
        synchronize: expect.anything()
      };

      const service = new EnvService(context);
      const config = service.getOrmConfiguration();
      expect(config).toEqual(expectedConfig);
    });
    it.each([
      "mysql://user:password@dbhost.domain:6632/database",
      "postgres://:password@somedb.host:1030/db",
      "postgres://username@somedb.host:1030/db",
      "postgres://username:password@:1030/db",
      "postgres://username:password@somedb.host/db",
      "postgres://username:password@somedb.host:3306"
    ])("throws on invalid postgres url: %p", databaseUrl => {
      NODE_ENV.DATABASE_URL = databaseUrl;
      const createService = () => new EnvService(context);
      expect(createService).toThrowError(/[iI]nvalid DATABASE_URL/);
    });
  });
  describe("method:getWebserverConfiguration", () => {
    it("provides expected defaults", () => {
      const service = new EnvService(context);
      const config = service.getWebserverConfig();
      expect(config.port).toMatchInlineSnapshot(`8081`);
      expect(config).toEqual({
        port: expect.anything()
      });
    });
    it("overwrites defaults", () => {
      NODE_ENV.PORT = 99;
      const service = new EnvService(context);
      const config = service.getWebserverConfig();
      expect(config).toEqual({
        port: NODE_ENV.PORT
      });
    });
  });
});
