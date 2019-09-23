import { Button } from "@material-ui/core";
import * as React from "react";
import { ButtonProps } from "@material-ui/core/Button";
import { PartialKeys } from "@clovercoin/constants";
// TODO: make client id & return url env vars
const clientId = process.env.cch2018_da_client_id;
const redirectUri = process.env.cch2018_da_redirect_uri;
console.log("Redirect URI is:" + redirectUri);
const theLink = `https://www.deviantart.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
const makeAnchor = (props: any) => <a href={theLink} {...props} />;
export function LoginLink(
  props: PartialKeys<ButtonProps, "variant" | "color" | "component">
) {
  return (
    <Button
      variant="contained"
      color="secondary"
      component={makeAnchor}
      {...props}
    >
      Log in with DeviantArt
    </Button>
  );
}
