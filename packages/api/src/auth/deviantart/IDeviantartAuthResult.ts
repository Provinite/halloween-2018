export interface IDeviantartAuthResult {
  expiresIn: number;
  status: string;
  accessToken: string;
  tokenType: "Bearer";
  refreshToken: string;
  scope: string;
}
