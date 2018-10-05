import { Component } from "../reflection/Component";
import { Route } from "../reflection/Route";

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
