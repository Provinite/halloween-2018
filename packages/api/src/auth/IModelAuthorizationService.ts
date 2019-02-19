import { Connection, EntityManager, FindManyOptions } from "typeorm";
import { User } from "../models";

export interface IModelAuthorizationService<ModelType> {
  canCreate: (
    user: User,
    createModel: Partial<ModelType>,
    orm: Connection | EntityManager
  ) => Promise<boolean>;
  canDelete: (user: User, model: ModelType) => Promise<boolean>;
  canUpdate: (user: User, model: ModelType) => Promise<boolean>;
  canRead: (user: User, model: ModelType) => Promise<boolean>;
  canReadMultiple: (
    user: User,
    findOptions?: FindManyOptions<ModelType>
  ) => Promise<boolean>;
}
