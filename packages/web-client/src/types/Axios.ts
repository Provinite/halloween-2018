import Axios from "axios";
import { ArgumentTypes } from "./ArgumentTypes";

export type InterceptorDefinition = ArgumentTypes<
  typeof Axios.interceptors.response.use
>;
export const noOnFulFilled = <T>(result: T): T => result;
export const noOnError = (err: any): never => {
  throw err;
};
