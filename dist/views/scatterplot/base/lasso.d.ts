import { ITester } from './quadtree';
export interface ILassoOptions {
    lineWidth: number;
    strokeStyle: string;
    fillStyle: string;
    pointRadius: number;
    dashedLine: {
        dashLength: number;
        gapLength: number;
    };
}
export declare class Lasso {
    private props;
    private line;
    private points;
    private current;
    constructor(options?: Partial<ILassoOptions>);
    start(x: number, y: number): void;
    setCurrent(x: number, y: number): void;
    pushCurrent(): boolean;
    end(x: number, y: number): void;
    clear(): void;
    tester(p2nX: (p: number) => number, p2nY: (p: number) => number, shiftX?: number, shiftY?: number): ITester | null;
    render(ctx: CanvasRenderingContext2D): void;
    static defaultOptions(): Readonly<ILassoOptions>;
}
//# sourceMappingURL=lasso.d.ts.map