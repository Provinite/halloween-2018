import * as React from "react";
export class PrizeInput extends React.Component {
  render() {
    return (
      <div>
        <label>
          Name
          <input type="text" />
        </label>
        <label>
          Description
          <textarea />
        </label>
        <label>
          Initial Stock
          <input type="number" />
        </label>
      </div>
    );
  }
}
