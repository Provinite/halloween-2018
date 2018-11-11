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
  TableRow
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import * as React from "react";
import { IPrize } from "../../models/IPrize";
interface IPrizeListProps {
  prizes: IPrize[];
  onDelete: (prize: IPrize) => any;
}

interface IPrizeListState {
  /** The prize to delete, if any. */
  prizeToDelete: IPrize;
  /** If set, the confirmation dialog will be shown to delete the prize */
  dialogOpen: boolean;
}

export class PrizeList extends React.Component<
  IPrizeListProps,
  IPrizeListState
> {
  constructor(props) {
    super(props);
    /** Initial State */
    this.state = {
      prizeToDelete: null,
      dialogOpen: false
    };

    /** Bound functions */
    this.createPrizeRow = this.createPrizeRow.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.handleCancelClick = this.handleCancelClick.bind(this);
    this.handleDialogExited = this.handleDialogExited.bind(this);
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
   * Clear the prize to delete
   */
  handleDialogExited() {
    this.setState({
      prizeToDelete: null
    });
  }

  /**
   * Prompt the user for confirmation.
   * @param prize - The prize to delete.
   */
  handleDeleteClick(prize: IPrize) {
    this.setState({
      prizeToDelete: prize,
      dialogOpen: true
    });
  }

  /**
   * Create a display row for the given prize. Should be memoized.
   * @param prize - The prize to display
   */
  createPrizeRow(prize: IPrize) {
    return (
      <TableRow key={prize.id}>
        <TableCell>{prize.name}</TableCell>
        <TableCell>{prize.description}</TableCell>
        <TableCell numeric={true}>{prize.initialStock}</TableCell>
        <TableCell numeric={true}>{prize.currentStock}</TableCell>
        <TableCell>
          <IconButton
            color="secondary"
            // tslint:disable-next-line
            onClick={() => this.handleDeleteClick(prize)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  }
  render() {
    const { prizeToDelete, dialogOpen } = this.state;
    return (
      <>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Prize</TableCell>
              <TableCell>Description</TableCell>
              <TableCell numeric={true}>Total</TableCell>
              <TableCell numeric={true}>Remaining</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>{this.props.prizes.map(this.createPrizeRow)}</TableBody>
          <TableFooter>{this.props.children}</TableFooter>
        </Table>
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
