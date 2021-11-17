import { Vector2D } from '../2D/Vector2D';
import { AShape } from './AShape';
import { Circle } from './Circle';
import { Rect } from './Rect';
export class Line extends AShape {
    constructor(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
        super();
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    get xy() {
        return new Vector2D(this.x1, this.y1);
    }
    get x1y1() {
        return this.xy;
    }
    get x2y2() {
        return new Vector2D(this.x2, this.y2);
    }
    toString() {
        return `Line(x1=${this.x1},y1=${this.y1},x2=${this.x2},y2=${this.y2})`;
    }
    shiftImpl(x, y) {
        this.x1 += x;
        this.y1 += y;
        this.x2 += x;
        this.y2 += y;
    }
    aabb() {
        return new Rect(Math.min(this.x1, this.x2), Math.min(this.y1, this.y2), Math.abs(this.x1 - this.x2), Math.abs(this.y1 - this.y2));
    }
    get center() {
        const c = this.bs();
        return c.xy;
    }
    bs() {
        const x = 0.5 * (this.x1 + this.x2);
        const y = 0.5 * (this.y1 + this.y2);
        const dx = (this.x1 - this.x2);
        const dy = (this.y1 - this.y2);
        return new Circle(x, y, Math.sqrt(dx * dx + dy * dy) / 2);
    }
    transform(scale, rotate) {
        //TODO rotate
        return new Line(this.x1 * scale[0], this.y1 * scale[1], this.x2 * scale[0], this.y2 * scale[1]);
    }
    asIntersectionParams() {
        return {
            name: 'Line',
            params: [this.xy, this.x2y2]
        };
    }
    static line(x1, y1, x2, y2) {
        return new Line(x1, y1, x2, y2);
    }
}
//# sourceMappingURL=Line.js.map