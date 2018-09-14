import { Component } from "../decorators/Component";
import { Route } from "../decorators/Route";

@Component()
export class NewController {
  @Route("/index")
  index() {
    return { a: "bee" };
  }
}
