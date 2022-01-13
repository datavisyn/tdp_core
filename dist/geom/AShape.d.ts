import { IShape } from '../2D/IShape';
import { IRect } from './IRect';
import { Vector2D } from '../2D/Vector2D';
import { IIntersectionParam } from '../2D/IIntersectionParam';
export declare namespace Corner {
    const CORNER: any;
}
/**
 * a simple basic shape
 */
export declare abstract class AShape implements IShape {
    /**
     * shift the shape by the given amount
     * @param x
     * @param y
     */
    shift(x: number, y: number): AShape;
    shift(xy: {
        x: number;
        y: number;
    }): AShape;
    shift(xy: [number, number]): AShape;
    /**
     * center of this shape
     * @returns {Vector2D}
     */
    abstract get center(): Vector2D;
    /**
     * axis aligned bounding box (ro)
     */
    abstract aabb(): IRect;
    /**
     * a specific corner of th axis aligned bounding box
     * @param corner
     * @returns {Vector2D}
     */
    corner(corner: string): Vector2D;
    protected abstract shiftImpl(x: number, y: number): void;
    abstract asIntersectionParams(): IIntersectionParam;
    intersects(other: AShape): any;
}
