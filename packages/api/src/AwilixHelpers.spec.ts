/* tslint:disable max-classes-per-file */
import { asValue } from "awilix";
import {
  ContainerAware,
  createContainer,
  MakeContainerAware
} from "./AwilixHelpers";
import { ContextContainer } from "./config/context/ApplicationContext";

describe("AwilixHelpers", () => {
  // tests for bind, createContainer omitted since they are
  // too simple to warrant testing at this time
  describe("containerAware", () => {
    class Inheritance extends ContainerAware {
      suffix: string;
      getName({ name }: { name: string }) {
        return name + this.suffix;
      }
    }
    @MakeContainerAware()
    class Mixin {
      suffix: string;
      constructor(public container: ContextContainer<any>) {}
      getName({ name }: { name: string }) {
        return name + this.suffix;
      }
    }
    // tslint:disable-next-line no-empty-interface
    interface Mixin extends ContainerAware {}

    type MockClass = new (
      container: ContextContainer<{ name: string }>
    ) => ContainerAware & {
      suffix: string;
      getName(context: { name: string }): string;
    };
    describe.each([Inheritance, Mixin])(
      "containerAware: %p",
      (Clazz: MockClass) => {
        describe("buildMethod", () => {
          it("injects the provided method and preserves this", () => {
            const container = createContainer<{ name: string }>();
            const mockName = "name_";
            const mockSuffix = "&_suffix";
            container.register("name", asValue(mockName));

            const subject = new Clazz(container);
            subject.suffix = mockSuffix;
            const result = subject.buildMethod(subject.getName as any);
            expect(result).toEqual(mockName + mockSuffix);
          });
        });
      }
    );
  });
});
