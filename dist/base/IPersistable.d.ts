export interface IPersistable {
    /**
     * persist the current configuration and return
     */
    persist(): any;
    /**
     * restores from stored persisted state
     * @param persisted a result of a previous persist call
     * @return the restored view or null if it could be in place restored
     */
    restore(persisted: any): IPersistable | Promise<IPersistable>;
}
//# sourceMappingURL=IPersistable.d.ts.map