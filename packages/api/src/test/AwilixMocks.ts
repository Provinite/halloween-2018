export function mockAsFunction(fn: (...args: any[]) => any) {
  return createMock(fn, "function");
}

export function mockAsValue(val: any) {
  return createMock(val, "value");
}

export function mockAsClass(clazz: new (...args: any[]) => any) {
  return createMock(clazz, "class");
}

function createMock(value: any, type: "class" | "function" | "value") {
  return {
    type,
    value,
    singleton: () => createMock(value, type)
  };
}

interface IMockResolver {
  value: any;
  type: "class" | "function" | "value";
  singleton: () => IMockResolver;
}

interface IMockClassResolver extends IMockResolver {
  type: "class";
}

interface IMockFunctionResolver extends IMockResolver {
  type: "function";
}

interface IMockValueResolver extends IMockResolver {
  type: "value";
}

export function isMockResolver(obj: any): obj is IMockResolver {
  return obj && obj.hasOwnProperty("type") && obj.hasOwnProperty("singleton");
}

export function isMockValueResolver(obj: any): obj is IMockValueResolver {
  return isMockResolver(obj) && obj.type === "value";
}

export function isMockFunctionResolver(obj: any): obj is IMockFunctionResolver {
  return isMockResolver(obj) && obj.type === "function";
}

export function isMockClassResolver(obj: any): obj is IMockClassResolver {
  return isMockResolver(obj) && obj.type === "class";
}

function toBeMockClassResolverFor(
  actual: any,
  clazz: new (...args: any[]) => any
) {
  const fail = {
    message: () => `Expected to be a mock class resolver for ${clazz.name}.`,
    pass: false
  };
  const pass = {
    message: () =>
      `Expected not to be a mock class resolver for ${clazz.name}.`,
    pass: true
  };
  if (isMockClassResolver(actual) && actual.value === clazz) {
    return pass;
  }
  return fail;
}

function toBeMockFunctionResolverFor(actual: any, fn: (...args: any[]) => any) {
  const fail = {
    message: () => `Expected to be a mock function resolver for ${fn.name}`,
    pass: false
  };
  const pass = {
    message: () => `Expected to not be a mock function resolver for ${fn.name}`,
    pass: true
  };
  if (isMockFunctionResolver(actual) && actual.value === fn) {
    return pass;
  }
  return fail;
}

function toBeMockValueResolverFor(actual: any, val: any) {
  const fail = {
    message: () =>
      `Expected to be a mock value resolver for the specified value`,
    pass: false
  };
  const pass = {
    message: () =>
      `Expected to not be a mock value resolver for the specified value`,
    pass: true
  };
  if (isMockValueResolver(actual) && actual.value === val) {
    return pass;
  }
  return fail;
}

export function aMockFunctionResolverFor(fn: (...args: any[]) => any) {
  return;
}

expect.extend({
  toBeMockClassResolverFor,
  toBeMockFunctionResolverFor,
  toBeMockValueResolverFor
});

declare global {
  namespace jest {
    // tslint:disable-next-line
    interface Matchers<R> {
      toBeMockClassResolverFor(clazz: new (...args: any[]) => any): R;
      toBeMockFunctionResolverFor(fn: (...args: any[]) => any): R;
      toBeMockValueResolverFor(value: any): R;
    }
  }
}
