import { Quadtree, QuadtreeInternalNode, QuadtreeLeaf } from 'd3v4';
import { shuffle } from 'd3v4';

export interface IBoundsPredicate {
  (x0: number, y0: number, x1: number, y1: number): boolean;
}

export interface ITester {
  test(x: number, y: number): boolean;
  testArea: IBoundsPredicate;
}

export class QuadtreeUtils {
  /**
   * @internal
   */
  public static readonly ABORT_TRAVERSAL = true;

  /**
   * @internal
   */
  public static readonly CONTINUE_TRAVERSAL = false;

  static ellipseTester(cx: number, cy: number, radiusX: number, radiusY: number): ITester {
    const radiusX2 = radiusX * radiusX;
    const radiusY2 = radiusY * radiusY;
    const overlapping = QuadtreeUtils.hasOverlap(cx - radiusX, cy - radiusY, cx + radiusX, cy + radiusY);
    return {
      test: (x: number, y: number) => {
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
  static findByTester<T>(tree: Quadtree<T>, tester: ITester): T[] {
    const r: T[] = [];

    function testAdder(d: T) {
      const x1 = tree.x()(d);
      const y1 = tree.y()(d);
      if (tester.test(x1, y1)) {
        r.push(d);
      }
    }

    function findItems(node: QuadtreeInternalNode<T> | QuadtreeLeaf<T>, x0: number, y0: number, x1: number, y1: number) {
      const xy00In = tester.test(x0, y0);
      const xy01In = tester.test(x0, y1);
      const xy10In = tester.test(x1, y0);
      const xy11In = tester.test(x1, y1);

      if (xy00In && xy01In && xy10In && xy11In) {
        // all points in radius -> add all
        QuadtreeUtils.forEach(node, (d) => r.push(<T>d));
        return QuadtreeUtils.ABORT_TRAVERSAL;
      }

      if (tester.testArea(x0, y0, x1, y1)) {
        // continue search
        if (QuadtreeUtils.isLeafNode(node)) {
          QuadtreeUtils.forEachLeaf(<QuadtreeLeaf<T>>node, testAdder);
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
  static forEachLeaf<T>(node: QuadtreeLeaf<T>, callback: (d: T) => void) {
    if (!node || !QuadtreeUtils.isLeafNode(node)) {
      return 0;
    }

    let i = 0;
    let leaf: QuadtreeLeaf<T> | undefined = node;
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
  static forEach<T>(node: QuadtreeInternalNode<T> | QuadtreeLeaf<T> | undefined, callback: (d: T) => void) {
    if (!node) {
      return;
    }
    if (QuadtreeUtils.isLeafNode(node)) {
      QuadtreeUtils.forEachLeaf(<QuadtreeLeaf<T>>node, callback);
    } else {
      // manually visit the children
      const inner = <QuadtreeInternalNode<T>>node;
      inner.forEach((i) => QuadtreeUtils.forEach(i, callback));
    }
  }

  /**
   * @internal
   */
  static hasOverlap(ox0: number, oy0: number, ox1: number, oy1: number): IBoundsPredicate {
    return (x0: number, y0: number, x1: number, y1: number) => {
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
  static getTreeData<T>(node: QuadtreeInternalNode<T> | QuadtreeLeaf<T>): T[] {
    const r: T[] = [];
    QuadtreeUtils.forEach(node, r.push.bind(r));
    return r;
  }

  /**
   * @internal
   */
  static getTreeSize(node: QuadtreeInternalNode<any> | QuadtreeLeaf<any>) {
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
  private static getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * returns the first leaf node in the subtree
   * @param node
   * @internal
   * @returns {any}
   */
  static getFirstLeaf<T>(node: QuadtreeInternalNode<T> | QuadtreeLeaf<T>): T {
    if (QuadtreeUtils.isLeafNode(node)) {
      return (<QuadtreeLeaf<T>>node).data;
    }
    // manually visit the children
    const inner = <QuadtreeInternalNode<T>>node;
    return <T>inner.reduce((f, act) => (f || !act ? f : QuadtreeUtils.getFirstLeaf(act!)), <T | null>null);
  }

  /**
   * returns a random leaf node in the subtree
   * @param node
   * @internal
   * @returns {any}
   */
  static getRandomLeaf<T>(node: QuadtreeInternalNode<T> | QuadtreeLeaf<T>): T {
    if (QuadtreeUtils.isLeafNode(node)) {
      const sub = QuadtreeUtils.getTreeData(node);
      return <T>sub[QuadtreeUtils.getRandomInt(0, sub.length)];
    }
    // manually visit the children
    // shuffle the sub tree
    const inner = shuffle((<QuadtreeInternalNode<T>>node).slice());

    return <T>inner.reduce((f, act) => (f || !act ? f : QuadtreeUtils.getRandomLeaf(act)), <T | null>null);
  }

  /**
   * checks whether the given node is a leaf node, as described in d3.quadtree docu
   * @param node
   * @internal
   * @returns {boolean}
   */
  static isLeafNode(node: QuadtreeInternalNode<any> | QuadtreeLeaf<any>) {
    return !(<any>node).length;
  }
}
