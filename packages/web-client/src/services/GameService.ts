import { IGame } from "../models/IGame";
import { ApiClient } from "./ApiClient";

const baseRoute = "games";

export class GameService {
  constructor(public apiClient: ApiClient) {}
  async getAll(): Promise<IGame[]> {
    const result = this.apiClient.get(baseRoute);
    const { data } = await result;
    return data as IGame[];
  }
  async create(game: Partial<IGame>) {
    const gameToSave = { ...game };
    if (gameToSave.startDate === "") {
      delete gameToSave.startDate;
    }
    if (gameToSave.endDate === "") {
      delete gameToSave.endDate;
    }
    const result = this.apiClient.post(baseRoute, game);
    const { data } = await result;
    return data as IGame;
  }
  async getOne(gameId: string | number) {
    const { data } = await this.apiClient.get(`${baseRoute}/${gameId}`);
    return data as IGame;
  }
}
