import { TextField, Button } from "@material-ui/core";
import * as React from "react";
import {
  ChangeEvent,
  FormEventHandler,
  FunctionComponent,
  useCallback,
  useContext,
  useState
} from "react";
import { AppContext } from "../AppContext";
import { LoginLink } from "../login/LoginLink";
import { FormSectionHeading } from "../ui/FormSectionHeading";
import { PageCard } from "../ui/PageCard";
import { PageTitle } from "../ui/PageTitle";

export const LoginPage: FunctionComponent = props => {
  const ctx = useContext(AppContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleUsernameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
    },
    [setUsername]
  );
  const handlePasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    [setPassword]
  );
  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();
      const { authenticationService } = ctx.services;
      try {
        console.log(username);
        console.log(password);
        await authenticationService.loginWithLocalCredentials(
          username,
          password
        );
      } catch (e) {
        ctx.onApiError(e);
      }
    },
    [username, password, ctx.onApiError, ctx.services.authenticationService]
  );
  return (
    <PageCard open={true}>
      <PageTitle>Log In</PageTitle>
      <form onSubmit={handleSubmit}>
        <FormSectionHeading>
          Login in with a Username &amp; Password
        </FormSectionHeading>
        <TextField
          label="Username"
          value={username}
          onChange={handleUsernameChange}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
        />
        <Button type="submit" variant="contained" size="medium">
          Submit
        </Button>
      </form>
      <FormSectionHeading>Or</FormSectionHeading>
      <LoginLink>Log In</LoginLink>
    </PageCard>
  );
};
