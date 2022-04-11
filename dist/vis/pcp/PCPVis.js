import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useMemo, useEffect } from 'react';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { createPCPTraces } from './utils';
import { useAsync } from '../../hooks';
import { PCPVisSidebar } from './PCPVisSidebar';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function PCPVis({ config, extensions, columns, setConfig, selected = {}, hideSidebar = false }) {
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createPCPTraces, [columns, config, selected]);
    const id = React.useMemo(() => uniqueId('PCPVis'), []);
    useEffect(() => {
        if (hideSidebar) {
            return;
        }
        const menu = document.getElementById(`generalVisBurgerMenu${id}`);
        menu.addEventListener('hidden.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
        });
        menu.addEventListener('shown.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
        });
    }, [hideSidebar, id]);
    const layout = React.useMemo(() => {
        return traces
            ? {
                showlegend: true,
                autosize: true,
                grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
                shapes: [],
                violingap: 0,
            }
            : null;
    }, [traces]);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: `position-relative d-flex justify-content-center align-items-center flex-grow-1 ${traceStatus === 'pending' ? 'tdp-busy-partial-overlay' : ''}` },
            mergedExtensions.prePlot,
            traceStatus === 'success' && (traces === null || traces === void 0 ? void 0 : traces.plots.length) > 0 ? (React.createElement(PlotlyComponent, { divId: `plotlyDiv${id}`, data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' } })) : traceStatus !== 'pending' ? (React.createElement(InvalidCols, { headerMessage: traces === null || traces === void 0 ? void 0 : traces.errorMessageHeader, bodyMessage: (traceError === null || traceError === void 0 ? void 0 : traceError.message) || (traces === null || traces === void 0 ? void 0 : traces.errorMessage) })) : null,
            mergedExtensions.postPlot),
        !hideSidebar ? (React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light overflow-auto mt-2" },
            React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#generalVisBurgerMenu${id}`, "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
                React.createElement("i", { className: "fas fa-bars" })),
            React.createElement("div", { className: "collapse show collapse-horizontal", id: `generalVisBurgerMenu${id}` },
                React.createElement(PCPVisSidebar, { config: config, extensions: extensions, columns: columns, setConfig: setConfig })))) : null));
}
//# sourceMappingURL=PCPVis.js.map