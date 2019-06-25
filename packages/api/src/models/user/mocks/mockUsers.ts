import { mockRoles } from "../../../auth/mocks/mockRoles";
import { makeGetterObject } from "../../../test/testUtils";
import { User } from "../../User";
import { RequestUser } from "../../../middlewares/AuthorizationMiddlewareFactory";

const admin = () => {
  const adminUser = new User();
  adminUser.displayName = "Provinite";
  adminUser.id = 1;
  adminUser.iconUrl = "http://www.example.com/iconurl.gif";
  adminUser.roles = [mockRoles.admin, mockRoles.user];
  return adminUser;
};

const user = () => {
  const userUser = new User();
  userUser.displayName = "PillowingFan";
  userUser.id = 2;
  userUser.iconUrl = "http://www.example.com/iconurl.ping";
  userUser.roles = [mockRoles.user];
  return userUser;
};

const moderator = () => {
  const moderatorUser = new User();
  moderatorUser.displayName = "TheActualBest";
  moderatorUser.id = 3;
  moderatorUser.iconUrl = "http://www.example.com/iconurl.jpg";
  moderatorUser.roles = [mockRoles.moderator, mockRoles.user];
  return moderatorUser;
};

export const mockUsers = makeGetterObject({
  admin,
  moderator,
  user,
  public: () => undefined as RequestUser
});
