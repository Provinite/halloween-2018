import { AwilixContainer } from "awilix";
import * as Awilix from "awilix";
import { IScannableClass } from "../../decorators/ScannableClass";
import {
  decoratedType,
  DecoratedTypes,
  isScannable
} from "../../decorators/Symbols";
import { ComponentRegistrar } from "../ComponentRegistrar";
interface IMocks {
  container: jest.Mocked<AwilixContainer>;
}

/**
 * Create a mock @Component annotated class.
 * @param name - The name of the "class"
 * @return {{}} An object with a name, and the appropriate symbols to be
 *    identified as a scannable class.
 */
function createMockComponent(name: string) {
  const MockComponent = jest.fn<IScannableClass>(() => {
    return { name };
  });
  const result = new MockComponent();
  result[isScannable] = true;
  result[decoratedType] = DecoratedTypes.CLASS;
  return result;
}

function strictly(
  value: any
): {
  asymmetricMatch: (_: any) => boolean;
} {
  return {
    asymmetricMatch: (actual: any) => actual === value
  };
}

describe("config:ComponentRegistrar", () => {
  let mocks: Partial<IMocks>;
  beforeEach(() => {
    /* Mocks */
    const MockContainer = jest.fn<jest.Mocked<AwilixContainer>>(() => ({
      register: jest.fn()
    }));
    mocks = {};
    mocks.container = new MockContainer();

    /* Stubs */
    jest.spyOn(Awilix, "asClass").mockImplementation(clazz => {
      return {
        type: "class",
        value: clazz
      };
    });

    jest.spyOn(Awilix, "asValue").mockImplementation(value => ({
      type: "value",
      value
    }));
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
    expect(mocks.container.register).toHaveBeenCalledTimes(4);
    components.forEach(component => {
      expect(mocks.container.register).toHaveBeenCalledWith(component.name, {
        type: "class",
        value: strictly(component)
      });
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

  it("registers the components list as a value", () => {
    const components = [createMockComponent("a"), createMockComponent("b")];
    ComponentRegistrar.configureContainer(mocks.container, components);
    expect(mocks.container.register).toHaveBeenCalledWith("ComponentList", {
      type: "value",
      value: components
    });
  });
});
