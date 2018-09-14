import { Component } from "../decorators/Component";
import { Route } from "../decorators/Route";

@Component()
export class IndexController {
  @Route("/")
  index(): boolean {
    return false;
  }

  @Route("/foo")
  foo(): string {
    return "goodbye";
  }
}
