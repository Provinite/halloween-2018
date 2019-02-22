import { EntityRepository, Repository } from "typeorm";
import { DrawEvent } from "../DrawEvent";
import { User } from "../User";

/**
 * Repository for managing draw events.
 */
@EntityRepository(DrawEvent)
export class DrawEventRepository extends Repository<DrawEvent> {
  /**
   * Fetch the most recent draw event for the user.
   * @param user - The user to look up draw events for.
   * @return The user's most recent draw event, or undefined if they have none.
   */
  async getLastDrawEvent(user: User): Promise<DrawEvent | undefined> {
    if (!user) {
      throw new Error("Cannot get last draw event without user.");
    }
    const result = await this.manager.find(DrawEvent, {
      where: { user },
      take: 1,
      order: {
        createDate: "DESC"
      }
    });
    if (result.length === 0) {
      return undefined;
    }
    return result[0];
  }
}
