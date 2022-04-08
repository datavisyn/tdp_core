import { CurveFactory, SymbolType } from 'd3v7';
/**
 * a symbol renderer renderes a bunch of data points using `render` at the end `done` will be called
 */
export interface ISymbolRenderer<T> {
    render(x: number, y: number, d: T): void;
    done(): void;
}
/**
 * rendering mode for different kind of renderings
 */
export declare enum ERenderMode {
    NORMAL = 0,
    SELECTED = 1,
    HOVER = 2
}
export interface IRenderInfo {
    /**
     * current zoomLevel
     */
    zoomLevel: number;
}
/**
 * factory for creating symbols renderers
 */
export interface ISymbol<T> {
    /**
     * @param ctx the context to use
     * @param mode the current render mode
     * @param config additional config information
     * @returns a symbol renderer
     */
    (ctx: CanvasRenderingContext2D, mode: ERenderMode, renderInfo: IRenderInfo): ISymbolRenderer<T>;
}
export interface IStyleSymbolOptions {
    fillColor: string;
    hoverColor: string;
    selectedColor: string;
}
export interface ISymbolOptions extends IStyleSymbolOptions {
    symbolSize: number;
}
export interface ILineSymbolOptions extends IStyleSymbolOptions {
    lineWidth: number;
    curve: CurveFactory | null;
}
export declare class SymbolUtils {
    static readonly d3SymbolCircle: SymbolType;
    static readonly d3SymbolCross: SymbolType;
    static readonly d3SymbolDiamond: SymbolType;
    static readonly d3SymbolSquare: SymbolType;
    static readonly d3SymbolStar: SymbolType;
    static readonly d3SymbolTriangle: SymbolType;
    static readonly d3SymbolWye: SymbolType;
    /**
     * generic wrapper around d3 symbols for rendering
     * @param symbol the symbol to render
     * @param fillStyle the style applied
     * @param size the size of the symbol
     * @returns {function(CanvasRenderingContext2D): undefined}
     */
    static d3Symbol(symbol?: SymbolType, fillStyle?: string, size?: number): ISymbol<any>;
    static readonly defaultStyleOptions: Readonly<IStyleSymbolOptions>;
    static readonly defaultOptions: Readonly<ISymbolOptions>;
    /**
     * circle symbol renderer (way faster than d3Symbol(d3symbolCircle)
     * @param fillStyle
     * @param size
     * @returns {function(CanvasRenderingContext2D): undefined}
     */
    static circleSymbol(params?: Partial<ISymbolOptions>): ISymbol<any>;
    static squareSymbol(params?: Partial<ISymbolOptions>): ISymbol<any>;
    static diamondSymbol(params?: Partial<ISymbolOptions>): ISymbol<any>;
    static readonly defaultLineOptions: Readonly<ILineSymbolOptions>;
    static lineRenderer(params?: Partial<ILineSymbolOptions>): (ctx: CanvasRenderingContext2D, mode: ERenderMode) => {
        render: (x: number, y: number) => void;
        done: () => void;
    };
    /**
     * creates an parses a renderer
     * @param symbol
     * @internal
     * @returns {any}
     */
    static createRenderer<T>(symbol: ISymbol<T> | string): ISymbol<T>;
}
//# sourceMappingURL=symbol.d.ts.map