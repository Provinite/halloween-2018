import { EntityManager } from "typeorm";
import { DrawEvent } from "../DrawEvent";
import { User } from "../User";
import { mockUsers } from "../user/mocks/mockUsers";
import { DrawEventRepository } from "./DrawEventRepository";

describe("DrawEventRepository", () => {
  let repository: DrawEventRepository;
  let mockManager: jest.Mocked<EntityManager>;
  let mockUser: User;
  beforeEach(() => {
    mockManager = {
      find: jest.fn()
    } as any;
    repository = new DrawEventRepository();
    (repository as any).manager = mockManager;
    mockUser = mockUsers.user;
  });
  describe("getLastDrawEvent", async () => {
    it("returns undefined when there are none", async () => {
      mockManager.find.mockResolvedValue([]);
      const result = await repository.getLastDrawEvent(mockUser);
      expect(result).toBeUndefined();
    });
    it("fetches and returns the most recent event", async () => {
      const mockDraw = new DrawEvent();
      mockDraw.user = mockUser;
      mockDraw.prize = null;
      mockManager.find.mockResolvedValue([mockDraw]);
      const result = await repository.getLastDrawEvent(mockUser);
      expect(mockManager.find).toHaveBeenCalledWith(DrawEvent, {
        where: { user: mockUser },
        take: 1,
        order: {
          createDate: "DESC"
        }
      });
      expect(result).toBe(mockDraw);
    });
    it("throws if user is undefined", async () => {
      await expect(repository.getLastDrawEvent(undefined)).rejects.toEqual(
        expect.objectContaining({
          message: "Cannot get last draw event without user."
        })
      );
    });
  });
});
