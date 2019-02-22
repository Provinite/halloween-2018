import { EntityRepository, MoreThan, Repository } from "typeorm";
import { Prize } from "../Prize";

@EntityRepository(Prize)
export class PrizeRepository extends Repository<Prize> {
  private static inStock = { where: { currentStock: MoreThan(0) } };
  /**
   * Fetch in stock prizes and their count.
   */
  async getInStockPrizesAndCount(): Promise<[Prize[], number]> {
    return await this.findAndCount(PrizeRepository.inStock);
  }
  /**
   * Fetch count of all in stock prizes (not total quantity of prizes).
   */
  async getInStockPrizeCount(): Promise<number> {
    return await this.count(PrizeRepository.inStock);
  }
  /**
   * Fetch all in stock prizes.
   */
  async getInStockPrizes(): Promise<Prize[]> {
    return await this.find(PrizeRepository.inStock);
  }
  /**
   * Fetch all in stock prizes, and acquire a pessimistic lock.
   */
  async getInStockPrizesForUpdate(): Promise<Prize[]> {
    return await this.createQueryBuilder()
      .setLock("pessimistic_write")
      .where(PrizeRepository.inStock.where)
      .getMany();
  }
}
