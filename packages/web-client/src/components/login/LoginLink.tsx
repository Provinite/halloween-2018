import * as React from "react";
const clientId = process.env.cch2018_da_client_id;
export function LoginLink(props) {
  // TODO: make client id & return url env vars
  const theLink = `https://www.deviantart.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=http://localhost:8080/login`;
  return <a href={theLink}>{props.children}</a>;
}
