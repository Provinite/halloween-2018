import {
  Entity,
  Column,
  OneToOne,
  RelationId,
  JoinColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./User";

@Entity()
/**
 * Login credentials for users that use local authentication.
 */
export class LocalCredentials {
  /**
   * The user that is authenticated by these credentials.
   */
  @OneToOne(type => User, {
    nullable: false
  })
  @JoinColumn()
  user!: User;

  @RelationId((localCredentials: LocalCredentials) => localCredentials.user)
  userId!: number;

  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The login (username/email/w/e for this user)
   */
  @Column({
    unique: true,
    length: 255
  })
  principal!: string;

  /**
   * The hashed password for this user.
   */
  @Column({ nullable: false })
  password!: string;
}
