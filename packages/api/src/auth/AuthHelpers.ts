import { ROLES } from "@clovercoin/constants";
import { User } from "../models";
import { RoleLiteral } from "./RoleLiteral";

/**
 * Determine if a user has a specified role.
 * @param user - The user to check.
 * @param role - The role literal to check for, eg "user", "public".
 */
export function hasRole(user: User | null | undefined, role: RoleLiteral) {
  if (role === "public") {
    return true;
  }
  if (user === null || user === undefined) {
    return false;
  }
  const roleName = ROLES[role];
  return user.roles.some(userRole => userRole.name === roleName);
}
