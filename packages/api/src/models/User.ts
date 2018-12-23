import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { Role } from "./Role";
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
  @ManyToMany(type => Role, {
    eager: true
  })
  @JoinTable()
  roles: Role[];
}
