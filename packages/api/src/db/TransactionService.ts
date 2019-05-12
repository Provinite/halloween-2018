import { asValue, AwilixContainer } from "awilix";
import { Connection } from "typeorm";
import { Component } from "../reflection/Component";

@Component("SCOPED")
export class TransactionService {
  constructor(private container: AwilixContainer) {}
  /**
   * Run a function in a transaction.
   * @param fn - The function to execute, will be built with a DI container.
   * @return The return value of `fn`
   */
  async runTransaction(fn: (...args: any[]) => any) {
    const orm: Connection = this.container.cradle.orm;
    return await orm.transaction(async manager => {
      const transactionContainer = this.container.createScope();
      transactionContainer.register("manager", asValue(manager));
      return await transactionContainer.build(fn);
    });
  }
}

declare global {
  interface ApplicationContext {
    /** Service for running units of work in typeorm transactions. */
    transactionService: TransactionService;
  }
}
