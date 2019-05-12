import { Prize } from "./Prize";
export { Prize } from "./Prize";
export { Role } from "./Role";
import { DrawEvent } from "./DrawEvent";
import { Role } from "./Role";
import { User } from "./User";
export { DrawEvent } from "./DrawEvent";
export { User } from "./User";
import { Repository } from "typeorm";
import { Game } from "./Game";
export { Game } from "./Game";
/**
 * Interface representing a model constructor function.
 */
export interface IModelClass<T = any> {
  createInitialEntities?: (...args: any[]) => Promise<any>;
  new (...args: any[]): T;
}
export const MODELS: IModelClass[] = [User, Prize, Role, DrawEvent, Game];

declare global {
  interface ApplicationContext {
    // see OrmContext for creation of these default repositories
    // if a custom repository is created for any model in this list,
    // remove it from here and declare its more specific type in the
    // implementation file
    userRepository: Repository<User>;
    roleRepository: Repository<Role>;
    gameRepository: Repository<Game>;
  }
}
