import * as React from "react";
import * as renderer from "react-test-renderer";
import { TestableComponent } from "./testableComponent";
test("state", () => {
  const component = renderer.create(
    <TestableComponent leftSummand={5} rightSummand={7} />
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
