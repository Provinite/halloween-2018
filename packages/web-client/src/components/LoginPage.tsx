import Axios from "axios";
import { parse } from "query-string";
import * as React from "react";
import { RouteComponentProps } from "react-router";
export class LoginPage extends React.Component<RouteComponentProps, {}> {
  render() {
    const parts = parse(this.props.location.search);
    Axios.post("http://localhost:8081/login", {
      authCode: parts.code
    }).then(response => {
      console.log(response);
    });
    return <div>You are logging in!</div>;
  }
}
