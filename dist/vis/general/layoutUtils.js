/**
 * Truncate long texts (e.g., to use as axes title)
 * @param text Input text to be truncated
 * @param maxLength Maximum text length (default: 50)
 */
export function truncateText(text, maxLength = 50) {
    return text.length > maxLength ? `${text.substring(0, maxLength)}\u2026` : text;
}
/**
 * Cleans up the layout of a given trace, primarily by positioning potential small multiple plots in a reasonable way
 * @param traces the traces associated with the layout
 * @param layout the current layout to be changed. Typed to any because the plotly types complain.p
 * @returns the changed layout
 */
export function beautifyLayout(traces, layout) {
    const layoutEdit = layout;
    layoutEdit.annotations = [];
    traces.plots.forEach((t, i) => {
        layoutEdit[`xaxis${i > 0 ? i + 1 : ''}`] = {
            automargin: true,
            tickvals: t.xTicks,
            ticktext: t.xTickLabels,
            text: t.xTicks,
            showline: false,
            showspikes: true,
            spikecolor: 'black',
            spikethickness: 2,
            spikedash: 'dash',
            fixedrange: true,
            ticks: 'outside',
            title: {
                standoff: 10,
                text: traces.plots.length > 1 ? truncateText(t.xLabel, 15) : truncateText(t.xLabel, 50),
                font: {
                    family: 'Roboto, sans-serif',
                    size: traces.plots.length > 9 ? 10 : 14,
                    color: '#7f7f7f',
                },
            },
        };
        layoutEdit[`yaxis${i > 0 ? i + 1 : ''}`] = {
            automargin: true,
            tickvals: t.yTicks,
            ticktext: t.yTickLabels,
            text: t.yTicks,
            showline: false,
            showspikes: true,
            spikecolor: 'black',
            spikethickness: 2,
            spikedash: 'dash',
            ticks: 'outside',
            fixedrange: true,
            title: {
                standoff: 10,
                text: traces.plots.length > 1 ? truncateText(t.yLabel, 15) : truncateText(t.yLabel, 50),
                font: {
                    family: 'Roboto, sans-serif',
                    size: traces.plots.length > 9 ? 10 : 14,
                    color: '#7f7f7f',
                },
            },
        };
        layoutEdit.shapes.push({
            type: 'line',
            // @ts-ignore
            xref: `x${i > 0 ? i + 1 : ''} domain`,
            // @ts-ignore
            yref: `y${i > 0 ? i + 1 : ''} domain`,
            x0: 0,
            y0: 1,
            x1: 1,
            y1: 1,
            line: {
                color: 'rgb(238, 238, 238)',
                width: 2,
            },
            opacity: 1,
            row: 2,
            col: 2,
        });
        layoutEdit.shapes.push({
            type: 'line',
            // @ts-ignore
            xref: `x${i > 0 ? i + 1 : ''} domain`,
            // @ts-ignore
            yref: `y${i > 0 ? i + 1 : ''} domain`,
            x0: 0,
            y0: 0,
            x1: 1,
            y1: 0,
            line: {
                color: 'rgb(238, 238, 238)',
                width: 2,
            },
            opacity: 1,
            row: 2,
            col: 2,
        });
        layoutEdit.shapes.push({
            type: 'line',
            // @ts-ignore
            xref: `x${i > 0 ? i + 1 : ''} domain`,
            // @ts-ignore
            yref: `y${i > 0 ? i + 1 : ''} domain`,
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 1,
            line: {
                color: 'rgb(238, 238, 238)',
                width: 2,
            },
            opacity: 1,
            row: 2,
            col: 2,
        });
        layoutEdit.shapes.push({
            type: 'line',
            // @ts-ignore
            xref: `x${i > 0 ? i + 1 : ''} domain`,
            // @ts-ignore
            yref: `y${i > 0 ? i + 1 : ''} domain`,
            x0: 1,
            y0: 0,
            x1: 1,
            y1: 1,
            line: {
                color: 'rgb(238, 238, 238)',
                width: 2,
            },
            opacity: 1,
            row: 2,
            col: 2,
        });
    });
    return layoutEdit;
}
export function resolveColumnValues(columns) {
    return Promise.all(columns.map(async (col) => ({ ...col, resolvedValues: await col.values() })));
}
export async function resolveSingleColumn(column) {
    if (!column) {
        return null;
    }
    return {
        ...column,
        resolvedValues: await column.values(),
    };
}
//# sourceMappingURL=layoutUtils.js.map