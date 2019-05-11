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
    validateValue(gameId, "gameId", validators.digitString);
    const gameParts = parseBodyForUpdate(requestBody);
    const game = await gameRepository.findOne(gameId);
    await this.gameAuthorizationService.canUpdate(user);
    gameRepository.merge(game, gameParts);
    return await gameRepository.save(game);
  }

  /**
   * Fetch a single game.
   */
  @Route({ route: "/games/{gameId}", roles: ["user"], method: HttpMethod.GET })
  async getGame(
    game: Game,
    gameAuthorizationService: GameAuthorizationService
  ) {
    if (game === undefined) {
      throw new ResourceNotFoundError();
    }
    await gameAuthorizationService.canRead(game);
    return game;
  }
}

/**
 * Validate and extract keys from a request body for PATCHing a game.
 * @param requestBody - The request body to parse.
 * @returns The validated, picked keys off of requestBody.
 * @throws If validation fails.
 */
function parseBodyForUpdate(requestBody: any) {
  return validateRequest(requestBody, {
    name: validators.optional.string,
    description: validators.optional.string,
    contact: validators.optional.string,
    startDate: validators.optional.dateString,
    endDate: validators.optional.dateString,
    drawResetSchedule: validators.optional.string,
    drawsPerReset: validators.optional.integer,
    vipDrawsPerReset: validators.optional.integer,
    winRate: validators.optional.float
  });
}

/**
 * Extract valid keys for POST operations from the request body.
 * @param requestBody - The incoming request body.
 * @return Those keys from requestBody that are valid update and create keys for
 *  a Game.
 * @throws if the request body does not have the required
 *  keys, or they are of the wrong data type.
 */
function parseBodyForCreate(requestBody: any) {
  return validateRequest(requestBody, {
    name: validators.string,
    description: validators.string,
    contact: validators.string,
    startDate: validators.optional.dateString,
    endDate: validators.optional.dateString,
    drawResetSchedule: validators.optional.string,
    drawsPerReset: validators.optional.integer,
    vipDrawsPerReset: validators.optional.integer,
    winRate: validators.optional.float
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
