import { Component } from "../decorators/Component";
import { Route } from "../decorators/Route";

@Component()
export class IndexController {
  @Route("/")
  index() {
    return false;
  }

  @Route("/foo")
  foo() {
    return "goodbye";
  }
}
