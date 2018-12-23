import { ROLES } from "@clovercoin/constants";
import * as React from "react";
import { IRole } from "../models/IRole";
import { ApiClient } from "../services/ApiClient";
import { AuthenticationService } from "../services/auth/AuthenticationService";
import { PrizeService } from "../services/PrizeService";
import { RoleService } from "../services/RoleService";
import { UserService } from "../services/UserService";
export interface IAppContext {
  services: {
    apiClient: ApiClient;
    authenticationService: AuthenticationService;
    prizeService: PrizeService;
    userService: UserService;
    roleService: RoleService;
  };
  roles: Record<keyof typeof ROLES, IRole>;
  onApiError: (error: any) => void;
  onSuccess: (message: string) => void;
}

export const AppContext = React.createContext<IAppContext>(null);
