export function getMethods(instance: any): any[] {
  const prototype: { [_: string]: any } = Reflect.getPrototypeOf(instance);
  const results: any[] = [];
  for (const key of Reflect.ownKeys(prototype)) {
    const descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(
      prototype,
      key
    );
    if (typeof descriptor.value === "function") {
      results.push(descriptor.value);
    }
  }
  return results;
}
