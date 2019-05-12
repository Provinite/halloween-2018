import { HttpMethod } from "../../HttpMethod";
import { Controller } from "../../reflection/Controller";
import { Route } from "../../reflection/Route";
import { Prize } from "../Prize";
import { PrizeController, PrizeRequestContext } from "./PrizeController";

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
  async createPrize({
    requestBody,
    prizeRepository,
    prizeAuthorizationService,
    game
  }: PrizeRequestContext): Promise<Prize> {
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
  async getPrizes({ prizeOptions, prizeRepository }: PrizeRequestContext) {
    return await prizeRepository.find(prizeOptions);
  }
}
