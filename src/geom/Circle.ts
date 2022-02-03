import { Vector2D } from '../2D/Vector2D';
import { IIntersectionParam } from '../2D/IIntersectionParam';
import { AShape } from './AShape';
import { ICircle } from './ICircle';
import { Rect } from './Rect';

export class Circle extends AShape implements ICircle {
  constructor(public x = 0, public y = 0, public radius = 0) {
    super();
  }

  get xy() {
    return new Vector2D(this.x, this.y);
  }

  toString() {
    return `Circle(x=${this.x},y=${this.y},radius=${this.radius})`;
  }

  protected shiftImpl(x: number, y: number) {
    this.x += x;
    this.y += y;
  }

  aabb(): Rect {
    return new Rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
  }

  get center(): Vector2D {
    return this.xy;
  }

  transform(scale: number[], rotate: number) {
    return new Circle(this.x * scale[0], this.y * scale[1], (this.radius * (scale[0] + scale[1])) / 2);
  }

  asIntersectionParams(): IIntersectionParam {
    return {
      name: 'Circle',
      params: [this.xy, this.radius],
    };
  }

  static circle(x: number, y: number, radius: number): Circle {
    return new Circle(x, y, radius);
  }
}
