import { Connection } from "typeorm";
import { RestRepositoryController } from "../../controllers/RestRepositoryController";
import { Component } from "../../reflection/Component";
import { Controller } from "../../reflection/Controller";
import { Prize } from "../Prize";

@Component()
@Controller()
export class PrizeController extends RestRepositoryController<Prize> {
  constructor(orm: Connection) {
    super(orm, Prize);
  }
}
