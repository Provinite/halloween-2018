import { AppBar, Tab, Tabs, Typography } from "@material-ui/core";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { IPrize } from "../../models/IPrize";
import { AppContext, IAppContext } from "../AppContext";
import { AppHeader } from "../AppHeader";
import { TabContainer } from "../ui/TabContainer";
import { AdminPrizeTab } from "./AdminPrizeTab";
/**
 * Props for the admin page component.
 */
type IAdminPageProps = RouteComponentProps;

/**
 * State for the admin page component.
 */
interface IAdminPageState {
  /** Stateful data regarding prizes */
  prizes: {
    /** The list of prizes from the API. */
    list: IPrize[];
    /** If true, the prize list is currently fetching. */
    loading: boolean;
  };
  /** The currently selected tab */
  selectedTab: number;
}
/**
 * Component that presents a page for common administrative actions.
 */
export class AdminPage extends React.Component<
  IAdminPageProps,
  IAdminPageState
> {
  static contextType = AppContext;
  context: IAppContext;
  constructor(props) {
    super(props);
    this.state = {
      prizes: {
        list: [],
        loading: false
      },
      selectedTab: 0
    };
    /* Bound Members */
    // TODO: Make an @annotation for bound functions.
    this.handleTabSelect = this.handleTabSelect.bind(this);
  }

  /**
   * Update the selected tab when one is selected.
   * @param selectedTab - The new selected tab.
   */
  handleTabSelect(e: React.ChangeEvent, selectedTab: number) {
    this.setState({ selectedTab });
  }

  async componentDidMount() {
    const prizes = await this.context.services.prizeService.getAll();
    // const prizes = await this.props.prizeService.getAll();
    this.setState({
      prizes: {
        list: prizes,
        loading: false
      }
    });
  }

  render(): JSX.Element {
    const { selectedTab } = this.state;
    if (this.state.prizes.loading) {
      return <Typography variant="h1">Please hold. . .</Typography>;
    }
    return (
      <div className="cc-admin-page">
        <AppHeader />
        <AppBar position="relative" color="secondary">
          <Tabs
            value={selectedTab}
            onChange={this.handleTabSelect}
            centered={true}
            indicatorColor="primary"
            textColor="inherit"
          >
            <Tab label="Prizes" classes={{ label: "cc-tab" }} />
            <Tab label="Accounts" classes={{ label: "cc-tab" }} />
            <Tab label="Winners" classes={{ label: "cc-tab" }} />
          </Tabs>
        </AppBar>
        <TabContainer value={selectedTab} index={0}>
          <AdminPrizeTab
            prizes={this.state.prizes.list}
            // tslint:disable-next-line
            onSave={async (prize) => {
              const result = await this.context.services.prizeService.create(
                prize
              );
              this.setState(prevState => {
                const { prizes } = prevState;
                prizes.list.push(result);
                return { prizes };
              });
            }}
          />
        </TabContainer>
      </div>
    );
  }
}
