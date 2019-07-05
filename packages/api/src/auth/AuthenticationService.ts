import { ROLES } from "@clovercoin/constants";
import { TokenExpiredError } from "jsonwebtoken";
import { Repository, In } from "typeorm";
import { ApplicationContext } from "../config/context/ApplicationContext";
import { Role, LocalCredentials } from "../models";
import { Component } from "../reflection/Component";
import { AuthenticationFailureException } from "./AuthenticationFailureException";
import { AuthenticationTokenExpiredError } from "./AuthenticationTokenExpiredError";
import { DeviantartApiConsumer } from "./deviantart/DeviantartApiConsumer";
import { IDeviantartUser } from "./deviantart/IDeviantartUser";
import { TokenService } from "./TokenService";
import { PasswordHashingService } from "./PasswordHashingService";
import { DeviantartAccount } from "../models/DeviantartAccount";
import { UserRepository } from "../models/user/UserRepository";
import { ITokenPayload } from "./ITokenPayload";
@Component()
export class AuthenticationService {
  private client: DeviantartApiConsumer;
  private roleRepository: Repository<Role>;
  private userRepository: UserRepository;
  private tokenService: TokenService;
  private passwordHashingService: PasswordHashingService;
  private localCredentialsRepository: Repository<LocalCredentials>;
  private deviantartAccountRepository: Repository<DeviantartAccount>;
  /** @inject */
  constructor({
    deviantartApiConsumer,
    roleRepository,
    userRepository,
    tokenService,
    passwordHashingService,
    localCredentialsRepository,
    deviantartAccountRepository
  }: ApplicationContext) {
    this.client = deviantartApiConsumer;
    this.roleRepository = roleRepository;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.passwordHashingService = passwordHashingService;
    this.localCredentialsRepository = localCredentialsRepository;
    this.deviantartAccountRepository = deviantartAccountRepository;
  }

  /**
   * Create and save a new user with local credentials. The user will have the
   * default user role.
   * @param principal - The principal the user with authenticate with. Also
   *  set as the display name.
   * @param password  - The password the user will authenticate with.
   * @return The new user
   */
  async registerUser(
    principal: string,
    password: string,
    roles: (keyof typeof ROLES)[] = ["user"]
  ) {
    const rolePromise = this.roleRepository.find({
      name: In(roles.map(r => ROLES[r]))
    });
    const hashPromise = this.passwordHashingService.hashPassword(password);
    const [rolesToAdd, passwordHash] = await Promise.all([
      rolePromise,
      hashPromise
    ]);
    if (rolesToAdd.length !== roles.length) {
      throw new Error("Missing expected role.");
    }
    return this.userRepository.createLocalUser({
      principal,
      passwordHash,
      roles: [...rolesToAdd]
    });
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

    const conditions = {
      deviantartUuid: daUser.userId
    };
    const options = { relations: ["user"] };
    // check if they already exist
    let daAccount = await this.deviantartAccountRepository.findOne(
      conditions,
      options
    );
    let user = daAccount && daAccount.user;
    if (!daAccount) {
      // create the new user
      user = await this.userRepository.createFromDeviantartUser(daUser, [
        await defaultRole
      ]);
    } else {
      // update any info that needs it
      user = daAccount.user;
      const shouldUpdateIconUrl = user.iconUrl !== daUser.userIcon;
      const shouldUpdateUsername = user.displayName !== daUser.username;
      const shouldUpdate = shouldUpdateUsername || shouldUpdateIconUrl;
      if (shouldUpdate) {
        user.iconUrl = daUser.userIcon;
        user.displayName = daUser.username;
        user = await this.userRepository.save(user);
      }
    }
    // create and return an access token
    return this.tokenService.createToken({
      accessToken: loginResult.accessToken,
      sub: user.id
    });
  }

  /**
   * Validate the given token. Returns the parsed token payload. Throws an
   * AuthenticationFailureException in the event of failure.
   * @param token - The token to validate
   * @return The token's payload
   */
  async authenticateToken(token: string): Promise<ITokenPayload> {
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

  /**
   * Authenticate a user using their local credentials, and create a token
   * for them.
   * @throws AuthenticationFailureException if authentication fails
   * @param principal - The credential's principal
   * @param password  - The credential's password
   * @return A bearer token for the user authenticated by the provided principal
   *  and password.
   */
  async authenticateCredentials(
    principal: string,
    password: string
  ): Promise<string> {
    const { localCredentialsRepository, passwordHashingService } = this;
    if (
      !principal ||
      !password ||
      typeof principal !== "string" ||
      typeof password !== "string"
    ) {
      throw new AuthenticationFailureException(
        "Login and password are required to authenticate."
      );
    }
    if (password.length < 2) {
      throw new AuthenticationFailureException(
        "Invalid password, password must be greater than 2 characters."
      );
    }
    // construct a dummy password that is different from the supplied password
    const dummyPassword = password.substr(1);
    if (dummyPassword.length === password.length) {
      throw new AuthenticationFailureException();
    }
    // hash it so we have a hash to compare with in the event the user is not found
    const dummyPasswordHash = await passwordHashingService.hashPassword(
      dummyPassword
    );

    // fetch the credentials by principal
    const conditions = { principal };
    const options = { relations: ["user"] };
    const credentials = await localCredentialsRepository.findOne(
      conditions,
      options
    );

    // if no credentials are found, use the dummy password hash
    const storedPasswordHash = credentials
      ? credentials.password
      : dummyPasswordHash;

    const passwordsMatch = await passwordHashingService.verifyPasswordHash(
      password,
      storedPasswordHash
    );

    const loginResult = Boolean(passwordsMatch && credentials);
    if (!loginResult) {
      throw new AuthenticationFailureException("Invalid credentials");
    }

    const user = credentials!.user;
    return this.tokenService.createToken({
      accessToken: null,
      sub: user.id
    });
  }
}

declare global {
  interface ApplicationContextMembers {
    authenticationService: AuthenticationService;
  }
}
