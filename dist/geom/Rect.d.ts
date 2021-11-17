import { Vector2D } from '../2D/Vector2D';
import { IIntersectionParam } from '../2D/IIntersectionParam';
import { IRect } from './IRect';
import { AShape } from './AShape';
/**
 * a simple bounding rect
 */
export declare class Rect extends AShape implements IRect {
    x: number;
    y: number;
    w: number;
    h: number;
    constructor(x?: number, y?: number, w?: number, h?: number);
    eq(that: Rect): boolean;
    toString(): string;
    get xy(): Vector2D;
    get x2y2(): Vector2D;
    get size(): Vector2D;
    get cx(): number;
    get cy(): number;
    set cx(val: number);
    set cy(val: number);
    get x2(): number;
    get y2(): number;
    set x2(val: number);
    set y2(val: number);
    protected shiftImpl(x: number, y: number): void;
    aabb(): Rect;
    get center(): Vector2D;
    transform(scale: number[], rotate: number): Rect;
    asIntersectionParams(): IIntersectionParam;
    static rect(x: number, y: number, w: number, h: number): Rect;
}
