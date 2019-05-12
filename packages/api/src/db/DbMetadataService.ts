import { Connection } from "typeorm";
import { Component } from "../reflection/Component";
import { Constructor } from "../reflection/Constructor";

@Component("SCOPED")
export class DbMetadataService {
  constructor(public orm: Connection) {}
  /**
   * Fetch typeorm metadata for the specified model class.
   * @param ModelClass - The model type to get metadata for.
   */
  getModelMetadata(ModelClass: Constructor) {
    return this.orm.getMetadata(ModelClass);
  }

  /**
   * Get default select fields for the given model class.
   * @param ModelClass
   */
  getDefaultSelect<T>(ModelClass: Constructor<T>): Array<keyof T> {
    return this.getModelMetadata(ModelClass)
      .columns.filter(c => c.isSelect)
      .map(c => c.propertyName) as any;
  }
}

declare global {
  interface ApplicationContextMembers {
    /** Service for interacting with typeorm database metadata. */
    dbMetadataService: DbMetadataService;
  }
}
