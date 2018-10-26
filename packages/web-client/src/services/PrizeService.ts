import { IPrize } from "../models/IPrize";
import { ApiClient } from "./ApiClient";

const baseRoute = "prizes";

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

  async getAll(): Promise<IPrize[]> {
    const result = this.apiClient.get(`${baseRoute}`);
    const { data } = await result;
    return data as IPrize[];
  }
}
