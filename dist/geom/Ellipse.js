import { Vector2D } from '../2D/Vector2D';
import { AShape } from './AShape';
import { Circle } from './Circle';
import { Rect } from './Rect';
export class Ellipse extends AShape {
    constructor(x = 0, y = 0, radiusX = 0, radiusY = 0) {
        super();
        this.x = x;
        this.y = y;
        this.radiusX = radiusX;
        this.radiusY = radiusY;
    }
    get xy() {
        return new Vector2D(this.x, this.y);
    }
    toString() {
        return `Ellipse(x=${this.x},y=${this.y},radiusX=${this.radiusX},radiusY=${this.radiusY})`;
    }
    shiftImpl(x, y) {
        this.x += x;
        this.y += y;
    }
    aabb() {
        return new Rect(this.x - this.radiusX, this.y - this.radiusY, this.radiusX * 2, this.radiusY * 2);
    }
    bs() {
        return new Circle(this.x, this.y, Math.max(this.radiusX, this.radiusY));
    }
    get center() {
        const c = this.bs();
        return c.xy;
    }
    transform(scale, rotate) {
        // TODO rotate
        return new Ellipse(this.x * scale[0], this.y * scale[1], this.radiusX * scale[0], this.radiusY * scale[1]);
    }
    asIntersectionParams() {
        return {
            name: 'Ellipse',
            params: [this.xy, this.radiusX, this.radiusY],
        };
    }
    static ellipse(x, y, radiusX, radiusY) {
        return new Ellipse(x, y, radiusX, radiusY);
    }
}
//# sourceMappingURL=Ellipse.js.map