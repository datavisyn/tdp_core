/* eslint-disable prefer-rest-params */
import { Vector2D } from '../2D/Vector2D';
import { AShape } from './AShape';
import { Circle } from './Circle';
import { Rect } from './Rect';
export class Polygon extends AShape {
    constructor(points = []) {
        super();
        this.points = points;
    }
    push() {
        if (arguments.length === 2 && typeof arguments[0] === 'number') {
            this.points.push(new Vector2D(arguments[0], arguments[1]));
        }
        else {
            this.points.push(...Array.from(arguments));
        }
    }
    toString() {
        return `Polygon(${this.points.join(',')})`;
    }
    shiftImpl(x, y) {
        this.points.forEach((p) => {
            p.x += x;
            p.y += y;
        });
    }
    get length() {
        return this.points.length;
    }
    aabb() {
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        this.points.forEach((p) => {
            if (p.x < minX) {
                minX = p.x;
            }
            if (p.y < minY) {
                minY = p.y;
            }
            if (p.x > maxX) {
                maxX = p.x;
            }
            if (p.y > maxY) {
                maxY = p.y;
            }
        });
        return new Rect(minX, minY, maxX - minX, maxY - minY);
    }
    get center() {
        const c = this.bs();
        return c.xy;
    }
    bs() {
        const { centroid } = this;
        let radius2 = 0;
        this.points.forEach((p) => {
            const dx = p.x - centroid.x;
            const dy = p.y - centroid.x;
            const d = dx * dx + dy * dy;
            if (d > radius2) {
                radius2 = d;
            }
        });
        return new Circle(centroid.x, centroid.y, Math.sqrt(radius2));
    }
    transform(scale, rotate) {
        // TODO rotate
        return new Polygon(this.points.map((p) => new Vector2D(p.x * scale[0], p.y * scale[1])));
    }
    pointInPolygon(point) {
        const { length } = this.points;
        let counter = 0;
        let p1 = this.points[0];
        for (let i = 1; i <= length; i++) {
            const p2 = this.points[i % length];
            if (point.y > Math.min(p1.y, p2.y) && point.y <= Math.max(p1.y, p2.y) && point.x <= Math.max(p1.x, p2.x) && p1.y !== p2.y) {
                const xInter = ((point.y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;
                if (p1.x === p2.x || point.x <= xInter) {
                    counter++;
                }
            }
            p1 = p2;
        }
        return counter % 2 === 1;
    }
    get area() {
        let area = 0;
        const { length } = this.points;
        for (let i = 0; i < length; i++) {
            const h1 = this.points[i];
            const h2 = this.points[(i + 1) % length];
            area += h1.x * h2.y - h2.x * h1.y;
        }
        return area / 2;
    }
    get centroid() {
        const { length } = this.points;
        const area6x = 6 * this.area;
        let xSum = 0;
        let ySum = 0;
        for (let i = 0; i < length; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % length];
            const cross = p1.x * p2.y - p2.x * p1.y;
            xSum += (p1.x + p2.x) * cross;
            ySum += (p1.y + p2.y) * cross;
        }
        return new Vector2D(xSum / area6x, ySum / area6x);
    }
    get isClockwise() {
        return this.area < 0;
    }
    get isCounterClockwise() {
        return this.area > 0;
    }
    get isConcave() {
        let positive = 0;
        let negative = 0;
        const { length } = this.points;
        for (let i = 0; i < length; i++) {
            const p0 = this.points[i];
            const p1 = this.points[(i + 1) % length];
            const p2 = this.points[(i + 2) % length];
            const v0 = Vector2D.fromPoints(p0, p1);
            const v1 = Vector2D.fromPoints(p1, p2);
            const cross = v0.cross(v1);
            if (cross < 0) {
                negative++;
            }
            else {
                positive++;
            }
        }
        return negative !== 0 && positive !== 0;
    }
    get isConvex() {
        return !this.isConcave;
    }
    asIntersectionParams() {
        return {
            name: 'Polygon',
            params: [this.points.slice()],
        };
    }
    static polygon() {
        if (Array.isArray(arguments[0])) {
            return new Polygon(arguments[0]);
        }
        return new Polygon(Array.from(arguments));
    }
}
//# sourceMappingURL=Polygon.js.map