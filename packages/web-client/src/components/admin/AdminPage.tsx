import * as React from "react";
import { RouteComponentProps } from "react-router";
import { IPrize } from "../../models/IPrize";
import { ApiClient } from "../../services/ApiClient";
import { PrizeService } from "../../services/PrizeService";
import { PrizeList } from "./PrizeList";
import { PrizeInput } from "./PrizeInput";
interface IAdminPageProps extends RouteComponentProps {
  apiClient: ApiClient;
  prizeService: PrizeService;
}
interface IAdminPageState {
  prizes: {
    list: IPrize[];
    loading: boolean;
  };
}
export class AdminPage extends React.Component<
  IAdminPageProps,
  IAdminPageState
> {
  constructor(props) {
    super(props);
    this.state = {
      prizes: {
        list: [],
        loading: true
      }
    };
  }

  async componentDidMount() {
    const prizes = await this.props.prizeService.getAll();
    this.setState({
      prizes: {
        list: prizes,
        loading: false
      }
    });
  }

  render(): JSX.Element {
    if (this.state.prizes.loading) {
      return <div>Please hold. . .</div>;
    } else {
      return (
        <>
          <PrizeList prizes={this.state.prizes.list} />
          <PrizeInput />
        </>
      );
    }
  }
}
