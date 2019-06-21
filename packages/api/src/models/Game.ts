import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * A game represents a single event or giveaway and provides a containing scope
 * for prize pools and draws. Games provide a way to configure win rates and
 * draw schedules as well as run multiple concurrent giveaways.
 */
@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id!: number;

  /** The name of the game. */
  @Column({ nullable: false, unique: true })
  name!: string;

  /** Description for the game. */
  @Column({ nullable: false })
  description!: string;

  /** Contact details for the game's owner */
  @Column({ nullable: false })
  contact!: string;

  /** Datetime at which the game opens. */
  @Column({ type: "time without time zone", nullable: true })
  startDate: Date | null = null;

  /** Datetime at which the game closes. */
  @Column({ type: "time without time zone", nullable: true })
  endDate: Date | null = null;

  /**
   * Crontab style string representing the draw reset schedule.
   * Check out https://crontab.guru for details.
   * @example
   * 0 12 1,15 * * // noon on the first and fifteenth of every month
   * 0 12 * * * // every day at noon
   */
  @Column({
    default: "0 12 * * *"
  })
  drawResetSchedule!: string;

  /**
   * How many draws a player gets per reset.
   */
  @Column({ default: 1 })
  drawsPerReset!: number;

  /**
   * How many draws a VIP gets per reset.
   */
  @Column({ default: 2 })
  vipDrawsPerReset!: number;

  /**
   * The win rate (percentage) for this event.
   * @example
   * 0.75 // 75% winrate
   * 0.5 // 50% winrate
   * 0.3333 // 33.33% winrate
   * 1 // 100% winrate
   */
  @Column({
    default: 0.5,
    type: "double precision"
  })
  winRate!: number;
}
