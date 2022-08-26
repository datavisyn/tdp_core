import { CommonPropertyHandler } from './CommonPropertyHandler';
/**
 * manages the hash location property helper
 */
export declare class HashPropertyHandler extends CommonPropertyHandler {
    constructor();
    get propertySource(): string;
    get propertySymbol(): string;
    toURLString(): string;
    protected updateImpl(): void;
    destroy(): void;
}
//# sourceMappingURL=HashPropertyHandler.d.ts.map