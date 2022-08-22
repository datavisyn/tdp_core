import { PropertyHandler } from './PropertyHandler';
export declare abstract class CommonPropertyHandler extends PropertyHandler {
    static readonly EVENT_STATE_PUSHED = "pushedState";
    static readonly EVENT_HASH_CHANGED = "hashChanged";
    private debounceTimer;
    protected updated: () => void;
    protected init(): void;
    /**
     * Remove event listener, ...
     */
    destroy(): void;
    abstract get propertySource(): string;
    abstract get propertySymbol(): string;
    toURLString(): string;
    setInt(name: string, value: number, update?: boolean | number): void;
    setProp(name: string, value: string, update?: boolean | number): void;
    removeProp(name: string, update?: boolean | number): boolean;
    protected toObject(): any;
    private update;
    private clearDebounceTimer;
    protected abstract updateImpl(): void;
    protected isSameHistoryState(): boolean;
}
//# sourceMappingURL=CommonPropertyHandler.d.ts.map