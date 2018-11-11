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
}

const apiClient = new ApiClient("http://localhost:8081");
const authenticationService = new AuthenticationService(apiClient);
const prizeService = new PrizeService(apiClient);

const appContext = {
  services: {
    apiClient,
    authenticationService,
    prizeService
  }
};

export const AppContext = React.createContext(appContext);
export const defaultAppContext = appContext;
