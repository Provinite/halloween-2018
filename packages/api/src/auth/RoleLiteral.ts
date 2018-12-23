import { ROLES } from "@clovercoin/constants";

export type RoleLiteral = keyof typeof ROLES | "public";
