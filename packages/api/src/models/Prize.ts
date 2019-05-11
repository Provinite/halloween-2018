import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  Unique
} from "typeorm";
import { DrawEvent } from "./DrawEvent";
import { Game } from "./Game";

@Entity()
@Unique(["name", "game"])
export class Prize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ select: false })
  initialStock: number;

  @Column({ select: false })
  currentStock: number;

  @Column({
    default: 1.0,
    type: "double precision",
    select: false
  })
  weight: number;

  @ManyToOne(type => Game, { nullable: false })
  game: Game;

  @RelationId((prize: Prize) => prize.game)
  gameId: number;

  @OneToMany(type => DrawEvent, drawEvent => drawEvent.prize, { eager: false })
  drawEvents: DrawEvent[];
}
