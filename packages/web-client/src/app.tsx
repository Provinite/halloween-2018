// Bring in polyfills required by babel and React
import "@babel/polyfill";
import "raf/polyfill";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";
import * as _env from "./settings.env.json";
import { EnvConfig } from "./types/EnvConfig";
import { PlayingCard } from "./components/PlayingCard";

const env: EnvConfig = _env as EnvConfig;

export default class HalloweenApp extends React.Component<{env: EnvConfig;},{}> {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <PlayingCard suit="hearts" rank="7" />
      </div>
    );
  }
}

ReactDOM.render((
  <BrowserRouter>
    <HalloweenApp env={env} />
  </BrowserRouter>), document.getElementById("app"));
