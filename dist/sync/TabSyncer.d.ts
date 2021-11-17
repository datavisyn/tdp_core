import { Store } from './Store';
export interface ITabSyncerOptions {
    keyPrefix?: string;
    storage?: Storage;
}
export interface ISyncerExtension {
    (store: Store): any;
}
export declare class TabSyncer {
    static SYNCER_EXTENSION_POINT: string;
    private static TAB_LIST;
    private options;
    private store;
    constructor(options?: ITabSyncerOptions);
    push(syncer: ISyncerExtension): void;
    private registerTab;
    private static handleChange;
    private unregisterTab;
    getTabList(): string[];
}
