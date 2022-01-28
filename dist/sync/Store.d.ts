import { EventHandler } from '../base/event';
export interface IChangedHandler {
    (newValue: any, oldValue: any, url: string): any;
}
export declare class Store extends EventHandler {
    private storage;
    private prefix;
    static EVENT_CHANGED: string;
    constructor(storage: Storage, prefix: string);
    private toFullKey;
    setValue(key: string, value: any): string;
    deleteValue(key: string): void;
    includes(key: string): boolean;
    getValue<T>(key: string, defaultValue?: T): T;
    parse(v: string): any;
    stringify(v: any): string;
}
//# sourceMappingURL=Store.d.ts.map