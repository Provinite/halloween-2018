import { PartialKeys } from "@clovercoin/constants";
import { asValue } from "awilix";
import { FindManyOptions, FindOneOptions } from "typeorm";
import { hasRole } from "../../auth/AuthHelpers";
import { asClassMethod } from "../../AwilixHelpers";
import { EnhancedRequestContext } from "../../config/context/RequestContext";
import {
  validateRequest,
  validateValue,
  validators
} from "../../web/RequestValidationUtils";
import { Game } from "../Game";
import { Prize, prizeAdminFields } from "../Prize";

type Options = FindOneOptions<Prize> | FindManyOptions<Prize>;

/**
 * Interface for augmented
 */
export interface PrizeRequestAugment {
  prizeOptions: Options;
  game: Game;
}

/**
 * Type for the request context after augmentation by this controller.
 */
export interface PrizeRequestContext
  extends EnhancedRequestContext<PrizeRequestAugment> {}

/**
 * Base controller class for managing prizes. Contains logic for parsing
 * requests that is common to prize routes.
 */
export abstract class PrizeController {
  static readonly listRoute = "/games/{gameId}/prizes";
  static readonly detailRoute = "/games/{gameId}/prizes/{prizeId}";

  /**
   * Configure the request-scoped container for requests handled by this
   * controller. Validates incoming prize and game id's.
   * @scope Request
   * @configures {FindOptions<Prize> & FindManyOptions<Prize>} prizeOptions -
   *  the find options for the prize specified in the request.
   * @configures {Game} game - The game specified in the request.
   * @inject
   */
  async configureRequestContainer({ container }: PrizeRequestContext) {
    const build = (fn: (...args: any[]) => any) =>
      container.build(asClassMethod(this, fn));
    await build(this.validatePrizeId);
    return await Promise.all([
      build(this.registerGame),
      build(this.registerFindPrizeOptions)
    ]);
  }

  /**
   * Convert incoming request into default query options. Respects the
   * include_config request variable for administrative users. Expects prizeId
   * to have already been validated.
   * @configures prizeOptions
   * @inject
   */
  registerFindPrizeOptions({
    container,
    query,
    user,
    pathVariables: { gameId, prizeId },
    dbMetadataService
  }: PrizeRequestContext) {
    const options: Options = {
      where: {
        game: gameId
      }
    };
    if (prizeId !== undefined) {
      // detail-route request
      options.where = {
        ...(options.where as any),
        id: prizeId
      };
    }
    if (hasRole(user, "admin") && query.include_config) {
      // these fields should never be given to normal users.
      options.select = [
        ...dbMetadataService.getDefaultSelect(Prize),
        ...prizeAdminFields
      ] as any;
    }
    container.register("prizeOptions", asValue(options));
  }

  /**
   * Validate incoming {prizeId} from the request.
   */
  validatePrizeId({ pathVariables: { prizeId } }: PrizeRequestContext) {
    validateValue(prizeId, "prizeId", validators.optional.digitString);
  }

  /**
   * Validate {gameId} from the url, fetch the associated Game, and register
   * it as "game".
   * @configures game
   * @inject
   */
  async registerGame({
    container,
    gameRepository,
    pathVariables: { gameId }
  }: PrizeRequestContext) {
    validateValue(gameId, "gameId", validators.digitString);
    const game = await gameRepository.findOneOrFail(gameId, {
      loadRelationIds: true
    });
    container.register("game", asValue(game));
  }

  /**
   * Validate and parse a request body for updating. Only basic input validation
   * is performed.
   * @param requestBody - The incoming request body.
   * @return The validated keys off of requestBody.
   * @throws An application-safe validation error if validation fails.
   */
  parseBodyForUpdate(requestBody: any) {
    const result = validateRequest(requestBody, {
      name: validators.optional.string,
      description: validators.optional.string,
      currentStock: validators.optional.integer,
      weight: validators.optional.float
    });
    type OptionalKeys = "name" | "description" | "currentStock" | "weight";
    return result as PartialKeys<typeof result, OptionalKeys>;
  }
  /**
   * Validate and parse a request body for creation. Only basic input validation
   * is performed.
   * @param requestBody The incoming request body.
   * @return The validated keys off of requestBody.
   * @throws An application-safe validation error if validation fails.
   */
  parseBodyForCreate(requestBody: any) {
    const result = validateRequest(requestBody, {
      name: validators.string,
      description: validators.string,
      initialStock: validators.integer,
      currentStock: validators.notAllowed,
      weight: validators.optional.float,
      game: validators.notAllowed
    });
    type OptionalKeys = "weight";
    return result as PartialKeys<typeof result, OptionalKeys>;
  }
}
