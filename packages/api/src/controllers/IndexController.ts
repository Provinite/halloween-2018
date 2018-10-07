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
  @Route("/")
  index(ctx: any): string {
    console.log(ctx);
    return "LOL!" + this.name;
  }

  @Route("/foo")
  foo(): string {
    return "goodbye";
  }
}
