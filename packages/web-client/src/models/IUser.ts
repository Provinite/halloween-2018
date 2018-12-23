import { IRole } from "./IRole";

export interface IUser {
  deviantartUuid: string;
  deviantartName: string;
  iconUrl: string;
  roles: IRole[];
}
