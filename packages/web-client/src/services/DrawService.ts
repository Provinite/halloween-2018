import { ApiClient } from "./ApiClient";
import { IGame } from "../models/IGame";
import { IUser } from "../models/IUser";

/**
 * Service supporting CRUD operations on DrawEvents.
 */
export class DrawService {
  /**
   * Add a role to a user.
   */
  private apiClient: ApiClient;

  /**
   * Create a new RoleService using the given client.
   * @param apiClient - The API client to use when making requests.
   */
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Query the API for the time remaining until next draw.
   * @param user
   * @param game
   * @return { Date }
   */
  async getNextDrawTime(user: IUser, game: IGame) {}
}
