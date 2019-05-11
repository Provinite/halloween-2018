import { FindOneOptions } from "typeorm";
import { HttpMethod } from "../../HttpMethod";
import { Controller } from "../../reflection/Controller";
import { Route } from "../../reflection/Route";
import { Prize } from "../Prize";
import { PrizeAuthorizationService } from "./PrizeAuthorizationService";
import { PrizeController } from "./PrizeController";
import { PrizeRepository } from "./PrizeRepository";
/**
 * Controller for prize detail-route methods.
 */
@Controller()
export class PrizeDetailController extends PrizeController {
  /**
   * GET a specific prize.
   */
  @Route({
    route: PrizeController.detailRoute,
    method: HttpMethod.GET,
    roles: ["user"]
  })
  async getPrize(
    prizeOptions: FindOneOptions<Prize>,
    prizeAuthorizationService: PrizeAuthorizationService,
    prizeRepository: PrizeRepository
  ): Promise<Prize> {
    const prize = await prizeRepository.findOneOrFail(prizeOptions);
    await prizeAuthorizationService.canRead();
    return prize;
  }

  /**
   * PATCH a prize with the request body.
   */
  @Route({
    route: PrizeController.detailRoute,
    method: HttpMethod.PATCH,
    roles: ["admin"]
  })
  async updatePrize(
    prizeOptions: FindOneOptions<Prize>,
    requestBody: any,
    prizeRepository: PrizeRepository,
    prizeAuthorizationService: PrizeAuthorizationService
  ) {
    const prize = await prizeRepository.findOneOrFail(prizeOptions);
    const body = this.parseBodyForUpdate(requestBody);
    await prizeAuthorizationService.canUpdate(prize, body);
    prizeRepository.merge(prize, body);
    await prizeRepository.save(prize);
    return await prizeRepository.findOne(prizeOptions);
  }

  /**
   * DELETE a prize.
   */
  @Route({
    route: PrizeController.detailRoute,
    method: HttpMethod.DELETE,
    roles: ["admin"]
  })
  async deletePrize(
    prizeOptions: FindOneOptions<Prize>,
    prizeRepository: PrizeRepository,
    prizeAuthorizationService: PrizeAuthorizationService
  ) {
    const prize = await prizeRepository.findOneOrFail(prizeOptions);
    await prizeAuthorizationService.canDelete(prize);
    const result = await prizeRepository.delete(prize);
    return { affected: result.affected };
  }
}
