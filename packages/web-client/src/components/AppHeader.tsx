import { AppBar, Toolbar, Typography } from "@material-ui/core";
import * as React from "react";

/**
 * Functional component presenting the shared top bar for the app.
 */
export const AppHeader = () => (
  <AppBar position="static" color="primary">
    <Toolbar>
      <Typography variant="h6" color="inherit">
        Pillowing Pile
      </Typography>
    </Toolbar>
  </AppBar>
);
