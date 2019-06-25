import { Repository } from "typeorm";
import { AnyContext } from "../config/context/ApplicationContext";

export abstract class CustomRepository<ModelType> extends Repository<
  ModelType
> {
  /**
   * Method invoked to update the application context for the repository.
   */
  abstract setContext(ctx: AnyContext): void;
}
