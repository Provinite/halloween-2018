import * as _dateFns from "date-fns";
import { PermissionDeniedError } from "../../auth/PermissionDeniedError";
import {
  RequestContainer,
  RequestContext
} from "../../config/context/RequestContext";
import { roleLiteralSpec } from "../../test/testUtils";
import { DrawEvent } from "../DrawEvent";
import { mockGames } from "../game/mocks/mockGames";
import { User } from "../User";
import { mockUsers } from "../user/mocks/mockUsers";
import { DrawEventAuthorizationService } from "./DrawEventAuthorizationService";
import { DrawEventRepository } from "./DrawEventRepository";
import { DrawRateLimitExceededError } from "./DrawRateLimitExceededError";
const dateFns: jest.Mocked<typeof _dateFns> = _dateFns as any;
jest.mock("date-fns");
describe("DrawEventAuthorizationService", () => {
  let service: DrawEventAuthorizationService;
  jest.spyOn(dateFns, "differenceInSeconds");
  let context: {
    user: User;
    drawEventRepository: jest.Mocked<DrawEventRepository>;
    container: jest.Mocked<RequestContainer>;
  };
  beforeEach(() => {
    context = {
      user: mockUsers.user as any,
      container: {
        build: jest.fn(fn => fn(context))
      } as any,
      drawEventRepository: {} as any
    };
    service = new DrawEventAuthorizationService(
      (context as unknown) as RequestContext
    );
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe("canCreate", () => {
    beforeEach(() => {
      dateFns.differenceInSeconds.mockReturnValue(100);
      context.drawEventRepository.getLastDrawEvent = jest
        .fn()
        .mockResolvedValue(undefined);
    });
    it("does not allow users to create draw events for others", async () => {
      // const mockUser = mockUsers.user;
      const mockDrawEvent = new DrawEvent();
      mockDrawEvent.user = mockUsers.user;
      mockDrawEvent.user.deviantartUuid = "a-different-uuid";
      await expect(
        service.canCreate(
          // mockUser,
          mockDrawEvent // , context.orm
        )
      ).rejects.toBeInstanceOf(PermissionDeniedError);
    });
    it("allows users to create draw events for themselves once per 30 seconds", async () => {
      dateFns.differenceInSeconds.mockReturnValue(31);
      const mockUser = mockUsers.user;
      const mockDrawEvent = new DrawEvent();
      mockDrawEvent.user = mockUser;
      await expect(
        service.canCreate(
          // mockUser,
          mockDrawEvent // , context.orm
        )
      ).resolves.toBe(true);
    });
    it("does not allow users to create a draw event within 30 seconds", async () => {
      dateFns.differenceInSeconds.mockReturnValue(29);
      const mockLastDrawEvent = new DrawEvent();
      mockLastDrawEvent.createDate = new Date();
      context.drawEventRepository.getLastDrawEvent.mockResolvedValue(
        mockLastDrawEvent
      );
      const mockUser = mockUsers.user;
      const mockDrawEvent = new DrawEvent();
      mockDrawEvent.user = mockUser;
      await expect(
        service.canCreate(
          // mockUser,
          mockDrawEvent // , context.orm
        )
      ).rejects.toBeInstanceOf(DrawRateLimitExceededError);
    });
    it("does not allow public to create draw events", async () => {
      expect(mockUsers.public).toBeUndefined();
      const data = {
        user: mockUsers.public!,
        game: mockGames.sample
      };
      await expect(
        service.canCreate(data, mockUsers.user)
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
        await expect(service.canRead(mockUser, mockDrawEvent)).resolves.toBe(
          true
        );
      },
      ["public"]
    );
  });
  describe("canDelete", () => {
    roleLiteralSpec("does not allow %p to delete", async roleName => {
      const mockDrawEvent = new DrawEvent();
      mockDrawEvent.user = mockUsers.user;
      const mockUser = mockUsers[roleName];
      await expect(service.canDelete(mockUser)).rejects.toBeInstanceOf(
        PermissionDeniedError
      );
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
        await expect(
          service.canRead(mockUser, mockDrawEvent)
        ).rejects.toBeInstanceOf(PermissionDeniedError);
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
      if (mockUser) mockDrawEvent.user = mockUser;
      await expect(
        service.canUpdate(mockUser, mockDrawEvent)
      ).rejects.toBeInstanceOf(PermissionDeniedError);
    });
  });
  describe("canReadMultiple", () => {
    roleLiteralSpec(
      "allows %p to read their own",
      async roleName => {
        const mockUser = mockUsers[roleName];
        const filter = { where: { user: mockUser.deviantartUuid } };
        await expect(service.canReadMultiple(filter, mockUser)).resolves.toBe(
          true
        );
      },
      ["public"]
    );
    roleLiteralSpec(
      "does not allow %p to read multiple of others",
      async roleName => {
        const mockUser = mockUsers[roleName];
        const filter = { where: { user: mockUser.deviantartUuid + "1" } };
        await expect(
          service.canReadMultiple(filter, mockUser)
        ).rejects.toBeInstanceOf(PermissionDeniedError);
      },
      ["admin", "public"]
    );
    it('does not allow "public" to read multiple', async () => {
      await expect(
        service.canReadMultiple({}, mockUsers.public)
      ).rejects.toBeInstanceOf(PermissionDeniedError);
    });
  });
});
