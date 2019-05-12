import { EntityRepository, MoreThan, Repository } from "typeorm";
import { Game } from "../Game";
import { Prize, prizeAdminFields } from "../Prize";

@EntityRepository(Prize)
export class PrizeRepository extends Repository<Prize> {
  private static inStock = (game: Game | number) => ({
    where: {
      currentStock: MoreThan(0),
      game
    }
  });
  /**
   * Fetch in stock prizes and their count.
   */
  async getInStockPrizesAndCount(
    game: Game | number
  ): Promise<[Prize[], number]> {
    return await this.findAndCount(PrizeRepository.inStock(game));
  }
  /**
   * Fetch count of all in stock prizes (not total quantity of prizes).
   */
  async getInStockPrizeCount(game: Game | number): Promise<number> {
    return await this.count(PrizeRepository.inStock(game));
  }
  /**
   * Fetch all in stock prizes.
   */
  async getInStockPrizes(game: Game | number): Promise<Prize[]> {
    return await this.find(PrizeRepository.inStock(game));
  }

  /**
   * Fetch all in stock prizes, and acquire a pessimistic lock.
   */
  async getInStockPrizesForUpdate(game: Game | number): Promise<Prize[]> {
    return this.createQueryBuilder("prize")
      .setLock("pessimistic_write")
      .addSelect(prizeAdminFields.map(f => `prize.${f}`))
      .where(PrizeRepository.inStock(game).where)
      .getMany();
  }
}

declare global {
  interface ApplicationContextMembers {
    prizeRepository: PrizeRepository;
  }
}
