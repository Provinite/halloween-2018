declare module "*.json" {
  const value: any;
  export = value;
}

declare module "*.scss" {
  const path: string;
  export = path;
}
