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
  // see constructor
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
    // Define isWin on the instance directly so that it appears as an instance
    // field for things like JSON generation
    Object.defineProperty(this, "isWin", {
      get: () => this.prize !== null,
      enumerable: true
    });
  }
}
