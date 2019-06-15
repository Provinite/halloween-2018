import { Lifetime, LifetimeType, AwilixContainer } from "awilix";
import * as Awilix from "awilix";

export function mockAsFunction(fn: (...args: any[]) => any) {
  return createMock(fn, "function");
}

export function mockAsValue(val: any) {
  return createMock(val, "value");
}

export function mockAsClass(clazz: new (...args: any[]) => any) {
  return createMock(clazz, "class");
}

type createMockOptions = {
  lifetime?: LifetimeType;
};

function createMock<T>(
  value: new (...args: any[]) => T,
  type: "class",
  opts?: createMockOptions
): IMockClassResolver<T>;
function createMock<T>(
  value: (...args: any[]) => T,
  type: "function",
  opts?: createMockOptions
): IMockFunctionResolver<T>;
function createMock<T>(
  value: T,
  type: "value",
  opts?: createMockOptions
): IMockFunctionResolver<T>;
function createMock<T>(
  value: T,
  type: "class" | "function" | "value",
  opts?: createMockOptions
): IMockResolver<T>;
function createMock(
  value: any,
  type: "class" | "function" | "value",
  opts: { lifetime?: LifetimeType } = {}
): IMockResolver {
  return {
    type,
    value,
    singleton: () => createMock(value, type, { lifetime: Lifetime.SINGLETON }),
    resolve: () => value,
    ...opts
  };
}

interface IMockResolver<T = any> {
  value: T;
  type: "class" | "function" | "value";
  singleton: () => IMockResolver<T>;
  lifetime?: LifetimeType;
  resolve: (container: AwilixContainer) => T;
}

interface IMockClassResolver<T = any> extends IMockResolver<T> {
  type: "class";
}

interface IMockFunctionResolver<T = any> extends IMockResolver<T> {
  type: "function";
}

interface IMockValueResolver<T = any> extends IMockResolver<T> {
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
  clazz: new (...args: any[]) => any,
  lifetime?: LifetimeType
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
    if (lifetime === undefined) {
      return pass;
    }
    return actual.lifetime === lifetime ? pass : fail;
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

/**
 * Create an asymmetric matcher that expects a mock (or real) resolver for the
 * specified value.
 * @param val - The value
 * @param [strict=true] - If true, uses .toBe comparison, otherwise uses .toEqual
 */
function expectAsValue(val: any, strict = true) {
  return asymmetricMatcher((actual: any) => {
    try {
      if (strict) {
        expect(actual.resolve()).toBe(val);
      } else {
        expect(actual.resolve()).toEqual(val);
      }
    } catch (e) {
      return false;
    }
    return true;
  });
}

/**
 *
 * @param val
 * @param lifetime
 */
function expectAsClass(val: any, lifetime?: LifetimeType) {
  return asymmetricMatcher(actual => {
    try {
      expect(actual).toBeMockClassResolverFor(val, lifetime);
    } catch (e) {
      return false;
    }
    return true;
  });
}

function asymmetricMatcher(fn: (actual: any) => boolean) {
  return {
    asymmetricMatch: fn
  };
}

type AwilixModule = typeof Awilix;
/**
 * Apply mocks to the awilix module. Stubs resolver functions (asClass, asValue,
 * etc) for use with mockResolver jest extensions.
 * @param awilix - The awilix module.
 */
export function applyMockResolvers(
  awilix: AwilixModule
): AwilixModule &
  jest.Mocked<Pick<AwilixModule, "asClass" | "asFunction" | "asValue">> {
  jest.spyOn(awilix, "asClass").mockImplementation(mockAsClass as any);
  jest.spyOn(awilix, "asFunction").mockImplementation(mockAsFunction as any);
  jest.spyOn(awilix, "asValue").mockImplementation(mockAsValue as any);

  return awilix as any;
}

expect.extend({
  toBeMockClassResolverFor,
  toBeMockFunctionResolverFor,
  toBeMockValueResolverFor
});

expect.asValue = expectAsValue;
expect.asClass = expectAsClass;

declare global {
  namespace jest {
    interface Expect {
      /** Expect `actual` to be an asValue resolver */
      asValue(value: any, strict?: boolean): any;
      /** Expect `actual` to be a mock asClass resolver */
      asClass(value: any, lifetime?: LifetimeType): any;
    }
    interface Matchers<R> {
      toBeMockClassResolverFor(
        clazz: new (...args: any[]) => any,
        lifetime?: LifetimeType
      ): R;
      toBeMockFunctionResolverFor(fn: (...args: any[]) => any): R;
      toBeMockValueResolverFor(value: any): R;
    }
  }
}
