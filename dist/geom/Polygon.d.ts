import { Vector2D } from '../2D/Vector2D';
import { IIntersectionParam } from '../2D/IIntersectionParam';
import { AShape } from './AShape';
import { Circle } from './Circle';
import { Rect } from './Rect';
export declare class Polygon extends AShape {
    private points;
    constructor(points?: Vector2D[]);
    push(x: number, y: number): void;
    push(...points: Vector2D[]): void;
    toString(): string;
    protected shiftImpl(x: number, y: number): void;
    get length(): number;
    aabb(): Rect;
    get center(): Vector2D;
    bs(): Circle;
    transform(scale: number[], rotate: number): Polygon;
    pointInPolygon(point: Vector2D): boolean;
    get area(): number;
    get centroid(): Vector2D;
    get isClockwise(): boolean;
    get isCounterClockwise(): boolean;
    get isConcave(): boolean;
    get isConvex(): boolean;
    asIntersectionParams(): IIntersectionParam;
    static polygon(...points: Vector2D[]): Polygon;
    static polygon(points: Vector2D[]): Polygon;
}
