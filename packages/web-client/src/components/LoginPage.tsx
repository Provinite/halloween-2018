import { parse } from "query-string";
import * as React from "react";
import { RouteComponentProps } from "react-router";
export class LoginPage extends React.Component<RouteComponentProps, {}> {
  render() {
    // tslint:disable-next-line
    console.log(parse(this.props.location.search));
    return <div>You are logging in!</div>;
  }
}
