import { ROLES } from "@clovercoin/constants";
import { Role } from "../../Role";
import { makeGetterObject } from "../../../test/testUtils";
import { RealRoleLiteral } from "../../../auth/RoleLiteral";

const ids = {
  user: 1,
  admin: 2,
  moderator: 3
};
const mockRoleCreator = (roleName: RealRoleLiteral) => {
  return () => {
    const role = new Role();
    role.name = ROLES[roleName];
    role.id = ids[roleName];
    return role;
  };
};

export const mockRoles = makeGetterObject(
  (["user", "admin", "moderator"] as const).reduce(
    (obj, roleName) => {
      obj[roleName] = mockRoleCreator(roleName);
      return obj;
    },
    {} as { [k in RealRoleLiteral]: () => Role }
  )
);
