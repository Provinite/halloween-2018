import { FindManyOptions } from "typeorm";
import { HttpMethod } from "../../HttpMethod";
import { Controller } from "../../reflection/Controller";
import { Route } from "../../reflection/Route";
import { Game } from "../Game";
import { Prize } from "../Prize";
import { PrizeAuthorizationService } from "./PrizeAuthorizationService";
import { PrizeController } from "./PrizeController";
import { PrizeRepository } from "./PrizeRepository";

@Controller()
export class PrizeListController extends PrizeController {
  /**
   * Create a new prize.
   */
  @Route({
    route: PrizeController.listRoute,
    method: HttpMethod.POST,
    roles: ["admin"]
  })
  async createPrize(
    requestBody: any,
    prizeRepository: PrizeRepository,
    prizeAuthorizationService: PrizeAuthorizationService,
    game: Game
  ): Promise<Prize> {
    const body = this.parseBodyForCreate(requestBody);
    const prize = prizeRepository.create();
    prizeRepository.merge(prize, body);
    prize.game = game;
    prize.currentStock = prize.initialStock;
    await prizeAuthorizationService.canCreate(prize);
    return await prizeRepository.save(prize);
  }

  /**
   * Fetch all prizes for a game.
   */
  @Route({
    route: PrizeController.listRoute,
    method: HttpMethod.GET,
    roles: ["public"]
  })
  async getPrizes(
    prizeOptions: FindManyOptions<Prize>,
    prizeRepository: PrizeRepository
  ) {
    return await prizeRepository.find(prizeOptions);
  }
}
