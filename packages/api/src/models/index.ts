import { Prize } from "./Prize";
export { Prize } from "./Prize";
export { Role } from "./Role";
import { Role } from "./Role";
import { User } from "./User";
export { User } from "./User";
/**
 * Interface representing a model constructor function.
 */
export interface IModelClass<T = any> {
  createInitialEntities?: (...args: any[]) => Promise<any>;
  new (...args: any[]): T;
}
export const MODELS: IModelClass[] = [User, Prize, Role];
