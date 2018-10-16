import { Repository } from "typeorm";
import { User } from "../models";
import { AuthenticationService } from "./AuthenticationService";
import { DeviantartApiConsumer } from "./deviantart/DeviantartApiConsumer";
import { IDeviantartAuthResult } from "./deviantart/IDeviantartAuthResult";
import { IDeviantartUser } from "./deviantart/IDeviantartUser";
import { TokenService } from "./TokenService";

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
      userRepository: jest.Mocked<Repository<User>>;
      user: User;
      tokenService: jest.Mocked<TokenService>;
      token: string;
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
          deviantartName: "some_da_username",
          iconUrl: "some_icon_url",
          deviantartUuid: "some_da_uuid"
        },
        token: "some_jwt"
      } as any;
      /* Dependencies */
      mocks.userRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn()
      } as any;

      mocks.deviantartApiConsumer = {
        authenticate: jest.fn(),
        getUser: jest.fn()
      } as any;

      mocks.tokenService = {
        createToken: jest.fn()
      } as any;

      /* Stubs */
      mocks.deviantartApiConsumer.authenticate.mockResolvedValue(
        mocks.authResult
      );
      mocks.deviantartApiConsumer.getUser.mockResolvedValue(mocks.daUser);

      mocks.userRepository.findOne.mockResolvedValue(mocks.user);
      mocks.userRepository.save.mockResolvedValue(mocks.user);
      mocks.userRepository.create.mockReturnValue({});

      mocks.tokenService.createToken.mockResolvedValue(mocks.token);
      /* Default Service */
      authenticationService = new AuthenticationService(
        mocks.deviantartApiConsumer,
        mocks.userRepository,
        mocks.tokenService
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
      mocks.userRepository.findOne.mockResolvedValue(undefined);
      await authenticationService.authenticate(mocks.authCode);
      expect(mocks.userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(mocks.user)
      );
    });

    it("invokes the tokenService and returns its result", async () => {
      const jwt = await authenticationService.authenticate(mocks.authCode);
      expect(mocks.tokenService.createToken).toHaveBeenCalledTimes(1);
      expect(mocks.tokenService.createToken).toHaveBeenCalledWith({
        accessToken: mocks.authResult.accessToken,
        sub: mocks.daUser.userId
      });
      expect(jwt).toEqual(mocks.token);
    });
  });
});
