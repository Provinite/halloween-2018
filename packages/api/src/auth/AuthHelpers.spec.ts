import { User } from "../models";
import { hasRole } from "./AuthHelpers";
import { mockRoles } from "./mocks/Roles";
import { RoleLiteral } from "./RoleLiteral";

describe("AuthHelpers", () => {
  describe("hasRole", () => {
    let mockAdmin: User;
    let mockUser: User;
    let mockModerator: User;
    let mockSuperUser: User;
    const makeMocks = () => {
      mockAdmin = makeMockUser(["admin", "user"]);
      mockUser = makeMockUser(["user"]);
      mockModerator = makeMockUser(["moderator", "user"]);
      mockSuperUser = makeMockUser(["admin", "moderator", "user"]);
    };
    makeMocks();
    beforeEach(() => {
      makeMocks();
    });
    describe.each([
      [mockAdmin, true, false, true, true],
      [mockUser, false, false, true, true],
      [mockModerator, false, true, true, true],
      [mockSuperUser, true, true, true, true]
    ])("hasRole", (user, isAdmin, isMod, isUser, isPublic) => {
      it(`${user.roles} is admin: ${isAdmin}`, () => {
        expect(hasRole(user, "admin")).toBe(isAdmin);
      });
      it(`${user.roles} is moderator: ${isMod}`, () => {
        expect(hasRole(user, "moderator")).toBe(isMod);
      });
      it(`${user.roles} is user: ${isUser}`, () => {
        expect(hasRole(user, "user")).toBe(isUser);
      });
      it(`${user.roles} is public: ${isPublic}`, () => {
        expect(hasRole(user, "public")).toBe(isPublic);
      });
    });
  });
});

/**
 * Create a mock user with the specified roles
 * @param roles - The roles, eg ["admin","moderator"]
 */
function makeMockUser(roles: RoleLiteral[]) {
  return ({
    roles: roles
      .map(r => (r === "public" ? undefined : mockRoles[r]))
      .filter(_ => _)
  } as unknown) as User;
}
