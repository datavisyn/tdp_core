/** *******************************************************
 * Copyright (c) 2022 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 ******************************************************** */
import { ERenderMode } from './symbol';
export class LollipopSymbol {
    static defaultOptions() {
        return {
            strokeColor: '#AAA',
            fillColor: '#000',
            hoverColor: '#0A0',
            selectedColor: '#A00',
            symbolSize: 20,
        };
    }
    static lollipopSymbol(params = {}) {
        const options = Object.assign(LollipopSymbol.defaultOptions(), params || {});
        const r = Math.sqrt(options.symbolSize / Math.PI);
        const tau = 2 * Math.PI;
        const styles = {
            [ERenderMode.NORMAL]: options.fillColor,
            [ERenderMode.HOVER]: options.hoverColor,
            [ERenderMode.SELECTED]: options.selectedColor,
        };
        return (ctx, mode) => {
            const style = styles[mode];
            // before
            const pointsx = [];
            const pointsy = [];
            const colors = [];
            ctx.beginPath();
            return {
                // during
                render: (x, y, item) => {
                    pointsx.push(x);
                    pointsy.push(y);
                    ctx.moveTo(x, y + r);
                    ctx.lineTo(x, ctx.canvas.height - r);
                    // paint dot
                    if (typeof style === 'function') {
                        colors.push(style(item));
                    }
                },
                // after
                done: () => {
                    ctx.closePath();
                    ctx.strokeStyle = options.strokeColor;
                    ctx.stroke();
                    if (typeof style !== 'function') {
                        // render dots manually on top of the lines
                        ctx.beginPath();
                        for (let i = pointsx.length - 1; i >= 0; --i) {
                            const x = pointsx[i];
                            const y = pointsy[i];
                            ctx.moveTo(x + r, y);
                            ctx.arc(x, y, r, 0, tau);
                        }
                        ctx.closePath();
                        ctx.fillStyle = style;
                        ctx.fill();
                        return;
                    }
                    for (let i = 0; i <= pointsx.length; ++i) {
                        ctx.beginPath();
                        const x = pointsx[i];
                        const y = pointsy[i];
                        ctx.moveTo(x + r, y);
                        ctx.arc(x, y, r, 0, tau);
                        ctx.closePath();
                        ctx.fillStyle = colors[i];
                        ctx.fill();
                    }
                    // reset
                    pointsx.length = 0;
                    pointsy.length = 0;
                    colors.length = 0;
                },
            };
        };
    }
    static circleSymbol(params = {}) {
        const options = Object.assign(LollipopSymbol.defaultOptions(), params || {});
        const r = Math.sqrt(options.symbolSize / Math.PI);
        const tau = 2 * Math.PI;
        const styles = {
            [ERenderMode.NORMAL]: options.fillColor,
            [ERenderMode.HOVER]: options.hoverColor,
            [ERenderMode.SELECTED]: options.selectedColor,
        };
        return (ctx, mode) => {
            const style = styles[mode];
            // before
            ctx.beginPath();
            let last = typeof style === 'function' ? null : style;
            return {
                // during
                render: (x, y, item) => {
                    if (typeof style === 'function') {
                        const current = style(item);
                        if (current !== last && last !== null) {
                            ctx.closePath();
                            ctx.fillStyle = last;
                            ctx.fill();
                            ctx.beginPath();
                        }
                        last = current;
                    }
                    ctx.moveTo(x + r, y);
                    ctx.arc(x, y, r, 0, tau);
                },
                // after
                done: () => {
                    ctx.closePath();
                    ctx.fillStyle = last;
                    ctx.fill();
                },
            };
        };
    }
}
//# sourceMappingURL=LollipopSymbol.js.map