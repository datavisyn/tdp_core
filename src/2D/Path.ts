import { Token } from './Token';
import { IntersectionParamUtils } from './IIntersectionParam';
import {
  IPathSegment,
  AbsoluteArcPath,
  AbsoluteCurveto3,
  RelativeCurveto3,
  AbsoluteHLineto,
  AbsoluteLineto,
  RelativeLineto,
  AbsoluteMoveto,
  RelativeMoveto,
  AbsoluteCurveto2,
  RelativeCurveto2,
  AbsoluteSmoothCurveto3,
  RelativeSmoothCurveto3,
  AbsoluteSmoothCurveto2,
  RelativeSmoothCurveto2,
  RelativeClosePath,
} from './PathSegment';

export class Path {
  static COMMAND = 0;

  static NUMBER = 1;

  static EOD = 2;

  static PARAMS: { [key: string]: string[] } = {
    A: ['rx', 'ry', 'x-axis-rotation', 'large-arc-flag', 'sweep-flag', 'x', 'y'],
    a: ['rx', 'ry', 'x-axis-rotation', 'large-arc-flag', 'sweep-flag', 'x', 'y'],
    C: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
    c: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
    H: ['x'],
    h: ['x'],
    L: ['x', 'y'],
    l: ['x', 'y'],
    M: ['x', 'y'],
    m: ['x', 'y'],
    Q: ['x1', 'y1', 'x', 'y'],
    q: ['x1', 'y1', 'x', 'y'],
    S: ['x2', 'y2', 'x', 'y'],
    s: ['x2', 'y2', 'x', 'y'],
    T: ['x', 'y'],
    t: ['x', 'y'],
    V: ['y'],
    v: ['y'],
    Z: <string[]>[],
    z: <string[]>[],
  };

  segments: IPathSegment[];

  constructor(path: string) {
    this.segments = null;
    this.parseData(path);
  }

  appendPathSegment(segment: IPathSegment) {
    segment.previous = this.segments[this.segments.length - 1];
    this.segments.push(segment);
  }

  parseData(d: string) {
    const tokens = this.tokenize(d);
    let index = 0;
    let token = tokens[index];
    let mode = 'BOD';
    this.segments = [];
    while (!token.typeis(Path.EOD)) {
      let paramLength;
      const params = [];
      if (mode === 'BOD') {
        if (token.text === 'M' || token.text === 'm') {
          index++;
          paramLength = Path.PARAMS[token.text].length;
          mode = token.text;
        } else {
          throw new Error('Path data must begin with a moveto command');
        }
      } else if (token.typeis(Path.NUMBER)) {
        paramLength = Path.PARAMS[mode].length;
      } else {
        index++;
        paramLength = Path.PARAMS[token.text].length;
        mode = token.text;
      }
      if (index + paramLength < tokens.length) {
        for (let i = index; i < index + paramLength; i++) {
          const n = tokens[i];
          if (n.typeis(Path.NUMBER)) {
            params[params.length] = n.text;
          } else {
            throw new Error(`Parameter type is not a number: ${mode},${n.text}`);
          }
        }
        let segment;
        const { length } = this.segments;
        const previous = length === 0 ? null : this.segments[length - 1];
        switch (mode) {
          case 'A':
            segment = new AbsoluteArcPath(params, this, previous);
            break;
          case 'C':
            segment = new AbsoluteCurveto3(params, this, previous);
            break;
          case 'c':
            segment = new RelativeCurveto3(params, this, previous);
            break;
          case 'H':
            segment = new AbsoluteHLineto(params, this, previous);
            break;
          case 'L':
            segment = new AbsoluteLineto(params, this, previous);
            break;
          case 'l':
            segment = new RelativeLineto(params, this, previous);
            break;
          case 'M':
            segment = new AbsoluteMoveto(params, this, previous);
            break;
          case 'm':
            segment = new RelativeMoveto(params, this, previous);
            break;
          case 'Q':
            segment = new AbsoluteCurveto2(params, this, previous);
            break;
          case 'q':
            segment = new RelativeCurveto2(params, this, previous);
            break;
          case 'S':
            segment = new AbsoluteSmoothCurveto3(params, this, previous);
            break;
          case 's':
            segment = new RelativeSmoothCurveto3(params, this, previous);
            break;
          case 'T':
            segment = new AbsoluteSmoothCurveto2(params, this, previous);
            break;
          case 't':
            segment = new RelativeSmoothCurveto2(params, this, previous);
            break;
          case 'Z':
            segment = new RelativeClosePath(params, this, previous);
            break;
          case 'z':
            segment = new RelativeClosePath(params, this, previous);
            break;
          default:
            throw new Error(`Unsupported segment type: ${mode}`);
        }
        this.segments.push(segment);
        index += paramLength;
        token = tokens[index];
        if (mode === 'M') {
          mode = 'L';
        }
        if (mode === 'm') {
          mode = 'l';
        }
      } else {
        throw new Error('Path data ended before all parameters were found');
      }
    }
  }

  tokenize(d: string) {
    const tokens = [];
    while (d !== '') {
      if (d.match(/^([ \t\r\n,]+)/)) {
        d = d.substr(RegExp.$1.length);
      } else if (d.match(/^([aAcChHlLmMqQsStTvVzZ])/)) {
        tokens[tokens.length] = new Token(Path.COMMAND, RegExp.$1);
        d = d.substr(RegExp.$1.length);
      } else if (d.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) {
        tokens[tokens.length] = new Token(Path.NUMBER, parseFloat(RegExp.$1));
        d = d.substr(RegExp.$1.length);
      } else {
        throw new Error(`Unrecognized segment command: ${d}`);
      }
    }
    tokens[tokens.length] = new Token(Path.EOD, null);
    return tokens;
  }

  asIntersectionParams() {
    return IntersectionParamUtils.createIntersectionParam('Path', []);
  }
}
