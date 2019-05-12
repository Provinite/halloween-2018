import {
  createStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  StyledComponentProps,
  Theme,
  withStyles
} from "@material-ui/core";
import VideogameAssetIcon from "@material-ui/icons/VideogameAsset";
import { Component } from "react";
import * as React from "react";
import { IGame } from "../../models/IGame";
import { handlerFactory } from "../../utils/Utils";
type ClassNames = "list";
export interface IGameListProps extends StyledComponentProps<ClassNames> {
  games: IGame[];
  onListItemClick: (game: IGame, e: React.MouseEvent) => any;
}
export class GameListComponent extends Component<IGameListProps> {
  handleListItemClick = handlerFactory((game: IGame, e?: React.MouseEvent) =>
    this.props.onListItemClick(game, e!)
  );
  render() {
    const { games } = this.props;
    return (
      <List subheader={<ListSubheader>Current Games</ListSubheader>}>
        {games.map(this.renderListItem)}
      </List>
    );
  }
  renderListItem = (game: IGame) => (
    <ListItem key={game.id} onClick={this.handleListItemClick(game)}>
      <ListItemIcon>
        <VideogameAssetIcon />
      </ListItemIcon>
      <ListItemText primary={game.name} secondary={game.contact} />
    </ListItem>
  );
}

const styles = (theme: Theme) =>
  createStyles<ClassNames>({
    list: {}
  });

export const GameList = withStyles(styles)(GameListComponent);
