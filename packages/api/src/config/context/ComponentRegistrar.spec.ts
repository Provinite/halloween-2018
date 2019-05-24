/* tslint:disable max-classes-per-file class-name */
import * as Awilix from "awilix";
import { asClass } from "awilix";
import { createApplicationContainer } from "../../AwilixHelpers";
import { Component } from "../../reflection/Component";
import { IScannableClass } from "../../reflection/ScannableClass";
import {
  decoratedType,
  DecoratedTypes,
  isScannable
} from "../../reflection/Symbols";
import { mockAsClass, mockAsValue } from "../../test/AwilixMocks";
import { ContextContainer } from "./ApplicationContext";
import { ComponentRegistrar } from "./ComponentRegistrar";
const AwilixMocked = Awilix as jest.Mocked<typeof Awilix>;
interface IMocks {
  container: jest.Mocked<ContextContainer>;
}

/**
 * Create a mock @Component annotated class.
 * @param name - The name of the "class"
 * @return {{}} An object with a name, and the appropriate symbols to be
 *    identified as a scannable class.
 */
function createMockComponent(name: string) {
  const MockComponent = jest.fn(() => ({ name }));
  const result = new MockComponent() as IScannableClass;
  result[isScannable] = true;
  result[decoratedType] = DecoratedTypes.CLASS;
  return result;
}

describe("config:ComponentRegistrar", () => {
  let mocks: Partial<IMocks>;
  beforeEach(() => {
    /* Mocks */
    const MockContainer = jest.fn(() => ({
      register: jest.fn()
    }));
    mocks = {};
    mocks.container = new MockContainer() as any;

    /* Stubs */
    jest.spyOn(Awilix, "asClass").mockImplementation(mockAsClass as any);
    jest.spyOn(Awilix, "asValue").mockImplementation(mockAsValue as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("registers each component as a class", () => {
    const components: IScannableClass[] = [
      createMockComponent("a"),
      createMockComponent("b"),
      createMockComponent("c")
    ];
    ComponentRegistrar.configureContainer(mocks.container, components);
    expect(mocks.container.register.mock.calls.length).toBeGreaterThanOrEqual(
      3
    );
    components.forEach(component => {
      let found: boolean = false;
      for (const call of mocks.container.register.mock.calls) {
        const [name, resolver] = call;
        if (name === component.name) {
          found = true;
          expect(resolver).toBeMockClassResolverFor(component);
        }
      }
      expect(found).toBe(true);
    });
  });

  it("converts class names to camelCase", () => {
    const components = [
      createMockComponent("Alpha"),
      createMockComponent("AlphaBeta")
    ];
    ComponentRegistrar.configureContainer(mocks.container, components);
    expect(mocks.container.register).toHaveBeenCalledWith(
      "alpha",
      expect.anything()
    );
    expect(mocks.container.register).toHaveBeenCalledWith(
      "alphaBeta",
      expect.anything()
    );
  });

  describe("static:getRegistrationName", () => {
    @Component()
    class FooComponent {}

    describe("when provided with a container", () => {
      it("errors if the container does not have that registration", () => {
        const container = createApplicationContainer();
        expect(() =>
          ComponentRegistrar.getRegistrationName(
            FooComponent as IScannableClass,
            container
          )
        ).toThrowErrorMatchingInlineSnapshot(`"Registration not found."`);
      });
      it("does not error if the container has that registration", () => {
        @Component()
        class KoaConfiguration {}
        AwilixMocked.asClass.mockRestore();
        const container = createApplicationContainer();
        container.register("koaConfiguration", asClass(
          KoaConfiguration
        ) as any);
        expect(() =>
          ComponentRegistrar.getRegistrationName(
            KoaConfiguration as IScannableClass,
            container
          )
        ).not.toThrowError();
      });
    });

    @Component()
    class FluxCapacitanceInheritor {}

    @Component()
    class sumbinch {}

    @Component()
    class wrongNameForACLASS {}

    it.each([
      [FooComponent, "fooComponent"],
      [FluxCapacitanceInheritor, "fluxCapacitanceInheritor"],
      [sumbinch, "sumbinch"],
      [wrongNameForACLASS, "wrongNameForACLASS"]
    ])(
      "creates a registration for %p as %p",
      (clazz: IScannableClass, expectedName: string) => {
        expect(ComponentRegistrar.getRegistrationName(clazz)).toEqual(
          expectedName
        );
      }
    );
  });
});
