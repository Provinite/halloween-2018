import { EntityRepository } from "typeorm";
import { User } from "../User";
import { IDeviantartUser } from "../../auth/deviantart/IDeviantartUser";
import { CustomRepository } from "../../db/CustomRepository";
import { ApplicationContext } from "../../config/context/ApplicationContext";
import { Role } from "../Role";

@EntityRepository(User)
export class UserRepository extends CustomRepository<User> {
  private transactionService!: ApplicationContext["transactionService"];

  setContext({ transactionService }: ApplicationContext) {
    this.transactionService = transactionService;
  }

  /**
   * Create and save a new user from a deviantart user
   * @param daUser - The deviantArt user profile to create a user for.
   * @param roles - The roles to give this user
   * @return The newly created user
   */
  async createFromDeviantartUser(
    daUser: IDeviantartUser,
    roles: Role[]
  ): Promise<User> {
    return this.transactionService.runTransaction(
      async ({ userRepository, deviantartAccountRepository }) => {
        let user = userRepository.create();
        user.iconUrl = daUser.userIcon;
        user.displayName = daUser.username;
        user.roles = [...roles];
        user = await userRepository.save(user);
        await deviantartAccountRepository.associateDeviantartUser(user, daUser);
        return user;
      }
    );
  }

  /**
   * Create a user with local credentials.
   * @param options - The options to create the user with.
   * @see LocalUserCreateOptions
   * @return The new user
   */
  createLocalUser({
    principal,
    passwordHash,
    roles,
    iconUrl = null
  }: LocalUserCreateOptions): Promise<User> {
    return this.transactionService.runTransaction(
      async ({
        localCredentialsRepository,
        userRepository
      }: ApplicationContext) => {
        let user = userRepository.create();
        user.iconUrl = iconUrl;
        user.displayName = principal;
        user.roles = [...roles];
        user = await userRepository.save(user);

        await localCredentialsRepository.associateCredentialsWithUser(user, {
          principal,
          password: passwordHash
        });
        return user;
      }
    );
  }
}

/**
 * Options for creating a user with local credentials
 */
export interface LocalUserCreateOptions {
  /** The principal that the user will authenticate with */
  principal: string;
  /** The (hashed) password the user will authenticate with */
  passwordHash: string;
  /** The roles for the user */
  roles: Role[];
  /** The icon URL for the user, defaults to null */
  iconUrl?: string | null;
}

declare global {
  interface ApplicationContextMembers {
    userRepository: UserRepository;
  }
}
