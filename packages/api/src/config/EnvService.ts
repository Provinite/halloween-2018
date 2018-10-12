/**
 * Interface for environmental configuration of the ORM container.
 */
export interface IOrmConfiguration {
  database: string;
  host: string;
  password: string;
  port: number;
  synchronize: boolean;
  type: string;
  username: string;
}

/**
 * Interface for environmental webserver configuration.
 */
export interface IWebserverConfiguration {
  port: number;
}

/**
 * This interface documents what environmental variables are utilized by the
 * application.
 */
// tslint:disable-next-line
interface ENV_VARS {
  /**
   * The database URL to use. Overrides username, password, host, and database.
   */
  DATABASE_URL: string;
  /** The database connection username. */
  cch2018_orm_username: string;
  /** The database connection password. */
  cch2018_orm_password: string;
  /* The database provider. See typeorm docs for options. */
  cch2018_orm_type: string;
  /* The database host. */
  cch2018_orm_host: string;
  /* The database name. */
  cch2018_orm_database: string;
  /* True to synchronize (autogenerate schema) on connection. */
  cch2018_orm_synchronize: boolean;
  /* The port to listen on. */
  PORT: number;
}

/**
 * Sensible defaults for the application (where possible). Not all values
 * are required to have a default, and it is acceptable to terminate the
 * application at runtime if a required environmental key is missing.
 */
const DEFAULTS: {
  webserver: Partial<IWebserverConfiguration>;
  orm: Partial<IOrmConfiguration>;
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
  private webserverConfig: IWebserverConfiguration;
  private ormConfig: IOrmConfiguration;
  /**
   * Creates an EnvService with data poulated from the specified environment.
   * @param NODE_ENV - The runtime environment to use.
   */
  constructor(NODE_ENV: Partial<ENV_VARS>) {
    const env = NODE_ENV;
    this.webserverConfig = this.createWebserverConfig(env);
    this.ormConfig = this.createOrmConfig(env);
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
