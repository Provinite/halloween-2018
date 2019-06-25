import { EntityRepository, Repository } from "typeorm";
import { LocalCredentials } from "../LocalCredentials";
import { User } from "../User";

@EntityRepository(LocalCredentials)
export class LocalCredentialsRepository extends Repository<LocalCredentials> {
  async associateCredentialsWithUser(
    user: User,
    credentials: Pick<LocalCredentials, "principal" | "password">
  ) {
    const localCredentials = this.create();
    localCredentials.principal = credentials.principal;
    localCredentials.password = credentials.password;
    localCredentials.user = user;
    return this.save(localCredentials);
  }
}

declare global {
  interface ApplicationContextMembers {
    localCredentialsRepository: LocalCredentialsRepository;
  }
}
