import { Context } from "koa";
import { Connection } from "typeorm";
import { RoleLiteral } from "../../auth/RoleLiteral";
import {
  IFallbackHandlerMap,
  RestRepositoryController
} from "../../controllers/RestRepositoryController";
import { HttpMethod } from "../../HttpMethod";
import { Component } from "../../reflection/Component";
import { Route } from "../../reflection/Route";
import { Prize } from "../Prize";

@Component()
export class PrizeController extends RestRepositoryController<Prize> {
  protected defaultRoles: RoleLiteral[] = ["admin"];
  constructor(orm: Connection) {
    super(orm, Prize);
  }

  configureFallbackHandlers(fallbackHandlers: IFallbackHandlerMap) {
    fallbackHandlers[this.detailRoute][HttpMethod.GET].roles = ["user"];
  }

  @Route({
    route: "/prizes",
    method: HttpMethod.POST,
    roles: ["admin"]
  })
  async createPrize(requestBody: any, ctx: Context): Promise<Prize> {
    const body = { ...requestBody } as Partial<Prize>;
    if (!body.currentStock) {
      body.currentStock = body.initialStock;
    }
    if (body.initialStock === undefined || !body.description || !body.name) {
      ctx.status = 400;
      return null;
    }
    return super.createOne(body, ctx);
  }
}
