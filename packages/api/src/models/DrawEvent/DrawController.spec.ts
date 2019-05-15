import { asFunction, asValue, AwilixContainer } from "awilix";
import { Connection, EntityManager, Repository } from "typeorm";
import { bind } from "../../AwilixHelpers";
import { TransactionService } from "../../db/TransactionService";
import * as _ModelUtils from "../../models/modelUtils";
import * as _RandomUtils from "../../RandomUtils";
import { createTestContainer } from "../../test/testUtils";
import { DrawEvent } from "../DrawEvent";
import * as DrawEventUtils from "../DrawEvent/DrawEventUtils";
import { Game } from "../Game";
import { GameAuthorizationService } from "../game/GameAuthorizationService";
import { mockGames } from "../game/mocks/mockGames";
import { Prize } from "../Prize";
import { mockPrizes } from "../prize/mocks/mockPrize";
import { NoPrizesInStockError } from "../prize/NoPrizesInStockError";
import { PrizeRepository } from "../prize/PrizeRepository";
import { mockUsers } from "../user/mocks/mockUsers";
import { DrawController } from "./DrawController";
import { DrawEventAuthorizationService } from "./DrawEventAuthorizationService";
import { DrawEventRepository } from "./DrawEventRepository";
const ModelUtils = _ModelUtils as jest.Mocked<typeof _ModelUtils>;
const RandomUtils = _RandomUtils as jest.Mocked<typeof _RandomUtils>;
describe("DrawController", () => {
  let mocks: {
    drawEventAuthorizationService: jest.Mocked<DrawEventAuthorizationService>;
    gameAuthorizationService: jest.Mocked<GameAuthorizationService>;
    drawEventRepository: jest.Mocked<DrawEventRepository>;
    gameRepository: jest.Mocked<Repository<Game>>;
    prizeRepository: jest.Mocked<PrizeRepository>;
    orm: jest.Mocked<Connection>;
    transactionService: jest.Mocked<TransactionService>;
    manager: jest.Mocked<EntityManager>;
  };
  let controller: DrawController;
  let container: AwilixContainer;

  beforeEach(() => {
    jest.spyOn(ModelUtils, "getRepositoryFor").mockImplementation();
    jest.spyOn(RandomUtils, "selectRandomItemFromPool");
    /** Dependencies */
    mocks = {
      drawEventAuthorizationService: {
        canCreate: jest.fn(),
        canReadMultiple: jest.fn()
      } as any,
      drawEventRepository: {
        save: jest.fn(),
        create: jest.fn(() => new DrawEvent()),
        find: jest.fn()
      } as any,
      prizeRepository: {
        save: jest.fn(),
        getInStockPrizeCount: jest.fn(),
        getInStockPrizesForUpdate: jest.fn()
      } as any,
      orm: {
        // gives this a unique look so that we can safely use .toEqual and
        // methods like calledWith that use it.
        mock: "mocks.orm"
      } as any,
      gameAuthorizationService: {
        canRead: jest.fn()
      } as any,
      gameRepository: {
        findOneOrFail: jest.fn()
      } as any,
      transactionService: {
        runTransaction: jest.fn()
      } as any,
      manager: {
        mock: "mocks.manager"
      } as any
    };

    /** Default Controller */
    controller = new DrawController();
    container = createTestContainer(mocks);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe("drawPrize", () => {
    beforeEach(() => {
      container.register(
        "pathVariables",
        asValue({ gameId: String(mockGames.sample.id) })
      );
      container.register("user", asValue(mockUsers.user));

      /** Stubs */
      const resolveIdentity = (arg: any) => Promise.resolve(arg);
      mocks.drawEventRepository.create.mockImplementation(
        () => new DrawEvent()
      );
      mocks.drawEventRepository.save.mockImplementation(resolveIdentity);
      mocks.prizeRepository.save.mockImplementation(resolveIdentity);
    });
    describe("without any prizes left", () => {
      beforeEach(() => {
        mocks.prizeRepository.getInStockPrizeCount.mockResolvedValue(0);
      });
      it("throws a NoPrizesInStockError", async () => {
        await expect(
          container.build(bind(controller.drawPrize, controller))
        ).rejects.toBeInstanceOf(NoPrizesInStockError);
      });
    });
    describe("rollWin: false", () => {
      beforeEach(() => {
        jest.spyOn(DrawEventUtils, "rollWin").mockReturnValue(false);
        mocks.drawEventRepository.save.mockImplementation(
          async drawEvent => drawEvent
        );
      });
      it("saves and returns a losing draw event", async () => {
        const mockUser = mockUsers.user;

        const result = await container.build(
          bind(controller.drawPrize, controller)
        );
        expect(mocks.drawEventRepository.create).toHaveBeenCalled();
        expect(mocks.drawEventRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({ prize: null, user: mockUser })
        );
        expect(result.isWin).toBe(false);
        expect(result.prize).toBe(null);
        expect(result.user).toEqual(mockUser);
      });
      it("runs the appropriate permission check", async () => {
        const mockError = { id: "some mock error" };
        mocks.drawEventAuthorizationService.canCreate.mockImplementation(
          async () => {
            throw mockError;
          }
        );
        await expect(
          container.build(bind(controller.drawPrize, controller))
        ).rejects.toBe(mockError);
        const losingDrawEvent = expect.objectContaining({
          user: mockUsers.user
        });
        expect(
          mocks.drawEventAuthorizationService.canCreate
        ).toHaveBeenCalledWith(losingDrawEvent);
        expect(mocks.drawEventRepository.save).not.toHaveBeenCalled();
      });
    });
    describe("rollWin: true", () => {
      beforeEach(() => {
        jest.spyOn(DrawEventUtils, "rollWin").mockReturnValue(true);
      });
      it("does almost all of its work in a transaction", async () => {
        await container.build(bind(controller.drawPrize, controller));
        expect(mocks.prizeRepository.getInStockPrizeCount).toHaveBeenCalled();
        expect(mocks.drawEventRepository.create).not.toHaveBeenCalled();
        expect(mocks.drawEventRepository.save).not.toHaveBeenCalled();
        expect(mocks.prizeRepository.save).not.toHaveBeenCalled();
        expect(
          mocks.drawEventAuthorizationService.canCreate
        ).not.toHaveBeenCalled();
      });
      describe("Transactional behavior", () => {
        let prizes: Prize[];
        beforeEach(() => {
          prizes = [mockPrizes.fullStock];
          mocks.prizeRepository.getInStockPrizesForUpdate.mockResolvedValue(
            prizes
          );
          mocks.transactionService.runTransaction.mockImplementation(
            async fn => {
              return container.build(asFunction(fn));
            }
          );
        });
        it("fetches in stock prizes for update", async () => {
          await container.build(bind(controller.drawPrize, controller));

          expect(
            mocks.prizeRepository.getInStockPrizesForUpdate
          ).toHaveBeenCalledTimes(1);
        });
        it("updates a random prize and saves a draw event targeting that prize", async () => {
          const mockSelection = mockPrizes.fullStock;
          RandomUtils.selectRandomItemFromPool.mockReturnValue(mockSelection);

          const result = await container.build(
            bind(controller.drawPrize, controller)
          );

          // it uses the pool selection helper
          expect(RandomUtils.selectRandomItemFromPool).toHaveBeenCalledWith(
            prizes,
            expect.any(Function)
          );
          expect(RandomUtils.selectRandomItemFromPool).toHaveBeenCalledTimes(1);
          // it saves the draw event with the resulting prize
          expect(mocks.drawEventRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              user: mockUsers.user,
              prize: mockSelection
            })
          );
          // it reduces the stock of the selected prize by 1
          expect(mocks.prizeRepository.save).toHaveBeenCalledWith({
            ...mockPrizes.fullStock,
            currentStock: mockPrizes.fullStock.currentStock - 1
          });
          // it returns the created draw event
          expect(result).toEqual(
            expect.objectContaining({
              prize: {
                ...mockPrizes.fullStock,
                currentStock: mockPrizes.fullStock.initialStock - 1
              },
              user: mockUsers.user
            })
          );
        });
        it("bubbles auth errors", async () => {
          const mockErr = { message: "some error message" };
          mocks.drawEventAuthorizationService.canCreate.mockRejectedValue(
            mockErr
          );
          await expect(
            container.build(bind(controller.drawPrize, controller))
          ).rejects.toBe(mockErr);
          expect(
            mocks.drawEventAuthorizationService.canCreate
          ).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
  describe("getDraws", () => {
    beforeEach(() => {
      container.register("user", asValue(mockUsers.user));
      container.register(
        "pathVariables",
        asValue({ userId: mockUsers.user.deviantartUuid })
      );
    });
    it("fetches prizes for the current user", async () => {
      await container.build(bind(controller.getDraws, controller));
      expect(mocks.drawEventRepository.find).toHaveBeenCalledWith({
        where: { user: mockUsers.user.deviantartUuid }
      });
    });
    it("bubbles errors from drawEventAuthorizationService.canReadMultiple", async () => {
      const mockError = { message: "some message" };
      mocks.drawEventAuthorizationService.canReadMultiple.mockImplementation(
        async () => {
          throw mockError;
        }
      );
      await expect(
        container.build(bind(controller.getDraws, controller))
      ).rejects.toBe(mockError);
    });
  });
});
