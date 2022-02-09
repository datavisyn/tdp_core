import { Vector2D } from '../2D/Vector2D';
import { IIntersectionParam } from '../2D/IIntersectionParam';
import { AShape } from './AShape';
import { Circle } from './Circle';
import { Rect } from './Rect';
export declare class Line extends AShape {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(x1?: number, y1?: number, x2?: number, y2?: number);
    get xy(): Vector2D;
    get x1y1(): Vector2D;
    get x2y2(): Vector2D;
    toString(): string;
    protected shiftImpl(x: number, y: number): void;
    aabb(): Rect;
    get center(): Vector2D;
    bs(): Circle;
    transform(scale: number[], rotate: number): Line;
    asIntersectionParams(): IIntersectionParam;
    static line(x1: number, y1: number, x2: number, y2: number): Line;
}
//# sourceMappingURL=Line.d.ts.map