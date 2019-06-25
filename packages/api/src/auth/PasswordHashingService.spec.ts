import { PasswordHashingService } from "./PasswordHashingService";
import * as bcrypt from "bcrypt";

describe("PasswordHashingService", () => {
  let svc: PasswordHashingService;
  beforeEach(() => {
    svc = new PasswordHashingService();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("hashPassword", () => {
    it("rejects if the password is empty", () => {
      return expect(svc.hashPassword("")).rejects.toMatchInlineSnapshot(
        `[Error: Non-empty password required to hash]`
      );
    });
    it("rejects if the password is over 72 characters", async () => {
      const password = "f".repeat(73);
      expect(svc.hashPassword(password)).rejects.toMatchInlineSnapshot(
        `[Error: Maximum password length exceeded, must not be greater than: 72]`
      );

      // justification for this test:
      const hash = await bcrypt.hash(password, 10);
      const otherPassword = password + "f";
      // passwords don't match
      expect(otherPassword).not.toEqual(password);
      // but otherPassword still satisfies our hash!
      await expect(bcrypt.compare(otherPassword, hash)).resolves.toBe(true);
    });
    it("returns the bcrypt hash with 10 salt rounds", async () => {
      const mockResult = "ting tang wallawallabingbang";
      jest.spyOn(bcrypt, "hash").mockResolvedValue(mockResult);
      const password = "f".repeat(72);
      const result = await svc.hashPassword("f".repeat(72));
      expect(result).toBe(mockResult);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });
  describe("verifyPasswordHash", () => {
    it("throws if password or hash are empty", async () => {
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      const password = "somePassword";
      const hash = "0xSomeHash";
      await expect(
        svc.verifyPasswordHash("", hash)
      ).rejects.toMatchInlineSnapshot(
        `[Error: Password and existing hash both required to verify credentials.]`
      );
      await expect(
        svc.verifyPasswordHash(password, "")
      ).rejects.toMatchInlineSnapshot(
        `[Error: Password and existing hash both required to verify credentials.]`
      );
    });
    it("returns the result of bcrypt compare", async () => {
      const mockResult = {} as any;
      jest.spyOn(bcrypt, "compare").mockResolvedValue(mockResult);
      const password = "somePassword";
      const hash = "0xSomeHash";
      const result = await svc.verifyPasswordHash(password, hash);
      expect(result).toBe(mockResult);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });
  });
  describe("integration", () => {
    describe.each([
      "somePassword",
      "$123.45aF",
      "ûteXx",
      "aA01189998819991187253",
      "aA".repeat(36)
    ])("valid password: %p", (password: string) => {
      it("matches: " + password, async () => {
        const hash = await svc.hashPassword(password);
        const matches = await svc.verifyPasswordHash(password, hash);
        expect(matches).toBe(true);
      });
      it("does not match: " + password.toLowerCase(), async () => {
        const hash = await svc.hashPassword(password);
        const matches = await svc.verifyPasswordHash(
          password.toLowerCase(),
          hash
        );
        expect(matches).toBe(false);
      });
    });
  });
});
