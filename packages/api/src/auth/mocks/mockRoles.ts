import { ROLES } from "@clovercoin/constants";
import { Role } from "../../models";
import { makeGetterObject } from "../../test/testUtils";

const makeMockRole = (id: number, name: string): Role => ({ id, name });

export const mockRoles = makeGetterObject({
  admin: () => makeMockRole(1, ROLES.admin),
  moderator: () => makeMockRole(2, ROLES.moderator),
  user: () => makeMockRole(3, ROLES.user)
});
