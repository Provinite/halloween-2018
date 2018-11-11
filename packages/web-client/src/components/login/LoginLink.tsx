import { Button } from "@material-ui/core";
import * as React from "react";
import { Link } from "react-router-dom";
// TODO: make client id & return url env vars
const clientId = process.env.cch2018_da_client_id;
const theLink = `https://www.deviantart.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=http://localhost:8080/login`;
const makeAnchor = props => <a href={theLink} {...props} />;
export function LoginLink(props) {
  return (
    <Button
      variant="contained"
      color="secondary"
      component={makeAnchor}
      {...props}
    >
      Log right the fuck on in.
    </Button>
  );
}
