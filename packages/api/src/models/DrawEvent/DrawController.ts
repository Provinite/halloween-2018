import { RequestContext } from "../../config/context/RequestContext";
import { HttpMethod } from "../../HttpMethod";
import { selectRandomItemFromPool } from "../../RandomUtils";
import { Component } from "../../reflection/Component";
import { Route } from "../../reflection/Route";
import { validateValue, validators } from "../../web/RequestValidationUtils";
import { DrawEvent } from "../DrawEvent";
import { NoPrizesInStockError } from "../prize/NoPrizesInStockError";
import { rollWin } from "./DrawEventUtils";
import { DrawRateLimitExceededError } from "./DrawRateLimitExceededError";
import moment = require("moment");
@Component()
export class DrawController {
  /** @inject */
  @Route({
    route: "/games/{gameId}/draws",
    method: HttpMethod.GET,
    roles: ["public"]
  })
  async getDrawsByGame({
    pathVariables: { gameId },
    drawEventRepository,
    drawEventAuthorizationService
  }: RequestContext) {
    const findOptions = { where: { game: gameId }, loadEagerRelations: true };
    await drawEventAuthorizationService.canReadMultiple(findOptions);
    const result = await drawEventRepository.find({
      where: { game: gameId },
      loadEagerRelations: true
    });
    return result;
  }

  /**
   * Attempt to draw a prize for the user. Uses the configured win chance to
   * roll for a win. Does its work in a transaction and locks the prize table
   * during a win to ensure we are protected against any sort of concurrency
   * issues. This is critical to prevent things like accidentally giving out
   * more prizes than we have, or multiple copies of a unique prize.
   *
   * @return The newly created draw event.
   * @inject
   */
  @Route({
    route: "/games/{gameId}/draws",
    method: HttpMethod.POST,
    roles: ["user"]
  })
  async drawPrize({
    pathVariables: { gameId },
    user,
    drawEventRepository,
    prizeRepository,
    drawEventAuthorizationService,
    gameAuthorizationService,
    gameRepository,
    transactionService
  }: RequestContext): Promise<DrawEvent> {
    // no public access
    user = user!;
    validateValue(gameId, "gameId", validators.digitString);
    const game = await gameRepository.findOneOrFail(gameId);
    await gameAuthorizationService.canRead(game);
    const count = await prizeRepository.getInStockPrizeCount(game);
    if (count === 0) {
      throw new NoPrizesInStockError();
    }
    // roll the dice!
    if (!rollWin(game)) {
      const loseDrawEvent: DrawEvent = await drawEventRepository.create();
      loseDrawEvent.user = user;
      loseDrawEvent.prize = null;
      loseDrawEvent.game = game;
      await drawEventAuthorizationService.canCreate(loseDrawEvent);
      return await drawEventRepository.save(loseDrawEvent);
    }
    return await transactionService.runTransaction(
      /** @inject */
      async ({ prizeRepository, drawEventRepository }: RequestContext) => {
        user = user!;
        // TODO: This could be done better. Basically to prevent wasting a DB lock
        // this check is duplicated here.
        await drawEventAuthorizationService.canCreate({ user, game });
        // fetch the prize list and lock the table
        const prizes = await prizeRepository.getInStockPrizesForUpdate(game);
        if (prizes.length === 0) {
          throw new NoPrizesInStockError();
        }

        const selectedPrize = selectRandomItemFromPool(prizes, prize => {
          return Math.floor(prize.weight * 100) * prize.currentStock;
        });
        let drawEvent = drawEventRepository.create();
        drawEvent.user = user;
        drawEvent.prize = selectedPrize;
        drawEvent.game = game;
        // authorize the model creation
        await drawEventAuthorizationService.canCreate(drawEvent);

        // TODO: this prize update should probably have an auth check
        selectedPrize.currentStock--;
        const [savedDrawEvent, savedPrize] = await Promise.all([
          drawEventRepository.save(drawEvent),
          prizeRepository.save(selectedPrize)
        ]);
        drawEvent = savedDrawEvent;
        drawEvent.prize = savedPrize;
        return drawEvent;
      }
    );
  }

  /**
   * Get a list of draws for the specified user.
   * @param userId - The ID of the user to get draws for.
   */
  @Route({
    route: "/users/{userId}/draws",
    method: HttpMethod.GET,
    roles: ["user"]
  })
  async getDraws({
    pathVariables: { userId },
    drawEventRepository,
    drawEventAuthorizationService
  }: RequestContext): Promise<DrawEvent[]> {
    const filter = { where: { user: userId } };
    await drawEventAuthorizationService.canReadMultiple(filter);
    return await drawEventRepository.find(filter);
  }

  @Route({
    route: "/games/{gameId}/can-draw",
    method: HttpMethod.GET,
    roles: ["user"]
  })
  async getNextDrawTime({
    pathVariables: { gameId },
    drawEventAuthorizationService,
    gameRepository,
    user
  }: RequestContext): Promise<NextDrawTimeResponse> {
    if (!user) {
      throw new Error("User required");
    }
    const response: NextDrawTimeResponse = {
      canDraw: false
    };

    try {
      // fetch the game
      const game = await gameRepository.findOneOrFail(gameId);

      // auth a prize draw
      await drawEventAuthorizationService.canCreate({
        user,
        game
      });
      response.canDraw = true;
    } catch (e) {
      response.canDraw = false;
      if (e instanceof DrawRateLimitExceededError) {
        response.tryAgainInSeconds = moment(e.tryAgainAt).diff(
          moment(),
          "seconds"
        );
        response.tryAgainAt = e.tryAgainAt;
      }
    }
    return response;
  }
}

interface NextDrawTimeResponse {
  canDraw: boolean;
  tryAgainInSeconds?: number;
  tryAgainAt?: Date;
}
