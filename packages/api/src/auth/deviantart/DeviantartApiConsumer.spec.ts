import Axios from "axios";
import { DeviantartApiConsumer } from "./DeviantartApiConsumer";
import { IDeviantartApiConsumerConfig } from "./IDeviantartApiConsumerConfig";
describe("service:DeviantartApiConsumer", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("method: authenticate", () => {
    interface IMocks {
      config: IDeviantartApiConsumerConfig;
    }
    let svc: DeviantartApiConsumer;
    let mocks: IMocks;
    beforeEach(() => {
      mocks = {} as IMocks;

      /* Mocks */
      mocks.config = {
        oauth_endpoint: "http://example.com/oauth/authenticate",
        client_id: 1234,
        client_secret: "halloweenclientsecret",
        baseRoute: "http://api.example.com"
      };

      /* Stubs */
      jest.spyOn(Axios, "post").mockImplementation(() => ({
        data: "result"
      }));

      /* Default Service */
      svc = new DeviantartApiConsumer(mocks.config);
    });
    it("makes a POST request to the oauth endpoint", async () => {
      await svc.authenticate("boop");
      expect(Axios.post).toHaveBeenCalledWith(
        mocks.config.oauth_endpoint,
        expect.anything()
      );
    });
    it("returns the response data", async () => {
      const result = await svc.authenticate("boop");
      expect(result).toBe("result");
    });
  });
});
