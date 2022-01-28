export interface IAppMetaData {
    name: string;
    displayName?: string;
    version: string;
    repository: string;
    description: string;
    homepage: string;
    screenshot?: string;
}
export declare class AppMetaDataUtils {
    static getMetaData(): Promise<IAppMetaData>;
}
//# sourceMappingURL=metaData.d.ts.map