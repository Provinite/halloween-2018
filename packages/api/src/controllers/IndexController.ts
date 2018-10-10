import { Component } from "../reflection/Component";
import { Route } from "../reflection/Route";

@Component()
export class IndexController {
  private name: string;
  constructor() {
    this.name = "namely";
  }
  @Route("/{username}/{action}")
  index(username: string, action: string) {
    return { username, action, name: this.name };
  }

  @Route("/foo")
  foo(): string {
    return "goodbye";
  }
}
