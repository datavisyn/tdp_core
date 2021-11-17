
import {IShape} from '../2D/IShape';
import {Vector2D} from '../2D/Vector2D';

// tslint:disable:no-use-before-declare
// Disabled the rule, because the classes below reference each other in a way that it is impossible to find a successful order.

/**
 * The intersection is based on Kevin Lindsey
 * http://www.kevlindev.com/gui/index.htm
 *
 * copyright 2002 Kevin Lindsey
 */
export interface IRect extends IShape {
  x: number;
  y: number;
  cx: number;
  cy: number;
  y2: number;
  x2: number;
  xy: Vector2D;
  x2y2: Vector2D;
}
