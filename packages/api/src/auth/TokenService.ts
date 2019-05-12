import * as JWT from "jsonwebtoken";
import { ApplicationContext } from "../config/context/ApplicationContext";
import { ITokenConfiguration } from "../config/env/ITokenConfiguration";
import { Component } from "../reflection/Component";
import { ITokenPayload } from "./ITokenPayload";

/**
 * Class for managing JWTs.
 */
@Component()
export class TokenService {
  private config: ITokenConfiguration;
  /**
   * Create a new auth service using configuration from the specified
   * EnvService.
   * @param envService - The environment service from which to fetch token
   * configuration info
   * @inject
   */
  constructor({ envService }: ApplicationContext) {
    this.config = envService.getTokenConfiguration();
  }
  /**
   * Create a new token using the provided payload. Lasts for 55 minutes.
   */
  async createToken(payload: ITokenData): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      JWT.sign(
        payload,
        this.config.secret,
        {
          expiresIn: 60 * 55 // 55 minutes
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  /**
   * Validate and read the given token and return its payload.
   * Throws an exception if validation fails.
   * @param token - The token to parse.
   */
  async readToken(token: string): Promise<ITokenPayload> {
    return new Promise<ITokenPayload>((resolve, reject) => {
      JWT.verify(token, this.config.secret, (err, payload: ITokenPayload) => {
        if (err) {
          reject(err);
        } else {
          resolve(payload);
        }
      });
    });
  }
}
/**
 * Local interface for token inputs.
 */
interface ITokenData {
  /** Subject, should be the user's unique identifier. */
  sub: string;
  /** Deviantart api access token. */
  accessToken: string;
}

declare global {
  interface ApplicationContextMembers {
    /** Service for managing JWTs */
    tokenService: TokenService;
  }
}
