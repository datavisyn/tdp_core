/**
 * utility class for handling a bunch of reuseable ids
 */
export declare class IdPool {
    private counter;
    private free;
    /**
     * check out a new id
     * @return {*}
     */
    checkOut(): number;
    /**
     * returns an id again
     * @param id
     */
    checkIn(id: number): void;
    /**
     * whether the given id is used
     * @param id
     * @return {boolean}
     */
    isCheckedOut(id: number): boolean;
    /**
     * return the number of checked out ids
     * @return {number}
     */
    get size(): number;
}
//# sourceMappingURL=IdPool.d.ts.map