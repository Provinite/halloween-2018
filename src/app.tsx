import "@babel/polyfill";
import "raf/polyfill";
import * as React from "react";
import * as ReactDOM from "react-dom";
import settings = require("./settings.env.json");

console.log("Settings is", settings);

export default class HalloweenApp extends React.Component<
  {
    appName: string;
  },
  {}
> {
  constructor(props) {
    super(props);
  }
  render() {
    return <span className="appName">{this.props.appName}</span>;
  }
}

ReactDOM.render(
  <HalloweenApp appName={settings.version} />,
  document.getElementById("app")
);
