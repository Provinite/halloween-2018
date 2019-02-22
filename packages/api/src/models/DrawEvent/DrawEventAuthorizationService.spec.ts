import * as _dateFns from "date-fns";
import { Connection } from "typeorm";
import { PermissionDeniedError } from "../../auth/PermissionDeniedError";
import { roleLiteralSpec } from "../../test/testUtils";
import { DrawEvent } from "../DrawEvent";
import { mockUsers } from "../user/mocks/mockUsers";
import { DrawEventAuthorizationService } from "./DrawEventAuthorizationService";
import { DrawEventRepository } from "./DrawEventRepository";
import { DrawRateLimitExceededError } from "./DrawRateLimitExceededError";
const dateFns: jest.Mocked<typeof _dateFns> = _dateFns as any;
jest.mock("date-fns");
interface IMocks {
  drawEventRepository: jest.Mocked<DrawEventRepository>;
  orm: jest.Mocked<Connection>;
}
describe("DrawEventAuthorizationService", () => {
  let service: DrawEventAuthorizationService;
  let mocks: IMocks;
  jest.spyOn(dateFns, "differenceInSeconds");
  beforeEach(() => {
    mocks = {
      drawEventRepository: {
        getLastDrawEvent: jest.fn()
      } as any,
      orm: {
        getCustomRepository: jest.fn()
      } as any
    };
    service = new DrawEventAuthorizationService();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe("canCreate", () => {
    beforeEach(() => {
      dateFns.differenceInSeconds.mockReturnValue(100);
      mocks.drawEventRepository.getLastDrawEvent.mockResolvedValue(undefined);
      mocks.orm.getCustomRepository.mockReturnValue(mocks.drawEventRepository);
    });
    it("does not allow users to create draw events for others", async () => {
      const mockUser = mockUsers.user;
      const mockDrawEvent = new DrawEvent();
      mockDrawEvent.user = mockUsers.user;
      mockDrawEvent.user.deviantartUuid = "a-different-uuid";
      await expect(
        service.canCreate(mockUser, mockDrawEvent, mocks.orm)
      ).rejects.toBeInstanceOf(PermissionDeniedError);
    });
    it("allows users to create draw events for themselves once per 30 seconds", async () => {
      dateFns.differenceInSeconds.mockReturnValue(31);
      const mockUser = mockUsers.user;
      const mockDrawEvent = new DrawEvent();
      mockDrawEvent.user = mockUser;
      await expect(
        service.canCreate(mockUser, mockDrawEvent, mocks.orm)
      ).resolves.toBe(true);
    });
    it("does not allow users to create a draw event within 30 seconds", async () => {
      dateFns.differenceInSeconds.mockReturnValue(29);
      const mockLastDrawEvent = new DrawEvent();
      mockLastDrawEvent.createDate = new Date();
      mocks.drawEventRepository.getLastDrawEvent.mockResolvedValue(
        mockLastDrawEvent
      );
      const mockUser = mockUsers.user;
      const mockDrawEvent = new DrawEvent();
      mockDrawEvent.user = mockUser;
      await expect(
        service.canCreate(mockUser, mockDrawEvent, mocks.orm)
      ).rejects.toBeInstanceOf(DrawRateLimitExceededError);
    });
    it("does not allow public to create draw events", async () => {
      await expect(
        service.canCreate(
          mockUsers.public,
          { user: mockUsers.public },
          mocks.orm
        )
      ).rejects.toBeInstanceOf(PermissionDeniedError);
    });
  });
  describe("canRead", () => {
    roleLiteralSpec(
      "allows %p to read their own draw events",
      async roleName => {
        const mockUser = mockUsers[roleName];
        const mockDrawEvent = new DrawEvent();
        mockDrawEvent.user = mockUser;
        expect(await service.canRead(mockUser, mockDrawEvent)).toBe(true);
      },
      ["public"]
    );
  });
  describe("canUpdate", () => {
    roleLiteralSpec("does not allow %p to update", async roleName => {
      const mockDrawEvent = new DrawEvent();
      mockDrawEvent.user = mockUsers.user;
      const mockUser = mockUsers[roleName];
      expect(await service.canUpdate(mockUser, mockDrawEvent)).toBe(false);
    });
  });
  describe("canDelete", () => {
    roleLiteralSpec("does not allow %p to delete", async roleName => {
      const mockDrawEvent = new DrawEvent();
      mockDrawEvent.user = mockUsers.user;
      const mockUser = mockUsers[roleName];
      expect(await service.canUpdate(mockUser, mockDrawEvent)).toBe(false);
    });
  });
  describe("canRead", () => {
    roleLiteralSpec(
      "does not allow %p to read other user's draws",
      async roleName => {
        const mockDrawEvent = new DrawEvent();
        mockDrawEvent.user = mockUsers.user;
        mockDrawEvent.user.deviantartUuid = "some-other-uuid";
        const mockUser = mockUsers[roleName];
        expect(await service.canRead(mockUser, mockDrawEvent)).toBe(false);
      },
      ["admin"]
    );
    roleLiteralSpec(
      "allows %p to read their own draw event",
      async roleName => {
        const mockDrawEvent = new DrawEvent();
        const mockUser = mockUsers[roleName];
        mockDrawEvent.user = mockUser;
        expect(await service.canRead(mockUser, mockDrawEvent)).toBe(true);
      },
      ["public"]
    );
    it("allows admins to read other's draw events", async () => {
      const mockDrawEvent = new DrawEvent();
      mockDrawEvent.user = mockUsers.user;
      expect(await service.canRead(mockUsers.admin, mockDrawEvent)).toBe(true);
    });
  });
  describe("canUpdate", () => {
    roleLiteralSpec("does not allow %p to update", async roleName => {
      const mockUser = mockUsers[roleName];
      const mockDrawEvent = new DrawEvent();
      mockDrawEvent.user = mockUser;
      expect(await service.canUpdate(mockUser, mockDrawEvent)).toBe(false);
    });
  });
  describe("canReadMultiple", () => {
    roleLiteralSpec(
      "allows %p to read their own",
      async roleName => {
        const mockUser = mockUsers[roleName];
        const filter = { where: { user: mockUser.deviantartUuid } };
        expect(await service.canReadMultiple(mockUser, filter)).toBe(true);
      },
      ["public"]
    );
    roleLiteralSpec(
      "does not allow %p to read multiple of others",
      async roleName => {
        const mockUser = mockUsers[roleName];
        const filter = { where: { user: mockUser.deviantartUuid + "1" } };
        await expect(
          service.canReadMultiple(mockUser, filter)
        ).rejects.toBeInstanceOf(PermissionDeniedError);
      },
      ["admin", "public"]
    );
    it('does not allow "public" to read multiple', async () => {
      await expect(
        service.canReadMultiple(mockUsers.public, null)
      ).rejects.toBeInstanceOf(PermissionDeniedError);
    });
  });
});
