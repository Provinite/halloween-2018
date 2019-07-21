import { PartialExcept } from "@clovercoin/constants";
import { AppBar, Tab, Tabs } from "@material-ui/core";
import { Location, UnregisterCallback } from "history";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { IGame } from "../../models/IGame";
import { IPrize } from "../../models/IPrize";
import { IRole } from "../../models/IRole";
import { IUser } from "../../models/IUser";
import { AppContext, IAppContext } from "../AppContext";
import { AppHeader } from "../AppHeader";
import { GameDropDownLight } from "../ui/GameDropDown";
import { PageCard } from "../ui/PageCard";
import { WithSpinner } from "../ui/WithSpinner";
import { AdminGameTab } from "./AdminGameTab";
import { AdminPrizeTab } from "./AdminPrizeTab";
import { AdminUsersTab } from "./AdminUsersTab";

const paths = ["/admin/prizes", "/admin/accounts", "/admin/games"];
/**
 * Props for the admin page component.
 */
type IAdminPageProps = RouteComponentProps; // & StyledComponentProps<ClassNames>;

/**
 * State for the admin page component.
 */
interface IAdminPageState {
  /** The currently selected game. */
  selectedGame: IGame | null;
  /** Stateful data regarding games */
  games: {
    list: IGame[];
    loading: boolean;
  };
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
  nextTab: number | null;
  /** The last tab we were on */
  lastTab: number | null;
}
// type ClassNames = "tabs";
/**
 * Component that presents a page for common administrative actions.
 */
export class AdminPage extends React.Component<
  IAdminPageProps,
  IAdminPageState
> {
  static contextType = AppContext;
  context!: IAppContext;

  private historyUnregisterCallback!: UnregisterCallback | null;

  constructor(props: IAdminPageProps) {
    super(props);
    this.state = {
      selectedGame: null,
      games: {
        list: [],
        loading: false
      },
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
  }

  /**
   * Update the selected tab when one is selected.
   * @param selectedTab - The new selected tab.
   */
  handleTabSelect = (_: any, nextTab: number) => {
    this.switchToTab(nextTab);
  };

  /**
   * Update selected game in the state.
   */
  handleGameSelect = (selectedGame: IGame) => {
    this.setState({ selectedGame }, () => {
      this.loadPrizes();
    });
  };

  /**
   * Switch to the new tab after transitions are complete.
   */
  handleTabExited = () => {
    this.setState(
      prevState => {
        return {
          selectedTab: prevState.nextTab!,
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
  };

  /** Fetch games and update the state */
  loadGames = async () => {
    this.setState(prevState => ({
      games: {
        ...prevState.games,
        loading: true
      }
    }));
    const { gameService } = this.context.services;
    try {
      const games = await gameService.getAll();
      this.setState(prevState => ({
        games: {
          ...prevState.games,
          list: games,
          loading: false
        }
      }));
    } catch (err) {
      this.context.onApiError(err);
      this.setState(prevState => ({
        games: {
          ...prevState.games,
          list: [],
          loading: false
        }
      }));
    }
  };

  /**
   * Save a new Game.
   */
  handleGameSave = async (game: Partial<IGame>) => {
    const { gameService } = this.context.services;
    try {
      const savedGame = await gameService.create(game);
      this.setState(({ games }) => ({
        games: {
          ...games,
          list: [savedGame, ...games.list]
        }
      }));
      this.context.onSuccess(`Added game ${savedGame.name}`);
    } catch (e) {
      this.context.onApiError(e);
      throw e;
    }
  };

  /**
   * Navigate to a specific game.
   */
  handleGameListItemClick = async (game: IGame) => {
    this.props.history.push(`/admin/games/${game.id}`);
  };

  /**
   * Fetch prizes and update the state.
   */
  async loadPrizes() {
    const loadingPrizes = (prevState: IAdminPageState) => ({
      prizes: {
        ...prevState.prizes,
        loading: true
      }
    });
    this.setState(loadingPrizes);
    const prizes = await this.context.services.prizeService
      .getAll(this.state.selectedGame!)
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
    const loadingUsers = (prevState: IAdminPageState) => ({
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

    this.loadUsers();
    this.loadGames();
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
  handlePrizeSave = async (prize: Partial<IPrize>) => {
    delete prize.currentStock;
    try {
      const result = await this.context.services.prizeService.create(
        this.state.selectedGame!,
        prize
      );
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
        this.context.onApiError(error);
      } else {
        this.context.onApiError("Failed to save.");
      }
      return Promise.reject();
    }
  };

  /**
   * Patch the given prize.
   * @param prize - The prize to modify.
   */
  handlePrizeEdit = async (prize: PartialExcept<IPrize, "id" | "gameId">) => {
    try {
      delete prize.initialStock;
      const result = await this.context.services.prizeService.update(prize);
      this.setState(prevState => {
        const prizes = { ...prevState.prizes };
        prizes.list = [...prizes.list];
        prizes.list = prizes.list.map(p => (p.id === prize.id ? result : p));
        return { ...prevState, prizes };
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.context.onApiError(error);
      } else {
        this.context.onApiError("Failed to save.");
      }
      return Promise.reject();
    }
  };

  /**
   * Delete a prize.
   */
  handlePrizeDelete = async (prize: IPrize) => {
    try {
      await this.context.services.prizeService.delete(
        this.state.selectedGame!,
        prize.id
      );
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
  };

  /**
   * Add a role to a user.
   */
  handleUserAddRole = async (user: IUser, role: IRole) => {
    const result = await this.context.services.userService.addRole(user, role);
    this.setState(prevState => ({
      users: {
        ...prevState.users,
        list: prevState.users.list.map(u => (u.id === result.id ? result : u))
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
        list: prevState.users.list.map(u => (u.id === result.id ? result : u))
      }
    }));
  };

  /**
   * Render the component.
   */
  render(): JSX.Element {
    const { selectedTab, nextTab, lastTab } = this.state;
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
        <AppHeader>
          <div className="cc-admin-page__game-select">
            <GameDropDownLight
              onChange={this.handleGameSelect}
              value={this.state.selectedGame || undefined}
            />
          </div>
        </AppHeader>
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
            <Tab label="Games" classes={{ label: "cc-tab" }} />
          </Tabs>
        </AppBar>
        <PageCard
          direction={getDirection(0)}
          open={selectedTab === 0 && nextTab === null}
          hidden={selectedTab !== 0}
          onExited={this.handleTabExited}
        >
          <WithSpinner
            style={{
              margin: "40px auto",
              display: "block"
            }}
            loading={this.state.prizes.loading}
            color="inherit"
          >
            <AdminPrizeTab
              prizes={this.state.prizes.list}
              onSave={this.handlePrizeSave}
              onDelete={this.handlePrizeDelete}
              onUpdate={this.handlePrizeEdit}
            />
          </WithSpinner>
        </PageCard>
        <PageCard
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
        </PageCard>
        <PageCard
          direction={getDirection(2)}
          open={selectedTab === 2 && nextTab === null}
          onExited={this.handleTabExited}
          hidden={selectedTab !== 2}
        >
          <WithSpinner
            style={{
              margin: "40px auto",
              display: "block"
            }}
            loading={this.state.games.loading}
            color="inherit"
          >
            <AdminGameTab
              games={this.state.games.list}
              onCreate={this.handleGameSave}
              onListItemClick={this.handleGameListItemClick}
            />
          </WithSpinner>
        </PageCard>
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
    let desiredTab: number | null = paths.findIndex(p => path!.startsWith(p));
    if (desiredTab === -1) {
      desiredTab = null;
    }
    return desiredTab;
  }

  /**
   * Start a transition to the specified tab.
   */
  private switchToTab(nextTab: number | null) {
    this.setState(prevState => {
      if (prevState.selectedTab === nextTab) {
        return null;
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
