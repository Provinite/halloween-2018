import Axios, { AxiosError, AxiosInstance } from "axios";
import { RequestValidationError } from "../web/RequestValidationUtils";

describe("/login", () => {
  let axios: AxiosInstance;
  beforeEach(() => {
    axios = Axios.create();
    axios.defaults.baseURL = "http://localhost:8081/";
  });
  describe("POST /login", () => {
    describe("error handling", () => {
      const invalidAuthCodes = [undefined, 123, null];
      it.each([invalidAuthCodes])(
        "returns a 400/RequestValidationError for bad auth codes",
        async authCode => {
          let caughtError: AxiosError;
          await axios
            .post("/login", { authCode })
            .catch(e => (caughtError = e));
          expect(caughtError).toBeTruthy();
          expect(caughtError.response.status).toBe(400);
          expect(caughtError.response.data.error).toEqual(
            RequestValidationError.name
          );
          expect(caughtError.response.data).toMatchSnapshot();
        }
      );
    });
  });
});
