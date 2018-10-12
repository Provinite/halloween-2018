import * as React from "react";
export function LoginLink(props) {
  // TODO: make client id & return url env vars
  const theLink =
    "https://www.deviantart.com/oauth2/authorize?response_type=code&client_id=3739&redirect_uri=http://localhost:8080/login";
  return <a href={theLink}>{props.children}</a>;
}
