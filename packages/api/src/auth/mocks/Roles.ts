import { ROLES } from "@clovercoin/constants";
import { Role } from "../../models";

export const mockRoles: Record<keyof typeof ROLES, Role> = {
  admin: { id: 1, name: ROLES.admin },
  moderator: { id: 2, name: ROLES.moderator },
  user: { id: 3, name: ROLES.user }
};
