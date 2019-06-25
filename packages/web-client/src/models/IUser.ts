import { IRole } from "./IRole";

export interface IUser {
  id: number;
  iconUrl: string | null;
  displayName: string;
  roles: IRole[];
}
