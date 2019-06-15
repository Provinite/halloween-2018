/**
 * This interface documents what environmental variables are utilized by the
 * application.
 */
// tslint:disable-next-line
export interface ENV_VARS {
  // ====================
  // ORM Configuration
  // ====================

  /**
   * The database URL to use. Overrides username, password, host, and database.
   */
  DATABASE_URL: string;
  /** The database connection username. */
  cch2018_orm_username: string;
  /** The database connection password. */
  cch2018_orm_password: string;
  /** The database provider. See typeorm docs for options. */
  cch2018_orm_type: string;
  /** The database host. */
  cch2018_orm_host: string;
  /** The database port. */
  cch2018_orm_port: string;
  /** The database name. */
  cch2018_orm_database: string;
  /** True to synchronize (autogenerate schema) on connection. */
  cch2018_orm_synchronize: boolean;

  // ====================
  // Token Configuration
  // ====================

  /** The auth token secret to use */
  cch2018_token_secret: string;
  // ====================
  // Webserver Configuration
  // ====================

  /** The port to listen on. */
  PORT: number;

  // ====================
  // Deviantart API Config
  // ====================
  /** The Deviantart application client id */
  cch2018_da_client_id: number;
  /** The Deviantart application client secret */
  cch2018_da_client_secret: string;
  /** The deviantart api oauth endpoint */
  cch2018_da_oauth_endpoint: string;
  /** The deviantart api base route (with trailing slash) */
  cch2018_da_baseroute: string;
  /** The redirect URI for authorization requests. */
  cch2018_da_redirect_uri: string;
}
