import { PartialExcept } from "@clovercoin/constants";
import { IGame } from "../models/IGame";
import { IPrize } from "../models/IPrize";
import { ApiClient } from "./ApiClient";

const baseRoute = (game: IGame | number) => `/games/${getId(game)}/prizes`;

const getId = (gameOrId: IGame | number) => {
  if (typeof gameOrId === "number") {
    return gameOrId;
  }
  return gameOrId.id;
};
/**
 * Service supporting CRUD operations on prizes.
 */
export class PrizeService {
  private apiClient: ApiClient;
  /**
   * Create a new PrizeService using the given client.
   * @param apiClient - The API client to use when making requests.
   */
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Fetch all prizes.
   */
  async getAll(game: IGame | number): Promise<IPrize[]> {
    const result = this.apiClient.get(baseRoute(game));
    const { data } = await result;
    return data as IPrize[];
  }

  /**
   * Save a new prize
   */
  async create(game: IGame | number, prize: Partial<IPrize>): Promise<IPrize> {
    const result = this.apiClient.post(baseRoute(game), prize);
    const { data } = await result;
    return data as IPrize;
  }

  /**
   * Patch a prize by id.
   * @param prize - The prize to patch.
   */
  async update(prize: PartialExcept<IPrize, "id" | "gameId">) {
    const { id, gameId, ...other } = prize;
    const result = this.apiClient.patch(`${baseRoute(gameId)}/${id}`, other);
    const { data } = await result;
    return data as IPrize;
  }

  /**
   * Delete a prize
   */
  async delete(gameOrId: IGame | number, prizeId: number): Promise<void> {
    const safeId: number = Number.parseInt("" + prizeId, 10);
    await this.apiClient.delete(`${baseRoute(gameOrId)}/${safeId}`);
    return;
  }
}
