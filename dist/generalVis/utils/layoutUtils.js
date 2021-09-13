export function beautifyLayout(traces, layout) {
    traces.plots.forEach((t, i) => {
        layout[`xaxis${i > 0 ? i + 1 : ''}`] = {
            showline: true,
            ticks: 'outside',
            title: {
                standoff: 5,
                text: t.xLabel,
                font: {
                    family: 'Courier New, monospace',
                    size: 14,
                    color: '#7f7f7f'
                }
            },
        };
        layout[`yaxis${i > 0 ? i + 1 : ''}`] = {
            showline: true,
            ticks: 'outside',
            title: {
                text: t.yLabel,
                font: {
                    family: 'Courier New, monospace',
                    size: 14,
                    color: '#7f7f7f'
                }
            },
        };
        layout.shapes.push({
            type: 'line',
            xref: `x${i > 0 ? i + 1 : ''} domain`,
            yref: `y${i > 0 ? i + 1 : ''} domain`,
            x0: 0,
            y0: 1,
            x1: 1,
            y1: 1,
            line: {
                color: 'rgb(238, 238, 238)',
                width: 2
            },
            opacity: 1,
            row: 2,
            col: 2
        });
        layout.shapes.push({
            type: 'line',
            xref: `x${i > 0 ? i + 1 : ''} domain`,
            yref: `y${i > 0 ? i + 1 : ''} domain`,
            x0: 1,
            y0: 0,
            x1: 1,
            y1: 1,
            line: {
                color: 'rgb(238, 238, 238)',
                width: 2
            },
            opacity: 1,
            row: 2,
            col: 2
        });
    });
    return layout;
}
//# sourceMappingURL=layoutUtils.js.map