import { CustomRepository } from "../../db/CustomRepository";
import { DeviantartAccount } from "../DeviantartAccount";
import { IDeviantartUser } from "../../auth/deviantart/IDeviantartUser";
import { User } from "../User";
import { EntityRepository } from "typeorm";

@EntityRepository(DeviantartAccount)
export class DeviantartAccountRepository extends CustomRepository<
  DeviantartAccount
> {
  setContext() {
    // noop
  }

  /**
   * Create and save a new DeviantartAccount from a DA user. Does not save the DA account
   * to the database or set the `user`.
   * @param daUser - The Deviantart user to create an auth account for
   * @return The new DeviantartAccount
   */
  associateDeviantartUser(user: User, daUser: IDeviantartUser) {
    const daAccount = this.create();
    daAccount.deviantartUuid = daUser.userId;
    daAccount.user = user;
    return this.save(daAccount);
  }
}

declare global {
  interface ApplicationContextMembers {
    deviantartAccountRepository: DeviantartAccountRepository;
  }
}
