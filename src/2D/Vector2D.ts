export class Vector2D {
  constructor(public x = 0, public y = 0) {

  }

  add(that: Vector2D) {
    return new Vector2D(this.x + that.x, this.y + that.y);
  }

  addEquals(that: Vector2D) {
    this.x += that.x;
    this.y += that.y;
    return this;
  }

  scalarAdd(scalar: number) {
    return new Vector2D(this.x + scalar, this.y + scalar);
  }

  scalarAddEquals(scalar: number) {
    this.x += scalar;
    this.y += scalar;
    return this;
  }

  subtract(that: Vector2D) {
    return new Vector2D(this.x - that.x, this.y - that.y);
  }

  subtractEquals(that: Vector2D) {
    this.x -= that.x;
    this.y -= that.y;
    return this;
  }

  scalarSubtract(scalar: number) {
    return new Vector2D(this.x - scalar, this.y - scalar);
  }

  scalarSubtractEquals(scalar: number) {
    this.x -= scalar;
    this.y -= scalar;
    return this;
  }

  multiply(scalar: number) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  multiplyEquals(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar: number) {
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  divideEquals(scalar: number) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  eq(that: Vector2D) {
    return (this.x === that.x && this.y === that.y);
  }

  lt(that: Vector2D) {
    return (this.x < that.x && this.y < that.y);
  }

  lte(that: Vector2D) {
    return (this.x <= that.x && this.y <= that.y);
  }

  gt(that: Vector2D) {
    return (this.x > that.x && this.y > that.y);
  }

  gte(that: Vector2D) {
    return (this.x >= that.x && this.y >= that.y);
  }

  lerp(that: Vector2D, t: number) {
    return new Vector2D(this.x + (that.x - this.x) * t, this.y + (that.y - this.y) * t);
  }

  distanceFrom(that: Vector2D) {
    const dx = this.x - that.x;
    const dy = this.y - that.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  min(that: Vector2D) {
    return new Vector2D(Math.min(this.x, that.x), Math.min(this.y, that.y));
  }

  max(that: Vector2D) {
    return new Vector2D(Math.max(this.x, that.x), Math.max(this.y, that.y));
  }

  toString() {
    return this.x + ',' + this.y;
  }

  setXY(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setFromPoint(that: Vector2D) {
    this.x = that.x;
    this.y = that.y;
  }

  swap(that: Vector2D) {
    const x = this.x;
    const y = this.y;
    this.x = that.x;
    this.y = that.y;
    that.x = x;
    that.y = y;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  dot(that: Vector2D) {
    return this.x * that.x + this.y * that.y;
  }

  cross(that: Vector2D) {
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

  static fromPoints(p1: {x: number, y: number}, p2: {x: number, y: number}): Vector2D {
    return new Vector2D(p2.x - p1.x, p2.y - p1.y);
  }

  static vec(x: number, y: number): Vector2D;
  static vec(vec: {x: number; y: number}): Vector2D;
  static vec(x: any, y: number = Number.NaN): Vector2D {
    if (typeof x === 'number') {
      return new Vector2D(<number>x, y);
    } else {
      return new Vector2D(x.x, x.y);
    }
  }
  static vec2(x: number, y: number): Vector2D {
    return new Vector2D(x, y);
  }


}


