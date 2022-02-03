export class Polynomial {
  static TOLERANCE = 1e-6;

  static ACCURACY = 6;

  coefs: any[] = [];

  constructor(...coefs: number[]) {
    for (let i = coefs.length - 1; i >= 0; i--) {
      this.coefs.push(coefs[i]);
    }
  }

  eval(x: number) {
    let result = 0;
    for (let i = this.coefs.length - 1; i >= 0; i--) {
      result = result * x + this.coefs[i];
    }
    return result;
  }

  multiply(that: Polynomial) {
    const result = new Polynomial();
    let i;
    for (i = 0; i <= this.getDegree() + that.getDegree(); i++) {
      result.coefs.push(0);
    }
    for (i = 0; i <= this.getDegree(); i++) {
      for (let j = 0; j <= that.getDegree(); j++) {
        result.coefs[i + j] += this.coefs[i] * that.coefs[j];
      }
    }
    return result;
  }

  divide_scalar(scalar: number) {
    for (let i = 0; i < this.coefs.length; i++) {
      this.coefs[i] /= scalar;
    }
  }

  simplify() {
    for (let i = this.getDegree(); i >= 0; i--) {
      if (Math.abs(this.coefs[i]) <= Polynomial.TOLERANCE) {
        this.coefs.pop();
      } else {
        break;
      }
    }
  }

  bisection(min: number, max: number) {
    let minValue = this.eval(min);
    let maxValue = this.eval(max);
    let result;
    if (Math.abs(minValue) <= Polynomial.TOLERANCE) {
      result = min;
    } else if (Math.abs(maxValue) <= Polynomial.TOLERANCE) {
      result = max;
    } else if (minValue * maxValue <= 0) {
      const tmp1 = Math.log(max - min);
      const tmp2 = Math.log(10) * Polynomial.ACCURACY;
      const iters = Math.ceil((tmp1 + tmp2) / Math.log(2));
      for (let i = 0; i < iters; i++) {
        result = 0.5 * (min + max);
        const value = this.eval(result);
        if (Math.abs(value) <= Polynomial.TOLERANCE) {
          break;
        }
        if (value * minValue < 0) {
          max = result;
          maxValue = value;
        } else {
          min = result;
          minValue = value;
        }
      }
    }
    return result;
  }

  toString() {
    const coefs = [];
    const signs = [];
    let i;
    for (i = this.coefs.length - 1; i >= 0; i--) {
      let value = this.coefs[i];
      if (value !== 0) {
        const sign = value < 0 ? ' - ' : ' + ';
        value = Math.abs(value);
        if (i > 0 && value === 1) {
          value = 'x';
        } else {
          value += 'x';
        }
        if (i > 1) {
          value += `^${i}`;
        }
        signs.push(sign);
        coefs.push(value);
      }
    }
    signs[0] = signs[0] === ' + ' ? '' : '-';
    let result = '';
    for (i = 0; i < coefs.length; i++) {
      result += signs[i] + coefs[i];
    }
    return result;
  }

  getDegree() {
    return this.coefs.length - 1;
  }

  getDerivative() {
    const derivative = new Polynomial();
    for (let i = 1; i < this.coefs.length; i++) {
      derivative.coefs.push(i * this.coefs[i]);
    }
    return derivative;
  }

  getRoots() {
    let result: number[];
    this.simplify();
    switch (this.getDegree()) {
      case 0:
        result = [];
        break;
      case 1:
        result = this.getLinearRoot();
        break;
      case 2:
        result = this.getQuadraticRoots();
        break;
      case 3:
        result = this.getCubicRoots();
        break;
      case 4:
        result = this.getQuarticRoots();
        break;
      default:
        result = [];
    }
    return result;
  }

  getRootsInInterval(min: number, max: number) {
    const roots = [];
    let i;
    let root;
    if (this.getDegree() === 1) {
      root = this.bisection(min, max);
      if (root != null) {
        roots.push(root);
      }
    } else {
      const deriv = this.getDerivative();
      const droots = deriv.getRootsInInterval(min, max);
      if (droots.length > 0) {
        root = this.bisection(min, droots[0]);
        if (root != null) {
          roots.push(root);
        }
        for (i = 0; i <= droots.length - 2; i++) {
          root = this.bisection(droots[i], droots[i + 1]);
          if (root != null) {
            roots.push(root);
          }
        }
        root = this.bisection(droots[droots.length - 1], max);
        if (root != null) {
          roots.push(root);
        }
      } else {
        root = this.bisection(min, max);
        if (root != null) {
          roots.push(root);
        }
      }
    }
    return roots;
  }

  getLinearRoot() {
    const result: number[] = [];
    const a = this.coefs[1];
    if (a !== 0) {
      result.push(-this.coefs[0] / a);
    }
    return result;
  }

  getQuadraticRoots() {
    const results: number[] = [];
    if (this.getDegree() === 2) {
      const a = this.coefs[2];
      const b = this.coefs[1] / a;
      const c = this.coefs[0] / a;
      const d = b * b - 4 * c;
      if (d > 0) {
        const e = Math.sqrt(d);
        results.push(0.5 * (-b + e));
        results.push(0.5 * (-b - e));
      } else if (d === 0) {
        results.push(0.5 * -b);
      }
    }
    return results;
  }

  getCubicRoots() {
    const results: number[] = [];
    let disrim;
    if (this.getDegree() === 3) {
      const c3 = this.coefs[3];
      const c2 = this.coefs[2] / c3;
      const c1 = this.coefs[1] / c3;
      const c0 = this.coefs[0] / c3;
      const a = (3 * c1 - c2 * c2) / 3;
      const b = (2 * c2 * c2 * c2 - 9 * c1 * c2 + 27 * c0) / 27;
      const offset = c2 / 3;
      const discrim = (b * b) / 4 + (a * a * a) / 27;
      const halfB = b / 2;
      if (Math.abs(discrim) <= Polynomial.TOLERANCE) {
        disrim = 0;
      }
      let tmp;
      if (discrim > 0) {
        const e = Math.sqrt(discrim);
        let root;
        tmp = -halfB + e;
        if (tmp >= 0) {
          root = tmp ** (1 / 3);
        } else {
          root = -((-tmp) ** (1 / 3));
        }
        tmp = -halfB - e;
        if (tmp >= 0) {
          root += tmp ** (1 / 3);
        } else {
          root -= (-tmp) ** (1 / 3);
        }
        results.push(root - offset);
      } else if (discrim < 0) {
        const distance = Math.sqrt(-a / 3);
        const angle = Math.atan2(Math.sqrt(-discrim), -halfB) / 3;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const sqrt3 = Math.sqrt(3);
        results.push(2 * distance * cos - offset);
        results.push(-distance * (cos + sqrt3 * sin) - offset);
        results.push(-distance * (cos - sqrt3 * sin) - offset);
      } else {
        if (halfB >= 0) {
          tmp = -(halfB ** (1 / 3));
        } else {
          tmp = (-halfB) ** (1 / 3);
        }
        results.push(2 * tmp - offset);
        results.push(-tmp - offset);
      }
    }
    return results;
  }

  getQuarticRoots() {
    const results: number[] = [];
    if (this.getDegree() === 4) {
      const c4 = this.coefs[4];
      const c3 = this.coefs[3] / c4;
      const c2 = this.coefs[2] / c4;
      const c1 = this.coefs[1] / c4;
      const c0 = this.coefs[0] / c4;
      const resolveRoots = new Polynomial(1, -c2, c3 * c1 - 4 * c0, -c3 * c3 * c0 + 4 * c2 * c0 - c1 * c1).getCubicRoots();
      const y = resolveRoots[0];
      let discrim = (c3 * c3) / 4 - c2 + y;
      if (Math.abs(discrim) <= Polynomial.TOLERANCE) {
        discrim = 0;
      }

      let t2;
      let d: number;
      if (discrim > 0) {
        const e = Math.sqrt(discrim);
        const t1 = (3 * c3 * c3) / 4 - e * e - 2 * c2;
        t2 = (4 * c3 * c2 - 8 * c1 - c3 * c3 * c3) / (4 * e);
        let plus = t1 + t2;
        let minus = t1 - t2;
        let f: number;
        if (Math.abs(plus) <= Polynomial.TOLERANCE) {
          plus = 0;
        }
        if (Math.abs(minus) <= Polynomial.TOLERANCE) {
          minus = 0;
        }
        if (plus >= 0) {
          f = Math.sqrt(plus);
          results.push(-c3 / 4 + (e + f) / 2);
          results.push(-c3 / 4 + (e - f) / 2);
        }
        if (minus >= 0) {
          f = Math.sqrt(minus);
          results.push(-c3 / 4 + (f - e) / 2);
          results.push(-c3 / 4 - (f + e) / 2);
        }
      } else if (discrim >= 0) {
        t2 = y * y - 4 * c0;
        if (t2 >= -Polynomial.TOLERANCE) {
          if (t2 < 0) {
            t2 = 0;
          }
          t2 = 2 * Math.sqrt(t2);
          const t1 = (3 * c3 * c3) / 4 - 2 * c2;
          if (t1 + t2 >= Polynomial.TOLERANCE) {
            d = Math.sqrt(t1 + t2);
            results.push(-c3 / 4 + d / 2);
            results.push(-c3 / 4 - d / 2);
          }
          if (t1 - t2 >= Polynomial.TOLERANCE) {
            d = Math.sqrt(t1 - t2);
            results.push(-c3 / 4 + d / 2);
            results.push(-c3 / 4 - d / 2);
          }
        }
      }
    }
    return results;
  }
}
