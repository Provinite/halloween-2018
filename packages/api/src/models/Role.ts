import { ROLES } from "@clovercoin/constants";
import { Column, Entity, PrimaryGeneratedColumn, Repository } from "typeorm";
import { isDuplicateKeyError } from "../db/OrmErrors";

@Entity()
/**
 * Entity used to categorize users' access levels.
 */
export class Role {
  /**
   * Create the required initial roles. Creates each role defined in constants.
   * This method is a lifecycle hook that is fired by the OrmContext
   * configuration.
   * @param roleRepository - The role repository to use when creating initial
   *    roles.
   */
  static async createInitialEntities(roleRepository: Repository<Role>) {
    const requiredRoleNames = ROLES;
    for (const [, roleName] of Object.entries(requiredRoleNames)) {
      const role = roleRepository.create();
      role.name = roleName;
      try {
        await roleRepository.save(role);
      } catch (e) {
        // ignore duplicate key exceptions
        if (!isDuplicateKeyError(e)) {
          throw e;
        }
      }
    }
  }
  /**
   * @property id
   * Unique identifier.
   */
  @PrimaryGeneratedColumn()
  id: number;
  /**
   * @property name
   * A unique name for this role.
   */
  @Column({
    unique: true
  })
  name: string;
}
