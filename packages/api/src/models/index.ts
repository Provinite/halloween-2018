import { Prize } from "./Prize";
export { Prize } from "./Prize";
export { Role } from "./Role";
import { DrawEvent } from "./DrawEvent";
import { Role } from "./Role";
import { User } from "./User";
export { DrawEvent } from "./DrawEvent";
export { User } from "./User";
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
