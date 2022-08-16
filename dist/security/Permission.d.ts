export declare enum EPermission {
    READ = 4,
    WRITE = 2,
    EXECUTE = 1
}
export declare enum EEntity {
    USER = 0,
    GROUP = 1,
    OTHERS = 2,
    BUDDIES = 3
}
export declare class Permission {
    readonly user: Set<EPermission>;
    readonly group: Set<EPermission>;
    readonly others: Set<EPermission>;
    readonly buddies: Set<EPermission>;
    /**
     * by default only the creator has all permissions
     * @type {number}
     */
    static ALL_READ_READ: number;
    static ALL_NONE_NONE: number;
    static ALL_READ_NONE: number;
    static DEFAULT_PERMISSION: number;
    /**
     * buddy variants: buddy, creator, group, others
     * buddies first for backward compatibility
     */
    static ALL_ALL_READ_READ: number;
    static ALL_ALL_NONE_NONE: number;
    static ALL_ALL_READ_NONE: number;
    constructor(user: Set<EPermission>, group: Set<EPermission>, others: Set<EPermission>, buddies?: Set<EPermission>);
    encode(): number;
    toString(): string;
    clone(): Permission;
    getPermissions(entity: EEntity): Set<EPermission>;
    hasPermission(entity: EEntity, permission: EPermission): boolean;
    static toNumber(p: Set<EPermission>): number;
    static toString(p: Set<EPermission>): string;
    static fromNumber(p: number): Set<EPermission>;
    static encode(user: Set<EPermission>, group: Set<EPermission>, others: Set<EPermission>, buddies?: Set<EPermission>): number;
    static decode(permission?: number): Permission;
}
//# sourceMappingURL=Permission.d.ts.map