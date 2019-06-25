import {
  Entity,
  OneToOne,
  RelationId,
  PrimaryColumn,
  JoinColumn
} from "typeorm";
import { User } from "./User";

@Entity()
export class DeviantartAccount {
  /**
   * The user who owns this DA association
   */
  @OneToOne(type => User, {
    nullable: false
  })
  @JoinColumn()
  user!: User;

  /**
   * The ID of the user for this account
   */
  @RelationId((deviantartAccount: DeviantartAccount) => deviantartAccount.user)
  userId!: number;

  /**
   * The deviantart UUID for this account
   */
  @PrimaryColumn()
  deviantartUuid!: string;
}
