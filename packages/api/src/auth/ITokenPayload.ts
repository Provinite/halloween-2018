/**
 * Data stored in JWT payload.
 */
export interface ITokenPayload {
  /** User's deviantart api access token */
  accessToken: string;
  /** Subject, user's uuid */
  sub: string;
  /** Date (seconds since epoch) indicating issuance time. */
  iat: number;
  /** Date (seconds since epoch) indicating expiry time */
  exp: number;
}
