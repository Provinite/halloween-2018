import { RoleLiteral } from "../../auth/RoleLiteral";

export async function createTestUser(password: string, roles: RoleLiteral[]) {
  const appInstance = global.testAppInstance;
  const {
    authenticationService,
    userRepository,
    roleRepository
  } = appInstance.context;
  const user = await authenticationService.registerUser(
    "username",
    password || "password"
  );
  const roleModels = await roleRepository.find();
  user.roles = roleModels;
  return userRepository.save(user);
}
