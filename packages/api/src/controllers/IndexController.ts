import { HttpMethod } from "../HttpMethod";
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
  @Route({
    route: "/foo",
    method: HttpMethod.POST
  })
  foo(): string {
    return "goodbye";
  }
}
