/**
 * additional data about a performed action
 */
export declare class ActionMetaData {
    readonly category: string;
    readonly operation: string;
    readonly name: string;
    readonly timestamp: number;
    readonly user: string;
    constructor(category: string, operation: string, name: string, timestamp?: number, user?: string);
    static restore(p: any): ActionMetaData;
    eq(that: ActionMetaData): boolean;
    /**
     * checks whether this metadata are the inverse of the given one in terms of category and operation
     * @param that
     * @returns {boolean}
     */
    inv(that: ActionMetaData): boolean;
    toString(): string;
    static actionMeta(name: string, category?: string, operation?: string, timestamp?: number, user?: string): ActionMetaData;
}
//# sourceMappingURL=ActionMeta.d.ts.map