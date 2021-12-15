export declare class Polynomial {
    static TOLERANCE: number;
    static ACCURACY: number;
    coefs: any[];
    constructor(...coefs: number[]);
    eval(x: number): number;
    multiply(that: Polynomial): Polynomial;
    divide_scalar(scalar: number): void;
    simplify(): void;
    bisection(min: number, max: number): any;
    toString(): string;
    getDegree(): number;
    getDerivative(): Polynomial;
    getRoots(): number[];
    getRootsInInterval(min: number, max: number): any[];
    getLinearRoot(): number[];
    getQuadraticRoots(): number[];
    getCubicRoots(): number[];
    getQuarticRoots(): number[];
}
