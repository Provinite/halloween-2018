import { ROLES } from "@clovercoin/constants";
import * as React from "react";
import { IRole } from "../models/IRole";
import { ApiClient } from "../services/ApiClient";
import { AuthenticationService } from "../services/auth/AuthenticationService";
import { GameService } from "../services/GameService";
import { PrizeService } from "../services/PrizeService";
import { RoleService } from "../services/RoleService";
import { UserService } from "../services/UserService";
import { IUser } from "../models/IUser";
export interface IAppContext {
  services: {
    apiClient: ApiClient;
    authenticationService: AuthenticationService;
    prizeService: PrizeService;
    userService: UserService;
    roleService: RoleService;
    gameService: GameService;
  };
  user: IUser | null;
  roles: Record<keyof typeof ROLES, IRole>;
  onApiError: (error: any) => void;
  onSuccess: (message: string) => void;
}

export const AppContext = React.createContext<IAppContext>({} as any);
