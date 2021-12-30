export declare class Vector2D {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    add(that: Vector2D): Vector2D;
    addEquals(that: Vector2D): this;
    scalarAdd(scalar: number): Vector2D;
    scalarAddEquals(scalar: number): this;
    subtract(that: Vector2D): Vector2D;
    subtractEquals(that: Vector2D): this;
    scalarSubtract(scalar: number): Vector2D;
    scalarSubtractEquals(scalar: number): this;
    multiply(scalar: number): Vector2D;
    multiplyEquals(scalar: number): this;
    divide(scalar: number): Vector2D;
    divideEquals(scalar: number): this;
    eq(that: Vector2D): boolean;
    lt(that: Vector2D): boolean;
    lte(that: Vector2D): boolean;
    gt(that: Vector2D): boolean;
    gte(that: Vector2D): boolean;
    lerp(that: Vector2D, t: number): Vector2D;
    distanceFrom(that: Vector2D): number;
    min(that: Vector2D): Vector2D;
    max(that: Vector2D): Vector2D;
    toString(): string;
    setXY(x: number, y: number): void;
    setFromPoint(that: Vector2D): void;
    swap(that: Vector2D): void;
    length(): number;
    dot(that: Vector2D): number;
    cross(that: Vector2D): number;
    unit(): Vector2D;
    unitEquals(): this;
    perp(): Vector2D;
    static fromPoints(p1: {
        x: number;
        y: number;
    }, p2: {
        x: number;
        y: number;
    }): Vector2D;
    static vec(x: number, y: number): Vector2D;
    static vec(vec: {
        x: number;
        y: number;
    }): Vector2D;
    static vec2(x: number, y: number): Vector2D;
}
