import { Vector2D } from '../2D/Vector2D';
import { IIntersectionParam } from '../2D/IIntersectionParam';
import { AShape } from './AShape';
import { ICircle } from './ICircle';
import { Rect } from './Rect';
export declare class Circle extends AShape implements ICircle {
    x: number;
    y: number;
    radius: number;
    constructor(x?: number, y?: number, radius?: number);
    get xy(): Vector2D;
    toString(): string;
    protected shiftImpl(x: number, y: number): void;
    aabb(): Rect;
    get center(): Vector2D;
    transform(scale: number[], rotate: number): Circle;
    asIntersectionParams(): IIntersectionParam;
    static circle(x: number, y: number, radius: number): Circle;
}
//# sourceMappingURL=Circle.d.ts.map