import { Repository } from "typeorm";
import { RoleLiteral } from "../../auth/RoleLiteral";
import { HttpMethod } from "../../HttpMethod";
import { Component } from "../../reflection/Component";
import { Route } from "../../reflection/Route";
import { BadRequestError } from "../../web/BadRequestError";
import {
  validateRequest,
  validateValue,
  validators
} from "../../web/RequestValidationUtils";
import { Game } from "../Game";
import { User } from "../User";
import { GameAuthorizationService } from "./GameAuthorizationService";

@Component()
export class GameController {
  defaultRoles: RoleLiteral[] = ["admin"];

  constructor(public gameAuthorizationService: GameAuthorizationService) {}

  /**
   * Create a new game.
   */
  @Route({
    route: "/games",
    method: HttpMethod.POST,
    roles: ["admin"]
  })
  async createGame(
    requestBody: any,
    user: User,
    gameRepository: Repository<Game>
  ) {
    const game = gameFromRequestBody(requestBody, gameRepository);
    await this.gameAuthorizationService.canCreate(user);
    return await gameRepository.save(game);
  }

  /**
   * Fetch all games.
   */
  @Route({
    route: "/games",
    method: HttpMethod.GET,
    roles: ["admin"]
  })
  async getGames(user: User, gameRepository: Repository<Game>) {
    await this.gameAuthorizationService.canReadMultiple(user);
    return await gameRepository.find();
  }

  /**
   * Update a single game.
   * @param gameId - URL parameter, the id of the game to update.
   * @param requestBody - The incoming request body.
   * @param gameRepository - The game repository to use.
   */
  @Route({
    route: "/games/{gameId}",
    method: HttpMethod.PATCH,
    roles: ["admin"]
  })
  async updateGame(
    gameId: string,
    requestBody: any,
    user: User,
    gameRepository: Repository<Game>
  ) {
    validateValue(gameId, "gameId", validators.requiredDigitString);
    const gameParts = gamePartsFromRequestBody(requestBody);
    const game = await gameRepository.findOne(gameId);
    await this.gameAuthorizationService.canUpdate(user);
    Object.assign(game, gameParts);
    return await gameRepository.save(game);
  }
}

/**
 * Extract valid keys for POST and PATCH operations from the request body.
 * @param requestBody - The incoming request body.
 * @return Those keys from requestBody that are valid update and create keys for
 *  a Game.
 * @throws RequestValidationError if the request body does not have the required
 *  keys, or they are of the wrong data type.
 */
function gamePartsFromRequestBody(requestBody: any) {
  return validateRequest(requestBody, {
    name: validators.requiredString,
    description: validators.requiredString,
    contact: validators.requiredString,
    startDate: validators.optionalDateString,
    endDate: validators.optionalDateString,
    drawResetSchedule: validators.optionalString,
    drawsPerReset: validators.optionalInt,
    vipDrawsPerReset: validators.optionalInt,
    winRate: validators.optionalFloat
  });
}

/**
 * Validates an incoming request body and converts it into a Game object.
 * @param requestBody - The request body.
 * @param gameRepository - The game repository to use to create games.
 * @throws BadRequestError if requestBody is falsy.
 */
function gameFromRequestBody(
  requestBody: any | null | undefined,
  gameRepository: Repository<Game>
) {
  if (!requestBody) {
    throw new BadRequestError("A request body is required.");
  }
  const body = gamePartsFromRequestBody(requestBody);
  const game = gameRepository.create();
  Object.assign(game, body);
  return game;
}
