import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Role } from "./Role";
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: false
  })
  displayName!: string;

  @Column({
    default: null,
    nullable: true,
    type: "varchar"
  })
  iconUrl: string | null = null;

  @ManyToMany(type => Role, {
    eager: true
  })
  @JoinTable()
  roles!: Role[];
}
