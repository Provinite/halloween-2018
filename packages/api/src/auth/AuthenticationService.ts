import { ROLES } from "@clovercoin/constants";
import { TokenExpiredError } from "jsonwebtoken";
import { Repository } from "typeorm";
import { RequestContext } from "../config/context/RequestContext";
import { Role, User } from "../models";
import { Component } from "../reflection/Component";
import { AuthenticationFailureException } from "./AuthenticationFailureException";
import { AuthenticationTokenExpiredError } from "./AuthenticationTokenExpiredError";
import { DeviantartApiConsumer } from "./deviantart/DeviantartApiConsumer";
import { IDeviantartUser } from "./deviantart/IDeviantartUser";
import { TokenService } from "./TokenService";
@Component()
export class AuthenticationService {
  private client: DeviantartApiConsumer;
  private roleRepository: Repository<Role>;
  private userRepository: Repository<User>;
  private tokenService: TokenService;
  /** @inject */
  constructor({
    deviantartApiConsumer,
    roleRepository,
    userRepository,
    tokenService
  }: RequestContext) {
    this.client = deviantartApiConsumer;
    this.roleRepository = roleRepository;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  /**
   * Authenticate using the given oauth authorization code. Creates a new user
   * if they are not already registered. Updates a user's associated DeviantArt
   * information if necessary.
   * @param authCode - The DeviantArt oAuth2 auth code
   * @return A bearer token.
   */
  async authenticate(authCode: string): Promise<string> {
    // authenticate against the DA API
    const loginResult = await this.client.authenticate(authCode);
    if (!loginResult || loginResult.status !== "success") {
      throw new AuthenticationFailureException();
    }
    const defaultRole = this.roleRepository.findOneOrFail({
      name: ROLES.user
    });
    // fetch the deviantart account info
    const daUser: IDeviantartUser = await this.client.getUser(loginResult);
    // check if they already exist
    let user: User = await this.userRepository.findOne(daUser.userId);
    if (!user) {
      // create the new user
      user = this.userRepository.create();
      user.iconUrl = daUser.userIcon;
      user.deviantartUuid = daUser.userId;
      user.deviantartName = daUser.username;
      user.roles = [await defaultRole];
      user = await this.userRepository.save(user);
    } else {
      // update any info that needs it
      const shouldUpdateIconUrl = user.iconUrl !== daUser.userIcon;
      const shouldUpdateUsername = user.deviantartName !== daUser.username;
      const shouldUpdate = shouldUpdateUsername || shouldUpdateIconUrl;
      if (shouldUpdate) {
        user.iconUrl = daUser.userIcon;
        user.deviantartName = daUser.username;
        user = await this.userRepository.save(user);
      }
    }
    // create and return an access token
    return this.tokenService.createToken({
      accessToken: loginResult.accessToken,
      sub: user.deviantartUuid
    });
  }

  /**
   * Validate the given token. Returns the parsed token payload. Throws an
   * AuthenticationFailureException in the event of failure.
   */
  async authenticateToken(token: string) {
    try {
      return await this.tokenService.readToken(token);
    } catch (e) {
      let message;
      if (e && e.message) {
        message = e.message;
      } else {
        message = "Unknown authentication failure.";
      }
      if (e instanceof TokenExpiredError) {
        throw new AuthenticationTokenExpiredError(e.message);
      }
      throw new AuthenticationFailureException(message);
    }
  }
}

declare global {
  interface ApplicationContextMembers {
    authenticationService: AuthenticationService;
  }
}
