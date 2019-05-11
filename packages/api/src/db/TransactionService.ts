import { asValue, AwilixContainer } from "awilix";
import { Connection } from "typeorm";
import { Component } from "../reflection/Component";

@Component("SCOPED")
export class TransactionService {
  constructor(private container: AwilixContainer) {}
  async runTransaction(fn: (...args: any[]) => any) {
    const orm: Connection = this.container.cradle.orm;
    return await orm.transaction(async manager => {
      const transactionContainer = this.container.createScope();
      transactionContainer.register("manager", asValue(manager));
      return await transactionContainer.build(fn);
    });
  }
}
