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
import { CountDown } from "./draw/CountDown";
type GameLandingPageClasses =
  | "container"
  | "flexRow"
  | "flexColumn"
  | "logoImage"
  | "mainHeader"
  | "topBar"
  | "gameImage"
  | "gameName"
  | "gameImageContainer";
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
      {/* CloverCoin Logo */}
      <div className={classes.topBar}>
        <img
          src="https://www.clovercoin.com/assets/img/banner_cc_10.png"
          className={classes.logoImage}
        />
      </div>
      {/* Game Splash Image */}
      <div
        className={classNames(classes.flexColumn, classes.gameImageContainer)}
      >
        <img src={game.mainImageUrl} className={classes.gameImage} />
        <h2 className={classes.gameName}>{game.name}</h2>
      </div>
      <h2>Welcome!</h2>
      <p>{game.description}</p>
      <img src={image({ size: 128 })} />
    </div>
  );
};

const styles: StyleRulesCallback<GameLandingPageClasses> = theme => ({
  container: {
    fontFamily: "'Roboto', sans-serif",
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
  topBar: {
    backgroundColor: "#272932",
    alignSelf: "stretch"
  },
  logoImage: {
    alignSelf: "flex-start"
  },
  mainHeader: {},
  gameImage: {
    width: "100%"
  },
  gameName: {
    position: "absolute",
    bottom: "0",
    padding: "1rem 1rem 1rem",
    margin: 0,
    fontSize: "2rem",
    background: "linear-gradient(rgba(0,0,0,0.1), black)",
    color: "white",
    boxShadow:
      "0 12px 17px 2px rgba(0,0,0,0.14), 0 5px 22px 4px rgba(0,0,0,0.12), 0 7px 8px -4px rgba(0,0,0,0.20)",
    fontWeight: 500,
    display: "block",
    width: "100%"
  },
  gameImageContainer: {
    width: "100%",
    position: "relative"
  }
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
