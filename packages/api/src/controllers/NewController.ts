import { Component } from "../reflection/Component";
import { Route } from "../reflection/Route";

@Component()
export class NewController {
  @Route("/index")
  index() {
    return { a: "bee" };
  }
}
