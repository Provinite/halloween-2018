import * as Awilix from "awilix";
import { IScannableClass } from "../../reflection/ScannableClass";
import {
  decoratedType,
  DecoratedTypes,
  isScannable
} from "../../reflection/Symbols";
import { mockAsClass, mockAsValue } from "../../test/AwilixMocks";
import { ContextContainer } from "./ApplicationContext";
import { ComponentRegistrar } from "./ComponentRegistrar";
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
  // CDTODO: test getRegistrationName separately.
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
});
