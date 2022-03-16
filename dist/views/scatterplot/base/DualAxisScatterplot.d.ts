import { ISymbol } from './symbol';
import { AScatterplot, IScale, IFormatOptions, IScatterplotOptions, IScalesObject, IAccessor, ERenderReason, INormalizedScalesObject } from './AScatterplot';
export interface IDualAxisScalesObject extends IScalesObject {
    y2: IScale;
}
export interface IDualAxisNormalizedScalesObject extends INormalizedScalesObject {
    n2pY2: IScale;
}
export interface IDualAxisFormatOptions extends IFormatOptions {
    /**
     * d3 format used for formatting the y2 axis
     */
    y2: string | ((n: number) => string) | null;
}
/**
 * scatterplot options
 */
export interface IDualAxisScatterplotOptions<T, U> extends IScatterplotOptions<T> {
    /**
     * x2 accessor of the secondary data
     * default: d.x
     * @param d
     */
    x2: IAccessor<U>;
    /**
     * y2 accessor of the secondary data
     * default: d.y
     * @param d
     */
    y2: IAccessor<U>;
    /**
     * y axis label
     * default: x
     */
    y2label: string;
    /**
     * d3 y2 scale
     * default: linear scale with a domain from 0...100
     */
    y2scale: IScale;
    /**
     * instead of specifying the scale just the y limits
     */
    y2lim: [number, number];
    /**
     * renderer used to render secondary dataset
     * default: steelblue circle
     */
    symbol2: ISymbol<U> | string;
    format: IDualAxisFormatOptions;
}
/**
 * a class for rendering a double y-axis scatterplot in a canvas
 */
export declare class DualAxisScatterplot<T, U> extends AScatterplot<T, IDualAxisScatterplotOptions<T, U>> {
    protected readonly normalized2pixel: IDualAxisScalesObject;
    private secondaryTree;
    private readonly renderer;
    private readonly secondaryRenderer;
    constructor(data: T[], secondaryData: U[], root: HTMLElement, props?: Partial<IDualAxisScatterplotOptions<T, U>>);
    private setSecondaryData;
    set secondaryData(secondaryData: U[]);
    transformedScales(): IDualAxisScalesObject;
    protected transformedNormalized2PixelScales(): IDualAxisNormalizedScalesObject;
    render(reason?: ERenderReason, transformDelta?: {
        x: number;
        y: number;
        kx: number;
        ky: number;
    }): void;
    protected renderAxes(xscale: IScale, yscale: IScale, y2scale: IScale): void;
    private renderTree;
    static dualAxis<T, U>(data: T[], secondaryData: U[], canvas: HTMLCanvasElement, options: IDualAxisScatterplotOptions<T, U>): DualAxisScatterplot<T, U>;
}
//# sourceMappingURL=DualAxisScatterplot.d.ts.map