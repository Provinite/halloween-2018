import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Prize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  initialStock: number;

  @Column()
  currentStock: number;
}
