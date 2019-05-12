import { asValue } from "awilix";
import { Connection } from "typeorm";
import {
  AnyContext,
  ApplicationContainer
} from "../config/context/ApplicationContext";
import { RequestContainer } from "../config/context/RequestContext";
import { Component } from "../reflection/Component";

@Component("SCOPED")
export class TransactionService {
  private container: ApplicationContainer | RequestContainer;
  constructor({ container }: AnyContext) {
    this.container = container;
  }
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
  interface ApplicationContextMembers {
    /** Service for running units of work in typeorm transactions. */
    transactionService: TransactionService;
  }
}
