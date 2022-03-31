import { line as d3line, symbolCircle, symbolCross, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye, bisector as d3bisector, } from 'd3v4';
/**
 * rendering mode for different kind of renderings
 */
export var ERenderMode;
(function (ERenderMode) {
    ERenderMode[ERenderMode["NORMAL"] = 0] = "NORMAL";
    ERenderMode[ERenderMode["SELECTED"] = 1] = "SELECTED";
    ERenderMode[ERenderMode["HOVER"] = 2] = "HOVER";
})(ERenderMode || (ERenderMode = {}));
export class SymbolUtils {
    /**
     * generic wrapper around d3 symbols for rendering
     * @param symbol the symbol to render
     * @param fillStyle the style applied
     * @param size the size of the symbol
     * @returns {function(CanvasRenderingContext2D): undefined}
     */
    static d3Symbol(symbol = SymbolUtils.d3SymbolCircle, fillStyle = 'steelblue', size = 5) {
        return (ctx) => {
            // before
            ctx.beginPath();
            return {
                // during
                render: (x, y) => {
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
    /**
     * circle symbol renderer (way faster than d3Symbol(d3symbolCircle)
     * @param fillStyle
     * @param size
     * @returns {function(CanvasRenderingContext2D): undefined}
     */
    static circleSymbol(params) {
        const options = { ...SymbolUtils.defaultOptions, ...(params || {}) };
        const r = Math.sqrt(options.symbolSize / Math.PI);
        const tau = 2 * Math.PI;
        const styles = {
            [ERenderMode.NORMAL]: options.fillColor,
            [ERenderMode.HOVER]: options.hoverColor,
            [ERenderMode.SELECTED]: options.selectedColor,
        };
        return (ctx, mode) => {
            // before
            ctx.beginPath();
            return {
                // during
                render: (x, y) => {
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
    static squareSymbol(params) {
        const options = { ...SymbolUtils.defaultOptions, ...(params || {}) };
        const length = Math.sqrt(options.symbolSize);
        const styles = {
            [ERenderMode.NORMAL]: options.fillColor,
            [ERenderMode.HOVER]: options.hoverColor,
            [ERenderMode.SELECTED]: options.selectedColor,
        };
        return (ctx, mode) => {
            ctx.beginPath();
            return {
                render: (x, y) => {
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
    static diamondSymbol(params) {
        const options = { ...SymbolUtils.defaultOptions, ...(params || {}) };
        const tan30 = Math.sqrt(1 / 3);
        const tan30Double = tan30 * 2;
        const moveYAxis = Math.sqrt(options.symbolSize / tan30Double);
        const moveXAxis = moveYAxis * tan30;
        const styles = {
            [ERenderMode.NORMAL]: options.fillColor,
            [ERenderMode.HOVER]: options.hoverColor,
            [ERenderMode.SELECTED]: options.selectedColor,
        };
        return (ctx, mode) => {
            ctx.beginPath();
            return {
                render: (x, y) => {
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
    static lineRenderer(params) {
        const options = { ...SymbolUtils.defaultLineOptions, ...(params || {}) };
        const styles = {
            [ERenderMode.NORMAL]: options.fillColor,
            [ERenderMode.HOVER]: options.hoverColor,
            [ERenderMode.SELECTED]: options.selectedColor,
        };
        const coordinateBisector = d3bisector((d) => d[0]).right;
        return (ctx, mode) => {
            const line = d3line().context(ctx);
            if (options.curve) {
                line.curve(options.curve);
            }
            const data = [];
            return {
                render: (x, y) => {
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
    static createRenderer(symbol) {
        if (typeof symbol === 'string') {
            switch (symbol.charAt(0)) {
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
        return symbol;
    }
}
SymbolUtils.d3SymbolCircle = symbolCircle;
SymbolUtils.d3SymbolCross = symbolCross;
SymbolUtils.d3SymbolDiamond = symbolDiamond;
SymbolUtils.d3SymbolSquare = symbolSquare;
SymbolUtils.d3SymbolStar = symbolStar;
SymbolUtils.d3SymbolTriangle = symbolTriangle;
SymbolUtils.d3SymbolWye = symbolWye;
SymbolUtils.defaultStyleOptions = {
    fillColor: 'steelblue',
    selectedColor: 'red',
    hoverColor: 'orange',
};
SymbolUtils.defaultOptions = { symbolSize: 20, ...SymbolUtils.defaultStyleOptions };
SymbolUtils.defaultLineOptions = {
    lineWidth: 1,
    curve: null,
    ...SymbolUtils.defaultStyleOptions,
};
//# sourceMappingURL=symbol.js.map