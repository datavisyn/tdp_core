export interface ISecureItem {
    /**
     * creator / owner of the item
     */
    readonly creator: string;
    /**
     * group he is sharing this item
     */
    readonly group?: string;
    /**
     * detailed permissions, by default 744
     */
    readonly permissions?: number;
    /**
     * group of users with special rights, once buddies which e.g. should have write access, too
     */
    readonly buddies?: string[];
}
//# sourceMappingURL=ISecureItem.d.ts.map