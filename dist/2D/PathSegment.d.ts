import { IShape } from './IShape';
import { Vector2D } from './Vector2D';
import { IPath } from './IPath';
import { IIntersectionParam } from './IIntersectionParam';
export interface IPathSegment extends IShape {
    command: string;
    lastPoint: Vector2D;
    previous: IPathSegment;
}
export declare class AbsolutePathSegment implements IPathSegment {
    command: string;
    owner: IPath;
    previous: IPathSegment;
    points: Vector2D[];
    constructor(command: string, params: string[], owner: IPath, previous: IPathSegment);
    toString(): string;
    get lastPoint(): Vector2D;
    asIntersectionParams(): IIntersectionParam;
}
export declare class AbsoluteArcPath extends AbsolutePathSegment {
    rx: number;
    ry: number;
    angle: number;
    arcFlag: number;
    sweepFlag: number;
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    toString(): string;
    asIntersectionParams(): IIntersectionParam;
    get center(): Vector2D;
}
export declare class AbsoluteCurveto2 extends AbsolutePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    get controlPoint(): Vector2D;
    asIntersectionParams(): IIntersectionParam;
}
export declare class AbsoluteCurveto3 extends AbsolutePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    get lastControlPoint(): Vector2D;
    asIntersectionParams(): IIntersectionParam;
}
export declare class AbsoluteHLineto extends AbsolutePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    toString(): string;
}
export declare class AbsoluteLineto extends AbsolutePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    toString(): string;
    asIntersectionParams(): IIntersectionParam;
}
export declare class AbsoluteMoveto extends AbsolutePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    toString(): string;
}
export declare class AbsoluteSmoothCurveto2 extends AbsolutePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    get controlPoint(): any;
    asIntersectionParams(): IIntersectionParam;
}
export declare class AbsoluteSmoothCurveto3 extends AbsolutePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    get firstControlPoint(): any;
    get lastControlPoint(): Vector2D;
    asIntersectionParams(): IIntersectionParam;
}
export declare class RelativePathSegment implements IPathSegment {
    command: string;
    owner: IPath;
    previous: IPathSegment;
    points: Vector2D[];
    constructor(command: string, params: string[], owner: IPath, previous: IPathSegment);
    toString(): string;
    get lastPoint(): Vector2D;
    asIntersectionParams(): IIntersectionParam;
}
export declare class RelativeClosePath extends RelativePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    get lastPoint(): any;
    asIntersectionParams(): IIntersectionParam;
}
export declare class RelativeCurveto2 extends RelativePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    get controlPoint(): Vector2D;
    asIntersectionParams(): IIntersectionParam;
}
export declare class RelativeCurveto3 extends RelativePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    get lastControlPoint(): Vector2D;
    asIntersectionParams(): IIntersectionParam;
}
export declare class RelativeLineto extends RelativePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    toString(): string;
    asIntersectionParams(): IIntersectionParam;
}
export declare class RelativeMoveto extends RelativePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    toString(): string;
}
export declare class RelativeSmoothCurveto2 extends RelativePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    get controlPoint(): any;
    asIntersectionParams(): IIntersectionParam;
}
export declare class RelativeSmoothCurveto3 extends RelativePathSegment {
    constructor(params: string[], owner: IPath, previous: IPathSegment);
    get firstControlPoint(): any;
    get lastControlPoint(): Vector2D;
    asIntersectionParams(): IIntersectionParam;
}
