import { IShape } from './IShape';
import { Vector2D } from './Vector2D';
import { IPath } from './IPath';
import { IIntersectionParam, IntersectionParamUtils } from './IIntersectionParam';

export interface IPathSegment extends IShape {
  command: string;
  lastPoint: Vector2D;
  previous: IPathSegment;
}

export class AbsolutePathSegment implements IPathSegment {
  points: Vector2D[] = [];

  constructor(public command: string, params: string[], public owner: IPath, public previous: IPathSegment) {
    let index = 0;
    while (index < params.length) {
      this.points.push(new Vector2D(parseFloat(params[index]), parseFloat(params[index + 1])));
      index += 2;
    }
  }

  toString() {
    const points = this.points.map((v) => v.toString());
    let command = '';
    if (this.previous.command !== this.command) {
      command = this.command;
    }
    return command + points.join(' ');
  }

  get lastPoint() {
    return this.points[this.points.length - 1];
  }

  asIntersectionParams(): IIntersectionParam {
    return null;
  }
}

export class AbsoluteArcPath extends AbsolutePathSegment {
  rx: number;

  ry: number;

  angle: number;

  arcFlag: number;

  sweepFlag: number;

  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('A', params.slice(params.length - 2), owner, previous);
    this.rx = parseFloat(params.shift());
    this.ry = parseFloat(params.shift());
    this.angle = parseFloat(params.shift());
    this.arcFlag = parseFloat(params.shift());
    this.sweepFlag = parseFloat(params.shift());
  }

  toString() {
    let command = '';
    if (this.previous.command !== this.command) {
      command = this.command;
    }
    return command + [this.rx, this.ry, this.angle, this.arcFlag, this.sweepFlag, this.points[0].toString()].join(',');
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Ellipse', [this.center, this.rx, this.ry]);
  }

  get center() {
    const startPoint = this.previous.lastPoint;
    const endPoint = this.points[0];
    let { rx } = this;
    let { ry } = this;
    const angle = (this.angle * Math.PI) / 180;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const TOLERANCE = 1e-6;
    const halfDiff = startPoint.subtract(endPoint).divide(2);
    const x1p = halfDiff.x * c + halfDiff.y * s;
    const y1p = halfDiff.x * -s + halfDiff.y * c;
    const x1px1p = x1p * x1p;
    const y1py1p = y1p * y1p;
    const lambda = x1px1p / (rx * rx) + y1py1p / (ry * ry);
    let factor: number;
    if (lambda > 1) {
      factor = Math.sqrt(lambda);
      rx *= factor;
      ry *= factor;
    }
    const rxrx = rx * rx;
    const ryry = ry * ry;
    const rxy1 = rxrx * y1py1p;
    const ryx1 = ryry * x1px1p;
    factor = (rxrx * ryry - rxy1 - ryx1) / (rxy1 + ryx1);
    if (Math.abs(factor) < TOLERANCE) {
      factor = 0;
    }
    let sq = Math.sqrt(factor);
    if (this.arcFlag === this.sweepFlag) {
      sq = -sq;
    }
    const mid = startPoint.add(endPoint).divide(2);
    const cxp = (sq * rx * y1p) / ry;
    const cyp = (sq * -ry * x1p) / rx;
    return new Vector2D(cxp * c - cyp * s + mid.x, cxp * s + cyp * c + mid.y);
  }
}
export class AbsoluteCurveto2 extends AbsolutePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('Q', params, owner, previous);
  }

  get controlPoint() {
    return this.points[0];
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Bezier2', [this.previous.lastPoint, this.points[0], this.points[1]]);
  }
}
export class AbsoluteCurveto3 extends AbsolutePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('C', params, owner, previous);
  }

  get lastControlPoint() {
    return this.points[1];
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Bezier3', [this.previous.lastPoint, this.points[0], this.points[1], this.points[2]]);
  }
}
export class AbsoluteHLineto extends AbsolutePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('H', [params.pop(), String(previous.lastPoint.y)], owner, previous);
  }

  toString() {
    let command = '';
    if (this.previous.command !== this.command) {
      command = this.command;
    }
    return command + this.points[0].x;
  }
}
export class AbsoluteLineto extends AbsolutePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('L', params, owner, previous);
  }

  toString() {
    let command = '';
    if (this.previous.command !== this.command && this.previous.command !== 'M') {
      command = this.command;
    }
    return command + this.points[0].toString();
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Line', [this.previous.lastPoint, this.points[0]]);
  }
}
export class AbsoluteMoveto extends AbsolutePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('M', params, owner, previous);
  }

  toString() {
    return `M${this.points[0].toString()}`;
  }
}
export class AbsoluteSmoothCurveto2 extends AbsolutePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('T', params, owner, previous);
  }

  get controlPoint() {
    const { lastPoint } = this.previous;
    let point;
    if (this.previous.command.match(/^[QqTt]$/)) {
      const ctrlPoint = (<any>this.previous).controlPoint;
      const diff = ctrlPoint.subtract(lastPoint);
      point = lastPoint.subtract(diff);
    } else {
      point = lastPoint;
    }
    return point;
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Bezier2', [this.previous.lastPoint, this.controlPoint, this.points[0]]);
  }
}
export class AbsoluteSmoothCurveto3 extends AbsolutePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('S', params, owner, previous);
  }

  get firstControlPoint() {
    const { lastPoint } = this.previous;
    let point;
    if (this.previous.command.match(/^[SsCc]$/)) {
      const lastControl = (<any>this.previous).lastControlPoint;
      const diff = lastControl.subtract(lastPoint);
      point = lastPoint.subtract(diff);
    } else {
      point = lastPoint;
    }
    return point;
  }

  get lastControlPoint() {
    return this.points[0];
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Bezier3', [this.previous.lastPoint, this.firstControlPoint, this.points[0], this.points[1]]);
  }
}

export class RelativePathSegment implements IPathSegment {
  points: Vector2D[] = [];

  constructor(public command: string, params: string[], public owner: IPath, public previous: IPathSegment) {
    const lastPoint = this.previous ? this.previous.lastPoint : new Vector2D(0, 0);
    let index = 0;
    while (index < params.length) {
      const handle = new Vector2D(lastPoint.x + parseFloat(params[index]), lastPoint.y + parseFloat(params[index + 1]));
      this.points.push(handle);
      index += 2;
    }
  }

  toString() {
    const points = [];
    let command = '';
    const lastPoint = this.previous ? this.previous.lastPoint : new Vector2D(0, 0);
    if (this.previous == null || this.previous.command !== this.command) {
      command = this.command;
    }
    for (const point of this.points) {
      const diff = point.subtract(lastPoint);
      points.push(diff.toString());
    }
    return command + points.join(' ');
  }

  get lastPoint() {
    return this.points[this.points.length - 1];
  }

  asIntersectionParams(): IIntersectionParam {
    return null;
  }
}

export class RelativeClosePath extends RelativePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('z', params, owner, previous);
  }

  get lastPoint() {
    let current = this.previous;
    let point;
    while (current) {
      if (current.command.match(/^[mMzZ]$/)) {
        point = current.lastPoint;
        break;
      }
      current = current.previous;
    }
    return point;
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Line', [this.previous.lastPoint, this.lastPoint]);
  }
}
export class RelativeCurveto2 extends RelativePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('q', params, owner, previous);
  }

  get controlPoint() {
    return this.points[0];
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Bezier2', [this.previous.lastPoint, this.points[0], this.points[1]]);
  }
}
export class RelativeCurveto3 extends RelativePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('c', params, owner, previous);
  }

  get lastControlPoint() {
    return this.points[1];
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Bezier3', [this.previous.lastPoint, this.points[0], this.points[1], this.points[2]]);
  }
}
export class RelativeLineto extends RelativePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('l', params, owner, previous);
  }

  toString() {
    const lastPoint = this.previous ? this.previous.lastPoint : new Vector2D(0, 0);
    const point = this.points[0].subtract(lastPoint);
    let command = '';
    if (this.previous.command !== this.command && this.previous.command !== 'm') {
      command = this.command;
    }
    return command + point.toString();
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Line', [this.previous.lastPoint, this.points[0]]);
  }
}
export class RelativeMoveto extends RelativePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('m', params, owner, previous);
  }

  toString() {
    return `m${this.points[0].toString()}`;
  }
}
export class RelativeSmoothCurveto2 extends RelativePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('t', params, owner, previous);
  }

  get controlPoint() {
    const { lastPoint } = this.previous;
    let point;
    if (this.previous.command.match(/^[QqTt]$/)) {
      const ctrlPoint = (<any>this.previous).controlPoint;
      const diff = ctrlPoint.subtract(lastPoint);
      point = lastPoint.subtract(diff);
    } else {
      point = lastPoint;
    }
    return point;
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Bezier2', [this.previous.lastPoint, this.controlPoint, this.points[0]]);
  }
}

export class RelativeSmoothCurveto3 extends RelativePathSegment {
  constructor(params: string[], owner: IPath, previous: IPathSegment) {
    super('s', params, owner, previous);
  }

  get firstControlPoint() {
    const { lastPoint } = this.previous;
    let point;
    if (this.previous.command.match(/^[SsCc]$/)) {
      const lastControl = (<any>this.previous).lastControlPoint;
      const diff = lastControl.subtract(lastPoint);
      point = lastPoint.subtract(diff);
    } else {
      point = lastPoint;
    }
    return point;
  }

  get lastControlPoint() {
    return this.points[0];
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Bezier3', [this.previous.lastPoint, this.firstControlPoint, this.points[0], this.points[1]]);
  }
}
