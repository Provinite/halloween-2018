import { FunctionComponent } from "react";
import { useState } from "react";
import { IGame } from "../../models/IGame";
import { useContext } from "react";
import { AppContext } from "../AppContext";
import { RouteComponentProps } from "react-router";
import { useEffect } from "react";
import * as React from "react";
import {
  StyledComponentProps,
  StyleRulesCallback,
  withStyles
} from "@material-ui/core";
import classNames = require("classnames");
type GameLandingPageClasses =
  | "container"
  | "flexRow"
  | "flexColumn"
  | "logoImage"
  | "mainHeader"
  | "gameImage";
export interface GameLandingPageProps
  extends StyledComponentProps<GameLandingPageClasses>,
    RouteComponentProps<{ gameId: string }> {}

export const GameLandingPageComponent: FunctionComponent<
  GameLandingPageProps
> = ({ classes: optionalClasses, match }) => {
  const classes = optionalClasses!;
  const ctx = useContext(AppContext);
  const [game, setGame] = useState<IGame | null>(null);

  const { gameId } = match.params;
  const { gameService } = ctx.services;

  // fetch the game
  useEffect(
    () => {
      gameService.getOne(gameId).then(setGame, ctx.onApiError);
    },
    [gameId]
  );

  if (!game) {
    return <h1>Loading . . .</h1>;
  }
  return (
    <div className={classNames(classes.flexColumn, classes.container)}>
      <div className={classes.flexRow}>
        <img
          src={image({
            size: 128,
            backgroundColor: "FCE896",
            textColor: "000000",
            text: "CloverCoin"
          })}
          className={classes.logoImage}
        />
        <h1 className={classes.mainHeader}>CloverCoin Presents</h1>
      </div>
      <div
        className={classNames(classes.flexColumn, classes.gameImage)}
        style={{ backgroundImage: cssUrl(game.mainImageUrl) }}
      >
        <h2>{game.name}</h2>
      </div>
      <h2>Welcome!</h2>
      <p>{game.description}</p>
      <img src={image({ size: 128 })} />
    </div>
  );
};

const styles: StyleRulesCallback<GameLandingPageClasses> = theme => ({
  container: {
    margin: "0 auto",
    width: "100%",
    maxWidth: "1024px",
    backgroundColor: theme.palette.background.paper
  },
  flexRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  flexColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative"
  },
  logoImage: {
    borderRadius: "50%"
  },
  mainHeader: {},
  gameImage: {}
});

export function cssUrl(url: string) {
  return `url('${url}')`;
}

function image({
  size,
  width = size,
  height = size,
  backgroundColor,
  textColor,
  text
}: {
  size?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  text?: string;
}) {
  let result = `https://via.placeholder.com/${width}x${height}`;
  if (backgroundColor) {
    result += `/${backgroundColor}/${textColor}`;
    if (text) result += `?text=${text}`;
  }
  return result;
}

export const GameLandingPage = withStyles(styles)(GameLandingPageComponent);
