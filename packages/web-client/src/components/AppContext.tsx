import * as React from "react";
import { ApiClient } from "../services/ApiClient";
import { AuthenticationService } from "../services/auth/AuthenticationService";
import { PrizeService } from "../services/PrizeService";
export interface IAppContext {
  services: {
    apiClient: ApiClient;
    authenticationService: AuthenticationService;
    prizeService: PrizeService;
  };
  onApiError: (error: any) => void;
}

export const AppContext = React.createContext<IAppContext>(null);
