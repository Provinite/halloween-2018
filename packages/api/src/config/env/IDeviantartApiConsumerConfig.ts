export interface IDeviantartApiConsumerConfiguration {
  /** API base route, eg: https://www.deviantart.com/api/v1/oauth2/ */
  baseRoute: string;
  /** API oauth token endpoint, eg: https://www.deviantart.com/oauth2/token */
  oauthEndpoint: string;
  /** Deviantart client secret */
  clientSecret: string;
  /** Deviantart client id */
  clientId: number;
}
