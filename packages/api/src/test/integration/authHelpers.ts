import { RealRoleLiteral } from "../../auth/RoleLiteral";
import { In } from "typeorm";
import { ROLES } from "@clovercoin/constants";
import { getTestAppContext } from "./testHelpers";

let userSuffix = 0;
export async function createTestUser({
  principal = "TestUser-" + userSuffix,
  password = "password",
  roles = ["user"]
}: {
  principal?: string;
  password?: string;
  roles?: RealRoleLiteral[];
}) {
  userSuffix++;
  const {
    authenticationService,
    userRepository,
    roleRepository
  } = getTestAppContext();
  const user = await authenticationService.registerUser(principal, password);
  const roleModels = await roleRepository.find({
    name: In(roles.map(r => ROLES[r]))
  });
  user.roles = roleModels;
  return userRepository.save(user);
}
