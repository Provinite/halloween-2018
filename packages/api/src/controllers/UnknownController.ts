import { Component } from "../reflection/Component";
import { Route } from "../reflection/Route";

@Component()
export class UnknownController {
  @Route("/s")
  index() {
    return "<h1>Index!</h1>";
  }
}
