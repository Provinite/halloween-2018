import { PartialKeys } from "@clovercoin/constants";
import { asValue, AwilixContainer } from "awilix";
import { FindManyOptions, FindOneOptions, Repository } from "typeorm";
import { hasRole } from "../../auth/AuthHelpers";
import { asClassMethod } from "../../AwilixHelpers";
import { DbMetadataService } from "../../db/DbMetadataService";
import {
  validateRequest,
  validateValue,
  validators
} from "../../web/RequestValidationUtils";
import { Game } from "../Game";
import { Prize } from "../Prize";
import { User } from "../User";

type Options = FindOneOptions<Prize> | FindManyOptions<Prize>;

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
   */
  async configureRequestContainer(container: AwilixContainer) {
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
   */
  registerFindPrizeOptions(
    container: AwilixContainer,
    query: any,
    user: User,
    gameId: string,
    dbMetadataService: DbMetadataService
  ) {
    const prizeId = container.resolve("prizeId", { allowUnregistered: true });
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
        "weight",
        "currentStock",
        "initialStock"
      ] as any;
    }
    container.register("prizeOptions", asValue(options));
  }

  /**
   * Validate incoming {prizeId} from the request.
   */
  validatePrizeId(container: AwilixContainer) {
    const prizeId: string = container.resolve("prizeId", {
      allowUnregistered: true
    });
    validateValue(prizeId, "prizeId", validators.optional.digitString);
  }

  /**
   * Validate {gameId} from the url, fetch the associated Game, and register
   * it as "game".
   * @configures game
   */
  async registerGame(
    container: AwilixContainer,
    gameRepository: Repository<Game>
  ) {
    const gameId = container.resolve("gameId", { allowUnregistered: true });
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
