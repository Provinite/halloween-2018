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
