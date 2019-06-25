import { IRole } from "../models/IRole";
import { IUser } from "../models/IUser";
import { ApiClient } from "./ApiClient";

const baseRoute = "users";

/**
 * Service supporting CRUD operations on prizes.
 */
export class UserService {
  /**
   * Add a role to a user.
   */
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
  async getAll(): Promise<IUser[]> {
    const result = this.apiClient.get(baseRoute);
    const { data } = await result;
    return data as IUser[];
  }

  /**
   * Add a role to a user.
   */
  async addRole(user: IUser, role: IRole): Promise<IUser> {
    const route = `${getDetailRoute(user)}/roles/${role.id}`;
    const result = this.apiClient.put(route);
    const { data } = await result;
    return data as IUser;
  }

  /**
   * Delete a role from a user.
   */
  async removeRole(user: IUser, role: IRole): Promise<IUser> {
    const route = `${getDetailRoute(user)}/roles/${role.id}`;
    const result = this.apiClient.delete(route);
    const { data } = await result;
    return data as IUser;
  }
}
/**
 * Get the detail-route for a user.
 */
function getDetailRoute(user: IUser) {
  return `${baseRoute}/${user.id}`;
}
