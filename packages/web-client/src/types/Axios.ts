import Axios from "axios";
import { ArgumentTypes } from "./ArgumentTypes";

export type InterceptorDefinition = ArgumentTypes<
  typeof Axios.interceptors.response.use
>;
export const noOnFulFilled = result => result;
export const noOnError = err => {
  throw err;
};
