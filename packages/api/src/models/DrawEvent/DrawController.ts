import { Connection, Repository } from "typeorm";
import { HttpMethod } from "../../HttpMethod";
import { selectRandomItemFromPool } from "../../RandomUtils";
import { Component } from "../../reflection/Component";
import { Route } from "../../reflection/Route";
import { DrawEvent } from "../DrawEvent";
import { getRepositoryFor } from "../modelUtils";
import { NoPrizesInStockError } from "../prize/NoPrizesInStockError";
import { PrizeRepository } from "../prize/PrizeRepository";
import { User } from "../User";
import { DrawEventAuthorizationService } from "./DrawEventAuthorizationService";
import { DrawEventRepository } from "./DrawEventRepository";
import { rollWin } from "./DrawEventUtils";
@Component()
export class DrawController {
  constructor(
    private orm: Connection,
    private drawEventAuthorizationService: DrawEventAuthorizationService
  ) {}

  /**
   * Attempt to draw a prize for the user. Uses the configured win chance to
   * roll for a win. Does its work in a transaction and locks the prize table
   * during a win to ensure we are protected against any sort of concurrency
   * issues. This is critical to prevent things like accidentally giving out
   * more prizes than we have, or multiple copies of a unique prize.
   *
   * @return The newly created draw event.
   */
  @Route({
    route: "/draws",
    method: HttpMethod.POST,
    roles: ["user"]
  })
  async drawPrize(
    user: User,
    drawEventRepository: DrawEventRepository,
    prizeRepository: PrizeRepository
  ): Promise<DrawEvent> {
    const count = await prizeRepository.getInStockPrizeCount();
    if (count === 0) {
      throw new NoPrizesInStockError();
    }
    // roll the dice!
    if (!rollWin()) {
      const loseDrawEvent: DrawEvent = await drawEventRepository.create();
      loseDrawEvent.user = user;
      loseDrawEvent.prize = null;
      await this.drawEventAuthorizationService.canCreate(
        user,
        loseDrawEvent,
        this.orm
      );
      return await drawEventRepository.save(loseDrawEvent);
    }
    let drawEvent: DrawEvent;
    // run all of this in a transaction so it's all nice and atomic
    await this.orm.transaction(async manager => {
      // TODO: This could be done better. Basically to prevent wasting a DB lock
      // this check is duplicated here.
      await this.drawEventAuthorizationService.canCreate(
        user,
        { user },
        manager
      );
      // get transactional repositories
      const tPrizeRepository = manager.getCustomRepository(PrizeRepository);
      const tDrawEventRepository = getRepositoryFor(manager, DrawEvent);

      // fetch the prize list and lock the table
      const prizes = await tPrizeRepository.getInStockPrizesForUpdate();
      if (prizes.length === 0) {
        throw new NoPrizesInStockError();
      }

      const selectedPrize = selectRandomItemFromPool(prizes, prize => {
        return Math.floor(prize.weight * 100) * prize.currentStock;
      });

      drawEvent = tDrawEventRepository.create();
      drawEvent.user = user;
      drawEvent.prize = selectedPrize;
      // authorize the model creation
      await this.drawEventAuthorizationService.canCreate(
        user,
        drawEvent,
        manager
      );

      // TODO: this prize update should probably have an auth check
      selectedPrize.currentStock--;
      const [savedDrawEvent, savedPrize] = await Promise.all([
        tDrawEventRepository.save(drawEvent),
        tPrizeRepository.save(selectedPrize)
      ]);
      // update drawEvent in the outer scope.
      // this is weird.
      // TODO: can we just return a value from this promise via
      // manager.transaction?
      drawEvent = savedDrawEvent;
      drawEvent.prize = savedPrize;
    });
    return drawEvent;
  }

  /**
   * Get a list of draws for the specified user.
   * @param userId - The ID of the user to get draws for.
   */
  @Route({
    route: "/user/{userId}/draws",
    method: HttpMethod.GET,
    roles: ["user"]
  })
  async getDraws(
    user: User,
    userId: string,
    drawEventRepository: Repository<DrawEvent>
  ): Promise<DrawEvent[]> {
    const filter = { where: { user: userId } };
    await this.drawEventAuthorizationService.canReadMultiple(user, filter);
    return await drawEventRepository.find(filter);
  }
}
