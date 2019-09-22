import { FunctionComponent } from "react";
import { RouteComponentProps } from "react-router";
import * as React from "react";

export interface IndexPageProps extends RouteComponentProps {}

export const IndexPage: FunctionComponent<IndexPageProps> = () => {
  return <h1>CloverCoin Giveaways</h1>;
};
