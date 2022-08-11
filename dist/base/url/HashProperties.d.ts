import { PropertyHandler } from './PropertyHandler';
/**
 * manages the hash location property helper
 */
export declare class HashProperties extends PropertyHandler {
    static readonly EVENT_STATE_PUSHED = "pushedState";
    static readonly EVENT_HASH_CHANGED = "hashChanged";
    private updated;
    private debounceTimer;
    constructor();
    setInt(name: string, value: number, update?: boolean | number): void;
    setProp(name: string, value: string, update?: boolean | number): void;
    removeProp(name: string, update?: boolean | number): boolean;
    private toObject;
    private update;
    private updateImpl;
}
//# sourceMappingURL=HashProperties.d.ts.map