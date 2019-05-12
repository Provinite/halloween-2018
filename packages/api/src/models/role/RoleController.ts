import { RoleLiteral } from "../../auth/RoleLiteral";
import { ApplicationContext } from "../../config/context/ApplicationContext";
import {
  IFallbackHandlerMap,
  RestRepositoryController
} from "../../controllers/RestRepositoryController";
import { HttpMethod } from "../../HttpMethod";
import { Controller } from "../../reflection/Controller";
import { Role } from "../Role";

@Controller()
export class RoleController extends RestRepositoryController<Role> {
  protected defaultRoles: RoleLiteral[] = ["public"];
  /** @inject */
  constructor({ orm }: ApplicationContext) {
    super(orm, Role);
  }

  /**
   * @override
   * Remove deleteOne, createOne, updateOne endpoints.
   */
  configureFallbackHandlers(fallbackHandlers: IFallbackHandlerMap) {
    delete fallbackHandlers[this.detailRoute][HttpMethod.DELETE];
    delete fallbackHandlers[this.detailRoute][HttpMethod.PATCH];
    delete fallbackHandlers[this.listRoute][HttpMethod.POST];
  }
}
