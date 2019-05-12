import {
  Button,
  createStyles,
  Grid,
  StyledComponentProps,
  Theme,
  Typography,
  withStyles
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import * as React from "react";
import { Component } from "react";
import { Route, Switch } from "react-router";
import { IGame } from "../../models/IGame";
import { GameDetail } from "./GameDetail";
import { GameList } from "./GameList";
import { GameModal } from "./GameModal";

type ClassNames = "adminGameTab" | "bodyText";
export interface IAdminGameTabProps extends StyledComponentProps<ClassNames> {
  games: IGame[];
  onCreate: (game: Partial<IGame>) => any;
  onListItemClick: (game: IGame, e: React.MouseEvent) => any;
}
interface IState {
  showGameModal: boolean;
}

export class AdminGameTabComponent extends Component<
  IAdminGameTabProps,
  IState
> {
  readonly state = {
    showGameModal: false
  };
  handleAddClick = () => {
    this.setState({ showGameModal: true });
  };
  handleDialogClose = () => {
    this.setState({ showGameModal: false });
  };
  handleModalSave = async (game: Partial<IGame>) => {
    try {
      await this.props.onCreate(game);
      this.setState({ showGameModal: false });
    } catch (e) {
      // noop
    }
  };
  render() {
    const { classes } = this.props;
    return (
      <div className={classes!.adminGameTab}>
        <Switch>
          <Route path="/admin/games/:gameId" component={GameDetail} />
          <Route
            render={() => (
              <>
                <GameModal
                  open={this.state.showGameModal}
                  onClose={this.handleDialogClose}
                  onSave={this.handleModalSave}
                  mode="add"
                />
                <Grid container>
                  <Grid item style={{ flexGrow: 1 }}>
                    <Typography variant="h3" color="secondary">
                      Games
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={this.handleAddClick}
                    >
                      <AddIcon /> Add
                    </Button>
                  </Grid>
                </Grid>
                <Typography
                  variant="body2"
                  color="inherit"
                  className={classes!.bodyText}
                >
                  Manage games here. Each game has its own prize pool, win rate,
                  and reset schedule. Start and end dates can be used to
                  schedule events into the future.
                </Typography>
                <GameList
                  games={this.props.games}
                  onListItemClick={this.props.onListItemClick}
                />
              </>
            )}
          />
        </Switch>
      </div>
    );
  }
}

const styles = (theme: Theme) =>
  createStyles<ClassNames>({
    adminGameTab: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit
    },
    bodyText: {
      marginTop: theme.spacing.unit
    }
  });
export const AdminGameTab = withStyles(styles)(AdminGameTabComponent);
