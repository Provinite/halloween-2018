import { ENV_VARS } from "./ENV_VARS";
import { IDeviantartApiConsumerConfiguration } from "./IDeviantartApiConsumerConfig";
import { IOrmConfiguration } from "./IOrmConfiguration";
import { ITokenConfiguration } from "./ITokenConfiguration";
import { IWebserverConfiguration } from "./IWebserverConfiguration";

/**
 * Sensible defaults for the application (where possible). Not all values
 * are required to have a default, and it is acceptable to terminate the
 * application at runtime if a required environmental key is missing.
 */
const DEFAULTS: {
  webserver: Partial<IWebserverConfiguration>;
  orm: Partial<IOrmConfiguration>;
  deviantartApiConsumer: Partial<IDeviantartApiConsumerConfiguration>;
} = {
  webserver: {
    port: 8081
  },
  orm: {
    type: "postgres",
    host: "localhost",
    username: "halloween2018",
    password: "halloween-password",
    database: "halloween2018",
    synchronize: false
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
  /**
   * Creates an EnvService with data poulated from the specified environment.
   * @param NODE_ENV - The runtime environment to use.
   */
  constructor({ NODE_ENV }: ApplicationContextMembers) {
    this.ormConfig = this.createOrmConfig(NODE_ENV);
    this.tokenConfig = this.createTokenConfig(NODE_ENV);
    this.webserverConfig = this.createWebserverConfig(NODE_ENV);
    this.deviantartApiConsumerConfig = this.createDeviantartApiConsumerConfig(
      NODE_ENV
    );
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
   * Examine the application environment and create an appropriate
   * deviantart api consumer configuration.
   */
  private createDeviantartApiConsumerConfig(
    env: Partial<ENV_VARS>
  ): IDeviantartApiConsumerConfiguration {
    required(env, "cch2018_da_client_id");
    required(env, "cch2018_da_client_secret");
    const defaults = DEFAULTS.deviantartApiConsumer;
    const baseRoute = firstOf(env.cch2018_da_baseroute, defaults.baseRoute);
    const oauthEndpoint = firstOf(
      env.cch2018_da_oauth_endpoint,
      defaults.oauthEndpoint
    );
    const clientId = env.cch2018_da_client_id;
    const clientSecret = env.cch2018_da_client_secret;
    const redirectUri = env.cch2018_da_redirect_uri;
    return {
      baseRoute,
      oauthEndpoint,
      clientId,
      clientSecret,
      redirectUri
    };
  }
  /**
   * Examine the application environment and create an appropriate ORM
   * configuration.
   */
  private createOrmConfig(env: Partial<ENV_VARS>): IOrmConfiguration {
    let config = {} as IOrmConfiguration;
    config.synchronize = Boolean(
      firstOf(env.cch2018_orm_synchronize, DEFAULTS.orm.synchronize)
    );
    config.type = firstOf(env.cch2018_orm_type, DEFAULTS.orm.type);
    if (env.DATABASE_URL) {
      config = {
        ...config,
        ...this.parsePostgresUri(env.DATABASE_URL)
      };
    } else {
      config = {
        ...config,
        host: firstOf(env.cch2018_orm_host, DEFAULTS.orm.host),
        database: firstOf(env.cch2018_orm_database, DEFAULTS.orm.database),
        username: firstOf(env.cch2018_orm_username, DEFAULTS.orm.username),
        password: firstOf(env.cch2018_orm_password, DEFAULTS.orm.password)
      };
    }
    return config;
  }
  /**
   * Examine the application environment and create an appropriate auth
   * token configuration.
   */
  private createTokenConfig(env: Partial<ENV_VARS>): ITokenConfiguration {
    required(env, "cch2018_token_secret");
    if (!env.cch2018_token_secret) {
      throw new Error(
        `Unable to initialize. Environment key: cch2018_token_secret must exist`
      );
    }
    return {
      secret: env.cch2018_token_secret
    };
  }
  /**
   * Examine the application environment and create an appropriate webserver
   * configuration.
   */
  private createWebserverConfig(
    env: Partial<ENV_VARS>
  ): IWebserverConfiguration {
    return {
      port: Number.parseInt(firstOf(env.PORT, DEFAULTS.webserver.port), 10)
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
      throw new Error("Invalid postgres uri supplied.");
    } else {
      const result = matcher.exec(uri);
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

/* Private Helper Functions */
/**
 * Returns the first argument that is not strictly equal to undefined.
 * @param args
 */
function firstOf(...args: any[]): any {
  for (const arg of args) {
    if (arg !== undefined) {
      return arg;
    }
  }
}

/**
 * Verifies that the specified key exists on the env. Throws
 * a useful error message if not.
 */
function required(env: Partial<ENV_VARS>, key: string) {
  if (!(env as any)[key]) {
    throw new Error(
      "Fatal - EnvService: Cannot initialize without environment variable: " +
        key
    );
  }
}
