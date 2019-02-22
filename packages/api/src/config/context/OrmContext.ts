import { asFunction, asValue, AwilixContainer } from "awilix";
import { Connection, createConnection } from "typeorm";
import { asStaticMethod } from "../../AwilixHelpers";
import { MODELS } from "../../models";
import { getRepositoryFor } from "../../models/modelUtils";
import { EnvService } from "../env/EnvService";

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
   */
  static async configureContainer(
    container: AwilixContainer,
    envService: EnvService
  ) {
    const config = {
      ...envService.getOrmConfiguration(),
      entities: MODELS
    };
    // Create the typeorm connection
    const connection: Connection = await createConnection(config as any);

    // Register the ORM connection.
    container.register("orm", asValue(connection));

    MODELS.forEach(model => {
      // Register a repository for each model.
      const name = createRepositoryName(model);
      const proxy = (orm: Connection) => getRepositoryFor(orm, model);
      const resolver = asFunction(proxy);
      container.register(name, resolver);
    });

    // Fire off createInitialEntites for each model
    await Promise.all(
      MODELS.map(model =>
        model.createInitialEntities
          ? container.build(asStaticMethod(model.createInitialEntities))
          : Promise.resolve()
      )
    );

    return container;
  }
}
