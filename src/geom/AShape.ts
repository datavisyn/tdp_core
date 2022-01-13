/* eslint-disable prefer-rest-params */
import { IShape } from '../2D/IShape';
import { IRect } from './IRect';
import { Vector2D } from '../2D/Vector2D';
import { Intersection } from '../2D/Intersection';
import { IIntersectionParam } from '../2D/IIntersectionParam';

export namespace Corner {
  export const CORNER: any = <any>[];
  CORNER.N = CORNER[0] = 'n';
  CORNER.NE = CORNER[1] = 'ne';
  CORNER.E = CORNER[2] = 'e';
  CORNER.SE = CORNER[3] = 'se';
  CORNER.S = CORNER[4] = 's';
  CORNER.SW = CORNER[5] = 'sw';
  CORNER.W = CORNER[6] = 'w';
  CORNER.NW = CORNER[7] = 'nw';
}

/**
 * a simple basic shape
 */
export abstract class AShape implements IShape {
  /**
   * shift the shape by the given amount
   * @param x
   * @param y
   */
  shift(x: number, y: number): AShape;
  shift(xy: { x: number; y: number }): AShape;
  shift(xy: [number, number]): AShape;
  shift() {
    if (typeof arguments[0] === 'number') {
      this.shiftImpl(arguments[0], arguments[1]);
    } else if (Array.isArray(arguments[0])) {
      this.shiftImpl(arguments[0][0], arguments[0][1]);
    } else {
      this.shiftImpl(arguments[0].x, arguments[0].y);
    }
    return this;
  }

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
  corner(corner: string): Vector2D {
    const r = this.aabb();
    switch (corner) {
      case Corner.CORNER.N:
        return Vector2D.vec(r.cx, r.y);
      case Corner.CORNER.S:
        return Vector2D.vec(r.cx, r.y2);
      case Corner.CORNER.W:
        return Vector2D.vec(r.x, r.cy);
      case Corner.CORNER.E:
        return Vector2D.vec(r.x2, r.cy);
      case Corner.CORNER.NE:
        return Vector2D.vec(r.x2, r.y);
      case Corner.CORNER.NW:
        return r.xy;
      case Corner.CORNER.SE:
        return Vector2D.vec(r.x2, r.y2);
      case Corner.CORNER.SW:
        return Vector2D.vec(r.x, r.y2);
    }
    return this.center;
  }

  protected abstract shiftImpl(x: number, y: number): void;

  abstract asIntersectionParams(): IIntersectionParam;

  intersects(other: AShape) {
    return Intersection.intersectShapes(this, other);
  }
}
