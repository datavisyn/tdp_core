export class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    add(that) {
        return new Vector2D(this.x + that.x, this.y + that.y);
    }
    addEquals(that) {
        this.x += that.x;
        this.y += that.y;
        return this;
    }
    scalarAdd(scalar) {
        return new Vector2D(this.x + scalar, this.y + scalar);
    }
    scalarAddEquals(scalar) {
        this.x += scalar;
        this.y += scalar;
        return this;
    }
    subtract(that) {
        return new Vector2D(this.x - that.x, this.y - that.y);
    }
    subtractEquals(that) {
        this.x -= that.x;
        this.y -= that.y;
        return this;
    }
    scalarSubtract(scalar) {
        return new Vector2D(this.x - scalar, this.y - scalar);
    }
    scalarSubtractEquals(scalar) {
        this.x -= scalar;
        this.y -= scalar;
        return this;
    }
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
    multiplyEquals(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    divide(scalar) {
        return new Vector2D(this.x / scalar, this.y / scalar);
    }
    divideEquals(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }
    eq(that) {
        return this.x === that.x && this.y === that.y;
    }
    lt(that) {
        return this.x < that.x && this.y < that.y;
    }
    lte(that) {
        return this.x <= that.x && this.y <= that.y;
    }
    gt(that) {
        return this.x > that.x && this.y > that.y;
    }
    gte(that) {
        return this.x >= that.x && this.y >= that.y;
    }
    lerp(that, t) {
        return new Vector2D(this.x + (that.x - this.x) * t, this.y + (that.y - this.y) * t);
    }
    distanceFrom(that) {
        const dx = this.x - that.x;
        const dy = this.y - that.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    min(that) {
        return new Vector2D(Math.min(this.x, that.x), Math.min(this.y, that.y));
    }
    max(that) {
        return new Vector2D(Math.max(this.x, that.x), Math.max(this.y, that.y));
    }
    toString() {
        return `${this.x},${this.y}`;
    }
    setXY(x, y) {
        this.x = x;
        this.y = y;
    }
    setFromPoint(that) {
        this.x = that.x;
        this.y = that.y;
    }
    swap(that) {
        const { x } = this;
        const { y } = this;
        this.x = that.x;
        this.y = that.y;
        that.x = x;
        that.y = y;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    dot(that) {
        return this.x * that.x + this.y * that.y;
    }
    cross(that) {
        return this.x * that.y - this.y * that.x;
    }
    unit() {
        return this.divide(this.length());
    }
    unitEquals() {
        this.divideEquals(this.length());
        return this;
    }
    perp() {
        return new Vector2D(-this.y, this.x);
    }
    static fromPoints(p1, p2) {
        return new Vector2D(p2.x - p1.x, p2.y - p1.y);
    }
    static vec(x, y = Number.NaN) {
        if (typeof x === 'number') {
            return new Vector2D(x, y);
        }
        return new Vector2D(x.x, x.y);
    }
    static vec2(x, y) {
        return new Vector2D(x, y);
    }
}
//# sourceMappingURL=Vector2D.js.map