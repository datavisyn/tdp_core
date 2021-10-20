import { Vector2D } from '../2D/Vector2D';
import { Intersection } from '../2D/Intersection';
export var Corner;
(function (Corner) {
    Corner.CORNER = [];
    Corner.CORNER.N = Corner.CORNER[0] = 'n';
    Corner.CORNER.NE = Corner.CORNER[1] = 'ne';
    Corner.CORNER.E = Corner.CORNER[2] = 'e';
    Corner.CORNER.SE = Corner.CORNER[3] = 'se';
    Corner.CORNER.S = Corner.CORNER[4] = 's';
    Corner.CORNER.SW = Corner.CORNER[5] = 'sw';
    Corner.CORNER.W = Corner.CORNER[6] = 'w';
    Corner.CORNER.NW = Corner.CORNER[7] = 'nw';
})(Corner || (Corner = {}));
/**
 * a simple basic shape
 */
export class AShape {
    shift() {
        if (typeof arguments[0] === 'number') {
            this.shiftImpl(arguments[0], arguments[1]);
        }
        else if (Array.isArray(arguments[0])) {
            this.shiftImpl(arguments[0][0], arguments[0][1]);
        }
        else {
            this.shiftImpl(arguments[0].x, arguments[0].y);
        }
        return this;
    }
    /**
     * a specific corner of th axis aligned bounding box
     * @param corner
     * @returns {Vector2D}
     */
    corner(corner) {
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
    intersects(other) {
        return Intersection.intersectShapes(this, other);
    }
}
//# sourceMappingURL=AShape.js.map