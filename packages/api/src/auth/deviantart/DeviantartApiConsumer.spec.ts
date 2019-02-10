import Axios from "axios";
import { EnvService } from "../../config/env/EnvService";
import { IDeviantartApiConsumerConfiguration } from "../../config/env/IDeviantartApiConsumerConfig";
import { DeviantartApiConsumer } from "./DeviantartApiConsumer";
describe("service:DeviantartApiConsumer", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("method: authenticate", () => {
    interface IMocks {
      config: IDeviantartApiConsumerConfiguration;
      envService: jest.Mocked<EnvService>;
    }
    let svc: DeviantartApiConsumer;
    let mocks: IMocks;
    beforeEach(() => {
      mocks = {} as IMocks;

      /* Mocks */
      mocks.config = {
        oauthEndpoint: "http://example.com/oauth/authenticate",
        clientId: 1234,
        clientSecret: "halloweenclientsecret",
        baseRoute: "http://api.example.com",
        redirectUri: "http://localhost:8080/login"
      };

      mocks.envService = {
        getDeviantartApiConsumerConfig: () => mocks.config
      } as any;

      /* Stubs */
      jest.spyOn(Axios, "post").mockImplementation(() => ({
        data: "result"
      }));

      /* Default Service */
      svc = new DeviantartApiConsumer(mocks.envService);
    });
    it("makes a POST request to the oauth endpoint", async () => {
      await svc.authenticate("boop");
      expect(Axios.post).toHaveBeenCalledWith(
        mocks.config.oauthEndpoint,
        expect.anything()
      );
    });
  });
});
