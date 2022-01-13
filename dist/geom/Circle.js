import { Vector2D } from '../2D/Vector2D';
import { AShape } from './AShape';
import { Rect } from './Rect';
export class Circle extends AShape {
    constructor(x = 0, y = 0, radius = 0) {
        super();
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    get xy() {
        return new Vector2D(this.x, this.y);
    }
    toString() {
        return `Circle(x=${this.x},y=${this.y},radius=${this.radius})`;
    }
    shiftImpl(x, y) {
        this.x += x;
        this.y += y;
    }
    aabb() {
        return new Rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }
    get center() {
        return this.xy;
    }
    transform(scale, rotate) {
        return new Circle(this.x * scale[0], this.y * scale[1], (this.radius * (scale[0] + scale[1])) / 2);
    }
    asIntersectionParams() {
        return {
            name: 'Circle',
            params: [this.xy, this.radius],
        };
    }
    static circle(x, y, radius) {
        return new Circle(x, y, radius);
    }
}
//# sourceMappingURL=Circle.js.map