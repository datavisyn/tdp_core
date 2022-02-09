import { IShape } from './IShape';
import { Polynomial } from './Polynomial';
import { Vector2D } from './Vector2D';
import { Path } from './Path';

export class Intersection {
  readonly points: Vector2D[] = [];

  /**
   *  'Outside',
   *  'Inside',
   *  'Tangent'
   *  'Coincident'
   *  'Parallel'
   *  'Intersection'
   *  'No Intersection'
   */
  constructor(public status = 'No Intersection') {}

  get intersects() {
    return this.status === 'Intersection';
  }

  appendPoint(point: Vector2D) {
    this.status = 'Intersection';
    this.points.push(point);
  }

  appendPoints(points: Vector2D[]) {
    if (points.length > 0) {
      this.status = 'Intersection';
    }
    this.points.push(...points);
  }

  get length() {
    return this.points.length;
  }

  /**
   * Performs the specified action for each element in an array.
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(callbackfn: (value: Vector2D, index: number, array: Vector2D[]) => void, thisArg?: any): void {
    this.points.forEach(callbackfn, thisArg);
  }

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map<U>(callbackfn: (value: Vector2D, index: number, array: Vector2D[]) => U, thisArg?: any): U[] {
    return this.points.map(callbackfn, thisArg);
  }

  static intersectShapes(shape1: IShape, shape2: IShape) {
    const ip1 = shape1.asIntersectionParams();
    const ip2 = shape2.asIntersectionParams();
    let result;
    if (ip1 != null && ip2 != null) {
      if (shape1 instanceof Path) {
        result = Intersection.intersectPathShape(<Path>shape1, shape2);
      } else if (shape2 instanceof Path) {
        result = Intersection.intersectPathShape(<Path>shape2, shape1);
      } else {
        let method;
        let params;
        if (ip1.name < ip2.name) {
          method = `intersect${ip1.name}${ip2.name}`;
          params = ip1.params.concat(ip2.params);
        } else {
          method = `intersect${ip2.name}${ip1.name}`;
          params = ip2.params.concat(ip1.params);
        }
        const intersectionAny = <any>Intersection;
        if (typeof intersectionAny[method] !== 'function') {
          throw new Error(`Intersection not available: ${method}`);
        }
        result = intersectionAny[method].apply(null, params);
      }
    } else {
      result = new Intersection();
    }
    return result;
  }

  static intersectPathShape(path: Path, shape: IShape) {
    return Intersection.intersectShape(path, shape);
  }

  static intersectBezier2Bezier2(a1: Vector2D, a2: Vector2D, a3: Vector2D, b1: Vector2D, b2: Vector2D, b3: Vector2D) {
    const TOLERANCE = 1e-4;
    const result = new Intersection();
    let a = a2.multiply(-2);
    const c12 = a1.add(a.add(a3));
    a = a1.multiply(-2);
    let b = a2.multiply(2);
    const c11 = a.add(b);
    const c10 = new Vector2D(a1.x, a1.y);
    a = b2.multiply(-2);
    const c22 = b1.add(a.add(b3));
    a = b1.multiply(-2);
    b = b2.multiply(2);
    const c21 = a.add(b);
    const c20 = new Vector2D(b1.x, b1.y);
    const af = c12.x * c11.y - c11.x * c12.y;
    const bf = c22.x * c11.y - c11.x * c22.y;
    const c = c21.x * c11.y - c11.x * c21.y;
    const d = c11.x * (c10.y - c20.y) + c11.y * (-c10.x + c20.x);
    const e = c22.x * c12.y - c12.x * c22.y;
    const f = c21.x * c12.y - c12.x * c21.y;
    const g = c12.x * (c10.y - c20.y) + c12.y * (-c10.x + c20.x);
    const poly = new Polynomial(-e * e, -2 * e * f, af * bf - f * f - 2 * e * g, af * c - 2 * f * g, af * d - g * g);
    const roots = poly.getRoots();
    for (const s of roots) {
      if (s >= 0 && s <= 1) {
        const xRoots = new Polynomial(-c12.x, -c11.x, -c10.x + c20.x + s * c21.x + s * s * c22.x).getRoots();
        const yRoots = new Polynomial(-c12.y, -c11.y, -c10.y + c20.y + s * c21.y + s * s * c22.y).getRoots();
        if (xRoots.length > 0 && yRoots.length > 0) {
          // eslint-disable-next-line no-labels
          checkRoots: for (const xRoot of xRoots) {
            if (xRoot >= 0 && xRoot <= 1) {
              for (const yRoot of yRoots) {
                if (Math.abs(xRoot - yRoot) < TOLERANCE) {
                  result.points.push(c22.multiply(s * s).add(c21.multiply(s).add(c20)));
                  // eslint-disable-next-line no-labels
                  break checkRoots;
                }
              }
            }
          }
        }
      }
    }
    return result;
  }

  static intersectBezier2Bezier3(a1: Vector2D, a2: Vector2D, a3: Vector2D, b1: Vector2D, b2: Vector2D, b3: Vector2D, b4: Vector2D) {
    let a;
    let b;
    let c;
    let d;
    const result = new Intersection();
    a = a2.multiply(-2);
    const c12 = a1.add(a.add(a3));
    a = a1.multiply(-2);
    b = a2.multiply(2);
    const c11 = a.add(b);
    const c10 = new Vector2D(a1.x, a1.y);
    a = b1.multiply(-1);
    b = b2.multiply(3);
    c = b3.multiply(-3);
    d = a.add(b.add(c.add(b4)));
    const c23 = new Vector2D(d.x, d.y);
    a = b1.multiply(3);
    b = b2.multiply(-6);
    c = b3.multiply(3);
    d = a.add(b.add(c));
    const c22 = new Vector2D(d.x, d.y);
    a = b1.multiply(-3);
    b = b2.multiply(3);
    c = a.add(b);
    const c21 = new Vector2D(c.x, c.y);
    const c20 = new Vector2D(b1.x, b1.y);
    const c10x2 = c10.x * c10.x;
    const c10y2 = c10.y * c10.y;
    const c11x2 = c11.x * c11.x;
    const c11y2 = c11.y * c11.y;
    const c12x2 = c12.x * c12.x;
    const c12y2 = c12.y * c12.y;
    const c20x2 = c20.x * c20.x;
    const c20y2 = c20.y * c20.y;
    const c21x2 = c21.x * c21.x;
    const c21y2 = c21.y * c21.y;
    const c22x2 = c22.x * c22.x;
    const c22y2 = c22.y * c22.y;
    const c23x2 = c23.x * c23.x;
    const c23y2 = c23.y * c23.y;
    const poly = new Polynomial(
      -2 * c12.x * c12.y * c23.x * c23.y + c12x2 * c23y2 + c12y2 * c23x2,
      -2 * c12.x * c12.y * c22.x * c23.y - 2 * c12.x * c12.y * c22.y * c23.x + 2 * c12y2 * c22.x * c23.x + 2 * c12x2 * c22.y * c23.y,
      -2 * c12.x * c21.x * c12.y * c23.y -
        2 * c12.x * c12.y * c21.y * c23.x -
        2 * c12.x * c12.y * c22.x * c22.y +
        2 * c21.x * c12y2 * c23.x +
        c12y2 * c22x2 +
        c12x2 * (2 * c21.y * c23.y + c22y2),
      2 * c10.x * c12.x * c12.y * c23.y +
        2 * c10.y * c12.x * c12.y * c23.x +
        c11.x * c11.y * c12.x * c23.y +
        c11.x * c11.y * c12.y * c23.x -
        2 * c20.x * c12.x * c12.y * c23.y -
        2 * c12.x * c20.y * c12.y * c23.x -
        2 * c12.x * c21.x * c12.y * c22.y -
        2 * c12.x * c12.y * c21.y * c22.x -
        2 * c10.x * c12y2 * c23.x -
        2 * c10.y * c12x2 * c23.y +
        2 * c20.x * c12y2 * c23.x +
        2 * c21.x * c12y2 * c22.x -
        c11y2 * c12.x * c23.x -
        c11x2 * c12.y * c23.y +
        c12x2 * (2 * c20.y * c23.y + 2 * c21.y * c22.y),
      2 * c10.x * c12.x * c12.y * c22.y +
        2 * c10.y * c12.x * c12.y * c22.x +
        c11.x * c11.y * c12.x * c22.y +
        c11.x * c11.y * c12.y * c22.x -
        2 * c20.x * c12.x * c12.y * c22.y -
        2 * c12.x * c20.y * c12.y * c22.x -
        2 * c12.x * c21.x * c12.y * c21.y -
        2 * c10.x * c12y2 * c22.x -
        2 * c10.y * c12x2 * c22.y +
        2 * c20.x * c12y2 * c22.x -
        c11y2 * c12.x * c22.x -
        c11x2 * c12.y * c22.y +
        c21x2 * c12y2 +
        c12x2 * (2 * c20.y * c22.y + c21y2),
      2 * c10.x * c12.x * c12.y * c21.y +
        2 * c10.y * c12.x * c21.x * c12.y +
        c11.x * c11.y * c12.x * c21.y +
        c11.x * c11.y * c21.x * c12.y -
        2 * c20.x * c12.x * c12.y * c21.y -
        2 * c12.x * c20.y * c21.x * c12.y -
        2 * c10.x * c21.x * c12y2 -
        2 * c10.y * c12x2 * c21.y +
        2 * c20.x * c21.x * c12y2 -
        c11y2 * c12.x * c21.x -
        c11x2 * c12.y * c21.y +
        2 * c12x2 * c20.y * c21.y,
      -2 * c10.x * c10.y * c12.x * c12.y -
        c10.x * c11.x * c11.y * c12.y -
        c10.y * c11.x * c11.y * c12.x +
        2 * c10.x * c12.x * c20.y * c12.y +
        2 * c10.y * c20.x * c12.x * c12.y +
        c11.x * c20.x * c11.y * c12.y +
        c11.x * c11.y * c12.x * c20.y -
        2 * c20.x * c12.x * c20.y * c12.y -
        2 * c10.x * c20.x * c12y2 +
        c10.x * c11y2 * c12.x +
        c10.y * c11x2 * c12.y -
        2 * c10.y * c12x2 * c20.y -
        c20.x * c11y2 * c12.x -
        c11x2 * c20.y * c12.y +
        c10x2 * c12y2 +
        c10y2 * c12x2 +
        c20x2 * c12y2 +
        c12x2 * c20y2,
    );
    const roots = poly.getRootsInInterval(0, 1);
    for (const s of roots) {
      const xRoots = new Polynomial(c12.x, c11.x, c10.x - c20.x - s * c21.x - s * s * c22.x - s * s * s * c23.x).getRoots();
      const yRoots = new Polynomial(c12.y, c11.y, c10.y - c20.y - s * c21.y - s * s * c22.y - s * s * s * c23.y).getRoots();
      if (xRoots.length > 0 && yRoots.length > 0) {
        const TOLERANCE = 1e-4;
        // eslint-disable-next-line no-labels
        checkRoots: for (const xRoot of xRoots) {
          if (xRoot >= 0 && xRoot <= 1) {
            for (const yRoot of yRoots) {
              if (Math.abs(xRoot - yRoot) < TOLERANCE) {
                result.points.push(c23.multiply(s * s * s).add(c22.multiply(s * s).add(c21.multiply(s).add(c20))));
                // eslint-disable-next-line no-labels
                break checkRoots;
              }
            }
          }
        }
      }
    }
    return result;
  }

  static intersectBezier2Circle(p1: Vector2D, p2: Vector2D, p3: Vector2D, c: Vector2D, r: number) {
    return Intersection.intersectBezier2Ellipse(p1, p2, p3, c, r, r);
  }

  static intersectBezier2Ellipse(p1: Vector2D, p2: Vector2D, p3: Vector2D, ec: Vector2D, rx: number, ry: number) {
    let a;
    const result = new Intersection();
    a = p2.multiply(-2);
    const c2 = p1.add(a.add(p3));
    a = p1.multiply(-2);
    const b = p2.multiply(2);
    const c1 = a.add(b);
    const c0 = new Vector2D(p1.x, p1.y);
    const rxrx = rx * rx;
    const ryry = ry * ry;
    const roots = new Polynomial(
      ryry * c2.x * c2.x + rxrx * c2.y * c2.y,
      2 * (ryry * c2.x * c1.x + rxrx * c2.y * c1.y),
      ryry * (2 * c2.x * c0.x + c1.x * c1.x) + rxrx * (2 * c2.y * c0.y + c1.y * c1.y) - 2 * (ryry * ec.x * c2.x + rxrx * ec.y * c2.y),
      2 * (ryry * c1.x * (c0.x - ec.x) + rxrx * c1.y * (c0.y - ec.y)),
      ryry * (c0.x * c0.x + ec.x * ec.x) + rxrx * (c0.y * c0.y + ec.y * ec.y) - 2 * (ryry * ec.x * c0.x + rxrx * ec.y * c0.y) - rxrx * ryry,
    ).getRoots();
    for (const t of roots) {
      if (t >= 0 && t <= 1) {
        result.points.push(c2.multiply(t * t).add(c1.multiply(t).add(c0)));
      }
    }
    return result;
  }

  static intersectBezier2Line(p1: Vector2D, p2: Vector2D, p3: Vector2D, a1: Vector2D, a2: Vector2D) {
    let a;
    const min = a1.min(a2);
    const max = a1.max(a2);
    const result = new Intersection();
    a = p2.multiply(-2);
    const c2 = p1.add(a.add(p3));
    a = p1.multiply(-2);
    const b = p2.multiply(2);
    const c1 = a.add(b);
    const c0 = new Vector2D(p1.x, p1.y);
    const n = new Vector2D(a1.y - a2.y, a2.x - a1.x);
    const cl = a1.x * a2.y - a2.x * a1.y;
    const roots = new Polynomial(n.dot(c2), n.dot(c1), n.dot(c0) + cl).getRoots();
    for (const t of roots) {
      if (t >= 0 && t <= 1) {
        const p4 = p1.lerp(p2, t);
        const p5 = p2.lerp(p3, t);
        const p6 = p4.lerp(p5, t);
        if (a1.x === a2.x) {
          if (min.y <= p6.y && p6.y <= max.y) {
            result.appendPoint(p6);
          }
        } else if (a1.y === a2.y) {
          if (min.x <= p6.x && p6.x <= max.x) {
            result.appendPoint(p6);
          }
        } else if (p6.gte(min) && p6.lte(max)) {
          result.appendPoint(p6);
        }
      }
    }
    return result;
  }

  intersectBezier2Polygon(p1: Vector2D, p2: Vector2D, p3: Vector2D, points: Vector2D[]) {
    const result = new Intersection();
    const { length } = points;
    for (let i = 0; i < length; i++) {
      const a1 = points[i];
      const a2 = points[(i + 1) % length];
      const inter = Intersection.intersectBezier2Line(p1, p2, p3, a1, a2);
      result.appendPoints(inter.points);
    }
    return result;
  }

  static intersectBezier2Rectangle(p1: Vector2D, p2: Vector2D, p3: Vector2D, r1: Vector2D, r2: Vector2D) {
    const min = r1.min(r2);
    const max = r1.max(r2);
    const topRight = new Vector2D(max.x, min.y);
    const bottomLeft = new Vector2D(min.x, max.y);
    const inter1 = Intersection.intersectBezier2Line(p1, p2, p3, min, topRight);
    const inter2 = Intersection.intersectBezier2Line(p1, p2, p3, topRight, max);
    const inter3 = Intersection.intersectBezier2Line(p1, p2, p3, max, bottomLeft);
    const inter4 = Intersection.intersectBezier2Line(p1, p2, p3, bottomLeft, min);
    const result = new Intersection();
    result.appendPoints(inter1.points);
    result.appendPoints(inter2.points);
    result.appendPoints(inter3.points);
    result.appendPoints(inter4.points);
    return result;
  }

  static intersectBezier3Bezier3(a1: Vector2D, a2: Vector2D, a3: Vector2D, a4: Vector2D, b1: Vector2D, b2: Vector2D, b3: Vector2D, b4: Vector2D) {
    let a;
    let b;
    let c;
    let d;
    const result = new Intersection();
    a = a1.multiply(-1);
    b = a2.multiply(3);
    c = a3.multiply(-3);
    d = a.add(b.add(c.add(a4)));
    const c13 = new Vector2D(d.x, d.y);
    a = a1.multiply(3);
    b = a2.multiply(-6);
    c = a3.multiply(3);
    d = a.add(b.add(c));
    const c12 = new Vector2D(d.x, d.y);
    a = a1.multiply(-3);
    b = a2.multiply(3);
    c = a.add(b);
    const c11 = new Vector2D(c.x, c.y);
    const c10 = new Vector2D(a1.x, a1.y);
    a = b1.multiply(-1);
    b = b2.multiply(3);
    c = b3.multiply(-3);
    d = a.add(b.add(c.add(b4)));
    const c23 = new Vector2D(d.x, d.y);
    a = b1.multiply(3);
    b = b2.multiply(-6);
    c = b3.multiply(3);
    d = a.add(b.add(c));
    const c22 = new Vector2D(d.x, d.y);
    a = b1.multiply(-3);
    b = b2.multiply(3);
    c = a.add(b);
    const c21 = new Vector2D(c.x, c.y);
    const c20 = new Vector2D(b1.x, b1.y);
    const c10x2 = c10.x * c10.x;
    const c10x3 = c10.x * c10.x * c10.x;
    const c10y2 = c10.y * c10.y;
    const c10y3 = c10.y * c10.y * c10.y;
    const c11x2 = c11.x * c11.x;
    const c11x3 = c11.x * c11.x * c11.x;
    const c11y2 = c11.y * c11.y;
    const c11y3 = c11.y * c11.y * c11.y;
    const c12x2 = c12.x * c12.x;
    const c12x3 = c12.x * c12.x * c12.x;
    const c12y2 = c12.y * c12.y;
    const c12y3 = c12.y * c12.y * c12.y;
    const c13x2 = c13.x * c13.x;
    const c13x3 = c13.x * c13.x * c13.x;
    const c13y2 = c13.y * c13.y;
    const c13y3 = c13.y * c13.y * c13.y;
    const c20x2 = c20.x * c20.x;
    const c20x3 = c20.x * c20.x * c20.x;
    const c20y2 = c20.y * c20.y;
    const c20y3 = c20.y * c20.y * c20.y;
    const c21x2 = c21.x * c21.x;
    const c21x3 = c21.x * c21.x * c21.x;
    const c21y2 = c21.y * c21.y;
    const c22x2 = c22.x * c22.x;
    const c22x3 = c22.x * c22.x * c22.x;
    const c22y2 = c22.y * c22.y;
    const c23x2 = c23.x * c23.x;
    const c23x3 = c23.x * c23.x * c23.x;
    const c23y2 = c23.y * c23.y;
    const c23y3 = c23.y * c23.y * c23.y;
    const poly = new Polynomial(
      -c13x3 * c23y3 + c13y3 * c23x3 - 3 * c13.x * c13y2 * c23x2 * c23.y + 3 * c13x2 * c13.y * c23.x * c23y2,
      -6 * c13.x * c22.x * c13y2 * c23.x * c23.y +
        6 * c13x2 * c13.y * c22.y * c23.x * c23.y +
        3 * c22.x * c13y3 * c23x2 -
        3 * c13x3 * c22.y * c23y2 -
        3 * c13.x * c13y2 * c22.y * c23x2 +
        3 * c13x2 * c22.x * c13.y * c23y2,
      -6 * c21.x * c13.x * c13y2 * c23.x * c23.y -
        6 * c13.x * c22.x * c13y2 * c22.y * c23.x +
        6 * c13x2 * c22.x * c13.y * c22.y * c23.y +
        3 * c21.x * c13y3 * c23x2 +
        3 * c22x2 * c13y3 * c23.x +
        3 * c21.x * c13x2 * c13.y * c23y2 -
        3 * c13.x * c21.y * c13y2 * c23x2 -
        3 * c13.x * c22x2 * c13y2 * c23.y +
        c13x2 * c13.y * c23.x * (6 * c21.y * c23.y + 3 * c22y2) +
        c13x3 * (-c21.y * c23y2 - 2 * c22y2 * c23.y - c23.y * (2 * c21.y * c23.y + c22y2)),
      c11.x * c12.y * c13.x * c13.y * c23.x * c23.y -
        c11.y * c12.x * c13.x * c13.y * c23.x * c23.y +
        6 * c21.x * c22.x * c13y3 * c23.x +
        3 * c11.x * c12.x * c13.x * c13.y * c23y2 +
        6 * c10.x * c13.x * c13y2 * c23.x * c23.y -
        3 * c11.x * c12.x * c13y2 * c23.x * c23.y -
        3 * c11.y * c12.y * c13.x * c13.y * c23x2 -
        6 * c10.y * c13x2 * c13.y * c23.x * c23.y -
        6 * c20.x * c13.x * c13y2 * c23.x * c23.y +
        3 * c11.y * c12.y * c13x2 * c23.x * c23.y -
        2 * c12.x * c12y2 * c13.x * c23.x * c23.y -
        6 * c21.x * c13.x * c22.x * c13y2 * c23.y -
        6 * c21.x * c13.x * c13y2 * c22.y * c23.x -
        6 * c13.x * c21.y * c22.x * c13y2 * c23.x +
        6 * c21.x * c13x2 * c13.y * c22.y * c23.y +
        2 * c12x2 * c12.y * c13.y * c23.x * c23.y +
        c22x3 * c13y3 -
        3 * c10.x * c13y3 * c23x2 +
        3 * c10.y * c13x3 * c23y2 +
        3 * c20.x * c13y3 * c23x2 +
        c12y3 * c13.x * c23x2 -
        c12x3 * c13.y * c23y2 -
        3 * c10.x * c13x2 * c13.y * c23y2 +
        3 * c10.y * c13.x * c13y2 * c23x2 -
        2 * c11.x * c12.y * c13x2 * c23y2 +
        c11.x * c12.y * c13y2 * c23x2 -
        c11.y * c12.x * c13x2 * c23y2 +
        2 * c11.y * c12.x * c13y2 * c23x2 +
        3 * c20.x * c13x2 * c13.y * c23y2 -
        c12.x * c12y2 * c13.y * c23x2 -
        3 * c20.y * c13.x * c13y2 * c23x2 +
        c12x2 * c12.y * c13.x * c23y2 -
        3 * c13.x * c22x2 * c13y2 * c22.y +
        c13x2 * c13.y * c23.x * (6 * c20.y * c23.y + 6 * c21.y * c22.y) +
        c13x2 * c22.x * c13.y * (6 * c21.y * c23.y + 3 * c22y2) +
        c13x3 * (-2 * c21.y * c22.y * c23.y - c20.y * c23y2 - c22.y * (2 * c21.y * c23.y + c22y2) - c23.y * (2 * c20.y * c23.y + 2 * c21.y * c22.y)),
      6 * c11.x * c12.x * c13.x * c13.y * c22.y * c23.y +
        c11.x * c12.y * c13.x * c22.x * c13.y * c23.y +
        c11.x * c12.y * c13.x * c13.y * c22.y * c23.x -
        c11.y * c12.x * c13.x * c22.x * c13.y * c23.y -
        c11.y * c12.x * c13.x * c13.y * c22.y * c23.x -
        6 * c11.y * c12.y * c13.x * c22.x * c13.y * c23.x -
        6 * c10.x * c22.x * c13y3 * c23.x +
        6 * c20.x * c22.x * c13y3 * c23.x +
        6 * c10.y * c13x3 * c22.y * c23.y +
        2 * c12y3 * c13.x * c22.x * c23.x -
        2 * c12x3 * c13.y * c22.y * c23.y +
        6 * c10.x * c13.x * c22.x * c13y2 * c23.y +
        6 * c10.x * c13.x * c13y2 * c22.y * c23.x +
        6 * c10.y * c13.x * c22.x * c13y2 * c23.x -
        3 * c11.x * c12.x * c22.x * c13y2 * c23.y -
        3 * c11.x * c12.x * c13y2 * c22.y * c23.x +
        2 * c11.x * c12.y * c22.x * c13y2 * c23.x +
        4 * c11.y * c12.x * c22.x * c13y2 * c23.x -
        6 * c10.x * c13x2 * c13.y * c22.y * c23.y -
        6 * c10.y * c13x2 * c22.x * c13.y * c23.y -
        6 * c10.y * c13x2 * c13.y * c22.y * c23.x -
        4 * c11.x * c12.y * c13x2 * c22.y * c23.y -
        6 * c20.x * c13.x * c22.x * c13y2 * c23.y -
        6 * c20.x * c13.x * c13y2 * c22.y * c23.x -
        2 * c11.y * c12.x * c13x2 * c22.y * c23.y +
        3 * c11.y * c12.y * c13x2 * c22.x * c23.y +
        3 * c11.y * c12.y * c13x2 * c22.y * c23.x -
        2 * c12.x * c12y2 * c13.x * c22.x * c23.y -
        2 * c12.x * c12y2 * c13.x * c22.y * c23.x -
        2 * c12.x * c12y2 * c22.x * c13.y * c23.x -
        6 * c20.y * c13.x * c22.x * c13y2 * c23.x -
        6 * c21.x * c13.x * c21.y * c13y2 * c23.x -
        6 * c21.x * c13.x * c22.x * c13y2 * c22.y +
        6 * c20.x * c13x2 * c13.y * c22.y * c23.y +
        2 * c12x2 * c12.y * c13.x * c22.y * c23.y +
        2 * c12x2 * c12.y * c22.x * c13.y * c23.y +
        2 * c12x2 * c12.y * c13.y * c22.y * c23.x +
        3 * c21.x * c22x2 * c13y3 +
        3 * c21x2 * c13y3 * c23.x -
        3 * c13.x * c21.y * c22x2 * c13y2 -
        3 * c21x2 * c13.x * c13y2 * c23.y +
        c13x2 * c22.x * c13.y * (6 * c20.y * c23.y + 6 * c21.y * c22.y) +
        c13x2 * c13.y * c23.x * (6 * c20.y * c22.y + 3 * c21y2) +
        c21.x * c13x2 * c13.y * (6 * c21.y * c23.y + 3 * c22y2) +
        c13x3 *
          (-2 * c20.y * c22.y * c23.y -
            c23.y * (2 * c20.y * c22.y + c21y2) -
            c21.y * (2 * c21.y * c23.y + c22y2) -
            c22.y * (2 * c20.y * c23.y + 2 * c21.y * c22.y)),
      c11.x * c21.x * c12.y * c13.x * c13.y * c23.y +
        c11.x * c12.y * c13.x * c21.y * c13.y * c23.x +
        c11.x * c12.y * c13.x * c22.x * c13.y * c22.y -
        c11.y * c12.x * c21.x * c13.x * c13.y * c23.y -
        c11.y * c12.x * c13.x * c21.y * c13.y * c23.x -
        c11.y * c12.x * c13.x * c22.x * c13.y * c22.y -
        6 * c11.y * c21.x * c12.y * c13.x * c13.y * c23.x -
        6 * c10.x * c21.x * c13y3 * c23.x +
        6 * c20.x * c21.x * c13y3 * c23.x +
        2 * c21.x * c12y3 * c13.x * c23.x +
        6 * c10.x * c21.x * c13.x * c13y2 * c23.y +
        6 * c10.x * c13.x * c21.y * c13y2 * c23.x +
        6 * c10.x * c13.x * c22.x * c13y2 * c22.y +
        6 * c10.y * c21.x * c13.x * c13y2 * c23.x -
        3 * c11.x * c12.x * c21.x * c13y2 * c23.y -
        3 * c11.x * c12.x * c21.y * c13y2 * c23.x -
        3 * c11.x * c12.x * c22.x * c13y2 * c22.y +
        2 * c11.x * c21.x * c12.y * c13y2 * c23.x +
        4 * c11.y * c12.x * c21.x * c13y2 * c23.x -
        6 * c10.y * c21.x * c13x2 * c13.y * c23.y -
        6 * c10.y * c13x2 * c21.y * c13.y * c23.x -
        6 * c10.y * c13x2 * c22.x * c13.y * c22.y -
        6 * c20.x * c21.x * c13.x * c13y2 * c23.y -
        6 * c20.x * c13.x * c21.y * c13y2 * c23.x -
        6 * c20.x * c13.x * c22.x * c13y2 * c22.y +
        3 * c11.y * c21.x * c12.y * c13x2 * c23.y -
        3 * c11.y * c12.y * c13.x * c22x2 * c13.y +
        3 * c11.y * c12.y * c13x2 * c21.y * c23.x +
        3 * c11.y * c12.y * c13x2 * c22.x * c22.y -
        2 * c12.x * c21.x * c12y2 * c13.x * c23.y -
        2 * c12.x * c21.x * c12y2 * c13.y * c23.x -
        2 * c12.x * c12y2 * c13.x * c21.y * c23.x -
        2 * c12.x * c12y2 * c13.x * c22.x * c22.y -
        6 * c20.y * c21.x * c13.x * c13y2 * c23.x -
        6 * c21.x * c13.x * c21.y * c22.x * c13y2 +
        6 * c20.y * c13x2 * c21.y * c13.y * c23.x +
        2 * c12x2 * c21.x * c12.y * c13.y * c23.y +
        2 * c12x2 * c12.y * c21.y * c13.y * c23.x +
        2 * c12x2 * c12.y * c22.x * c13.y * c22.y -
        3 * c10.x * c22x2 * c13y3 +
        3 * c20.x * c22x2 * c13y3 +
        3 * c21x2 * c22.x * c13y3 +
        c12y3 * c13.x * c22x2 +
        3 * c10.y * c13.x * c22x2 * c13y2 +
        c11.x * c12.y * c22x2 * c13y2 +
        2 * c11.y * c12.x * c22x2 * c13y2 -
        c12.x * c12y2 * c22x2 * c13.y -
        3 * c20.y * c13.x * c22x2 * c13y2 -
        3 * c21x2 * c13.x * c13y2 * c22.y +
        c12x2 * c12.y * c13.x * (2 * c21.y * c23.y + c22y2) +
        c11.x * c12.x * c13.x * c13.y * (6 * c21.y * c23.y + 3 * c22y2) +
        c21.x * c13x2 * c13.y * (6 * c20.y * c23.y + 6 * c21.y * c22.y) +
        c12x3 * c13.y * (-2 * c21.y * c23.y - c22y2) +
        c10.y * c13x3 * (6 * c21.y * c23.y + 3 * c22y2) +
        c11.y * c12.x * c13x2 * (-2 * c21.y * c23.y - c22y2) +
        c11.x * c12.y * c13x2 * (-4 * c21.y * c23.y - 2 * c22y2) +
        c10.x * c13x2 * c13.y * (-6 * c21.y * c23.y - 3 * c22y2) +
        c13x2 * c22.x * c13.y * (6 * c20.y * c22.y + 3 * c21y2) +
        c20.x * c13x2 * c13.y * (6 * c21.y * c23.y + 3 * c22y2) +
        c13x3 *
          (-2 * c20.y * c21.y * c23.y -
            c22.y * (2 * c20.y * c22.y + c21y2) -
            c20.y * (2 * c21.y * c23.y + c22y2) -
            c21.y * (2 * c20.y * c23.y + 2 * c21.y * c22.y)),
      -c10.x * c11.x * c12.y * c13.x * c13.y * c23.y +
        c10.x * c11.y * c12.x * c13.x * c13.y * c23.y +
        6 * c10.x * c11.y * c12.y * c13.x * c13.y * c23.x -
        6 * c10.y * c11.x * c12.x * c13.x * c13.y * c23.y -
        c10.y * c11.x * c12.y * c13.x * c13.y * c23.x +
        c10.y * c11.y * c12.x * c13.x * c13.y * c23.x +
        c11.x * c11.y * c12.x * c12.y * c13.x * c23.y -
        c11.x * c11.y * c12.x * c12.y * c13.y * c23.x +
        c11.x * c20.x * c12.y * c13.x * c13.y * c23.y +
        c11.x * c20.y * c12.y * c13.x * c13.y * c23.x +
        c11.x * c21.x * c12.y * c13.x * c13.y * c22.y +
        c11.x * c12.y * c13.x * c21.y * c22.x * c13.y -
        c20.x * c11.y * c12.x * c13.x * c13.y * c23.y -
        6 * c20.x * c11.y * c12.y * c13.x * c13.y * c23.x -
        c11.y * c12.x * c20.y * c13.x * c13.y * c23.x -
        c11.y * c12.x * c21.x * c13.x * c13.y * c22.y -
        c11.y * c12.x * c13.x * c21.y * c22.x * c13.y -
        6 * c11.y * c21.x * c12.y * c13.x * c22.x * c13.y -
        6 * c10.x * c20.x * c13y3 * c23.x -
        6 * c10.x * c21.x * c22.x * c13y3 -
        2 * c10.x * c12y3 * c13.x * c23.x +
        6 * c20.x * c21.x * c22.x * c13y3 +
        2 * c20.x * c12y3 * c13.x * c23.x +
        2 * c21.x * c12y3 * c13.x * c22.x +
        2 * c10.y * c12x3 * c13.y * c23.y -
        6 * c10.x * c10.y * c13.x * c13y2 * c23.x +
        3 * c10.x * c11.x * c12.x * c13y2 * c23.y -
        2 * c10.x * c11.x * c12.y * c13y2 * c23.x -
        4 * c10.x * c11.y * c12.x * c13y2 * c23.x +
        3 * c10.y * c11.x * c12.x * c13y2 * c23.x +
        6 * c10.x * c10.y * c13x2 * c13.y * c23.y +
        6 * c10.x * c20.x * c13.x * c13y2 * c23.y -
        3 * c10.x * c11.y * c12.y * c13x2 * c23.y +
        2 * c10.x * c12.x * c12y2 * c13.x * c23.y +
        2 * c10.x * c12.x * c12y2 * c13.y * c23.x +
        6 * c10.x * c20.y * c13.x * c13y2 * c23.x +
        6 * c10.x * c21.x * c13.x * c13y2 * c22.y +
        6 * c10.x * c13.x * c21.y * c22.x * c13y2 +
        4 * c10.y * c11.x * c12.y * c13x2 * c23.y +
        6 * c10.y * c20.x * c13.x * c13y2 * c23.x +
        2 * c10.y * c11.y * c12.x * c13x2 * c23.y -
        3 * c10.y * c11.y * c12.y * c13x2 * c23.x +
        2 * c10.y * c12.x * c12y2 * c13.x * c23.x +
        6 * c10.y * c21.x * c13.x * c22.x * c13y2 -
        3 * c11.x * c20.x * c12.x * c13y2 * c23.y +
        2 * c11.x * c20.x * c12.y * c13y2 * c23.x +
        c11.x * c11.y * c12y2 * c13.x * c23.x -
        3 * c11.x * c12.x * c20.y * c13y2 * c23.x -
        3 * c11.x * c12.x * c21.x * c13y2 * c22.y -
        3 * c11.x * c12.x * c21.y * c22.x * c13y2 +
        2 * c11.x * c21.x * c12.y * c22.x * c13y2 +
        4 * c20.x * c11.y * c12.x * c13y2 * c23.x +
        4 * c11.y * c12.x * c21.x * c22.x * c13y2 -
        2 * c10.x * c12x2 * c12.y * c13.y * c23.y -
        6 * c10.y * c20.x * c13x2 * c13.y * c23.y -
        6 * c10.y * c20.y * c13x2 * c13.y * c23.x -
        6 * c10.y * c21.x * c13x2 * c13.y * c22.y -
        2 * c10.y * c12x2 * c12.y * c13.x * c23.y -
        2 * c10.y * c12x2 * c12.y * c13.y * c23.x -
        6 * c10.y * c13x2 * c21.y * c22.x * c13.y -
        c11.x * c11.y * c12x2 * c13.y * c23.y -
        2 * c11.x * c11y2 * c13.x * c13.y * c23.x +
        3 * c20.x * c11.y * c12.y * c13x2 * c23.y -
        2 * c20.x * c12.x * c12y2 * c13.x * c23.y -
        2 * c20.x * c12.x * c12y2 * c13.y * c23.x -
        6 * c20.x * c20.y * c13.x * c13y2 * c23.x -
        6 * c20.x * c21.x * c13.x * c13y2 * c22.y -
        6 * c20.x * c13.x * c21.y * c22.x * c13y2 +
        3 * c11.y * c20.y * c12.y * c13x2 * c23.x +
        3 * c11.y * c21.x * c12.y * c13x2 * c22.y +
        3 * c11.y * c12.y * c13x2 * c21.y * c22.x -
        2 * c12.x * c20.y * c12y2 * c13.x * c23.x -
        2 * c12.x * c21.x * c12y2 * c13.x * c22.y -
        2 * c12.x * c21.x * c12y2 * c22.x * c13.y -
        2 * c12.x * c12y2 * c13.x * c21.y * c22.x -
        6 * c20.y * c21.x * c13.x * c22.x * c13y2 -
        c11y2 * c12.x * c12.y * c13.x * c23.x +
        2 * c20.x * c12x2 * c12.y * c13.y * c23.y +
        6 * c20.y * c13x2 * c21.y * c22.x * c13.y +
        2 * c11x2 * c11.y * c13.x * c13.y * c23.y +
        c11x2 * c12.x * c12.y * c13.y * c23.y +
        2 * c12x2 * c20.y * c12.y * c13.y * c23.x +
        2 * c12x2 * c21.x * c12.y * c13.y * c22.y +
        2 * c12x2 * c12.y * c21.y * c22.x * c13.y +
        c21x3 * c13y3 +
        3 * c10x2 * c13y3 * c23.x -
        3 * c10y2 * c13x3 * c23.y +
        3 * c20x2 * c13y3 * c23.x +
        c11y3 * c13x2 * c23.x -
        c11x3 * c13y2 * c23.y -
        c11.x * c11y2 * c13x2 * c23.y +
        c11x2 * c11.y * c13y2 * c23.x -
        3 * c10x2 * c13.x * c13y2 * c23.y +
        3 * c10y2 * c13x2 * c13.y * c23.x -
        c11x2 * c12y2 * c13.x * c23.y +
        c11y2 * c12x2 * c13.y * c23.x -
        3 * c21x2 * c13.x * c21.y * c13y2 -
        3 * c20x2 * c13.x * c13y2 * c23.y +
        3 * c20y2 * c13x2 * c13.y * c23.x +
        c11.x * c12.x * c13.x * c13.y * (6 * c20.y * c23.y + 6 * c21.y * c22.y) +
        c12x3 * c13.y * (-2 * c20.y * c23.y - 2 * c21.y * c22.y) +
        c10.y * c13x3 * (6 * c20.y * c23.y + 6 * c21.y * c22.y) +
        c11.y * c12.x * c13x2 * (-2 * c20.y * c23.y - 2 * c21.y * c22.y) +
        c12x2 * c12.y * c13.x * (2 * c20.y * c23.y + 2 * c21.y * c22.y) +
        c11.x * c12.y * c13x2 * (-4 * c20.y * c23.y - 4 * c21.y * c22.y) +
        c10.x * c13x2 * c13.y * (-6 * c20.y * c23.y - 6 * c21.y * c22.y) +
        c20.x * c13x2 * c13.y * (6 * c20.y * c23.y + 6 * c21.y * c22.y) +
        c21.x * c13x2 * c13.y * (6 * c20.y * c22.y + 3 * c21y2) +
        c13x3 * (-2 * c20.y * c21.y * c22.y - c20y2 * c23.y - c21.y * (2 * c20.y * c22.y + c21y2) - c20.y * (2 * c20.y * c23.y + 2 * c21.y * c22.y)),
      -c10.x * c11.x * c12.y * c13.x * c13.y * c22.y +
        c10.x * c11.y * c12.x * c13.x * c13.y * c22.y +
        6 * c10.x * c11.y * c12.y * c13.x * c22.x * c13.y -
        6 * c10.y * c11.x * c12.x * c13.x * c13.y * c22.y -
        c10.y * c11.x * c12.y * c13.x * c22.x * c13.y +
        c10.y * c11.y * c12.x * c13.x * c22.x * c13.y +
        c11.x * c11.y * c12.x * c12.y * c13.x * c22.y -
        c11.x * c11.y * c12.x * c12.y * c22.x * c13.y +
        c11.x * c20.x * c12.y * c13.x * c13.y * c22.y +
        c11.x * c20.y * c12.y * c13.x * c22.x * c13.y +
        c11.x * c21.x * c12.y * c13.x * c21.y * c13.y -
        c20.x * c11.y * c12.x * c13.x * c13.y * c22.y -
        6 * c20.x * c11.y * c12.y * c13.x * c22.x * c13.y -
        c11.y * c12.x * c20.y * c13.x * c22.x * c13.y -
        c11.y * c12.x * c21.x * c13.x * c21.y * c13.y -
        6 * c10.x * c20.x * c22.x * c13y3 -
        2 * c10.x * c12y3 * c13.x * c22.x +
        2 * c20.x * c12y3 * c13.x * c22.x +
        2 * c10.y * c12x3 * c13.y * c22.y -
        6 * c10.x * c10.y * c13.x * c22.x * c13y2 +
        3 * c10.x * c11.x * c12.x * c13y2 * c22.y -
        2 * c10.x * c11.x * c12.y * c22.x * c13y2 -
        4 * c10.x * c11.y * c12.x * c22.x * c13y2 +
        3 * c10.y * c11.x * c12.x * c22.x * c13y2 +
        6 * c10.x * c10.y * c13x2 * c13.y * c22.y +
        6 * c10.x * c20.x * c13.x * c13y2 * c22.y -
        3 * c10.x * c11.y * c12.y * c13x2 * c22.y +
        2 * c10.x * c12.x * c12y2 * c13.x * c22.y +
        2 * c10.x * c12.x * c12y2 * c22.x * c13.y +
        6 * c10.x * c20.y * c13.x * c22.x * c13y2 +
        6 * c10.x * c21.x * c13.x * c21.y * c13y2 +
        4 * c10.y * c11.x * c12.y * c13x2 * c22.y +
        6 * c10.y * c20.x * c13.x * c22.x * c13y2 +
        2 * c10.y * c11.y * c12.x * c13x2 * c22.y -
        3 * c10.y * c11.y * c12.y * c13x2 * c22.x +
        2 * c10.y * c12.x * c12y2 * c13.x * c22.x -
        3 * c11.x * c20.x * c12.x * c13y2 * c22.y +
        2 * c11.x * c20.x * c12.y * c22.x * c13y2 +
        c11.x * c11.y * c12y2 * c13.x * c22.x -
        3 * c11.x * c12.x * c20.y * c22.x * c13y2 -
        3 * c11.x * c12.x * c21.x * c21.y * c13y2 +
        4 * c20.x * c11.y * c12.x * c22.x * c13y2 -
        2 * c10.x * c12x2 * c12.y * c13.y * c22.y -
        6 * c10.y * c20.x * c13x2 * c13.y * c22.y -
        6 * c10.y * c20.y * c13x2 * c22.x * c13.y -
        6 * c10.y * c21.x * c13x2 * c21.y * c13.y -
        2 * c10.y * c12x2 * c12.y * c13.x * c22.y -
        2 * c10.y * c12x2 * c12.y * c22.x * c13.y -
        c11.x * c11.y * c12x2 * c13.y * c22.y -
        2 * c11.x * c11y2 * c13.x * c22.x * c13.y +
        3 * c20.x * c11.y * c12.y * c13x2 * c22.y -
        2 * c20.x * c12.x * c12y2 * c13.x * c22.y -
        2 * c20.x * c12.x * c12y2 * c22.x * c13.y -
        6 * c20.x * c20.y * c13.x * c22.x * c13y2 -
        6 * c20.x * c21.x * c13.x * c21.y * c13y2 +
        3 * c11.y * c20.y * c12.y * c13x2 * c22.x +
        3 * c11.y * c21.x * c12.y * c13x2 * c21.y -
        2 * c12.x * c20.y * c12y2 * c13.x * c22.x -
        2 * c12.x * c21.x * c12y2 * c13.x * c21.y -
        c11y2 * c12.x * c12.y * c13.x * c22.x +
        2 * c20.x * c12x2 * c12.y * c13.y * c22.y -
        3 * c11.y * c21x2 * c12.y * c13.x * c13.y +
        6 * c20.y * c21.x * c13x2 * c21.y * c13.y +
        2 * c11x2 * c11.y * c13.x * c13.y * c22.y +
        c11x2 * c12.x * c12.y * c13.y * c22.y +
        2 * c12x2 * c20.y * c12.y * c22.x * c13.y +
        2 * c12x2 * c21.x * c12.y * c21.y * c13.y -
        3 * c10.x * c21x2 * c13y3 +
        3 * c20.x * c21x2 * c13y3 +
        3 * c10x2 * c22.x * c13y3 -
        3 * c10y2 * c13x3 * c22.y +
        3 * c20x2 * c22.x * c13y3 +
        c21x2 * c12y3 * c13.x +
        c11y3 * c13x2 * c22.x -
        c11x3 * c13y2 * c22.y +
        3 * c10.y * c21x2 * c13.x * c13y2 -
        c11.x * c11y2 * c13x2 * c22.y +
        c11.x * c21x2 * c12.y * c13y2 +
        2 * c11.y * c12.x * c21x2 * c13y2 +
        c11x2 * c11.y * c22.x * c13y2 -
        c12.x * c21x2 * c12y2 * c13.y -
        3 * c20.y * c21x2 * c13.x * c13y2 -
        3 * c10x2 * c13.x * c13y2 * c22.y +
        3 * c10y2 * c13x2 * c22.x * c13.y -
        c11x2 * c12y2 * c13.x * c22.y +
        c11y2 * c12x2 * c22.x * c13.y -
        3 * c20x2 * c13.x * c13y2 * c22.y +
        3 * c20y2 * c13x2 * c22.x * c13.y +
        c12x2 * c12.y * c13.x * (2 * c20.y * c22.y + c21y2) +
        c11.x * c12.x * c13.x * c13.y * (6 * c20.y * c22.y + 3 * c21y2) +
        c12x3 * c13.y * (-2 * c20.y * c22.y - c21y2) +
        c10.y * c13x3 * (6 * c20.y * c22.y + 3 * c21y2) +
        c11.y * c12.x * c13x2 * (-2 * c20.y * c22.y - c21y2) +
        c11.x * c12.y * c13x2 * (-4 * c20.y * c22.y - 2 * c21y2) +
        c10.x * c13x2 * c13.y * (-6 * c20.y * c22.y - 3 * c21y2) +
        c20.x * c13x2 * c13.y * (6 * c20.y * c22.y + 3 * c21y2) +
        c13x3 * (-2 * c20.y * c21y2 - c20y2 * c22.y - c20.y * (2 * c20.y * c22.y + c21y2)),
      -c10.x * c11.x * c12.y * c13.x * c21.y * c13.y +
        c10.x * c11.y * c12.x * c13.x * c21.y * c13.y +
        6 * c10.x * c11.y * c21.x * c12.y * c13.x * c13.y -
        6 * c10.y * c11.x * c12.x * c13.x * c21.y * c13.y -
        c10.y * c11.x * c21.x * c12.y * c13.x * c13.y +
        c10.y * c11.y * c12.x * c21.x * c13.x * c13.y -
        c11.x * c11.y * c12.x * c21.x * c12.y * c13.y +
        c11.x * c11.y * c12.x * c12.y * c13.x * c21.y +
        c11.x * c20.x * c12.y * c13.x * c21.y * c13.y +
        6 * c11.x * c12.x * c20.y * c13.x * c21.y * c13.y +
        c11.x * c20.y * c21.x * c12.y * c13.x * c13.y -
        c20.x * c11.y * c12.x * c13.x * c21.y * c13.y -
        6 * c20.x * c11.y * c21.x * c12.y * c13.x * c13.y -
        c11.y * c12.x * c20.y * c21.x * c13.x * c13.y -
        6 * c10.x * c20.x * c21.x * c13y3 -
        2 * c10.x * c21.x * c12y3 * c13.x +
        6 * c10.y * c20.y * c13x3 * c21.y +
        2 * c20.x * c21.x * c12y3 * c13.x +
        2 * c10.y * c12x3 * c21.y * c13.y -
        2 * c12x3 * c20.y * c21.y * c13.y -
        6 * c10.x * c10.y * c21.x * c13.x * c13y2 +
        3 * c10.x * c11.x * c12.x * c21.y * c13y2 -
        2 * c10.x * c11.x * c21.x * c12.y * c13y2 -
        4 * c10.x * c11.y * c12.x * c21.x * c13y2 +
        3 * c10.y * c11.x * c12.x * c21.x * c13y2 +
        6 * c10.x * c10.y * c13x2 * c21.y * c13.y +
        6 * c10.x * c20.x * c13.x * c21.y * c13y2 -
        3 * c10.x * c11.y * c12.y * c13x2 * c21.y +
        2 * c10.x * c12.x * c21.x * c12y2 * c13.y +
        2 * c10.x * c12.x * c12y2 * c13.x * c21.y +
        6 * c10.x * c20.y * c21.x * c13.x * c13y2 +
        4 * c10.y * c11.x * c12.y * c13x2 * c21.y +
        6 * c10.y * c20.x * c21.x * c13.x * c13y2 +
        2 * c10.y * c11.y * c12.x * c13x2 * c21.y -
        3 * c10.y * c11.y * c21.x * c12.y * c13x2 +
        2 * c10.y * c12.x * c21.x * c12y2 * c13.x -
        3 * c11.x * c20.x * c12.x * c21.y * c13y2 +
        2 * c11.x * c20.x * c21.x * c12.y * c13y2 +
        c11.x * c11.y * c21.x * c12y2 * c13.x -
        3 * c11.x * c12.x * c20.y * c21.x * c13y2 +
        4 * c20.x * c11.y * c12.x * c21.x * c13y2 -
        6 * c10.x * c20.y * c13x2 * c21.y * c13.y -
        2 * c10.x * c12x2 * c12.y * c21.y * c13.y -
        6 * c10.y * c20.x * c13x2 * c21.y * c13.y -
        6 * c10.y * c20.y * c21.x * c13x2 * c13.y -
        2 * c10.y * c12x2 * c21.x * c12.y * c13.y -
        2 * c10.y * c12x2 * c12.y * c13.x * c21.y -
        c11.x * c11.y * c12x2 * c21.y * c13.y -
        4 * c11.x * c20.y * c12.y * c13x2 * c21.y -
        2 * c11.x * c11y2 * c21.x * c13.x * c13.y +
        3 * c20.x * c11.y * c12.y * c13x2 * c21.y -
        2 * c20.x * c12.x * c21.x * c12y2 * c13.y -
        2 * c20.x * c12.x * c12y2 * c13.x * c21.y -
        6 * c20.x * c20.y * c21.x * c13.x * c13y2 -
        2 * c11.y * c12.x * c20.y * c13x2 * c21.y +
        3 * c11.y * c20.y * c21.x * c12.y * c13x2 -
        2 * c12.x * c20.y * c21.x * c12y2 * c13.x -
        c11y2 * c12.x * c21.x * c12.y * c13.x +
        6 * c20.x * c20.y * c13x2 * c21.y * c13.y +
        2 * c20.x * c12x2 * c12.y * c21.y * c13.y +
        2 * c11x2 * c11.y * c13.x * c21.y * c13.y +
        c11x2 * c12.x * c12.y * c21.y * c13.y +
        2 * c12x2 * c20.y * c21.x * c12.y * c13.y +
        2 * c12x2 * c20.y * c12.y * c13.x * c21.y +
        3 * c10x2 * c21.x * c13y3 -
        3 * c10y2 * c13x3 * c21.y +
        3 * c20x2 * c21.x * c13y3 +
        c11y3 * c21.x * c13x2 -
        c11x3 * c21.y * c13y2 -
        3 * c20y2 * c13x3 * c21.y -
        c11.x * c11y2 * c13x2 * c21.y +
        c11x2 * c11.y * c21.x * c13y2 -
        3 * c10x2 * c13.x * c21.y * c13y2 +
        3 * c10y2 * c21.x * c13x2 * c13.y -
        c11x2 * c12y2 * c13.x * c21.y +
        c11y2 * c12x2 * c21.x * c13.y -
        3 * c20x2 * c13.x * c21.y * c13y2 +
        3 * c20y2 * c21.x * c13x2 * c13.y,
      c10.x * c10.y * c11.x * c12.y * c13.x * c13.y -
        c10.x * c10.y * c11.y * c12.x * c13.x * c13.y +
        c10.x * c11.x * c11.y * c12.x * c12.y * c13.y -
        c10.y * c11.x * c11.y * c12.x * c12.y * c13.x -
        c10.x * c11.x * c20.y * c12.y * c13.x * c13.y +
        6 * c10.x * c20.x * c11.y * c12.y * c13.x * c13.y +
        c10.x * c11.y * c12.x * c20.y * c13.x * c13.y -
        c10.y * c11.x * c20.x * c12.y * c13.x * c13.y -
        6 * c10.y * c11.x * c12.x * c20.y * c13.x * c13.y +
        c10.y * c20.x * c11.y * c12.x * c13.x * c13.y -
        c11.x * c20.x * c11.y * c12.x * c12.y * c13.y +
        c11.x * c11.y * c12.x * c20.y * c12.y * c13.x +
        c11.x * c20.x * c20.y * c12.y * c13.x * c13.y -
        c20.x * c11.y * c12.x * c20.y * c13.x * c13.y -
        2 * c10.x * c20.x * c12y3 * c13.x +
        2 * c10.y * c12x3 * c20.y * c13.y -
        3 * c10.x * c10.y * c11.x * c12.x * c13y2 -
        6 * c10.x * c10.y * c20.x * c13.x * c13y2 +
        3 * c10.x * c10.y * c11.y * c12.y * c13x2 -
        2 * c10.x * c10.y * c12.x * c12y2 * c13.x -
        2 * c10.x * c11.x * c20.x * c12.y * c13y2 -
        c10.x * c11.x * c11.y * c12y2 * c13.x +
        3 * c10.x * c11.x * c12.x * c20.y * c13y2 -
        4 * c10.x * c20.x * c11.y * c12.x * c13y2 +
        3 * c10.y * c11.x * c20.x * c12.x * c13y2 +
        6 * c10.x * c10.y * c20.y * c13x2 * c13.y +
        2 * c10.x * c10.y * c12x2 * c12.y * c13.y +
        2 * c10.x * c11.x * c11y2 * c13.x * c13.y +
        2 * c10.x * c20.x * c12.x * c12y2 * c13.y +
        6 * c10.x * c20.x * c20.y * c13.x * c13y2 -
        3 * c10.x * c11.y * c20.y * c12.y * c13x2 +
        2 * c10.x * c12.x * c20.y * c12y2 * c13.x +
        c10.x * c11y2 * c12.x * c12.y * c13.x +
        c10.y * c11.x * c11.y * c12x2 * c13.y +
        4 * c10.y * c11.x * c20.y * c12.y * c13x2 -
        3 * c10.y * c20.x * c11.y * c12.y * c13x2 +
        2 * c10.y * c20.x * c12.x * c12y2 * c13.x +
        2 * c10.y * c11.y * c12.x * c20.y * c13x2 +
        c11.x * c20.x * c11.y * c12y2 * c13.x -
        3 * c11.x * c20.x * c12.x * c20.y * c13y2 -
        2 * c10.x * c12x2 * c20.y * c12.y * c13.y -
        6 * c10.y * c20.x * c20.y * c13x2 * c13.y -
        2 * c10.y * c20.x * c12x2 * c12.y * c13.y -
        2 * c10.y * c11x2 * c11.y * c13.x * c13.y -
        c10.y * c11x2 * c12.x * c12.y * c13.y -
        2 * c10.y * c12x2 * c20.y * c12.y * c13.x -
        2 * c11.x * c20.x * c11y2 * c13.x * c13.y -
        c11.x * c11.y * c12x2 * c20.y * c13.y +
        3 * c20.x * c11.y * c20.y * c12.y * c13x2 -
        2 * c20.x * c12.x * c20.y * c12y2 * c13.x -
        c20.x * c11y2 * c12.x * c12.y * c13.x +
        3 * c10y2 * c11.x * c12.x * c13.x * c13.y +
        3 * c11.x * c12.x * c20y2 * c13.x * c13.y +
        2 * c20.x * c12x2 * c20.y * c12.y * c13.y -
        3 * c10x2 * c11.y * c12.y * c13.x * c13.y +
        2 * c11x2 * c11.y * c20.y * c13.x * c13.y +
        c11x2 * c12.x * c20.y * c12.y * c13.y -
        3 * c20x2 * c11.y * c12.y * c13.x * c13.y -
        c10x3 * c13y3 +
        c10y3 * c13x3 +
        c20x3 * c13y3 -
        c20y3 * c13x3 -
        3 * c10.x * c20x2 * c13y3 -
        c10.x * c11y3 * c13x2 +
        3 * c10x2 * c20.x * c13y3 +
        c10.y * c11x3 * c13y2 +
        3 * c10.y * c20y2 * c13x3 +
        c20.x * c11y3 * c13x2 +
        c10x2 * c12y3 * c13.x -
        3 * c10y2 * c20.y * c13x3 -
        c10y2 * c12x3 * c13.y +
        c20x2 * c12y3 * c13.x -
        c11x3 * c20.y * c13y2 -
        c12x3 * c20y2 * c13.y -
        c10.x * c11x2 * c11.y * c13y2 +
        c10.y * c11.x * c11y2 * c13x2 -
        3 * c10.x * c10y2 * c13x2 * c13.y -
        c10.x * c11y2 * c12x2 * c13.y +
        c10.y * c11x2 * c12y2 * c13.x -
        c11.x * c11y2 * c20.y * c13x2 +
        3 * c10x2 * c10.y * c13.x * c13y2 +
        c10x2 * c11.x * c12.y * c13y2 +
        2 * c10x2 * c11.y * c12.x * c13y2 -
        2 * c10y2 * c11.x * c12.y * c13x2 -
        c10y2 * c11.y * c12.x * c13x2 +
        c11x2 * c20.x * c11.y * c13y2 -
        3 * c10.x * c20y2 * c13x2 * c13.y +
        3 * c10.y * c20x2 * c13.x * c13y2 +
        c11.x * c20x2 * c12.y * c13y2 -
        2 * c11.x * c20y2 * c12.y * c13x2 +
        c20.x * c11y2 * c12x2 * c13.y -
        c11.y * c12.x * c20y2 * c13x2 -
        c10x2 * c12.x * c12y2 * c13.y -
        3 * c10x2 * c20.y * c13.x * c13y2 +
        3 * c10y2 * c20.x * c13x2 * c13.y +
        c10y2 * c12x2 * c12.y * c13.x -
        c11x2 * c20.y * c12y2 * c13.x +
        2 * c20x2 * c11.y * c12.x * c13y2 +
        3 * c20.x * c20y2 * c13x2 * c13.y -
        c20x2 * c12.x * c12y2 * c13.y -
        3 * c20x2 * c20.y * c13.x * c13y2 +
        c12x2 * c20y2 * c12.y * c13.x,
    );
    const roots = poly.getRootsInInterval(0, 1);
    for (const s of roots) {
      const xRoots = new Polynomial(c13.x, c12.x, c11.x, c10.x - c20.x - s * c21.x - s * s * c22.x - s * s * s * c23.x).getRoots();
      const yRoots = new Polynomial(c13.y, c12.y, c11.y, c10.y - c20.y - s * c21.y - s * s * c22.y - s * s * s * c23.y).getRoots();
      if (xRoots.length > 0 && yRoots.length > 0) {
        const TOLERANCE = 1e-4;
        // eslint-disable-next-line no-labels
        checkRoots: for (const xRoot of xRoots) {
          if (xRoot >= 0 && xRoot <= 1) {
            for (const yRoot of yRoots) {
              if (Math.abs(xRoot - yRoot) < TOLERANCE) {
                result.points.push(c23.multiply(s * s * s).add(c22.multiply(s * s).add(c21.multiply(s).add(c20))));
                // eslint-disable-next-line no-labels
                break checkRoots;
              }
            }
          }
        }
      }
    }
    return result;
  }

  static intersectBezier3Circle(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D, c: Vector2D, r: number) {
    return Intersection.intersectBezier3Ellipse(p1, p2, p3, p4, c, r, r);
  }

  static intersectBezier3Ellipse(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D, ec: Vector2D, rx: number, ry: number) {
    let a;
    let b;
    let c;
    let d;
    const result = new Intersection();
    a = p1.multiply(-1);
    b = p2.multiply(3);
    c = p3.multiply(-3);
    d = a.add(b.add(c.add(p4)));
    const c3 = new Vector2D(d.x, d.y);
    a = p1.multiply(3);
    b = p2.multiply(-6);
    c = p3.multiply(3);
    d = a.add(b.add(c));
    const c2 = new Vector2D(d.x, d.y);
    a = p1.multiply(-3);
    b = p2.multiply(3);
    c = a.add(b);
    const c1 = new Vector2D(c.x, c.y);
    const c0 = new Vector2D(p1.x, p1.y);
    const rxrx = rx * rx;
    const ryry = ry * ry;
    const poly = new Polynomial(
      c3.x * c3.x * ryry + c3.y * c3.y * rxrx,
      2 * (c3.x * c2.x * ryry + c3.y * c2.y * rxrx),
      2 * (c3.x * c1.x * ryry + c3.y * c1.y * rxrx) + c2.x * c2.x * ryry + c2.y * c2.y * rxrx,
      2 * c3.x * ryry * (c0.x - ec.x) + 2 * c3.y * rxrx * (c0.y - ec.y) + 2 * (c2.x * c1.x * ryry + c2.y * c1.y * rxrx),
      2 * c2.x * ryry * (c0.x - ec.x) + 2 * c2.y * rxrx * (c0.y - ec.y) + c1.x * c1.x * ryry + c1.y * c1.y * rxrx,
      2 * c1.x * ryry * (c0.x - ec.x) + 2 * c1.y * rxrx * (c0.y - ec.y),
      c0.x * c0.x * ryry - 2 * c0.y * ec.y * rxrx - 2 * c0.x * ec.x * ryry + c0.y * c0.y * rxrx + ec.x * ec.x * ryry + ec.y * ec.y * rxrx - rxrx * ryry,
    );
    const roots = poly.getRootsInInterval(0, 1);
    for (const t of roots) {
      result.points.push(c3.multiply(t * t * t).add(c2.multiply(t * t).add(c1.multiply(t).add(c0))));
    }
    return result;
  }

  static intersectBezier3Line(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D, a1: Vector2D, a2: Vector2D) {
    let a;
    let b;
    let c;
    let d;
    const min = a1.min(a2);
    const max = a1.max(a2);
    const result = new Intersection();
    a = p1.multiply(-1);
    b = p2.multiply(3);
    c = p3.multiply(-3);
    d = a.add(b.add(c.add(p4)));
    const c3 = new Vector2D(d.x, d.y);
    a = p1.multiply(3);
    b = p2.multiply(-6);
    c = p3.multiply(3);
    d = a.add(b.add(c));
    const c2 = new Vector2D(d.x, d.y);
    a = p1.multiply(-3);
    b = p2.multiply(3);
    c = a.add(b);
    const c1 = new Vector2D(c.x, c.y);
    const c0 = new Vector2D(p1.x, p1.y);
    const n = new Vector2D(a1.y - a2.y, a2.x - a1.x);
    const cl = a1.x * a2.y - a2.x * a1.y;
    const roots = new Polynomial(n.dot(c3), n.dot(c2), n.dot(c1), n.dot(c0) + cl).getRoots();
    for (const t of roots) {
      if (t >= 0 && t <= 1) {
        const p5 = p1.lerp(p2, t);
        const p6 = p2.lerp(p3, t);
        const p7 = p3.lerp(p4, t);
        const p8 = p5.lerp(p6, t);
        const p9 = p6.lerp(p7, t);
        const p10 = p8.lerp(p9, t);
        if (a1.x === a2.x) {
          if (min.y <= p10.y && p10.y <= max.y) {
            result.appendPoint(p10);
          }
        } else if (a1.y === a2.y) {
          if (min.x <= p10.x && p10.x <= max.x) {
            result.appendPoint(p10);
          }
        } else if (p10.gte(min) && p10.lte(max)) {
          result.appendPoint(p10);
        }
      }
    }
    return result;
  }

  static intersectBezier3Polygon(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D, points: Vector2D[]) {
    const result = new Intersection();
    const { length } = points;
    for (let i = 0; i < length; i++) {
      const a1 = points[i];
      const a2 = points[(i + 1) % length];
      const inter = Intersection.intersectBezier3Line(p1, p2, p3, p4, a1, a2);
      result.appendPoints(inter.points);
    }
    return result;
  }

  static intersectBezier3Rectangle(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D, r1: Vector2D, r2: Vector2D) {
    const min = r1.min(r2);
    const max = r1.max(r2);
    const topRight = new Vector2D(max.x, min.y);
    const bottomLeft = new Vector2D(min.x, max.y);
    const inter1 = Intersection.intersectBezier3Line(p1, p2, p3, p4, min, topRight);
    const inter2 = Intersection.intersectBezier3Line(p1, p2, p3, p4, topRight, max);
    const inter3 = Intersection.intersectBezier3Line(p1, p2, p3, p4, max, bottomLeft);
    const inter4 = Intersection.intersectBezier3Line(p1, p2, p3, p4, bottomLeft, min);
    const result = new Intersection();
    result.appendPoints(inter1.points);
    result.appendPoints(inter2.points);
    result.appendPoints(inter3.points);
    result.appendPoints(inter4.points);
    return result;
  }

  static intersectCircleCircle(c1: Vector2D, r1: number, c2: Vector2D, r2: number) {
    let result;
    const rMax = r1 + r2;
    const rMin = Math.abs(r1 - r2);
    const cDist = c1.distanceFrom(c2);
    if (cDist > rMax) {
      result = new Intersection('Outside');
    } else if (cDist < rMin) {
      result = new Intersection('Inside');
    } else {
      result = new Intersection('Intersection');
      const a = (r1 * r1 - r2 * r2 + cDist * cDist) / (2 * cDist);
      const h = Math.sqrt(r1 * r1 - a * a);
      const p = c1.lerp(c2, a / cDist);
      const b = h / cDist;
      result.points.push(new Vector2D(p.x - b * (c2.y - c1.y), p.y + b * (c2.x - c1.x)));
      result.points.push(new Vector2D(p.x + b * (c2.y - c1.y), p.y - b * (c2.x - c1.x)));
    }
    return result;
  }

  static intersectCircleEllipse(cc: Vector2D, r: number, ec: Vector2D, rx: number, ry: number) {
    return Intersection.intersectEllipseEllipse(cc, r, r, ec, rx, ry);
  }

  static intersectCircleLine(c: Vector2D, r: number, a1: Vector2D, a2: Vector2D) {
    let result;
    const a = (a2.x - a1.x) * (a2.x - a1.x) + (a2.y - a1.y) * (a2.y - a1.y);
    const b = 2 * ((a2.x - a1.x) * (a1.x - c.x) + (a2.y - a1.y) * (a1.y - c.y));
    const cc = c.x * c.x + c.y * c.y + a1.x * a1.x + a1.y * a1.y - 2 * (c.x * a1.x + c.y * a1.y) - r * r;
    const deter = b * b - 4 * a * cc;
    if (deter < 0) {
      result = new Intersection('Outside');
    } else if (deter === 0) {
      result = new Intersection('Tangent');
    } else {
      const e = Math.sqrt(deter);
      const u1 = (-b + e) / (2 * a);
      const u2 = (-b - e) / (2 * a);
      if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {
        if ((u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)) {
          result = new Intersection('Outside');
        } else {
          result = new Intersection('Inside');
        }
      } else {
        result = new Intersection('Intersection');
        if (u1 >= 0 && u1 <= 1) {
          result.points.push(a1.lerp(a2, u1));
        }
        if (u2 >= 0 && u2 <= 1) {
          result.points.push(a1.lerp(a2, u2));
        }
      }
    }
    return result;
  }

  static intersectCirclePolygon(c: Vector2D, r: number, points: Vector2D[]) {
    const result = new Intersection();
    const { length } = points;
    let inter;
    for (let i = 0; i < length; i++) {
      const a1 = points[i];
      const a2 = points[(i + 1) % length];
      inter = Intersection.intersectCircleLine(c, r, a1, a2);
      result.appendPoints(inter.points);
    }
    if (result.points.length > 0) {
      result.status = 'Intersection';
    } else {
      result.status = inter.status;
    }
    return result;
  }

  static intersectCircleRectangle(c: Vector2D, r: number, r1: Vector2D, r2: Vector2D) {
    const min = r1.min(r2);
    const max = r1.max(r2);
    const topRight = new Vector2D(max.x, min.y);
    const bottomLeft = new Vector2D(min.x, max.y);
    const inter1 = Intersection.intersectCircleLine(c, r, min, topRight);
    const inter2 = Intersection.intersectCircleLine(c, r, topRight, max);
    const inter3 = Intersection.intersectCircleLine(c, r, max, bottomLeft);
    const inter4 = Intersection.intersectCircleLine(c, r, bottomLeft, min);
    const result = new Intersection();
    result.appendPoints(inter1.points);
    result.appendPoints(inter2.points);
    result.appendPoints(inter3.points);
    result.appendPoints(inter4.points);
    if (result.points.length > 0) {
      result.status = 'Intersection';
    } else {
      result.status = inter1.status;
    }
    return result;
  }

  static intersectEllipseEllipse(c1: Vector2D, rx1: number, ry1: number, c2: Vector2D, rx2: number, ry2: number) {
    const a = [
      ry1 * ry1,
      0,
      rx1 * rx1,
      -2 * ry1 * ry1 * c1.x,
      -2 * rx1 * rx1 * c1.y,
      ry1 * ry1 * c1.x * c1.x + rx1 * rx1 * c1.y * c1.y - rx1 * rx1 * ry1 * ry1,
    ];
    const b = [
      ry2 * ry2,
      0,
      rx2 * rx2,
      -2 * ry2 * ry2 * c2.x,
      -2 * rx2 * rx2 * c2.y,
      ry2 * ry2 * c2.x * c2.x + rx2 * rx2 * c2.y * c2.y - rx2 * rx2 * ry2 * ry2,
    ];
    const yPoly = Intersection.bezout(a, b);
    const yRoots = yPoly.getRoots();
    const epsilon = 1e-3;
    const norm0 = (a[0] * a[0] + 2 * a[1] * a[1] + a[2] * a[2]) * epsilon;
    const norm1 = (b[0] * b[0] + 2 * b[1] * b[1] + b[2] * b[2]) * epsilon;
    const result = new Intersection();
    for (const yRoot of yRoots) {
      const xPoly = new Polynomial(a[0], a[3] + yRoot * a[1], a[5] + yRoot * (a[4] + yRoot * a[2]));
      const xRoots = xPoly.getRoots();
      for (const xRoot of xRoots) {
        let test = (a[0] * xRoot + a[1] * yRoot + a[3]) * xRoot + (a[2] * yRoot + a[4]) * yRoot + a[5];
        if (Math.abs(test) < norm0) {
          test = (b[0] * xRoot + b[1] * yRoot + b[3]) * xRoot + (b[2] * yRoot + b[4]) * yRoot + b[5];
          if (Math.abs(test) < norm1) {
            result.appendPoint(new Vector2D(xRoot, yRoot));
          }
        }
      }
    }
    return result;
  }

  static intersectEllipseLine(c: Vector2D, rx: number, ry: number, a1: Vector2D, a2: Vector2D) {
    let result;
    const origin = new Vector2D(a1.x, a1.y);
    const dir = Vector2D.fromPoints(a1, a2);
    const center = new Vector2D(c.x, c.y);
    const diff = origin.subtract(center);
    const mDir = new Vector2D(dir.x / (rx * rx), dir.y / (ry * ry));
    const mDiff = new Vector2D(diff.x / (rx * rx), diff.y / (ry * ry));
    const a = dir.dot(mDir);
    const b = dir.dot(mDiff);
    const cdot = diff.dot(mDiff) - 1.0;
    const d = b * b - a * cdot;
    if (d < 0) {
      result = new Intersection('Outside');
    } else if (d > 0) {
      const root = Math.sqrt(d);
      const tA = (-b - root) / a;
      const tB = (-b + root) / a;
      if ((tA < 0 || tA > 1) && (tB < 0 || tB > 1)) {
        if ((tA < 0 && tB < 0) || (tA > 1 && tB > 1)) {
          result = new Intersection('Outside');
        } else {
          result = new Intersection('Inside');
        }
      } else {
        result = new Intersection('Intersection');
        if (tA >= 0 && tA <= 1) {
          result.appendPoint(a1.lerp(a2, tA));
        }
        if (tB >= 0 && tB <= 1) {
          result.appendPoint(a1.lerp(a2, tB));
        }
      }
    } else {
      const t = -b / a;
      if (t >= 0 && t <= 1) {
        result = new Intersection('Intersection');
        result.appendPoint(a1.lerp(a2, t));
      } else {
        result = new Intersection('Outside');
      }
    }
    return result;
  }

  static intersectEllipsePolygon(c: Vector2D, rx: number, ry: number, points: Vector2D[]) {
    const result = new Intersection();
    const { length } = points;
    for (let i = 0; i < length; i++) {
      const b1 = points[i];
      const b2 = points[(i + 1) % length];
      const inter = Intersection.intersectEllipseLine(c, rx, ry, b1, b2);
      result.appendPoints(inter.points);
    }
    return result;
  }

  static intersectEllipseRectangle(c: Vector2D, rx: number, ry: number, r1: Vector2D, r2: Vector2D) {
    const min = r1.min(r2);
    const max = r1.max(r2);
    const topRight = new Vector2D(max.x, min.y);
    const bottomLeft = new Vector2D(min.x, max.y);
    const inter1 = Intersection.intersectEllipseLine(c, rx, ry, min, topRight);
    const inter2 = Intersection.intersectEllipseLine(c, rx, ry, topRight, max);
    const inter3 = Intersection.intersectEllipseLine(c, rx, ry, max, bottomLeft);
    const inter4 = Intersection.intersectEllipseLine(c, rx, ry, bottomLeft, min);
    const result = new Intersection();
    result.appendPoints(inter1.points);
    result.appendPoints(inter2.points);
    result.appendPoints(inter3.points);
    result.appendPoints(inter4.points);
    return result;
  }

  static intersectLineLine(a1: Vector2D, a2: Vector2D, b1: Vector2D, b2: Vector2D) {
    let result;
    const uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    const ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    const uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
    if (uB !== 0) {
      const ua = uaT / uB;
      const ub = ubT / uB;
      if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        result = new Intersection('Intersection');
        result.points.push(new Vector2D(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
      } else {
        result = new Intersection();
      }
    } else if (uaT === 0 || ubT === 0) {
      result = new Intersection('Coincident');
    } else {
      result = new Intersection('Parallel');
    }
    return result;
  }

  static intersectLinePolygon(a1: Vector2D, a2: Vector2D, points: Vector2D[]) {
    const result = new Intersection();
    const { length } = points;
    for (let i = 0; i < length; i++) {
      const b1 = points[i];
      const b2 = points[(i + 1) % length];
      const inter = Intersection.intersectLineLine(a1, a2, b1, b2);
      result.appendPoints(inter.points);
    }
    return result;
  }

  static intersectLineRectangle(a1: Vector2D, a2: Vector2D, r1: Vector2D, r2: Vector2D) {
    const min = r1.min(r2);
    const max = r1.max(r2);
    const topRight = new Vector2D(max.x, min.y);
    const bottomLeft = new Vector2D(min.x, max.y);
    const inter1 = Intersection.intersectLineLine(min, topRight, a1, a2);
    const inter2 = Intersection.intersectLineLine(topRight, max, a1, a2);
    const inter3 = Intersection.intersectLineLine(max, bottomLeft, a1, a2);
    const inter4 = Intersection.intersectLineLine(bottomLeft, min, a1, a2);
    const result = new Intersection();
    result.appendPoints(inter1.points);
    result.appendPoints(inter2.points);
    result.appendPoints(inter3.points);
    result.appendPoints(inter4.points);
    return result;
  }

  static intersectPolygonPolygon(points1: Vector2D[], points2: Vector2D[]) {
    const result = new Intersection();
    const { length } = points1;
    for (let i = 0; i < length; i++) {
      const a1 = points1[i];
      const a2 = points1[(i + 1) % length];
      const inter = Intersection.intersectLinePolygon(a1, a2, points2);
      result.appendPoints(inter.points);
    }
    return result;
  }

  static intersectPolygonRectangle(points: Vector2D[], r1: Vector2D, r2: Vector2D) {
    const min = r1.min(r2);
    const max = r1.max(r2);
    const topRight = new Vector2D(max.x, min.y);
    const bottomLeft = new Vector2D(min.x, max.y);
    const inter1 = Intersection.intersectLinePolygon(min, topRight, points);
    const inter2 = Intersection.intersectLinePolygon(topRight, max, points);
    const inter3 = Intersection.intersectLinePolygon(max, bottomLeft, points);
    const inter4 = Intersection.intersectLinePolygon(bottomLeft, min, points);
    const result = new Intersection();
    result.appendPoints(inter1.points);
    result.appendPoints(inter2.points);
    result.appendPoints(inter3.points);
    result.appendPoints(inter4.points);
    return result;
  }

  static intersectRayRay(a1: Vector2D, a2: Vector2D, b1: Vector2D, b2: Vector2D) {
    let result;
    const uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    const ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    const uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
    if (uB !== 0) {
      const ua = uaT / uB;
      result = new Intersection('Intersection');
      result.points.push(new Vector2D(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
    } else if (uaT === 0 || ubT === 0) {
      result = new Intersection('Coincident');
    } else {
      result = new Intersection('Parallel');
    }
    return result;
  }

  static intersectRectangleRectangle(a1: Vector2D, a2: Vector2D, b1: Vector2D, b2: Vector2D) {
    const min = a1.min(a2);
    const max = a1.max(a2);
    const topRight = new Vector2D(max.x, min.y);
    const bottomLeft = new Vector2D(min.x, max.y);
    const inter1 = Intersection.intersectLineRectangle(min, topRight, b1, b2);
    const inter2 = Intersection.intersectLineRectangle(topRight, max, b1, b2);
    const inter3 = Intersection.intersectLineRectangle(max, bottomLeft, b1, b2);
    const inter4 = Intersection.intersectLineRectangle(bottomLeft, min, b1, b2);
    const result = new Intersection();
    result.appendPoints(inter1.points);
    result.appendPoints(inter2.points);
    result.appendPoints(inter3.points);
    result.appendPoints(inter4.points);
    return result;
  }

  static bezout(e1: number[], e2: number[]) {
    const AB = e1[0] * e2[1] - e2[0] * e1[1];
    const AC = e1[0] * e2[2] - e2[0] * e1[2];
    const AD = e1[0] * e2[3] - e2[0] * e1[3];
    const AE = e1[0] * e2[4] - e2[0] * e1[4];
    const AF = e1[0] * e2[5] - e2[0] * e1[5];
    const BC = e1[1] * e2[2] - e2[1] * e1[2];
    const BE = e1[1] * e2[4] - e2[1] * e1[4];
    const BF = e1[1] * e2[5] - e2[1] * e1[5];
    const CD = e1[2] * e2[3] - e2[2] * e1[3];
    const DE = e1[3] * e2[4] - e2[3] * e1[4];
    const DF = e1[3] * e2[5] - e2[3] * e1[5];
    const BFPLUSDE = BF + DE;
    const BEMINUSCD = BE - CD;
    return new Polynomial(
      AB * BC - AC * AC,
      AB * BEMINUSCD + AD * BC - 2 * AC * AE,
      AB * BFPLUSDE + AD * BEMINUSCD - AE * AE - 2 * AC * AF,
      AB * DF + AD * BFPLUSDE - 2 * AE * AF,
      AD * DF - AF * AF,
    );
  }

  static intersectShape(path: Path, shape: IShape) {
    const result = new Intersection();
    for (const segment of path.segments) {
      const inter = Intersection.intersectShapes(segment, shape);
      result.appendPoints(inter.points);
    }
    return result;
  }
}
