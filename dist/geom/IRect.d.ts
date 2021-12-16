import { IShape } from '../2D/IShape';
import { Vector2D } from '../2D/Vector2D';
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
