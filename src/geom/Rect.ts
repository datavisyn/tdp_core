import { Vector2D } from '../2D/Vector2D';
import { IIntersectionParam } from '../2D/IIntersectionParam';
import { IRect } from './IRect';
import { AShape } from './AShape';

/**
 * a simple bounding rect
 */
export class Rect extends AShape implements IRect {
  constructor(public x = 0, public y = 0, public w = 0, public h = 0) {
    super();
  }

  eq(that: Rect) {
    return this.x === that.x && this.y === that.y && this.w === that.w && this.h === that.h;
  }

  toString() {
    return `Rect(x=${this.x},y=${this.y},w=${this.w},h=${this.h})`;
  }

  get xy() {
    return new Vector2D(this.x, this.y);
  }

  get x2y2() {
    return new Vector2D(this.x2, this.y2);
  }

  get size() {
    return new Vector2D(this.w, this.h);
  }

  get cx(): number {
    return this.x + this.w / 2;
  }

  get cy() {
    return this.y + this.h / 2;
  }

  set cx(val: number) {
    this.x = val - this.w / 2;
  }

  set cy(val: number) {
    this.y = val - this.y / 2;
  }

  get x2(): number {
    return this.x + this.w;
  }

  get y2() {
    return this.y + this.h;
  }

  set x2(val: number) {
    this.w = val - this.x;
  }

  set y2(val: number) {
    this.h = val - this.y;
  }

  protected shiftImpl(x: number, y: number) {
    this.x += x;
    this.y += y;
  }

  aabb(): Rect {
    return this;
  }

  get center(): Vector2D {
    return new Vector2D(this.cx, this.cy);
  }

  transform(scale: number[], rotate: number) {
    // TODO rotate
    return new Rect(this.x * scale[0], this.y * scale[1], this.w * scale[0], this.h * scale[1]);
  }

  asIntersectionParams(): IIntersectionParam {
    return {
      name: 'Rectangle',
      params: [this.xy, this.x2y2],
    };
  }

  static rect(x: number, y: number, w: number, h: number): Rect {
    return new Rect(x, y, w, h);
  }
}
