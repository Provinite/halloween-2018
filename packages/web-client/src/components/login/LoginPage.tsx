import * as QueryString from "query-string";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { AppContext, IAppContext } from "../AppContext";
import { LoginLink } from "./LoginLink";
interface ILoginPageState {
  isLoading: boolean;
  hasAuthCode: boolean;
  username: string;
  iconUrl: string;
}

type ILoginPageProps = RouteComponentProps;
export class LoginPage extends React.Component<
  ILoginPageProps,
  ILoginPageState
> {
  static contextType = AppContext;
  context: IAppContext;
  constructor(props) {
    super(props);
    this.state = {
      iconUrl: undefined,
      isLoading: false,
      hasAuthCode: false,
      username: undefined
    };
  }
  async componentDidMount() {
    const parts = QueryString.parse(this.props.location.search);
    const authCode = parts.code as string;
    if (authCode) {
      this.setState({
        isLoading: true,
        hasAuthCode: true
      });
      const result = await this.context.services.authenticationService.login(
        authCode
      );
      this.setState({
        iconUrl: result.iconUrl,
        isLoading: false,
        username: result.username
      });
    }
  }
  render() {
    if (this.state.isLoading) {
      return "<h1>Please hold. . .";
    }
    if (!this.state.hasAuthCode) {
      return <LoginLink />;
    }
    return (
      <div>
        Welcome {this.state.username}!<img src={this.state.iconUrl} />
      </div>
    );
  }
}
