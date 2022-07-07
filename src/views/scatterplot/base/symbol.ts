import {
  line as d3line,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
  symbolWye,
  SymbolType,
  bisector as d3bisector,
  CurveFactory,
  symbolCircle,
} from 'd3v7';

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
export enum ERenderMode {
  NORMAL,
  SELECTED,
  HOVER,
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
  curve: CurveFactory | null; // d3 curve factory (e.g. curveCatmullRom)
}

declare type IPoint = [number, number];

export class SymbolUtils {
  static readonly d3SymbolCircle: SymbolType = symbolCircle;

  static readonly d3SymbolCross: SymbolType = symbolCross;

  static readonly d3SymbolDiamond: SymbolType = symbolDiamond;

  static readonly d3SymbolSquare: SymbolType = symbolSquare;

  static readonly d3SymbolStar: SymbolType = symbolStar;

  static readonly d3SymbolTriangle: SymbolType = symbolTriangle;

  static readonly d3SymbolWye: SymbolType = symbolWye;

  /**
   * generic wrapper around d3 symbols for rendering
   * @param symbol the symbol to render
   * @param fillStyle the style applied
   * @param size the size of the symbol
   * @returns {function(CanvasRenderingContext2D): undefined}
   */
  static d3Symbol(symbol: SymbolType = SymbolUtils.d3SymbolCircle, fillStyle = 'steelblue', size = 5): ISymbol<any> {
    return (ctx: CanvasRenderingContext2D) => {
      // before
      ctx.beginPath();
      return {
        // during
        render: (x: number, y: number) => {
          ctx.translate(x, y);
          symbol.draw(ctx, size);
          ctx.translate(-x, -y);
        },
        // after
        done: () => {
          ctx.closePath();
          ctx.fillStyle = fillStyle;
          ctx.fill();
        },
      };
    };
  }

  static readonly defaultStyleOptions: Readonly<IStyleSymbolOptions> = {
    fillColor: 'steelblue',
    selectedColor: 'red',
    hoverColor: 'orange',
  };

  static readonly defaultOptions: Readonly<ISymbolOptions> = { symbolSize: 20, ...SymbolUtils.defaultStyleOptions };

  /**
   * circle symbol renderer (way faster than d3Symbol(d3symbolCircle)
   * @param fillStyle
   * @param size
   * @returns {function(CanvasRenderingContext2D): undefined}
   */

  static circleSymbol(params?: Partial<ISymbolOptions>): ISymbol<any> {
    const options: ISymbolOptions = { ...SymbolUtils.defaultOptions, ...(params || {}) };

    const r = Math.sqrt(options.symbolSize / Math.PI);
    const tau = 2 * Math.PI;

    const styles = {
      [ERenderMode.NORMAL]: options.fillColor,
      [ERenderMode.HOVER]: options.hoverColor,
      [ERenderMode.SELECTED]: options.selectedColor,
    };

    return (ctx: CanvasRenderingContext2D, mode: ERenderMode) => {
      // before
      ctx.beginPath();
      return {
        // during
        render: (x: number, y: number) => {
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, tau);
        },
        // after
        done: () => {
          ctx.closePath();
          ctx.fillStyle = styles[mode];
          ctx.fill();
        },
      };
    };
  }

  static squareSymbol(params?: Partial<ISymbolOptions>): ISymbol<any> {
    const options: ISymbolOptions = { ...SymbolUtils.defaultOptions, ...(params || {}) };

    const length = Math.sqrt(options.symbolSize);

    const styles = {
      [ERenderMode.NORMAL]: options.fillColor,
      [ERenderMode.HOVER]: options.hoverColor,
      [ERenderMode.SELECTED]: options.selectedColor,
    };

    return (ctx: CanvasRenderingContext2D, mode: ERenderMode) => {
      ctx.beginPath();
      return {
        render: (x: number, y: number) => {
          ctx.rect(x - length / 2, y - length / 2, length, length);
        },
        done: () => {
          ctx.closePath();
          ctx.fillStyle = styles[mode];
          ctx.fill();
        },
      };
    };
  }

  static diamondSymbol(params?: Partial<ISymbolOptions>): ISymbol<any> {
    const options: ISymbolOptions = { ...SymbolUtils.defaultOptions, ...(params || {}) };

    const tan30 = Math.sqrt(1 / 3);
    const tan30Double = tan30 * 2;
    const moveYAxis = Math.sqrt(options.symbolSize / tan30Double);
    const moveXAxis = moveYAxis * tan30;

    const styles = {
      [ERenderMode.NORMAL]: options.fillColor,
      [ERenderMode.HOVER]: options.hoverColor,
      [ERenderMode.SELECTED]: options.selectedColor,
    };

    return (ctx: CanvasRenderingContext2D, mode: ERenderMode) => {
      ctx.beginPath();
      return {
        render: (x: number, y: number) => {
          ctx.moveTo(x, y - moveYAxis);
          ctx.lineTo(x - moveXAxis, y);
          ctx.lineTo(x, y + moveYAxis);
          ctx.lineTo(x + moveXAxis, y);
          ctx.closePath();
        },
        done: () => {
          ctx.closePath();
          ctx.fillStyle = styles[mode];
          ctx.fill();
        },
      };
    };
  }

  static readonly defaultLineOptions: Readonly<ILineSymbolOptions> = {
    lineWidth: 1,
    curve: null,
    ...SymbolUtils.defaultStyleOptions,
  };

  static lineRenderer(params?: Partial<ILineSymbolOptions>) {
    const options: ILineSymbolOptions = { ...SymbolUtils.defaultLineOptions, ...(params || {}) };

    const styles = {
      [ERenderMode.NORMAL]: options.fillColor,
      [ERenderMode.HOVER]: options.hoverColor,
      [ERenderMode.SELECTED]: options.selectedColor,
    };

    const coordinateBisector = d3bisector((d: IPoint) => d[0]).right;

    return (ctx: CanvasRenderingContext2D, mode: ERenderMode) => {
      const line = d3line().context(ctx);

      if (options.curve) {
        line.curve(options.curve);
      }

      const data: IPoint[] = [];
      return {
        render: (x: number, y: number) => {
          const index = coordinateBisector(data, x);
          data.splice(index, 0, [x, y]);
        },
        done: () => {
          if (data.length === 0) {
            return;
          }
          ctx.beginPath();
          line(data);
          ctx.strokeStyle = styles[mode];
          ctx.stroke();
        },
      };
    };
  }

  /**
   * creates an parses a renderer
   * @param symbol
   * @internal
   * @returns {any}
   */
  static createRenderer<T>(symbol: ISymbol<T> | string): ISymbol<T> {
    if (typeof symbol === 'string') {
      switch (<string>symbol.charAt(0)) {
        case '.':
          return SymbolUtils.squareSymbol();
        case 'b':
          return SymbolUtils.diamondSymbol();
        case 'l':
          return SymbolUtils.lineRenderer();
        default:
          return SymbolUtils.circleSymbol();
      }
    }
    return <ISymbol<T>>symbol;
  }
}
