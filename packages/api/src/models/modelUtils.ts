import {
  Connection,
  EntityManager,
  getMetadataArgsStorage,
  Repository
} from "typeorm";
import { IModelClass } from ".";

export function getRepositoryFor<T>(
  orm: EntityManager | Connection,
  modelClass: IModelClass<T>
): Repository<T> {
  const customRepository = getMetadataArgsStorage().entityRepositories.find(
    repository => repository.entity === modelClass
  );
  if (customRepository) {
    return orm.getCustomRepository(customRepository.target);
  }
  return orm.getRepository(modelClass);
}
