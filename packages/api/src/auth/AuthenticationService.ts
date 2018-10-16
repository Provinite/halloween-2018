import { Repository } from "typeorm";
import { User } from "../models";
import { Component } from "../reflection/Component";
import { AuthenticationFailureException } from "./AuthenticationFailureException";
import { DeviantartApiConsumer } from "./deviantart/DeviantartApiConsumer";
import { IDeviantartUser } from "./deviantart/IDeviantartUser";
import { TokenService } from "./TokenService";
@Component()
export class AuthenticationService {
  private client: DeviantartApiConsumer;
  private userRepository: Repository<User>;
  private tokenService: TokenService;
  constructor(
    deviantartApiConsumer: DeviantartApiConsumer,
    userRepository: Repository<User>,
    tokenService: TokenService
  ) {
    this.client = deviantartApiConsumer;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  /**
   * Authenticate using the given oauth authorization code. Creates a new user
   * if they are not already registered.
   * @return A bearer token.
   */
  async authenticate(authCode: string): Promise<string> {
    const loginResult = await this.client.authenticate(authCode);
    if (!loginResult || loginResult.status !== "success") {
      throw new AuthenticationFailureException();
    }
    const daUser: IDeviantartUser = await this.client.getUser(loginResult);
    let user: User = await this.userRepository.findOne(daUser.userId);
    if (!user) {
      user = this.userRepository.create();
      user.iconUrl = daUser.userIcon;
      user.deviantartUuid = daUser.userId;
      user.deviantartName = daUser.username;
      user = await this.userRepository.save(user);
    }
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
      return this.tokenService.readToken(token);
    } catch (e) {
      let message;
      if (e && e.message) {
        message = e.message;
      } else {
        message = "Unknown authentication failure.";
      }
      throw new AuthenticationFailureException(message);
    }
  }
}
