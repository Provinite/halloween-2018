import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter
} from "@material-ui/core";
import * as React from "react";
import { IPrize } from "../../models/IPrize";
interface IPrizeListProps {
  prizes: IPrize[];
}

export class PrizeList extends React.Component<IPrizeListProps, {}> {
  private static createPrizeRow(prize: IPrize) {
    return (
      <TableRow key={prize.id}>
        <TableCell>{prize.name}</TableCell>
        <TableCell>{prize.description}</TableCell>
        <TableCell numeric={true}>{prize.initialStock}</TableCell>
        <TableCell numeric={true}>{prize.currentStock}</TableCell>
      </TableRow>
    );
  }
  render() {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Prize</TableCell>
            <TableCell>Description</TableCell>
            <TableCell numeric={true}>Total</TableCell>
            <TableCell numeric={true}>Remaining</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{this.props.prizes.map(PrizeList.createPrizeRow)}</TableBody>
        <TableFooter>{this.props.children}</TableFooter>
      </Table>
    );
  }
}
