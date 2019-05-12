import { asFunction, asValue, Lifetime } from "awilix";
import { Connection, createConnection, EntityManager } from "typeorm";
import { MODELS } from "../../models";
import { getRepositoryFor } from "../../models/modelUtils";
import { AnyContext, ApplicationContext } from "./ApplicationContext";

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
   * @inject
   */
  static async configureContainer({
    container,
    envService
  }: ApplicationContext) {
    const config = {
      ...envService.getOrmConfiguration(),
      entities: MODELS
    };
    // Create the typeorm connection
    const connection: Connection = await createConnection(config as any);

    // Register the ORM connection.
    container.register("orm", asValue(connection));
    // make a proxy to always grab the "manager" off of the current container's
    // ORM
    container.register(
      "manager",
      asFunction(({ orm }: AnyContext) => orm.manager, {
        lifetime: Lifetime.TRANSIENT
      })
    );

    MODELS.forEach(model => {
      // Register a scoped repository for each model.
      const name = createRepositoryName(model);
      /** @inject */
      const proxy = ({ manager }: AnyContext) =>
        getRepositoryFor(manager, model);
      const resolver = asFunction(proxy);
      container.register(name as keyof ApplicationContext, resolver);
    });

    // Fire off createInitialEntites for each model
    await Promise.all(
      MODELS.map(model =>
        model.createInitialEntities
          ? container.build(model.createInitialEntities)
          : Promise.resolve()
      )
    );

    return container;
  }
}

declare global {
  interface ApplicationContextMembers {
    /** The typeorm connection for the application */
    orm: Connection;
    /** The entity manager for this container */
    manager: EntityManager;
  }
}
