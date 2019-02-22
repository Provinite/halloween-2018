import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Prize } from "./Prize";
import { User } from "./User";

@Entity()
export class DrawEvent {
  get isWin(): boolean {
    return this.prize !== null;
  }
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, { eager: true })
  user: User;

  @CreateDateColumn()
  createDate: Date;

  @ManyToOne(type => Prize, { nullable: true, eager: true })
  prize: Prize;

  toJSON() {
    const { id, user, createDate, prize, isWin } = this;
    return { id, user, createDate, prize, isWin };
  }
}
