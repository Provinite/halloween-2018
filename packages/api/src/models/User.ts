import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
  name: "halloweenUsers"
})
export class User {
  @PrimaryColumn()
  username: string;

  @Column()
  deviantArtName: string;

  @Column()
  email: string;
}
