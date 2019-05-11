import {
  Grid,
  StyledComponentProps,
  StyleRulesCallback,
  TextField,
  Typography,
  withStyles
} from "@material-ui/core";
import * as React from "react";
import { Component } from "react";
import { RouteComponentProps } from "react-router";
import { IGame } from "../../models/IGame";
import { handlerFactory } from "../../utils/Utils";
import { AppContext, IAppContext } from "../AppContext";
import { DateField } from "../ui/form/DateField";
import { NumericTextField } from "../ui/form/NumericTextField";
import { PageBody } from "../ui/PageBody";
import { PageTitle } from "../ui/PageTitle";
import { SaveButton } from "../ui/SaveButton";

type GameDetailClassNames = "configSection" | "formInput";
interface GameDetailProps
  extends RouteComponentProps<{ gameId: string }>,
    StyledComponentProps<GameDetailClassNames> {}
interface GameDetailState {
  game: IGame | null;
  form: {
    startDate: string;
    endDate: string;
    winRate: number | "";
    drawsPerReset: number | "";
    vipDrawsPerReset: number | "";
    drawResetSchedule: string;
  };
}
type formKey = keyof GameDetailState["form"];
/**
 * Game detail form.
 */
export class GameDetailComponent extends Component<
  GameDetailProps,
  GameDetailState
> {
  static contextType = AppContext;
  context: IAppContext;
  readonly state: Readonly<GameDetailState> = {
    game: null,
    form: {
      startDate: "",
      endDate: "",
      winRate: "",
      drawsPerReset: "",
      vipDrawsPerReset: "",
      drawResetSchedule: ""
    }
  };

  /**
   * Handler factory for updating a specific key on this.state.form
   */
  updateField = handlerFactory(
    (
      field: keyof GameDetailState["form"],
      e?: React.ChangeEvent<HTMLInputElement>
    ) => {
      const { value } = e!.target;
      this.setState(({ form }) => ({ form: { ...form, [field]: value } }));
    }
  );

  async componentDidMount() {
    // fetch the game we're viewing
    const { gameService } = this.context.services;
    const game = await gameService.getOne(this.props.match.params.gameId);
    this.setState({
      game,
      form: {
        startDate: game.startDate || "",
        endDate: game.endDate || "",
        winRate: game.winRate,
        drawsPerReset: game.drawsPerReset,
        vipDrawsPerReset: game.vipDrawsPerReset,
        drawResetSchedule: game.drawResetSchedule
      }
    });
  }

  render() {
    const { game } = this.state;
    const { classes } = this.props;
    const labels: Record<formKey, string> = {
      startDate: "Start Date",
      endDate: "End Date",
      winRate: "Win Rate",
      drawsPerReset: "Draws Per Reset",
      vipDrawsPerReset: "VIP Draws Per Reset",
      drawResetSchedule: "Reset Schedule"
    };
    const makeProps = (key: formKey) => ({
      label: labels[key],
      onChange: this.updateField(key),
      value: this.state.form[key],
      key,
      fullWidth: true,
      className: classes!.formInput
    });
    const renderDateField = (key: formKey) => <DateField {...makeProps(key)} />;
    const renderTextField = (key: formKey) => <TextField {...makeProps(key)} />;
    const renderNumericField = (key: formKey) => (
      <NumericTextField {...makeProps(key)} />
    );
    return (
      <div>
        {game && (
          <PageBody>
            <PageTitle>{game.name}</PageTitle>
            <Grid container>
              <Grid item xs={6} className={classes!.configSection}>
                <Typography variant="subtitle1">General</Typography>
                {renderDateField("startDate")}
                {renderDateField("endDate")}
              </Grid>
              <Grid xs={6} className={classes!.configSection}>
                <Typography variant="subtitle1">Configuration</Typography>
                {([
                  "winRate",
                  "drawsPerReset",
                  "vipDrawsPerReset"
                ] as formKey[]).map(renderNumericField)}
                {renderTextField("drawResetSchedule")}
              </Grid>
              <Grid
                item
                xs={12}
                className={classes!.configSection}
                justify="flex-end"
              >
                <SaveButton color="secondary">Save</SaveButton>
              </Grid>
            </Grid>
          </PageBody>
        )}
      </div>
    );
  }
}

const styles: StyleRulesCallback<GameDetailClassNames> = theme => ({
  configSection: {
    padding: theme.spacing.unit * 2
  },
  formInput: {
    marginBottom: "10px"
  }
});

export const GameDetail = withStyles(styles)(GameDetailComponent);
