import { IRole } from "../models/IRole";
import { ApiClient } from "./ApiClient";

const baseRoute = "roles";

/**
 * Service supporting CRUD operations on prizes.
 */
export class RoleService {
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
   * Fetch all roles.
   */
  async getAll(): Promise<IRole[]> {
    const result = this.apiClient.get(baseRoute);
    const { data } = await result;
    return data as IRole[];
  }
}
