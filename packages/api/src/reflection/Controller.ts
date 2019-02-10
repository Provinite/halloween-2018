import { Component } from "./Component";
import { isRouter } from "./Symbols";
/**
 * Decorator used to register controllers in the DI container.
 */
export function Controller() {
  return function<T extends new (...args: any[]) => {}>(constructor: T) {
    Object.defineProperty(constructor, isRouter, { value: true });
    Component()(constructor);
    return constructor;
  };
}
