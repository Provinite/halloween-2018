import { Connection, EntityManager, Repository } from "typeorm";
import * as _ModelUtils from "../../models/modelUtils";
import * as _RandomUtils from "../../RandomUtils";
import { DrawEvent } from "../DrawEvent";
import * as DrawEventUtils from "../DrawEvent/DrawEventUtils";
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
    authService: jest.Mocked<DrawEventAuthorizationService>;
    drawEventRepository: jest.Mocked<DrawEventRepository>;
    prizeRepository: jest.Mocked<PrizeRepository>;
    orm: jest.Mocked<Connection>;
    transactionalManager: jest.Mocked<EntityManager>;
  };
  let controller: DrawController;

  beforeEach(() => {
    jest.spyOn(ModelUtils, "getRepositoryFor").mockImplementation();
    jest.spyOn(RandomUtils, "selectRandomItemFromPool");
    mocks = {
      authService: {
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
        mock: "mocks.orm",
        transaction: jest.fn()
      } as any,
      transactionalManager: {
        getCustomRepository: jest.fn(),
        getRepository: jest.fn()
      } as any
    };
    controller = new DrawController(mocks.orm, mocks.authService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe("drawPrize", () => {
    describe("without any prizes left", () => {
      beforeEach(() => {
        mocks.prizeRepository.getInStockPrizeCount.mockResolvedValue(0);
      });
      it("throws a NoPrizesInStockError", async () => {
        await expect(
          controller.drawPrize(
            mockUsers.user,
            mocks.drawEventRepository,
            mocks.prizeRepository
          )
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
        const result = await controller.drawPrize(
          mockUser,
          mocks.drawEventRepository,
          mocks.prizeRepository
        );
        expect(mocks.drawEventRepository.create).toHaveBeenCalled();
        expect(mocks.drawEventRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({ prize: null, user: mockUser })
        );
        expect(result.isWin).toBe(false);
        expect(result.prize).toBe(null);
        expect(result.user).toBe(mockUser);
      });
      it("runs the appropriate permission check", async () => {
        const mockError = { id: "some mock error" };
        mocks.authService.canCreate.mockImplementation(async () => {
          throw mockError;
        });
        await expect(
          controller.drawPrize(
            mockUsers.user,
            mocks.drawEventRepository,
            mocks.prizeRepository
          )
        ).rejects.toBe(mockError);
        const losingDrawEvent = expect.objectContaining({
          user: mockUsers.user
        });
        expect(mocks.authService.canCreate).toHaveBeenCalledWith(
          mockUsers.user,
          losingDrawEvent,
          mocks.orm
        );
        expect(mocks.drawEventRepository.save).not.toHaveBeenCalled();
      });
    });
    describe("rollWin: true", () => {
      beforeEach(() => {
        jest.spyOn(DrawEventUtils, "rollWin").mockReturnValue(true);
        jest.spyOn(mocks.orm, "transaction").mockImplementation(async fn => {
          await Promise.resolve();
          return fn(mocks.transactionalManager);
        });
      });
      it("does almost all of its work in a transaction", async () => {
        mocks.orm.transaction.mockResolvedValue(undefined);
        await controller.drawPrize(
          mockUsers.user,
          mocks.drawEventRepository,
          mocks.prizeRepository
        );
        expect(mocks.prizeRepository.getInStockPrizeCount).toHaveBeenCalled();
        expect(mocks.drawEventRepository.create).not.toHaveBeenCalled();
        expect(mocks.drawEventRepository.save).not.toHaveBeenCalled();
        expect(mocks.prizeRepository.save).not.toHaveBeenCalled();
        expect(mocks.authService.canCreate).not.toHaveBeenCalled();
      });
      describe("Transactional behavior", () => {
        let txMocks: {
          prizeRepository: jest.Mocked<PrizeRepository>;
          drawEventRepository: jest.Mocked<Repository<DrawEvent>>;
          manager: jest.Mocked<EntityManager>;
          prizes: Prize[];
        };
        beforeEach(() => {
          // transactional mocks
          txMocks = {
            prizeRepository: {
              save: jest.fn(),
              getInStockPrizesForUpdate: jest.fn()
            } as any,
            drawEventRepository: {
              save: jest.fn(),
              create: jest.fn(() => new DrawEvent())
            } as any,
            manager: {
              getCustomRepository: jest.fn()
            } as any,
            prizes: [mockPrizes.fullStock]
          };
          // stubs
          mocks.orm.transaction.mockImplementation(async fn => {
            await Promise.resolve();
            return fn(txMocks.manager);
          });
          // prize repository stubs
          txMocks.prizeRepository.save.mockImplementation(async p => p);
          txMocks.prizeRepository.getInStockPrizesForUpdate.mockImplementation(
            async () => txMocks.prizes
          );
          // draw event repository stubs
          txMocks.drawEventRepository.save.mockImplementation(async de => de);
          // repository acquisition hookup stubs
          txMocks.manager.getCustomRepository.mockReturnValue(
            txMocks.prizeRepository
          );
          ModelUtils.getRepositoryFor.mockReturnValue(
            txMocks.drawEventRepository
          );
        });
        it("fetches in stock prizes for update", async () => {
          await controller.drawPrize(
            mockUsers.user,
            mocks.drawEventRepository,
            mocks.prizeRepository
          );
          expect(
            txMocks.prizeRepository.getInStockPrizesForUpdate
          ).toHaveBeenCalledTimes(1);
        });
        it("updates a random prize and saves a draw event targeting that prize", async () => {
          const mockSelection = txMocks.prizes[0];
          RandomUtils.selectRandomItemFromPool.mockReturnValue(mockSelection);

          const result = await controller.drawPrize(
            mockUsers.user,
            mocks.drawEventRepository,
            mocks.prizeRepository
          );
          // it uses the pool selection helper
          expect(RandomUtils.selectRandomItemFromPool).toHaveBeenCalledWith(
            txMocks.prizes,
            expect.anything()
          );
          expect(RandomUtils.selectRandomItemFromPool).toHaveBeenCalledTimes(1);
          // it saves the draw event with the resulting prize
          expect(txMocks.drawEventRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              user: mockUsers.user,
              prize: mockSelection
            })
          );
          // it reduces the stock of the selected prize by 1
          expect(txMocks.prizeRepository.save).toHaveBeenCalledWith({
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
          mocks.authService.canCreate.mockRejectedValue(mockErr);
          await expect(
            controller.drawPrize(
              mockUsers.user,
              mocks.drawEventRepository,
              mocks.prizeRepository
            )
          ).rejects.toBe(mockErr);
          expect(mocks.authService.canCreate).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
  describe("getDraws", () => {
    it("fetches prizes for the current user", async () => {
      await controller.getDraws(
        mockUsers.user,
        mockUsers.user.deviantartUuid,
        mocks.drawEventRepository
      );
      expect(mocks.drawEventRepository.find).toHaveBeenCalledWith({
        where: { user: mockUsers.user.deviantartUuid }
      });
    });
    it("bubbles errors from authService.canReadMultiple", async () => {
      const mockError = { message: "some message" };
      mocks.authService.canReadMultiple.mockImplementation(async () => {
        throw mockError;
      });
      await expect(
        controller.getDraws(
          mockUsers.user,
          mockUsers.user.deviantartUuid,
          mocks.drawEventRepository
        )
      ).rejects.toBe(mockError);
    });
  });
});
