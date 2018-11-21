import * as JWT from "jsonwebtoken";
import { EnvService } from "../config/env/EnvService";
import { ITokenConfiguration } from "../config/env/ITokenConfiguration";
import { TokenService } from "./TokenService";
describe("service:TokenService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("method:createToken", () => {
    interface IMocks {
      envService: jest.Mocked<EnvService>;
      tokenConfig: ITokenConfiguration;
      payload: {
        sub: string;
        accessToken: string;
      };
    }
    let mocks: IMocks;
    let tokenService: TokenService;
    beforeEach(() => {
      /* Mocks */
      mocks = {} as IMocks;
      mocks.envService = {
        getTokenConfiguration: () => mocks.tokenConfig
      } as any;
      mocks.tokenConfig = {
        secret: "test_secret"
      };
      mocks.payload = {
        sub: "userid",
        accessToken: "access_token"
      };
      /* Default Service */
      tokenService = new TokenService(mocks.envService);
    });
    it("creates a JWT containing the provided data", async () => {
      const token: string = await tokenService.createToken(mocks.payload);
      // implicitly: it also creates a JWT using the provided secret
      const result = JWT.verify(token, mocks.tokenConfig.secret);
      expect(result).toEqual(expect.objectContaining(mocks.payload));
    });
    it("creates a JWT with a 55 minute lifespan", async () => {
      const token: string = await tokenService.createToken(mocks.payload);
      const result = JWT.verify(token, mocks.tokenConfig.secret) as any;
      expect(result.exp - result.iat).toEqual(60 * 55);
    });
  });
});