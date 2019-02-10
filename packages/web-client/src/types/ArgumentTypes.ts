export type ArgumentTypes<T> = T extends (...args: infer U) => infer R
  ? U
  : never;
