import { FunctionComponent } from "react";
import { IGame } from "../../../models/IGame";
import { useContext } from "react";
import { AppContext } from "../../AppContext";

export interface DrawPrizeSectionProps {
  game: IGame;
}

export const DrawPrizeSection: FunctionComponent<DrawPrizeSectionProps> = ({
  game
}) => {
  const context = useContext(AppContext);
};
