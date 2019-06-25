import { Repository } from "typeorm";
import { ApplicationContext } from "../config/context/ApplicationContext";
import { Role, User } from "../models";
import { createSafeContext, getRejectReason } from "../test/testUtils";
import { AuthenticationService } from "./AuthenticationService";
import { DeviantartApiConsumer } from "./deviantart/DeviantartApiConsumer";
import { IDeviantartAuthResult } from "./deviantart/IDeviantartAuthResult";
import { IDeviantartUser } from "./deviantart/IDeviantartUser";
import { mockRoles } from "./mocks/mockRoles";
import { TokenService } from "./TokenService";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ArgumentTypes } from "@clovercoin/constants";
import { AuthenticationFailureException } from "./AuthenticationFailureException";
import { AuthenticationTokenExpiredError } from "./AuthenticationTokenExpiredError";
import { PasswordHashingService } from "./PasswordHashingService";
import { LocalCredentialsRepository } from "../models/localCredentials/LocalCredentialsRepository";
import { DeviantartAccountRepository } from "../models/deviantartAccount/DeviantartAccountRepository";
import { DeviantartAccount } from "../models/DeviantartAccount";
import { UserRepository } from "../models/user/UserRepository";

describe("service:AuthenticationService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("method:authenticate", () => {
    interface IMocks {
      deviantartApiConsumer: jest.Mocked<DeviantartApiConsumer>;
      authCode: string;
      authResult: IDeviantartAuthResult;
      daUser: IDeviantartUser;
      userRepository: jest.Mocked<UserRepository>;
      roleRepository: jest.Mocked<Repository<Role>>;
      user: User;
      daAccount: DeviantartAccount;
      tokenService: jest.Mocked<TokenService>;
      token: string;
      passwordHashingService: PasswordHashingService;
      localCredentialsRepository: LocalCredentialsRepository;
      deviantartAccountRepository: jest.Mocked<DeviantartAccountRepository>;
    }
    let mocks: IMocks;
    let authenticationService: AuthenticationService;
    beforeEach(() => {
      /* Mocks */
      mocks = {
        authCode: "some_code",
        authResult: {
          expiresIn: 3600,
          status: "success",
          accessToken: "some_token",
          tokenType: "Bearer",
          refreshToken: "some_refresh_token",
          scope: "some_scope"
        },
        daUser: {
          username: "some_da_username",
          userIcon: "some_icon_url",
          userId: "some_da_uuid",
          type: "some_type"
        },
        user: {
          displayName: "some_da_username",
          iconUrl: "some_icon_url",
          id: 245,
          roles: [mockRoles.user]
        },
        daAccount: {} as any,
        localCredentialsRepository: {
          findOne: jest.fn()
        } as any,
        token: "some_jwt",
        userRepository: {
          findOne: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
          createFromDeviantartUser: jest.fn()
        } as any,
        deviantartAccountRepository: {
          findOne: jest.fn()
        } as any,
        tokenService: {
          createToken: jest.fn()
        } as any,
        roleRepository: {
          findOneOrFail: jest.fn()
        } as any,
        deviantartApiConsumer: {
          authenticate: jest.fn(),
          getUser: jest.fn()
        } as any,
        passwordHashingService: {
          hashPassword: jest.fn(),
          verifyPasswordHash: jest.fn()
        }
      };
      mocks.daAccount.deviantartUuid = mocks.daUser.userId;
      mocks.daAccount.user = mocks.user;
      mocks.daAccount.userId = mocks.user.id;
      /* Stubs */
      mocks.deviantartApiConsumer.authenticate.mockResolvedValue(
        mocks.authResult
      );
      mocks.deviantartApiConsumer.getUser.mockResolvedValue(mocks.daUser);

      mocks.deviantartAccountRepository.findOne.mockResolvedValue(
        mocks.daAccount
      );

      mocks.userRepository.createFromDeviantartUser.mockResolvedValue(
        mocks.user
      );
      mocks.userRepository.findOne.mockResolvedValue(mocks.user);
      mocks.userRepository.save.mockResolvedValue(mocks.user);
      mocks.userRepository.create.mockReturnValue({} as User);

      mocks.roleRepository.findOneOrFail.mockImplementation(async role => {
        return Object.values(mockRoles).find(r => r.name === role!.name)!;
      });

      mocks.tokenService.createToken.mockResolvedValue(mocks.token);

      mocks = createSafeContext(mocks);
      /* Default Service */
      authenticationService = new AuthenticationService(
        (mocks as unknown) as ApplicationContext
      );
    });
    it("authenticates via the deviantart api", async () => {
      await authenticationService.authenticate(mocks.authCode);
      expect(mocks.deviantartApiConsumer.authenticate).toHaveBeenCalledWith(
        mocks.authCode
      );
    });
    it("fetches the deviantart user", async () => {
      await authenticationService.authenticate(mocks.authCode);
      expect(mocks.deviantartApiConsumer.getUser).toHaveBeenCalledWith(
        mocks.authResult
      );
    });
    it("does not create a user if it already exists", async () => {
      await authenticationService.authenticate(mocks.authCode);
      expect(mocks.userRepository.save).toHaveBeenCalledTimes(0);
    });

    it("creates the user in the database if they don't already exist", async () => {
      mocks.deviantartAccountRepository.findOne.mockResolvedValue(undefined);
      await authenticationService.authenticate(mocks.authCode);
      expect(
        mocks.userRepository.createFromDeviantartUser
      ).toHaveBeenCalledWith(mocks.daUser, [mockRoles.user]);
    });

    it("invokes the tokenService and returns its result", async () => {
      const jwt = await authenticationService.authenticate(mocks.authCode);
      expect(mocks.tokenService.createToken).toHaveBeenCalledTimes(1);
      expect(mocks.tokenService.createToken).toHaveBeenCalledWith({
        accessToken: mocks.authResult.accessToken,
        sub: mocks.user.id
      });
      expect(jwt).toEqual(mocks.token);
    });
  });

  describe("method:authenticateToken", () => {
    let context: ApplicationContext;
    let service: AuthenticationService;
    let readTokenStub: jest.MockInstance<
      ReturnType<TokenService["readToken"]>,
      ArgumentTypes<TokenService["readToken"]>
    >;

    beforeEach(() => {
      readTokenStub = jest.fn();
      context = createSafeContext({
        tokenService: {
          readToken: readTokenStub
        },
        deviantartApiConsumer: {},
        roleRepository: {},
        userRepository: {},
        passwordHashingService: {
          findOne: jest.fn()
        },
        deviantartAccountRepository: {},
        localCredentialsRepository: {}
      }) as any;
      service = new AuthenticationService(context);
    });

    describe("with a valid, active token", () => {
      it("wraps tokenService#readToken", async () => {
        const mockPayload = {};
        readTokenStub.mockResolvedValue(mockPayload as any);
        const mockToken = "TheWorldCelebrated";

        await expect(service.authenticateToken(mockToken)).resolves.toBe(
          mockPayload
        );
        expect(context.tokenService.readToken).toHaveBeenCalledWith(mockToken);
      });
    });

    describe("with an invalid token", () => {
      it("rejects with an AuthenticationFailureException matching the underlying message", async () => {
        const mockError = new JsonWebTokenError("Yargh, thar be problems");
        readTokenStub.mockRejectedValue(mockError);
        const error = await getRejectReason(service.authenticateToken(""));
        expect(error).toBeInstanceOf(AuthenticationFailureException);
        expect(error.message).toEqual(mockError.message);
      });
    });
    describe("with an expired token", () => {
      it("rejects with an AuthenticationTokenExpiredError matching the underlying message", async () => {
        const mockError = new TokenExpiredError("Token got totes expired", 10);
        readTokenStub.mockRejectedValue(mockError);
        const error = await getRejectReason(service.authenticateToken(""));
        expect(error).toBeInstanceOf(AuthenticationTokenExpiredError);
        expect(error.message).toEqual(mockError.message);
      });
    });
    describe("with unknown failure", () => {
      it("rejects with the message if there is one", async () => {
        const mockError = new Error("Ruh roh!");
        readTokenStub.mockRejectedValue(mockError);
        const error = await getRejectReason(service.authenticateToken(""));
        expect(error).toBeInstanceOf(AuthenticationFailureException);
        expect(error.message).toEqual(mockError.message);
      });
      it("rejects with a default message without one", async () => {
        const mockError = "I am a string instead of an error for some reason";
        readTokenStub.mockRejectedValue(mockError);
        const error = await getRejectReason(service.authenticateToken(""));
        expect(error).toBeInstanceOf(AuthenticationFailureException);
        expect(error).toMatchInlineSnapshot(
          `[Error: Unknown authentication failure.]`
        );
      });
    });
  });
});
