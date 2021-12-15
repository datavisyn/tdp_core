import { AShape } from './AShape';
import { Rect } from './Rect';
import { Circle } from './Circle';
import { Ellipse } from './Ellipse';
import { Line } from './Line';
import { Polygon } from './Polygon';
export class ShapeUtils {
    static wrapToShape(obj) {
        if (!obj) {
            return obj;
        }
        if (obj instanceof AShape) {
            return obj;
        }
        if (obj.hasOwnProperty('x') && obj.hasOwnProperty('y')) {
            if (obj.hasOwnProperty('radius') || obj.hasOwnProperty('r')) {
                return Circle.circle(obj.x, obj.y, obj.hasOwnProperty('radius') ? obj.radius : obj.r);
            }
            if ((obj.hasOwnProperty('radiusX') || obj.hasOwnProperty('rx')) && (obj.hasOwnProperty('radiusY') || obj.hasOwnProperty('ry'))) {
                return Ellipse.ellipse(obj.x, obj.y, obj.hasOwnProperty('radiusX') ? obj.radiusX : obj.rx, obj.hasOwnProperty('radiusY') ? obj.radiusY : obj.ry);
            }
            if (obj.hasOwnProperty('w') && obj.hasOwnProperty('h')) {
                return Rect.rect(obj.x, obj.y, obj.w, obj.h);
            }
            if (obj.hasOwnProperty('width') && obj.hasOwnProperty('height')) {
                return Rect.rect(obj.x, obj.y, obj.width, obj.height);
            }
        }
        if (obj.hasOwnProperty('x1') && obj.hasOwnProperty('y1') && obj.hasOwnProperty('x2') && obj.hasOwnProperty('y2')) {
            return Line.line(obj.x1, obj.y1, obj.x2, obj.y2);
        }
        if (Array.isArray(obj) && obj.length > 0 && obj[0].hasOwnProperty('x') && obj[0].hasOwnProperty('y')) {
            return Polygon.polygon(obj);
        }
        // TODO throw error?
        return obj; //can't derive it, yet
    }
}
//# sourceMappingURL=ShapeUtils.js.map