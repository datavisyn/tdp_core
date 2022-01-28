import { Vector2D } from '../2D/Vector2D';
import { IIntersectionParam } from '../2D/IIntersectionParam';
import { AShape } from './AShape';
import { Circle } from './Circle';
import { Rect } from './Rect';
export declare class Ellipse extends AShape {
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;
    constructor(x?: number, y?: number, radiusX?: number, radiusY?: number);
    get xy(): Vector2D;
    toString(): string;
    protected shiftImpl(x: number, y: number): void;
    aabb(): Rect;
    bs(): Circle;
    get center(): Vector2D;
    transform(scale: number[], rotate: number): Ellipse;
    asIntersectionParams(): IIntersectionParam;
    static ellipse(x: number, y: number, radiusX: number, radiusY: number): Ellipse;
}
//# sourceMappingURL=Ellipse.d.ts.map