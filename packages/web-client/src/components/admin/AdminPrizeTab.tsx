import { TableCell, TableRow, TextField } from "@material-ui/core";
import * as React from "react";
import { IPrize } from "../../models/IPrize";
import { NumericTextField } from "../ui/NumericTextField";
import { SaveButton } from "../ui/SaveButton";
import { WithSpinner } from "../ui/WithSpinner";
import { PrizeList } from "./PrizeList";
interface IAdminPrizeTabProps {
  onDelete: (prize: IPrize) => any;
  onSave: (prize: Partial<IPrize>) => any;
  prizes: IPrize[];
}
type formKey = Exclude<keyof IPrize, "id">;
interface IAdminPrizeTabState {
  prizeForm: { [key in formKey]: IPrize[formKey] | "" };
  saving: boolean;
}

/**
 * Component that presents a list and edit controls for prizes.
 */
export class AdminPrizeTab extends React.Component<
  IAdminPrizeTabProps,
  IAdminPrizeTabState
> {
  /** Change handlers for the prize form */
  private changeHandlers: {
    [key in formKey]: React.ChangeEventHandler<HTMLInputElement>
  };

  private defaultPrizeForm = {
    currentStock: "",
    description: "",
    initialStock: "",
    name: "",
    weight: 1.0
  };

  constructor(props) {
    super(props);
    /**
     * Creates a function that will update this.state.prizeForm[key] with
     * the value of an event's target.
     * @param field - The name of the field to update.
     */
    const createUpdateFn: (field: formKey) => React.ChangeEventHandler = (
      field: string
    ) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        this.setState(({ prizeForm }) => {
          prizeForm = { ...prizeForm };
          prizeForm[field] = value;
          return { prizeForm };
        });
      };
    };

    /* 
      Change handlers for prize form inputs. These could be moved to
      the prototype.
    */
    this.changeHandlers = {
      currentStock: createUpdateFn("currentStock"),
      description: createUpdateFn("description"),
      initialStock: createUpdateFn("initialStock"),
      name: createUpdateFn("name"),
      weight: createUpdateFn("weight")
    };

    /* Initial State */
    this.state = {
      prizeForm: {
        ...this.defaultPrizeForm
      },
      saving: false
    };

    /* Bound members */
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
  }

  /**
   * Handle save button click.
   */
  async handleSaveButtonClick() {
    this.setState({ saving: true });
    const prize: Partial<IPrize> = {};
    const { prizeForm } = this.state;
    for (const key of Object.keys(prizeForm)) {
      prize[key] = prizeForm[key] === "" ? null : prizeForm[key];
    }
    try {
      await this.props.onSave(this.state.prizeForm as IPrize);
      this.setState({
        prizeForm: { ...this.defaultPrizeForm }
      });
    } catch (e) {
      // noop
    } finally {
      this.setState({ saving: false });
    }
  }

  render() {
    const { changeHandlers } = this;
    const { prizeForm } = this.state;
    return (
      /* Don't show the page until prizes have loaded. */
      <WithSpinner
        style={{ margin: "40px auto", display: "block" }}
        loading={!this.props.prizes}
        color="inherit"
      >
        {/* Display the prize list */}
        <form>
          <PrizeList prizes={this.props.prizes} onDelete={this.props.onDelete}>
            {/* Display the prize form in the footer of the prize list */}
            <TableRow>
              <TableCell>
                <TextField
                  fullWidth={true}
                  variant="standard"
                  label="Name"
                  value={prizeForm.name}
                  onChange={changeHandlers.name}
                  disabled={this.state.saving}
                  required={true}
                />
              </TableCell>
              <TableCell>
                <TextField
                  fullWidth={true}
                  variant="standard"
                  label="Description"
                  multiline={true}
                  value={prizeForm.description}
                  onChange={changeHandlers.description}
                  disabled={this.state.saving}
                  required={true}
                />
              </TableCell>
              <TableCell numeric={true}>
                <NumericTextField
                  fullWidth={true}
                  variant="standard"
                  label="Total"
                  value={prizeForm.initialStock}
                  onChange={changeHandlers.initialStock}
                  disabled={this.state.saving}
                  required={true}
                  type="number"
                />
              </TableCell>
              <TableCell numeric={true}>
                <NumericTextField
                  fullWidth={true}
                  variant="standard"
                  label="Weight"
                  value={prizeForm.weight}
                  onChange={changeHandlers.weight}
                  disabled={this.state.saving}
                  required={true}
                  type="number"
                />
              </TableCell>
              <TableCell>
                {/* The button will be replaced by a spinner while saving */}
                <SaveButton
                  color="secondary"
                  size="small"
                  onClick={this.handleSaveButtonClick}
                  saving={this.state.saving}
                />
              </TableCell>
            </TableRow>
          </PrizeList>
        </form>
      </WithSpinner>
    );
  }
}
