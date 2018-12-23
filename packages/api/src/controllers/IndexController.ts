import { HttpMethod } from "../HttpMethod";
import { Component } from "../reflection/Component";
import { Route } from "../reflection/Route";

@Component()
export class IndexController {
  private name: string;
  constructor() {
    this.name = "namely";
  }
  @Route({
    route: "/foo",
    method: HttpMethod.POST
  })
  foo(requestBody: any): string {
    return requestBody;
  }
}
