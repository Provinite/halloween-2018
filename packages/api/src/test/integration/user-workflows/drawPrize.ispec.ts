import { testApi } from "../supertestWrapper";
import { createTestUser } from "../authHelpers";
import { createTestGame } from "../gameHelpers";
import { createTestPrize } from "../prizeHelpers";
import { DrawEvent } from "../../../models";

describe("prize draw", () => {
  /**
   * Workflow:
   * - Create a a test game with a 100% winrate
   * - Give that game a single prize
   * - create a test user
   * - log in as the test user
   * - draw a prize (100% winrate)
   */
  test("log in & draw a prize", async () => {
    const password = "password";
    const game = await createTestGame({ winRate: 1 });
    const prize = await createTestPrize({ game });

    const user = await createTestUser({ password });

    const login = async () => {
      const loginResult = await testApi()
        .post("/login")
        .send({
          principal: user.displayName,
          password
        })
        .expect(200);
      const token = loginResult.body.token;
      expect(token).toBeDefined();
      return token;
    };

    const draw = (token: string) => {
      return testApi()
        .post(`/games/${game.id}/draws`)
        .auth(token, { type: "bearer" })
        .expect(200);
    };

    const token = await login();
    const drawResponse = await draw(token);
    const drawEvent = drawResponse.body as DrawEvent;
    expect(drawEvent.isWin).toBe(true);
    expect(drawEvent.prize!.id).toBe(prize.id);
  });
});
