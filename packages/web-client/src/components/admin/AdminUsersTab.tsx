import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@material-ui/core";
import * as React from "react";
export class AdminUsersTab extends React.Component {
  render() {
    return (
      <>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>DeviantArt UUID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Provinite</TableCell>
              <TableCell>ADMIN</TableCell>
              <TableCell>i33253e23a2ef588</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>
    );
  }
}
