import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId
} from "typeorm";
import { Game } from "./Game";
import { Prize } from "./Prize";
import { User } from "./User";

@Entity()
export class DrawEvent {
  readonly isWin: boolean;

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, { eager: true })
  user: User;

  @ManyToOne(type => Game)
  game: Game;

  @RelationId((drawEvent: DrawEvent) => drawEvent.game)
  gameId: number;

  @CreateDateColumn()
  createDate: Date;

  @ManyToOne(type => Prize, { nullable: true, eager: true })
  prize: Prize;
  constructor() {
    Object.defineProperty(this, "isWin", {
      get: () => this.prize !== null,
      enumerable: true
    });
  }
}
