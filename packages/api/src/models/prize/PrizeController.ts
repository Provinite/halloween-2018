import { Connection } from "typeorm";
import { RestRepositoryController } from "../../controllers/RestRepositoryController";
import { HttpMethod } from "../../HttpMethod";
import { Component } from "../../reflection/Component";
import { Route } from "../../reflection/Route";
import { Prize } from "../Prize";

@Component()
export class PrizeController extends RestRepositoryController<Prize> {
  constructor(orm: Connection) {
    super(orm, Prize);
  }

  @Route({
    route: "/prizes",
    method: HttpMethod.POST
  })
  async createOne(requestBody: any): Promise<Prize> {
    const body = { ...requestBody } as Partial<Prize>;
    if (!body.currentStock) {
      body.currentStock = body.initialStock;
    }
    return super.createOne(body);
  }
}
