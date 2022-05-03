import { shuffle } from 'd3v7';
export class QuadtreeUtils {
    static ellipseTester(cx, cy, radiusX, radiusY) {
        const radiusX2 = radiusX * radiusX;
        const radiusY2 = radiusY * radiusY;
        const overlapping = QuadtreeUtils.hasOverlap(cx - radiusX, cy - radiusY, cx + radiusX, cy + radiusY);
        return {
            test: (x, y) => {
                // http://math.stackexchange.com/questions/76457/check-if-a-point-is-within-an-ellipse#76463
                // \frac{(x-h)^2}{r_x^2} + \frac{(y-k)^2}{r_y^2} \leq 1
                // (x-cx)^2/radiusX^2 + (y-cy)^2/(radiusY^2) <= 1
                return ((x - cx) * (x - cx)) / radiusX2 + ((y - cy) * (y - cy)) / radiusY2 <= 1;
            },
            testArea: overlapping,
        };
    }
    /**
     * finds all items using a tester
     * @param tree
     * @param tester
     * @internal
     * @returns {T[]}
     */
    static findByTester(tree, tester) {
        const r = [];
        function testAdder(d) {
            const x1 = tree.x()(d);
            const y1 = tree.y()(d);
            if (tester.test(x1, y1)) {
                r.push(d);
            }
        }
        function findItems(node, x0, y0, x1, y1) {
            const xy00In = tester.test(x0, y0);
            const xy01In = tester.test(x0, y1);
            const xy10In = tester.test(x1, y0);
            const xy11In = tester.test(x1, y1);
            if (xy00In && xy01In && xy10In && xy11In) {
                // all points in radius -> add all
                QuadtreeUtils.forEach(node, (d) => r.push(d));
                return QuadtreeUtils.ABORT_TRAVERSAL;
            }
            if (tester.testArea(x0, y0, x1, y1)) {
                // continue search
                if (QuadtreeUtils.isLeafNode(node)) {
                    QuadtreeUtils.forEachLeaf(node, testAdder);
                }
                return QuadtreeUtils.CONTINUE_TRAVERSAL;
            }
            return QuadtreeUtils.ABORT_TRAVERSAL;
        }
        tree.visit(findItems);
        return r;
    }
    /**
     * execute the callback for each item in the leaf
     * @param node
     * @param callback
     * @internal
     * @returns {number}
     */
    static forEachLeaf(node, callback) {
        if (!node || !QuadtreeUtils.isLeafNode(node)) {
            return 0;
        }
        let i = 0;
        let leaf = node;
        // see https://github.com/d3/d3-quadtree
        do {
            const d = leaf.data;
            i++;
            callback(d);
            leaf = leaf.next;
        } while (leaf != null);
        return i;
    }
    /**
     * for each data item in the subtree execute the callback
     * @param node
     * @param callback
     * @internal
     */
    static forEach(node, callback) {
        if (!node) {
            return;
        }
        if (QuadtreeUtils.isLeafNode(node)) {
            QuadtreeUtils.forEachLeaf(node, callback);
        }
        else {
            // manually visit the children
            const inner = node;
            inner.forEach((i) => QuadtreeUtils.forEach(i, callback));
        }
    }
    /**
     * @internal
     */
    static hasOverlap(ox0, oy0, ox1, oy1) {
        return (x0, y0, x1, y1) => {
            // if the 1er points are small than 0er or 0er bigger than 1er than outside
            if (x1 < ox0 || y1 < oy0 || x0 > ox1 || y0 > oy1) {
                return false;
            }
            // inside or partial overlap
            return true;
        };
    }
    /**
     * returns the data in the sub tree
     * @param node
     * @returns {T[]}
     * @internal
     */
    static getTreeData(node) {
        const r = [];
        QuadtreeUtils.forEach(node, r.push.bind(r));
        return r;
    }
    /**
     * @internal
     */
    static getTreeSize(node) {
        let count = 0;
        QuadtreeUtils.forEach(node, () => count++);
        return count;
    }
    /**
     *
     * @see http://stackoverflow.com/questions/10134237/javascript-random-integer-between-two-numbers
     * @param min
     * @param max
     * @internal
     * @returns {number}
     */
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /**
     * returns the first leaf node in the subtree
     * @param node
     * @internal
     * @returns {any}
     */
    static getFirstLeaf(node) {
        if (QuadtreeUtils.isLeafNode(node)) {
            return node.data;
        }
        // manually visit the children
        const inner = node;
        return inner.reduce((f, act) => (f || !act ? f : QuadtreeUtils.getFirstLeaf(act)), null);
    }
    /**
     * returns a random leaf node in the subtree
     * @param node
     * @internal
     * @returns {any}
     */
    static getRandomLeaf(node) {
        if (QuadtreeUtils.isLeafNode(node)) {
            const sub = QuadtreeUtils.getTreeData(node);
            return sub[QuadtreeUtils.getRandomInt(0, sub.length)];
        }
        // manually visit the children
        // shuffle the sub tree
        const inner = shuffle(node.slice());
        return inner.reduce((f, act) => (f || !act ? f : QuadtreeUtils.getRandomLeaf(act)), null);
    }
    /**
     * checks whether the given node is a leaf node, as described in d3.quadtree docu
     * @param node
     * @internal
     * @returns {boolean}
     */
    static isLeafNode(node) {
        return !node.length;
    }
}
/**
 * @internal
 */
QuadtreeUtils.ABORT_TRAVERSAL = true;
/**
 * @internal
 */
QuadtreeUtils.CONTINUE_TRAVERSAL = false;
//# sourceMappingURL=quadtree.js.map