import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  TextField
} from "@material-ui/core";
import { TextFieldProps } from "@material-ui/core/TextField";
import CancelIcon from "@material-ui/icons/Cancel";
import CardGiftCardIcon from "@material-ui/icons/CardGiftcard";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";

import * as React from "react";
import { IPrize } from "../../models/IPrize";
import { memoize } from "../../utils/Utils";
import { WithCssShake } from "../ui/motion/WithCssShake";
import { NumericTextField } from "../ui/NumericTextField";
import { SaveButton } from "../ui/SaveButton";
import { WithSpinner } from "../ui/WithSpinner";
type formKey = Exclude<keyof IPrize, "id">;

interface IPrizeListProps {
  prizes: IPrize[];
  onDelete: (prize: IPrize) => any;
  onSave: (prize: Partial<IPrize>) => any;
  onUpdate: (prize: Partial<IPrize>) => any;
}

interface IPrizeListState {
  /** The prize to delete, if any. */
  prizeToDelete: IPrize;
  /** If set, the confirmation dialog will be shown to delete the prize */
  dialogOpen: boolean;
  /** The id of the prize currently being edited */
  editingPrizeId: number;
  /** Model for the prize form. */
  prizeForm: { [key in formKey]: IPrize[formKey] | "" };
  /** Flag indicating whether the form is currently saving. */
  saving: boolean;
  /** Flag indicating whether the form should shake. */
  shakeForm: boolean;
}

export class PrizeList extends React.Component<
  IPrizeListProps,
  IPrizeListState
> {
  private static defaultPrizeForm = {
    currentStock: "",
    description: "",
    initialStock: "",
    name: "",
    weight: 1.0
  };

  private formRef: React.RefObject<HTMLFormElement>;

  constructor(props) {
    super(props);
    /** Refs */
    this.formRef = React.createRef();

    /** Initial State */
    this.state = {
      prizeToDelete: null,
      dialogOpen: false,
      editingPrizeId: null,
      prizeForm: { ...PrizeList.defaultPrizeForm },
      saving: false,
      shakeForm: false
    };

    /** Bound functions */
    this.createPrizeRow = this.createPrizeRow.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.handleCancelClick = this.handleCancelClick.bind(this);
    this.handleDialogExited = this.handleDialogExited.bind(this);
    this.makeHandleRowClick = memoize(this.makeHandleRowClick.bind(this));
    this.makeHandleFieldChange = memoize(this.makeHandleFieldChange.bind(this));
    this.handleAddFormSave = this.handleAddFormSave.bind(this);
    this.handleEditFormSave = this.handleEditFormSave.bind(this);
    this.makeHandleDeleteClick = memoize(this.makeHandleDeleteClick.bind(this));
    this.submitForm = this.submitForm.bind(this);
    this.stopEditing = this.stopEditing.bind(this);
    this.createPrizeFieldInput = this.createPrizeFieldInput.bind(this);
    this.shakeForm = this.shakeForm.bind(this);
    this.stopShakingForm = this.stopShakingForm.bind(this);
  }

  /**
   * Submit the form (committing an edit or create).
   */
  submitForm() {
    this.formRef.current.submit();
  }

  /**
   * Stop editing any prizes.
   */
  stopEditing(e?: any) {
    // todo: refactor into handleEditCancelClick / stopEditing private
    // also rename handleCancelClick to handleDeleteCancelClick or
    // handleDialogCancelClick.
    if (e) {
      e.stopPropagation();
    }
    this.setState(prevState => {
      if (prevState.editingPrizeId !== null) {
        return {
          ...prevState,
          editingPrizeId: null,
          prizeForm: { ...PrizeList.defaultPrizeForm },
          shakeForm: false
        };
      } else {
        return prevState;
      }
    });
  }

  /**
   * Waggle the prize form.
   */
  shakeForm() {
    this.setState(prevState => ({
      ...prevState,
      shakeForm: true
    }));
  }

  /**
   * Stop waggling the prize form.
   */
  stopShakingForm() {
    this.setState(prevState => ({
      ...prevState,
      shakeForm: false
    }));
  }

  /**
   * Create an event handler to delete the provided prize. Memoized.
   * @param prize - The prize to delete.
   */
  makeHandleDeleteClick(prize: IPrize) {
    return (event: React.MouseEvent<HTMLElement>) => {
      if (event.button !== 0) {
        return;
      }
      event.stopPropagation();
      this.handleDeleteClick(prize);
      // this.props.onDelete(prize);
    };
  }

  /**
   * Create a field change handler for the given key. Memoized.
   */
  makeHandleFieldChange(field: formKey) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      this.setState(({ prizeForm }) => {
        return {
          prizeForm: {
            ...prizeForm,
            [field]: value
          }
        };
      });
    };
  }
  /**
   * Handle patching. Invokes parent's onUpdate callback.
   * @param event
   */
  async handleEditFormSave(event?: React.FormEvent) {
    event.preventDefault();
    this.setState({ saving: true });
    const { prizeForm } = this.state;
    const prize: Partial<IPrize> = {};
    for (const key of Object.keys(prizeForm)) {
      prize[key] = prizeForm[key] === "" ? null : prizeForm[key];
    }
    prize.id = this.state.editingPrizeId;
    try {
      await this.props.onUpdate(prize);
      this.setState(prevState => ({
        ...prevState,
        saving: false,
        prizeForm: { ...PrizeList.defaultPrizeForm },
        editingPrizeId: null
      }));
    } catch (e) {
      requestAnimationFrame(this.shakeForm);
    } finally {
      this.setState({ saving: false });
    }
  }

  /**
   * Handle saving. Invokes parent's onSave callback.
   */
  async handleAddFormSave(event?: React.FormEvent) {
    event.preventDefault();
    this.setState({ saving: true });
    const prize: Partial<IPrize> = {};
    const { prizeForm } = this.state;
    for (const key of Object.keys(prizeForm)) {
      prize[key] = prizeForm[key] === "" ? null : prizeForm[key];
    }
    try {
      await this.props.onSave(prize);
      this.setState(prevState => ({
        ...prevState,
        prizeForm: {
          ...PrizeList.defaultPrizeForm
        }
      }));
    } catch (e) {
      requestAnimationFrame(() => this.shakeForm());
    } finally {
      this.setState({ saving: false });
    }
  }

  /**
   * Notify the parent of deletion after confirmation from the user.
   */
  async handleConfirmClick() {
    await this.props.onDelete(this.state.prizeToDelete);
    this.setState({
      dialogOpen: false
    });
  }

  /**
   * Close the dialog.
   */
  handleCancelClick() {
    this.setState({ dialogOpen: false });
  }

  /**
   * Clear the prize to delete after the dialog has closed.
   */
  handleDialogExited() {
    this.setState({
      prizeToDelete: null
    });
  }

  /**
   * Prompt the user for confirmation of deletion.
   * @param prize - The prize to delete.
   */
  handleDeleteClick(prize: IPrize) {
    this.setState({
      prizeToDelete: prize,
      dialogOpen: true
    });
  }

  /**
   * Create an onClick handler for the given prize row. Memoized.
   */
  makeHandleRowClick(prize: IPrize) {
    return () => {
      this.setState(prevState => {
        if (prevState.editingPrizeId === prize.id) {
          return prevState;
        }
        return {
          ...prevState,
          editingPrizeId: prize.id,
          prizeForm: {
            ...prize
          },
          shakeForm: false
        };
      });
    };
  }

  /**
   * Create a form element for the given key.
   * @param field - The name of the field this input represents.
   */
  createPrizeFieldInput(
    field: formKey,
    purpose: "add" | "edit" = "add",
    onRest: () => void = () => {
      // noop
    }
  ) {
    const { prizeForm, saving } = this.state;
    const labels: Partial<Record<formKey, string>> = {
      initialStock: "Total",
      currentStock: "Remaining"
    };
    const components: Partial<
      Record<formKey, typeof TextField | typeof NumericTextField>
    > = {
      weight: NumericTextField,
      initialStock: NumericTextField,
      currentStock: NumericTextField
    };

    const FieldComponent = components[field] || TextField;
    const labelProp = purpose === "add" ? "label" : "helperText";

    const label =
      labels[field] || field[0].toUpperCase() + field.substr(1).toLowerCase();

    const sharedFieldProps = {
      fullWidth: true
    };

    const fieldProps: TextFieldProps = {
      ...sharedFieldProps,
      multiline: field === "description",
      [labelProp]: label,
      onChange: this.makeHandleFieldChange(field),
      value: prizeForm[field],
      margin: "dense",
      disabled: saving
    };
    return (
      <WithCssShake shake={this.state.shakeForm} onComplete={onRest}>
        <FieldComponent {...fieldProps} />
      </WithCssShake>
    );
  }

  /**
   * Create a display row for the given prize.
   * @param prize - The prize to display
   */
  createPrizeRow(prize: IPrize) {
    const editing = this.state.editingPrizeId === prize.id;
    const { saving } = this.state;
    return (
      <TableRow
        hover={!editing}
        style={{
          cursor: editing ? "default" : "pointer"
        }}
        key={prize.id}
        onClick={this.makeHandleRowClick(prize)}
      >
        <TableCell>
          {editing
            ? this.createPrizeFieldInput("name", "edit", this.stopShakingForm)
            : prize.name}
        </TableCell>
        <TableCell>
          {editing
            ? this.createPrizeFieldInput("description", "edit")
            : prize.description}
        </TableCell>
        <TableCell numeric={true}>
          {editing
            ? this.createPrizeFieldInput("initialStock", "edit")
            : prize.initialStock}
        </TableCell>
        <TableCell numeric={true}>
          {editing
            ? this.createPrizeFieldInput("weight", "edit")
            : prize.weight}
        </TableCell>
        <TableCell numeric={true}>
          {editing
            ? this.createPrizeFieldInput("currentStock", "edit")
            : prize.currentStock}
        </TableCell>
        <TableCell>
          <IconButton
            color="secondary"
            disabled={saving}
            onClick={
              editing
                ? this.handleEditFormSave
                : this.makeHandleDeleteClick(prize)
            }
          >
            {editing ? (
              <WithSpinner color="secondary" loading={saving} size={24}>
                <SaveIcon />
              </WithSpinner>
            ) : (
              <DeleteIcon fontSize="small" />
            )}
          </IconButton>
          {editing && (
            <IconButton
              disabled={saving}
              color="primary"
              onClick={this.stopEditing}
            >
              <CancelIcon />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
    );
  }
  render() {
    const { prizeToDelete, dialogOpen, saving, editingPrizeId } = this.state;
    const editing = !!editingPrizeId;
    return (
      <>
        <form
          onSubmit={
            this.state.editingPrizeId === null
              ? this.handleAddFormSave
              : this.handleEditFormSave
          }
          ref={this.formRef}
        >
          {/* Enable enter-to-submit behavior. */}
          <input type="submit" style={{ display: "none" }} />
          <Table padding="dense" style={{ tableLayout: "fixed" }}>
            <>
              <TableHead key="head">
                <TableRow>
                  <TableCell style={{ width: "20%" }}>Prize</TableCell>
                  <TableCell style={{ width: "34%" }}>Description</TableCell>
                  <TableCell numeric={true} style={{ width: "12%" }}>
                    Total
                  </TableCell>
                  <TableCell numeric={true} style={{ width: "12%" }}>
                    Weight
                  </TableCell>
                  <TableCell numeric={true} style={{ width: "12%" }}>
                    Remaining
                  </TableCell>
                  <TableCell style={{ width: "10%", paddingLeft: "34px" }}>
                    <CardGiftCardIcon />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody key="bod">
                {/* Render a row for each prize */}
                {this.props.prizes.map(this.createPrizeRow) || (
                  <TableCell>No Data</TableCell>
                )}
              </TableBody>
              {/* Add prize form */}
              {editing || (
                <TableFooter key="foot">
                  <TableRow>
                    <TableCell key="name">
                      {this.createPrizeFieldInput(
                        "name",
                        "add",
                        this.stopShakingForm
                      )}
                    </TableCell>
                    <TableCell key="description">
                      {this.createPrizeFieldInput("description")}
                    </TableCell>
                    <TableCell key="initialStock">
                      {this.createPrizeFieldInput("initialStock")}
                    </TableCell>
                    <TableCell key="weight">
                      {this.createPrizeFieldInput("weight")}
                    </TableCell>
                    <TableCell key="actions">
                      {/* The button will be replaced by a spinner while saving */}
                      <SaveButton
                        color="secondary"
                        size="small"
                        saving={saving}
                      />
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </>
          </Table>
        </form>
        {/* Delete confirmation dialog */}
        <Dialog
          disableBackdropClick={true}
          disableEscapeKeyDown={true}
          maxWidth="md"
          open={dialogOpen}
          onExited={this.handleDialogExited}
        >
          <DialogTitle>
            Delete {prizeToDelete ? prizeToDelete.name : ""}?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Really delete this prize? This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleCancelClick}>
              Cancel
            </Button>
            <Button color="secondary" onClick={this.handleConfirmClick}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}
