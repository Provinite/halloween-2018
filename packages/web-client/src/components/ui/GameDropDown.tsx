import { Omit } from "@clovercoin/constants";
import {
  createStyles,
  MenuItem,
  Select,
  StyledComponentProps,
  Theme,
  withStyles
} from "@material-ui/core";
import { SelectProps } from "@material-ui/core/Select";
import * as React from "react";
import { IGame } from "../../models/IGame";
import { AppContext, IAppContext } from "../AppContext";

interface IState {
  games: IGame[];
}

interface IGameDropDownProps
  extends StyledComponentProps<"select" | "icon">,
    Omit<SelectProps, "value" | "onChange" | keyof StyledComponentProps> {
  onChange: (game: IGame) => any;
  value: IGame | undefined;
}

export class GameDropDown extends React.Component<IGameDropDownProps, IState> {
  static contextType = AppContext;
  context: IAppContext;
  readonly state: IState = {
    games: []
  };
  /**
   * Populate the dropdown on mount.
   */
  async componentDidMount() {
    const { gameService } = this.context.services;
    const games = await gameService.getAll();
    this.setState({ games });
    this.props.onChange(games[0]);
  }
  /**
   * Handle change events from the select.
   */
  handleChange = e => {
    // get the game and notify parent
    const game = this.state.games.find(g => g.id === e.target.value);
    this.props.onChange(game!);
  };
  render() {
    const { classes, onChange, value, inputProps, ...rest } = this.props;
    return (
      <Select
        className={classes!.select}
        inputProps={{ ...inputProps, classes: { icon: classes!.icon } as any }}
        onChange={this.handleChange}
        value={value ? value.id : ""}
        {...rest}
      >
        {this.state.games.map(game => (
          <MenuItem value={game.id} key={game.id}>
            {game.name}
          </MenuItem>
        ))}
      </Select>
    );
  }
}

const lightThemeStyles = (theme: Theme) => {
  const color = theme.palette.primary.contrastText;
  return createStyles({
    icon: {
      fill: color
    },
    select: {
      minWidth: "150px",
      color,
      "&:before": {
        borderColor: color
      },
      "&:after": {
        borderColor: color
      }
    }
  });
};

/**
 * A light themed game dropdown.
 */
export const GameDropDownLight = withStyles(lightThemeStyles)(GameDropDown);
