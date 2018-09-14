import { Component } from "../decorators/Component";
import { Route } from "../decorators/Route";
import { IndexController } from "./IndexController";

@Component()
export class UnknownController {
  @Route("/s")
  index() {
    return "<h1>Index!</h1>";
  }
}
