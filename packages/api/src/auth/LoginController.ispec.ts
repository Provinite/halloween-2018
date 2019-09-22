import { createTestUser } from "../test/integration/authHelpers";
import { testApi } from "../test/integration/supertestWrapper";
import { verify } from "jsonwebtoken";
import { User } from "../models";
import { ITokenPayload } from "./ITokenPayload";

describe("POST /login", () => {
  let user: User;
  const password = "password";
  beforeAll(async () => {
    user = await createTestUser({ password });
  });
  const endpoint = "/login";
  it("returns a JWT on success", async () => {
    const body = {
      principal: user.displayName,
      password: "password"
    };
    const result = await testApi()
      .post(endpoint)
      .send(body)
      .expect(200);

    const token = result.body.token as string;

    const tokenPayload = verify(
      token,
      process.env.cch2018_token_secret!
    ) as ITokenPayload;

    // it should contain the expected user id
    expect(tokenPayload.sub).toEqual(user.id);

    // it should be valid for 55 minutes
    expect(tokenPayload.exp - tokenPayload.iat).toEqual(55 * 60);

    // comparison is done using a 1-minute window for expiration time to make
    // these tests less likely to report false failures
    // if this test starts to fail, look into injecting a mock time service
    // and using it everywhere we use dates.
    const nowInSeconds = new Date().getTime() / 1000;

    // it should expire in more than 54 minutes
    const lowerBound = nowInSeconds + 54 * 60;
    expect(tokenPayload.exp).toBeGreaterThan(lowerBound);

    // it should expire in less than 56 minutes
    const upperBound = nowInSeconds + 56 * 60;
    expect(tokenPayload.exp).toBeLessThan(upperBound);
  });

  it("returns a 400 with invalid credentials", async () => {
    const body = {
      principal: "username",
      password: "Pa$$word!"
    };
    await testApi()
      .post(endpoint)
      .send(body)
      .expect(400);
  });

  it("returns a 400 on unknown user", async () => {
    const body = {
      principal: "Dwight Schrute",
      password: "SomethingFunny"
    };
    await testApi()
      .post(endpoint)
      .send(body)
      .expect(400);
  });

  it("returns a 400 with no request body", async () => {
    await testApi()
      .post(endpoint)
      .send()
      .expect(400);
  });

  it("validates principal and password", async () => {
    let body: { principal?: any; password?: any } = {
      principal: "one"
    };
    let result = await testApi()
      .post(endpoint)
      .send(body)
      .expect(400);
    expect(result.body).toMatchSnapshot();

    body = {
      password: 2
    };

    result = await testApi()
      .post(endpoint)
      .send(body)
      .expect(400);
    expect(result.body).toMatchSnapshot();
  });
});
