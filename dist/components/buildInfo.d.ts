interface IBuildInfo {
    name: string;
    version: string;
    resolved: string;
}
interface IServerBuildInfo extends IBuildInfo {
    dependencies: string[];
    plugins: IBuildInfo[];
}
interface IClientBuildInfo extends IBuildInfo {
    dependencies: any;
    extraDependencies: any;
}
export declare class BuildInfo {
    private client;
    private server?;
    constructor(client: IClientBuildInfo, server?: IServerBuildInfo);
    toString(): string;
    private buildBuildInfo;
    private buildIssuesContent;
    toHTML(): string;
    static build(): Promise<BuildInfo>;
}
export {};
//# sourceMappingURL=buildInfo.d.ts.map