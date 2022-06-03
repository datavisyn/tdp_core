import * as React from 'react';
import d3 from 'd3';
import { uniqueId } from 'lodash';
import { PlotlyComponent } from '../Plot';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { createStripTraces } from './utils';
import { useAsync } from '../../hooks';
import { CloseButton } from '../sidebar/CloseButton';
import { useVisResize } from '../useVisResize';
export function StripVis({ config, columns, selectionCallback = () => null, selectedMap = {}, scales, showCloseButton = false, closeButtonCallback = () => null, }) {
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createStripTraces, [columns, config, selectedMap, scales]);
    const id = React.useMemo(() => uniqueId('StripVis'), []);
    const plotlyDivRef = React.useRef(null);
    useVisResize(id, plotlyDivRef);
    const layout = React.useMemo(() => {
        if (!traces) {
            return null;
        }
        const innerLayout = {
            showlegend: true,
            legend: {
                // @ts-ignore
                itemclick: false,
                itemdoubleclick: false,
            },
            font: {
                family: 'Roboto, sans-serif',
            },
            autosize: true,
            grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
            shapes: [],
            violingap: 0,
            dragmode: 'select',
        };
        return beautifyLayout(traces, innerLayout);
    }, [traces]);
    return (React.createElement("div", { ref: plotlyDivRef, className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: `position-relative d-flex justify-content-center align-items-center flex-grow-1 ${traceStatus === 'pending' ? 'tdp-busy-partial-overlay' : ''}` },
            traceStatus === 'success' && (traces === null || traces === void 0 ? void 0 : traces.plots.length) > 0 ? (React.createElement(PlotlyComponent, { divId: `plotlyDiv${id}`, data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onSelected: (sel) => {
                    selectionCallback(sel ? sel.points.map((d) => d.id) : []);
                }, 
                // plotly redraws everything on updates, so you need to reappend title and
                onUpdate: () => {
                    for (const p of traces.plots) {
                        d3.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);
                        d3.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
                    }
                } })) : traceStatus !== 'pending' ? (React.createElement(InvalidCols, { headerMessage: traces === null || traces === void 0 ? void 0 : traces.errorMessageHeader, bodyMessage: (traceError === null || traceError === void 0 ? void 0 : traceError.message) || (traces === null || traces === void 0 ? void 0 : traces.errorMessage) })) : null,
            showCloseButton ? React.createElement(CloseButton, { closeCallback: closeButtonCallback }) : null)));
}
//# sourceMappingURL=StripVis.js.map