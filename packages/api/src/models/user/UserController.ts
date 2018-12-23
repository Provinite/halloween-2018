import { Connection, Repository } from "typeorm";
import { RoleLiteral } from "../../auth/RoleLiteral";
import {
  IFallbackHandlerMap,
  RestRepositoryController
} from "../../controllers/RestRepositoryController";
import { HttpMethod } from "../../HttpMethod";
import { Controller } from "../../reflection/Controller";
import { Route } from "../../reflection/Route";
import { Role } from "../Role";
import { User } from "../User";

@Controller()
export class UserController extends RestRepositoryController<User> {
  protected defaultRoles: RoleLiteral[] = ["user"];
  constructor(
    orm: Connection,
    private userRepository: Repository<User>,
    private roleRepository: Repository<Role>
  ) {
    super(orm, User);
  }

  /**
   * Add a role to a user.
   */
  @Route({
    route: "/users/{userId}/roles/{roleId}",
    method: HttpMethod.PUT,
    roles: ["admin"]
  })
  async addRole(userId: string, roleId: string) {
    const [user, role] = await Promise.all([
      this.userRepository.findOneOrFail(userId),
      this.roleRepository.findOneOrFail(roleId)
    ]);
    user.roles.push(role);
    await this.userRepository.save(user);
    return await this.userRepository.findOneOrFail(userId);
  }

  /**
   * Remove a role from a user.
   */
  @Route({
    route: "/users/{userId}/roles/{roleId}",
    method: HttpMethod.DELETE,
    roles: ["admin"]
  })
  async removeRole(userId: string, roleId: string) {
    const user = await this.userRepository.findOneOrFail(userId);
    user.roles = user.roles.filter(role => {
      return role.id !== Number(roleId);
    });
    await this.userRepository.save(user);
    return await this.userRepository.findOneOrFail(userId);
  }

  /**
   * @override
   * Prevent standard PATCH, DELETE, and POST actions.
   */
  configureFallbackHandlers(fallbackHandlers: IFallbackHandlerMap) {
    delete fallbackHandlers[this.listRoute][HttpMethod.POST];
    delete fallbackHandlers[this.detailRoute][HttpMethod.DELETE];
    delete fallbackHandlers[this.detailRoute][HttpMethod.PATCH];
    fallbackHandlers[this.listRoute][HttpMethod.GET].roles = ["admin"];
  }
}
