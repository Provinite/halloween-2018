import { asValue } from "awilix";
import { EntityManager } from "typeorm";
import { AnyContext } from "../config/context/ApplicationContext";
import { Component } from "../reflection/Component";

@Component("SCOPED")
export class TransactionService {
  private container: AnyContext["container"];
  constructor({ container }: AnyContext) {
    this.container = container;
  }
  /**
   * Run a function in a transaction.
   * @param fn - The function to execute, will be built with a DI container.
   * @return The return value of `fn`
   */
  async runTransaction<ContextType = AnyContext, T = any>(
    fn: (ctx: ContextType) => Promise<T> | T
  ): Promise<T> {
    const manager: EntityManager = this.container.cradle.manager;
    const result = await manager.transaction(async manager => {
      const transactionContainer = this.container.createScope();
      transactionContainer.register("container", asValue(transactionContainer));
      transactionContainer.register("manager", asValue(manager));
      const result = await transactionContainer.build(fn);
      return result;
    });
    return result;
  }
}

declare global {
  interface ApplicationContextMembers {
    /** Service for running units of work in typeorm transactions. */
    transactionService: TransactionService;
  }
}
