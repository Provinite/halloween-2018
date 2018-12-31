import { ROLES } from "@clovercoin/constants";
import { AppBar, Tab, Tabs, Typography } from "@material-ui/core";
import { Location, UnregisterCallback } from "history";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { IPrize } from "../../models/IPrize";
import { IRole } from "../../models/IRole";
import { IUser } from "../../models/IUser";
import { AppContext, IAppContext } from "../AppContext";
import { AppHeader } from "../AppHeader";
import { TabContainer } from "../ui/TabContainer";
import { AdminPrizeTab } from "./AdminPrizeTab";
import { AdminUsersTab } from "./AdminUsersTab";

const paths = ["/admin/prizes", "/admin/accounts", "/admin/winners"];
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
  /** Stateful data regarding users */
  users: {
    /** The list of users from the API */
    list: IUser[];
    loading: boolean;
  };
  /** The currently selected tab */
  selectedTab: number;
  /** The next tab to switch to when transitions are done */
  nextTab: number;
  /** The last tab we were on */
  lastTab: number;
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

  private historyUnregisterCallback: UnregisterCallback;
  constructor(props: IAdminPageProps) {
    super(props);
    this.state = {
      prizes: {
        list: [],
        loading: false
      },
      users: {
        list: [],
        loading: false
      },
      selectedTab: this.getTabFromUrl() || 0,
      nextTab: null,
      lastTab: null
    };
    /* Bound Members */
    // TODO: Make an @annotation for bound functions.
    this.handleTabSelect = this.handleTabSelect.bind(this);
    this.handlePrizeSave = this.handlePrizeSave.bind(this);
    this.handlePrizeDelete = this.handlePrizeDelete.bind(this);
    this.handleTabExited = this.handleTabExited.bind(this);
    this.handlePrizeEdit = this.handlePrizeEdit.bind(this);
  }

  /**
   * Update the selected tab when one is selected.
   * @param selectedTab - The new selected tab.
   */
  handleTabSelect(_, nextTab: number) {
    this.switchToTab(nextTab);
  }

  /**
   * Switch to the new tab after transitions are complete.
   */
  handleTabExited() {
    this.setState(
      prevState => {
        return {
          selectedTab: prevState.nextTab,
          nextTab: null,
          lastTab: prevState.selectedTab
        };
      },
      () => {
        const curPath = this.props.location.pathname;
        const tabPath = paths[this.state.selectedTab];
        if (!curPath.startsWith(tabPath)) {
          this.props.history.push(tabPath);
        }
      }
    );
  }

  /**
   * Fetch prizes and update the state.
   */
  async loadPrizes() {
    const loadingPrizes = prevState => ({
      prizes: {
        ...prevState.prizes,
        loading: true
      }
    });
    this.setState(loadingPrizes);
    const prizes = await this.context.services.prizeService
      .getAll()
      .catch(err => {
        this.context.onApiError(err);
        return [];
      });
    const finalState = {
      prizes: {
        list: prizes,
        loading: false
      }
    };
    this.setState(finalState);
  }

  /**
   * Fetch users and update the state.
   */
  async loadUsers() {
    const loadingUsers = prevState => ({
      users: {
        ...prevState.users,
        loading: true
      }
    });
    this.setState(loadingUsers);
    const users = await this.context.services.userService
      .getAll()
      .catch(err => {
        this.context.onApiError(err);
        return [];
      });
    const finalState = {
      users: {
        list: users,
        loading: false
      }
    };
    this.setState(finalState);
  }

  /**
   * Request data from the api, make sure the current tab is synched with
   * the url, and register the history listener for the tabs.
   */
  componentDidMount() {
    this.syncTabWithUrl();
    this.registerHistoryListener();

    this.loadPrizes();
    this.loadUsers();
  }

  /**
   * Cleanup history listener.
   */
  async componentWillUnmount() {
    this.unregisterHistoryListener();
  }

  /**
   * Create a new prize
   * @param prize - The prize to create.
   */
  async handlePrizeSave(prize: IPrize) {
    try {
      const result = await this.context.services.prizeService.create(prize);
      this.setState(prevState => {
        const prizes = { ...prevState.prizes };
        prizes.list = [...prizes.list];
        prizes.list.push(result);
        return { ...prevState, prizes };
      });
      this.context.onSuccess(
        `Added ${result.currentStock} "${prize.name}" to the prize pool!`
      );
      return;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.context.onApiError("Invalid prize.");
      } else {
        this.context.onApiError("Failed to save.");
      }
      return Promise.reject();
    }
  }

  /**
   * Patch the given prize.
   * @param prize - The prize to modify.
   */
  async handlePrizeEdit(prize: Partial<IPrize> & { id: IPrize["id"] }) {
    try {
      const result = await this.context.services.prizeService.update(prize);
      this.setState(prevState => {
        const prizes = { ...prevState.prizes };
        prizes.list = [...prizes.list];
        prizes.list = prizes.list.map(p => (p.id === prize.id ? result : p));
        return { ...prevState, prizes };
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.context.onApiError("Invalid prize.");
      } else {
        this.context.onApiError("Failed to save.");
      }
      return Promise.reject();
    }
  }

  /**
   * Delete a prize.
   */
  async handlePrizeDelete(prize: IPrize) {
    try {
      await this.context.services.prizeService.delete(prize.id);
      this.setState(
        prevState => {
          const { prizes } = prevState;
          const { list } = prizes;
          return {
            prizes: {
              ...prizes,
              list: list.filter(p => p.id !== prize.id)
            }
          };
        },
        () => {
          this.context.onSuccess(`Deleted "${prize.name}"!`);
        }
      );
    } catch (error) {
      setImmediate(() => this.context.onApiError(error));
    }
  }

  /**
   * Add a role to a user.
   */
  handleUserAddRole = async (user: IUser, role: IRole) => {
    const result = await this.context.services.userService.addRole(user, role);
    this.setState(prevState => ({
      users: {
        ...prevState.users,
        list: prevState.users.list.map(u =>
          u.deviantartUuid === result.deviantartUuid ? result : u
        )
      }
    }));
  };

  /**
   * Remove a role from a user.
   */
  handleUserDeleteRole = async (user: IUser, role: IRole) => {
    const result = await this.context.services.userService.removeRole(
      user,
      role
    );
    // obvious "reducer" type stuff here.
    this.setState(prevState => ({
      users: {
        ...prevState.users,
        list: prevState.users.list.map(u =>
          u.deviantartUuid === result.deviantartUuid ? result : u
        )
      }
    }));
  };

  /**
   * Render the component.
   */
  render(): JSX.Element {
    const { selectedTab, nextTab, lastTab } = this.state;
    if (this.state.prizes.loading) {
      return <Typography variant="h1">Please hold. . .</Typography>;
    }
    /** Calculate the appropriate slide direction for a tab */
    const getDirection = (index: number) => {
      if (selectedTab === index) {
        if (nextTab !== null) {
          // leaving this tab
          return nextTab > index ? "right" : "left";
        } else {
          if (lastTab === null) {
            return "down";
          }
          // coming to this tab
          return lastTab > index ? "right" : "left";
        }
      }
    };
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
        <TabContainer
          direction={getDirection(0)}
          open={selectedTab === 0 && nextTab === null}
          hidden={selectedTab !== 0}
          onExited={this.handleTabExited}
        >
          <AdminPrizeTab
            prizes={this.state.prizes.list}
            onSave={this.handlePrizeSave}
            onDelete={this.handlePrizeDelete}
            onUpdate={this.handlePrizeEdit}
          />
        </TabContainer>
        <TabContainer
          direction={getDirection(1)}
          open={selectedTab === 1 && nextTab === null}
          onExited={this.handleTabExited}
          hidden={selectedTab !== 1}
        >
          <AdminUsersTab
            users={this.state.users.list}
            onAddRole={this.handleUserAddRole}
            onDeleteRole={this.handleUserDeleteRole}
          />
        </TabContainer>
        <TabContainer
          direction={getDirection(2)}
          open={selectedTab === 2 && nextTab === null}
          onExited={this.handleTabExited}
          hidden={selectedTab !== 2}
        >
          Tab Three
        </TabContainer>
      </div>
    );
  }

  /** Private Methods */
  /**
   * Synchronize the current tab with the URL.
   * @param path - Optional. Defaults to the current url.
   */
  private syncTabWithUrl(path?: string) {
    const { selectedTab } = this.state;
    let desiredTab = this.getTabFromUrl(path);
    if (desiredTab === null) {
      desiredTab = 0;
      this.props.history.replace(paths[0]);
    }
    if (desiredTab !== selectedTab) {
      this.switchToTab(desiredTab);
    }
  }

  /**
   * Parse the URL and determine the desired tab. Returns null if the current
   * path does not match any tabs.
   * @param path - Optional. Defaults to the current url.
   */
  private getTabFromUrl(path?: string) {
    if (!path) {
      path = this.props.history.location.pathname;
    }
    let desiredTab = paths.findIndex(p => path.startsWith(p));
    if (desiredTab === -1) {
      desiredTab = null;
    }
    return desiredTab;
  }

  /**
   * Start a transition to the specified tab.
   */
  private switchToTab(nextTab: number) {
    this.setState(prevState => {
      if (prevState.selectedTab === nextTab) {
        return;
      }
      return { nextTab };
    });
  }

  /**
   * Listen for history changes and update the selected tab.
   */
  private registerHistoryListener() {
    this.historyUnregisterCallback = this.props.history.listen(
      (location: Location<any>) => {
        const desiredTab = this.getTabFromUrl(location.pathname);
        this.switchToTab(desiredTab);
      }
    );
  }

  /**
   * Unregister the history listener.
   */
  private unregisterHistoryListener() {
    if (this.historyUnregisterCallback) {
      this.historyUnregisterCallback();
    }
    this.historyUnregisterCallback = null;
  }
}
