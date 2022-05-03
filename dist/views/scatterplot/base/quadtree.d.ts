import { Quadtree, QuadtreeInternalNode, QuadtreeLeaf } from 'd3-quadtree';
export interface IBoundsPredicate {
    (x0: number, y0: number, x1: number, y1: number): boolean;
}
export interface ITester {
    test(x: number, y: number): boolean;
    testArea: IBoundsPredicate;
}
export declare class QuadtreeUtils {
    /**
     * @internal
     */
    static readonly ABORT_TRAVERSAL = true;
    /**
     * @internal
     */
    static readonly CONTINUE_TRAVERSAL = false;
    static ellipseTester(cx: number, cy: number, radiusX: number, radiusY: number): ITester;
    /**
     * finds all items using a tester
     * @param tree
     * @param tester
     * @internal
     * @returns {T[]}
     */
    static findByTester<T>(tree: Quadtree<T>, tester: ITester): T[];
    /**
     * execute the callback for each item in the leaf
     * @param node
     * @param callback
     * @internal
     * @returns {number}
     */
    static forEachLeaf<T>(node: QuadtreeLeaf<T>, callback: (d: T) => void): number;
    /**
     * for each data item in the subtree execute the callback
     * @param node
     * @param callback
     * @internal
     */
    static forEach<T>(node: QuadtreeInternalNode<T> | QuadtreeLeaf<T> | undefined, callback: (d: T) => void): void;
    /**
     * @internal
     */
    static hasOverlap(ox0: number, oy0: number, ox1: number, oy1: number): IBoundsPredicate;
    /**
     * returns the data in the sub tree
     * @param node
     * @returns {T[]}
     * @internal
     */
    static getTreeData<T>(node: QuadtreeInternalNode<T> | QuadtreeLeaf<T>): T[];
    /**
     * @internal
     */
    static getTreeSize(node: QuadtreeInternalNode<any> | QuadtreeLeaf<any>): number;
    /**
     *
     * @see http://stackoverflow.com/questions/10134237/javascript-random-integer-between-two-numbers
     * @param min
     * @param max
     * @internal
     * @returns {number}
     */
    private static getRandomInt;
    /**
     * returns the first leaf node in the subtree
     * @param node
     * @internal
     * @returns {any}
     */
    static getFirstLeaf<T>(node: QuadtreeInternalNode<T> | QuadtreeLeaf<T>): T;
    /**
     * returns a random leaf node in the subtree
     * @param node
     * @internal
     * @returns {any}
     */
    static getRandomLeaf<T>(node: QuadtreeInternalNode<T> | QuadtreeLeaf<T>): T;
    /**
     * checks whether the given node is a leaf node, as described in d3.quadtree docu
     * @param node
     * @internal
     * @returns {boolean}
     */
    static isLeafNode(node: QuadtreeInternalNode<any> | QuadtreeLeaf<any>): boolean;
}
//# sourceMappingURL=quadtree.d.ts.map