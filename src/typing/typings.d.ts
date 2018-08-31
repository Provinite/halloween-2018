declare module "*.env.json" {
    const value: {
        version: string,
        env: string
    };
    export = value;
}