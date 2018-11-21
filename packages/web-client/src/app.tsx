// Bring in polyfills required by babel and React
import "@babel/polyfill";
import "raf/polyfill";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Route, RouteComponentProps } from "react-router-dom";
import HalloweenApp from "./components/HalloweenApp";
import * as _env from "./settings.env.json";
import { IEnvConfig } from "./types/IEnvConfig";

const env: IEnvConfig = _env as IEnvConfig;

function renderApp(props: RouteComponentProps) {
  return <HalloweenApp env={env} {...props} />;
}

function main(): void {
  ReactDOM.render(
    <BrowserRouter basename={process.env.cch2018_wc_base}>
      <Route render={renderApp} />
    </BrowserRouter>,
    document.getElementById("app")
  );
}

main();
