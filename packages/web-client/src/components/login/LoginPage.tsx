import * as QueryString from "query-string";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { AuthenticationService } from "../../services/auth/AuthenticationService";
interface ILoginPageState {
  isLoading: boolean;
  username: string;
  iconUrl: string;
}

interface ILoginPageProps extends RouteComponentProps {
  authenticationService: AuthenticationService;
}
export class LoginPage extends React.Component<
  ILoginPageProps,
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
    const result = await this.props.authenticationService.login(authCode);
    this.setState({
      iconUrl: result.iconUrl,
      isLoading: false,
      username: result.username
    });
  }
  render() {
    if (this.state.isLoading) {
      return "<h1>Please hold. . .";
    }
    return (
      <div>
        Welcome {this.state.username}!<img src={this.state.iconUrl} />
      </div>
    );
  }
}
