import { IShape } from './IShape';
import { Polynomial } from './Polynomial';
import { Vector2D } from './Vector2D';
import { Path } from './Path';
export declare class Intersection {
    status: string;
    readonly points: Vector2D[];
    /**
     *  'Outside',
     *  'Inside',
     *  'Tangent'
     *  'Coincident'
     *  'Parallel'
     *  'Intersection'
     *  'No Intersection'
     */
    constructor(status?: string);
    get intersects(): boolean;
    appendPoint(point: Vector2D): void;
    appendPoints(points: Vector2D[]): void;
    get length(): number;
    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: Vector2D, index: number, array: Vector2D[]) => void, thisArg?: any): void;
    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map<U>(callbackfn: (value: Vector2D, index: number, array: Vector2D[]) => U, thisArg?: any): U[];
    static intersectShapes(shape1: IShape, shape2: IShape): any;
    static intersectPathShape(path: Path, shape: IShape): Intersection;
    static intersectBezier2Bezier2(a1: Vector2D, a2: Vector2D, a3: Vector2D, b1: Vector2D, b2: Vector2D, b3: Vector2D): Intersection;
    static intersectBezier2Bezier3(a1: Vector2D, a2: Vector2D, a3: Vector2D, b1: Vector2D, b2: Vector2D, b3: Vector2D, b4: Vector2D): Intersection;
    static intersectBezier2Circle(p1: Vector2D, p2: Vector2D, p3: Vector2D, c: Vector2D, r: number): Intersection;
    static intersectBezier2Ellipse(p1: Vector2D, p2: Vector2D, p3: Vector2D, ec: Vector2D, rx: number, ry: number): Intersection;
    static intersectBezier2Line(p1: Vector2D, p2: Vector2D, p3: Vector2D, a1: Vector2D, a2: Vector2D): Intersection;
    intersectBezier2Polygon(p1: Vector2D, p2: Vector2D, p3: Vector2D, points: Vector2D[]): Intersection;
    static intersectBezier2Rectangle(p1: Vector2D, p2: Vector2D, p3: Vector2D, r1: Vector2D, r2: Vector2D): Intersection;
    static intersectBezier3Bezier3(a1: Vector2D, a2: Vector2D, a3: Vector2D, a4: Vector2D, b1: Vector2D, b2: Vector2D, b3: Vector2D, b4: Vector2D): Intersection;
    static intersectBezier3Circle(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D, c: Vector2D, r: number): Intersection;
    static intersectBezier3Ellipse(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D, ec: Vector2D, rx: number, ry: number): Intersection;
    static intersectBezier3Line(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D, a1: Vector2D, a2: Vector2D): Intersection;
    static intersectBezier3Polygon(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D, points: Vector2D[]): Intersection;
    static intersectBezier3Rectangle(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D, r1: Vector2D, r2: Vector2D): Intersection;
    static intersectCircleCircle(c1: Vector2D, r1: number, c2: Vector2D, r2: number): any;
    static intersectCircleEllipse(cc: Vector2D, r: number, ec: Vector2D, rx: number, ry: number): Intersection;
    static intersectCircleLine(c: Vector2D, r: number, a1: Vector2D, a2: Vector2D): any;
    static intersectCirclePolygon(c: Vector2D, r: number, points: Vector2D[]): Intersection;
    static intersectCircleRectangle(c: Vector2D, r: number, r1: Vector2D, r2: Vector2D): Intersection;
    static intersectEllipseEllipse(c1: Vector2D, rx1: number, ry1: number, c2: Vector2D, rx2: number, ry2: number): Intersection;
    static intersectEllipseLine(c: Vector2D, rx: number, ry: number, a1: Vector2D, a2: Vector2D): any;
    static intersectEllipsePolygon(c: Vector2D, rx: number, ry: number, points: Vector2D[]): Intersection;
    static intersectEllipseRectangle(c: Vector2D, rx: number, ry: number, r1: Vector2D, r2: Vector2D): Intersection;
    static intersectLineLine(a1: Vector2D, a2: Vector2D, b1: Vector2D, b2: Vector2D): any;
    static intersectLinePolygon(a1: Vector2D, a2: Vector2D, points: Vector2D[]): Intersection;
    static intersectLineRectangle(a1: Vector2D, a2: Vector2D, r1: Vector2D, r2: Vector2D): Intersection;
    static intersectPolygonPolygon(points1: Vector2D[], points2: Vector2D[]): Intersection;
    static intersectPolygonRectangle(points: Vector2D[], r1: Vector2D, r2: Vector2D): Intersection;
    static intersectRayRay(a1: Vector2D, a2: Vector2D, b1: Vector2D, b2: Vector2D): any;
    static intersectRectangleRectangle(a1: Vector2D, a2: Vector2D, b1: Vector2D, b2: Vector2D): Intersection;
    static bezout(e1: number[], e2: number[]): Polynomial;
    static intersectShape(path: Path, shape: IShape): Intersection;
}
