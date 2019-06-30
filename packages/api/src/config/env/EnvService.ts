import { ENV_VARS } from "./ENV_VARS";
import { IDeviantartApiConsumerConfiguration } from "./IDeviantartApiConsumerConfig";
import { IOrmConfiguration } from "./IOrmConfiguration";
import { ITokenConfiguration } from "./ITokenConfiguration";
import { IWebserverConfiguration } from "./IWebserverConfiguration";
import { ApplicationContext } from "../context/ApplicationContext";

/**
 * Sensible defaults for the application (where possible). Not all values
 * are required to have a default, and it is acceptable to terminate the
 * application at runtime if a required environmental key is missing.
 */
const DEFAULTS = {
  webserver: {
    port: 8081
  },
  orm: {
    type: "postgres",
    host: "localhost",
    username: "halloween2018",
    password: "halloween-password",
    database: "halloween2018",
    synchronize: false,
    port: 5432
  },
  deviantartApiConsumer: {
    baseRoute: "https://www.deviantart.com/api/v1/oauth2/",
    oauthEndpoint: "https://www.deviantart.com/oauth2/token"
  }
};

/**
 * Class responsible for providing application configuration data from the
 * environment. At the time of writing, this class is the only one that should
 * really be allowed to interact with the NODE_ENV map directly.
 *
 * Note that this service is instantiated before the ComponentRegistrar is run,
 * so the DI container is in a very sparse state when it is built.
 */
export class EnvService {
  private deviantartApiConsumerConfig: IDeviantartApiConsumerConfiguration;
  private ormConfig: IOrmConfiguration;
  private tokenConfig: ITokenConfiguration;
  private webserverConfig: IWebserverConfiguration;
  private overrides: ApplicationContext["ENV_OVERRIDES"];
  private env: ApplicationContext["NODE_ENV"];
  /**
   * Creates an EnvService with data poulated from the specified environment.
   * @param NODE_ENV - The runtime environment to use.
   * @inject
   */
  constructor({ NODE_ENV, ENV_OVERRIDES }: ApplicationContext) {
    this.env = NODE_ENV;
    this.overrides = ENV_OVERRIDES;
    this.ormConfig = this.createOrmConfig();
    this.tokenConfig = this.createTokenConfig();
    this.webserverConfig = this.createWebserverConfig();
    this.deviantartApiConsumerConfig = this.createDeviantartApiConsumerConfig();
  }
  /**
   * @method getDeviantartApiConsumerConfig
   * Get environment-specific DA API configuration.
   *
   * @return Environmentally-dependent deviantart api consumer configuration
   * settings, with some defaults.
   */
  getDeviantartApiConsumerConfig(): Readonly<
    IDeviantartApiConsumerConfiguration
  > {
    return this.deviantartApiConsumerConfig;
  }
  /**
   * @method getWebserverConfig
   * Get environment-specific webserver configuration.
   *
   * @return Environmentally-dependent webserver configuration settings,
   *    including sensible defaults.
   */
  getWebserverConfig(): Readonly<IWebserverConfiguration> {
    return this.webserverConfig;
  }

  /**
   * @method getOrmConfiguration
   * Get environment-specific ORM configuration. This includes primarily
   *    database credentials. Notably, this configuration excludes the MODELS
   *    information necessary for typeorm. Providing that information is left
   *    to the OrmContext provider.
   *
   * @return Environmentally-dependent ORM configuration settings, including
   *    sensible defaults.
   */
  getOrmConfiguration(): Readonly<IOrmConfiguration> {
    return this.ormConfig;
  }

  /**
   * @method getTokenConfiguration
   * Get environment-specific JWT configuration.
   *
   * @return Environmentally-dependent JWT token configuration settings
   */
  getTokenConfiguration(): Readonly<ITokenConfiguration> {
    return this.tokenConfig;
  }

  /**
   * Get a requiired environment variable. All reads from the environment should
   * run through this method, since it checks the overrides properly.
   * @throws An error if the specified key is not in the environment
   * @param key - The environment key to check
   * @return The value at `key`
   */
  private getEnvVal(key: keyof ENV_VARS): string;
  /**
   * Get an optional environment variable. All reads from the environment should
   * run through this method, since it checks the overrides properly.
   * @param key - The environment key to check
   * @return The value at `key`, or `defaultValue` if the env key is not set
   */
  private getEnvVal(key: keyof ENV_VARS, defaultValue: string): string;
  private getEnvVal(
    key: keyof ENV_VARS,
    defaultValue?: string
  ): string | undefined {
    // check overrides first
    if (this.overrides.hasOwnProperty(key)) {
      return this.overrides[key] as string;
    }
    if (this.env.hasOwnProperty(key)) {
      return this.env[key] as string;
    }
    // no default provided, it is required
    if (defaultValue === undefined) {
      throw new Error(
        `Fatal - EnvService missing required environment variable: "${key}"`
      );
    }
    return defaultValue;
  }
  /**
   * Examine the application environment and create an appropriate
   * deviantart api consumer configuration.
   */
  private createDeviantartApiConsumerConfig(): IDeviantartApiConsumerConfiguration {
    const clientId = this.getEnvVal("cch2018_da_client_id");
    const clientSecret = this.getEnvVal("cch2018_da_client_secret");
    const redirectUri = this.getEnvVal("cch2018_da_redirect_uri");

    const defaults = DEFAULTS.deviantartApiConsumer;
    const baseRoute = this.getEnvVal(
      "cch2018_da_baseroute",
      defaults.baseRoute
    );
    const oauthEndpoint = this.getEnvVal(
      "cch2018_da_oauth_endpoint",
      defaults.oauthEndpoint
    );
    return {
      baseRoute,
      oauthEndpoint,
      clientId: Number(clientId),
      clientSecret,
      redirectUri
    };
  }
  /**
   * Examine the application environment and create an appropriate ORM
   * configuration.
   */
  private createOrmConfig(): IOrmConfiguration {
    let config = {} as IOrmConfiguration;
    const defaults = DEFAULTS.orm;

    const defaultSyncVal = defaults.synchronize.toString();
    const syncEnvVal = this.getEnvVal(
      "cch2018_orm_synchronize",
      defaultSyncVal
    );
    config.synchronize = syncEnvVal === "true" ? true : false;

    config.type = this.getEnvVal("cch2018_orm_type", defaults.type);
    const databaseUrl = this.getEnvVal("DATABASE_URL", "");
    if (databaseUrl) {
      config = {
        ...config,
        ...this.parsePostgresUri(databaseUrl)
      };
    } else {
      config = {
        ...config,
        host: this.getEnvVal("cch2018_orm_host", defaults.host),
        database: this.getEnvVal("cch2018_orm_database", defaults.database),
        username: this.getEnvVal("cch2018_orm_username", defaults.username),
        password: this.getEnvVal("cch2018_orm_password", defaults.password),
        port: Number(
          this.getEnvVal("cch2018_orm_port", defaults.port.toString())
        )
      };
    }
    return config;
  }
  /**
   * Examine the application environment and create an appropriate auth
   * token configuration.
   */
  private createTokenConfig(): ITokenConfiguration {
    return {
      secret: this.getEnvVal("cch2018_token_secret")
    };
  }
  /**
   * Examine the application environment and create an appropriate webserver
   * configuration.
   */
  private createWebserverConfig(): IWebserverConfiguration {
    return {
      port: Number(this.getEnvVal("PORT", DEFAULTS.webserver.port.toString()))
    };
  }

  /**
   * Parse a postgres URI into a username, password, host, port, and database
   * @param uri - A "postgres(ql)://username:password@host:port/database" type uri.
   */
  private parsePostgresUri(
    uri: string
  ): {
    username: string;
    password: string;
    host: string;
    port: number;
    database: string;
  } {
    const matcher = /^postgres(?:ql)?:\/\/(.+?):(.+?)@(.+?):(\d+?)\/(.+?)$/i;
    if (!matcher.test(uri)) {
      throw new Error("Invalid DATABASE_URL supplied");
    } else {
      const result = matcher.exec(uri)!;
      const [, username, password, host, , database] = result;
      const port = Number.parseInt(result[4], 10);
      return {
        username,
        password,
        host,
        port,
        database
      };
    }
  }
}
