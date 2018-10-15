import { Column, Entity, PrimaryColumn, Unique } from "typeorm";

@Entity({
  name: "halloweenUsers"
})
export class User {
  @PrimaryColumn()
  deviantartUuid: string;
  @Column()
  deviantartName: string;
  @Column()
  iconUrl: string;
}
