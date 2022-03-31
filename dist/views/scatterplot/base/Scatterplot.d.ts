import { AScatterplot, IScale, IScatterplotOptions, IScalesObject, ERenderReason, INormalizedScalesObject } from './AScatterplot';
/**
 * a class for rendering a scatterplot in a canvas
 */
export declare class Scatterplot<T> extends AScatterplot<T, IScatterplotOptions<T>> {
    protected readonly normalized2pixel: IScalesObject;
    private readonly renderer;
    constructor(data: T[], root: HTMLElement, props?: Partial<IScatterplotOptions<T>>);
    transformedScales(): IScalesObject;
    protected transformedNormalized2PixelScales(): INormalizedScalesObject;
    render(reason?: ERenderReason, transformDelta?: {
        x: number;
        y: number;
        kx: number;
        ky: number;
    }): void;
    protected renderAxes(xscale: IScale, yscale: IScale): void;
    private renderTree;
    static create<T>(data: T[], canvas: HTMLCanvasElement, options: IScatterplotOptions<T>): Scatterplot<T>;
}
//# sourceMappingURL=Scatterplot.d.ts.map