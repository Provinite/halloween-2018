import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  StyledComponentProps,
  Theme,
  withStyles
} from "@material-ui/core";
import TextField, {
  StandardTextFieldProps,
  TextFieldProps
} from "@material-ui/core/TextField";
import { Component } from "react";
import * as React from "react";
import { IGame } from "../../models/IGame";
import { Omit } from "../../types/Omit";
import { handlerFactory } from "../../utils/Utils";
import { NumericTextField } from "../ui/form/NumericTextField";
import { FormSectionHeading } from "../ui/FormSectionHeading";
import { DialogTitleWithCloseButton } from "../ui/mui/DialogTitleWithCloseButton";
import { SaveButton } from "../ui/SaveButton";
type ClassNames = "textField" | "textFieldRoot" | "fieldContainer";
export interface IGameModalProps extends StyledComponentProps<ClassNames> {
  mode: "add" | "edit";
  onClose: () => any;
  onSave: (game: Partial<IGame>) => any;
  open: boolean;
}
type formKeys =
  | "name"
  | "description"
  | "drawResetSchedule"
  | "drawsPerReset"
  | "winRate"
  | "contact"
  | "vipDrawsPerReset"
  | "startDate"
  | "endDate";

interface IState {
  form: Pick<Partial<IGame>, formKeys>;
  isSaving: boolean;
}

export class GameModalComponent extends Component<IGameModalProps, IState> {
  readonly state: Readonly<IState> = {
    form: {
      name: "",
      description: "",
      drawsPerReset: 1,
      vipDrawsPerReset: 2,
      winRate: 0.01,
      drawResetSchedule: "0 12 * * *",
      endDate: undefined,
      startDate: undefined,
      contact: ""
    },
    isSaving: false
  };

  handleFieldChange = handlerFactory(
    (
      field: keyof IState["form"],
      e?: React.ChangeEvent<HTMLInputElement>,
      numericVal?: number
    ) => {
      const val = e!.target.value;
      this.setState(({ form }) => ({
        form: {
          ...form,
          [field]: numericVal === undefined ? val : numericVal
        }
      }));
    }
  );
  handleSaveClick = async () => {
    this.setState({ isSaving: true });
    await this.props.onSave(this.state.form);
    this.setState({ isSaving: false });
  };

  /**
   * Render an input for the form. Injects styling and value/onChange props.
   * @param field - The name of the field in component state.
   * @param props - Props that will be spread onto the rendered component.
   * @param [RenderComponent] - The component to render, defaults to TextField.
   * @return The created element.
   */
  renderTextField = <P extends StandardTextFieldProps = StandardTextFieldProps>(
    field: keyof IState["form"],
    props: Omit<P, "onChange">,
    RenderComponent?:
      | React.ComponentType<P>
      | React.ComponentType<TextFieldProps>
  ) => {
    if (!RenderComponent) {
      RenderComponent = TextField;
    }
    const { classes } = this.props;
    const { form } = this.state;

    return (
      <RenderComponent
        className={classes!.textField}
        fullWidth={true}
        color="secondary"
        InputProps={{ classes: { root: classes!.textFieldRoot } }}
        {...props as any}
        value={form[field]}
        onChange={this.handleFieldChange(field)}
      />
    );
  };
  render() {
    const { classes } = this.props;
    return (
      <Dialog
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        maxWidth="sm"
        fullWidth={true}
        open={this.props.open}
        onExited={this.props.onClose}
      >
        <DialogTitleWithCloseButton onCloseClick={this.props.onClose}>
          {this.props.mode === "add" ? "Add " : "Edit "} Game
        </DialogTitleWithCloseButton>
        <DialogContent>
          <DialogContentText>
            {this.props.mode === "add"
              ? "Create a new game here to get started loading it with prizes and spreading smiles!"
              : "Fine tune your game settings here."}
          </DialogContentText>
          <FormSectionHeading>General Information</FormSectionHeading>
          <div className={classes!.fieldContainer}>
            {this.renderTextField("name", {
              label: "Name",
              placeholder: "Happy Funtime Giveaway",
              required: true
            })}
            {this.renderTextField("description", {
              label: "Description",
              required: true,
              placeholder: "A lovely giveaway from Happy Funtime Group!",
              multiline: true
            })}
            {this.renderTextField("contact", {
              label: "Contact",
              required: true,
              placeholder: "help@happyfuntime.org"
            })}
          </div>
          <FormSectionHeading>Configuration</FormSectionHeading>
          <div className={classes!.fieldContainer}>
            {this.renderTextField(
              "winRate",
              {
                align: "left",
                label: "Win Rate",
                helperText: "Game win rate, must be 0 - 1",
                placeholder: "0.5",
                required: true
              },
              NumericTextField
            )}
            {this.renderTextField(
              "drawsPerReset",
              {
                align: "left",
                label: "Draws Per Reset",
                placeholder: "1",
                helperText: "How many draws normal users get per reset",
                required: true
              },
              NumericTextField
            )}
            {this.renderTextField(
              "vipDrawsPerReset",
              {
                align: "left",
                label: "VIP Draws Per Reset",
                placeholder: "2",
                helperText: "How many draws VIP users get per reset"
              },
              NumericTextField
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button color="primary">Cancel</Button>
          <SaveButton
            size="small"
            color="secondary"
            onClick={this.handleSaveClick}
            saving={this.state.isSaving}
          />
        </DialogActions>
      </Dialog>
    );
  }
}

const styles = (theme: Theme) =>
  createStyles<ClassNames>({
    textField: {
      marginBottom: theme.spacing.unit
    },
    textFieldRoot: {
      "&:before": {
        // borderBottomColor: theme.palette.secondary.dark
      },
      "&:after": {
        borderBottomColor: theme.palette.secondary.light
      }
    },
    fieldContainer: {
      paddingLeft: theme.spacing.unit
    }
  });

export const GameModal = withStyles(styles)(GameModalComponent);
