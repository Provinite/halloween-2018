import { AwilixContainer } from "awilix";
import { Context } from "koa";
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
    console.log("index");
    return { username, action };
  }

  @Route("/foo")
  foo(): string {
    return "goodbye";
  }
}
