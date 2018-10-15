import Axios from "axios";
import * as QueryString from "query-string";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { AuthenticationService } from "../../services/auth/AuthenticationService";
interface ILoginPageState {
  isLoading: boolean;
  username: string;
  iconUrl: string;
}
export class LoginPage extends React.Component<
  RouteComponentProps,
  ILoginPageState
> {
  constructor(props) {
    super(props);
    this.state = {
      iconUrl: undefined,
      isLoading: true,
      username: undefined
    };
  }
  async componentDidMount() {
    const parts = QueryString.parse(this.props.location.search);
    const authCode = parts.code as string;
    const result = await AuthenticationService.login(authCode);
    this.setState({
      iconUrl: result.iconUrl,
      isLoading: false,
      username: result.username
    });
  }
  render() {
    return this.state.isLoading ? (
      <h1>Please Hold. . .</h1>
    ) : (
      <div>
        Welcome {this.state.username}!<img src={this.state.iconUrl} />
      </div>
    );
  }
}
