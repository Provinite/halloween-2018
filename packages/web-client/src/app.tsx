// Bring in polyfills required by babel and React
import "@babel/polyfill";
import "raf/polyfill";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _env from "./settings.env.json";
import { EnvConfig } from "./types/EnvConfig";

const env: EnvConfig = _env as EnvConfig;

export default class HalloweenApp extends React.Component<
  {
    env: EnvConfig;
  },
  {}
> {
  constructor(props) {
    super(props);
  }
  render() {
    return <div>Hello, Halloween 2018</div>;
  }
}

ReactDOM.render(<HalloweenApp env={env} />, document.getElementById("app"));
