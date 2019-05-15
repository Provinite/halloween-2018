import { Role, User } from "../models";
import { hasRole } from "./AuthHelpers";
import { mockRoles } from "./mocks/mockRoles";
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
    ])(
      "hasRole",
      (
        user: User,
        isAdmin: boolean,
        isMod: boolean,
        isUser: boolean,
        isPublic: boolean
      ) => {
        const roleStr = JSON.stringify(user.roles.map((r: Role) => r.name));
        it(`${roleStr} is admin: ${isAdmin}`, () => {
          expect(hasRole(user, "admin")).toBe(isAdmin);
        });
        it(`${roleStr} is moderator: ${isMod}`, () => {
          expect(hasRole(user, "moderator")).toBe(isMod);
        });
        it(`${roleStr} is user: ${isUser}`, () => {
          expect(hasRole(user, "user")).toBe(isUser);
        });
        it(`${roleStr} is public: ${isPublic}`, () => {
          expect(hasRole(user, "public")).toBe(isPublic);
        });
      }
    );
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
