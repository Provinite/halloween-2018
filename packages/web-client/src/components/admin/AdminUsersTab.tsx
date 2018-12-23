import { ROLES } from "@clovercoin/constants";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@material-ui/core";
import * as React from "react";
import { IRole } from "../../models/IRole";
import { IUser } from "../../models/IUser";
import { memoize } from "../../utils/Utils";
import { AppContext, IAppContext } from "../AppContext";
import { WithMuiTheme } from "../ui/mui/WithMuiTheme";
export interface IAdminUsersTabProps {
  users: IUser[];
  onAddRole?: (user: IUser, role: IRole) => any;
  onDeleteRole?: (user: IUser, role: IRole) => any;
}

export interface IAdminUsersTabState {
  userToPromote: IUser;
  roleToAdd: IRole;
  dialogOpen: boolean;
}

export class AdminUsersTab extends React.Component<
  IAdminUsersTabProps,
  IAdminUsersTabState
> {
  static contextType = AppContext;
  context: IAppContext;

  constructor(props) {
    super(props);

    this.makeHandleToggle = memoize(this.makeHandleToggle);

    this.state = {
      dialogOpen: false,
      userToPromote: null,
      roleToAdd: null
    };
  }

  /**
   * Create an event handler for toggling a permission level on or off.
   * Should be memoized.
   */
  makeHandleToggle = (user: IUser, role: IRole) => {
    const { authenticationService } = this.context.services;
    return () => {
      if (authenticationService.hasRole(user, role)) {
        this.props.onDeleteRole(user, role);
      } else {
        if (authenticationService.isAdminRole(role)) {
          this.setState({
            dialogOpen: true,
            userToPromote: user,
            roleToAdd: role
          });
        } else {
          this.props.onAddRole(user, role);
        }
      }
    };
  };

  /**
   * Event handler for dialog cancellation. Closes the dialog.
   */
  handleDialogCancelClick = () => {
    this.setState({
      dialogOpen: false
    });
  };

  /**
   * Event handler for dialog confirmation.
   */
  handleDialogConfirmClick = async () => {
    await this.props.onAddRole(this.state.userToPromote, this.state.roleToAdd);
    this.setState({
      dialogOpen: false
    });
  };

  /**
   * Event handler for the dialog closing.
   */
  handleDialogExited = () => {
    this.setState({
      userToPromote: null,
      roleToAdd: null
    });
  };

  render() {
    const { authenticationService } = this.context.services;
    const isAdmin = user =>
      authenticationService.hasNamedRole(user, ROLES.admin);
    const isMod = user =>
      authenticationService.hasNamedRole(user, ROLES.moderator);
    const isUser = user => authenticationService.hasNamedRole(user, ROLES.user);
    return (
      <>
        <WithMuiTheme>
          {theme => (
            <div
              style={{
                paddingLeft: theme.spacing.unit,
                paddingRight: theme.spacing.unit
              }}
            >
              <Typography variant="h3" color="secondary">
                Accounts
              </Typography>
              <Typography
                variant="body2"
                color="inherit"
                style={{ marginTop: theme.spacing.unit }}
              >
                Danger Zone - Manage user permissions here.
              </Typography>
            </div>
          )}
        </WithMuiTheme>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Mod</TableCell>
              <TableCell>User</TableCell>
              <TableCell>DeviantArt UUID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.users.map(user => (
              <TableRow key={user.deviantartUuid}>
                <TableCell>
                  <img
                    src={user.iconUrl}
                    style={{ width: "20px", height: "20px" }}
                  />
                  {user.deviantartName}
                </TableCell>
                <TableCell>
                  {/* TODO: Get this stuff going. We want to be able to toggle perms on and off. */}
                  <Switch
                    checked={isAdmin(user)}
                    onChange={this.makeHandleToggle(
                      user,
                      this.context.roles.admin
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={isMod(user)}
                    onChange={this.makeHandleToggle(
                      user,
                      this.context.roles.moderator
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={isUser(user)}
                    onChange={this.makeHandleToggle(
                      user,
                      this.context.roles.user
                    )}
                  />
                </TableCell>
                <TableCell>{user.deviantartUuid}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog
          disableBackdropClick={true}
          disableEscapeKeyDown={true}
          maxWidth="sm"
          open={this.state.dialogOpen}
          onExited={this.handleDialogExited}
        >
          <DialogTitle>
            Make{" "}
            {this.state.userToPromote
              ? this.state.userToPromote.deviantartName
              : "[no user]"}{" "}
            an administrator?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Really make this person an administrator? They will have full
              access to all parts of the system. Use this permission level
              sparingly.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleDialogCancelClick}>
              Cancel
            </Button>
            <Button color="secondary" onClick={this.handleDialogConfirmClick}>
              Promote
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}
