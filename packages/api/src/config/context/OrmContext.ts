import { asFunction, asValue, AwilixContainer } from "awilix";
import { Connection, createConnection } from "typeorm";
import { MODELS } from "../../models";

/**
 * Create a repository name for the given model.
 * @param model - A model class.
 */
export function createRepositoryName(model: Function) {
  let name: string = model.name;
  name = name[0].toLowerCase() + name.substr(1);
  name += "Repository";
  return name;
}
/**
 * @class OrmContext
 * Container configuration class to provide access to the persistence layer.
 */
export class OrmContext {
  /**
   * @static @method configureContainer
   * Configures the DI container with ORM related registrations.
   * @configures {typeorm.Connection} orm
   * @configures {typeorm.Repository} [model]Repository for each model.
   * @param {AwilixContainer} container - The Awilix DI container to configure.
   */
  static async configureContainer(container: AwilixContainer) {
    // Create the typeorm connection
    const connection: Connection = await createConnection({
      type: "postgres",
      host: "localhost",
      username: "halloween2018",
      password: "halloween-password",
      database: "halloween2018",
      synchronize: true,
      entities: MODELS
    });

    // Register the ORM connection.
    container.register("orm", asValue(connection));

    // Register a repository for each model.
    MODELS.forEach(model => {
      const name = createRepositoryName(model);
      const proxy = (orm: Connection) => orm.getRepository(model);
      const resolver = asFunction(proxy).singleton();
      container.register(name, resolver);
    });
    return container;
  }
}
