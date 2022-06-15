export declare class UniqueIdManager {
    /**
     * unique id container
     * @type {{}}
     */
    private idCounter;
    /**
     * returns a unique id for the given domain
     * @param domain
     * @return {number}
     */
    uniqueId(domain?: string): number;
    flagId(domain: string, id: number): number;
    /**
     * returns a string, which is a unique id for the given domain
     * @param domain
     * @return {string}
     */
    uniqueString(domain?: string): string;
    private static instance;
    static getInstance(): UniqueIdManager;
}
//# sourceMappingURL=UniqueIdManager.d.ts.map