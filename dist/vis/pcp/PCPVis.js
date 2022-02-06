import * as React from 'react';
import { AllColumnSelect, VisTypeSelect, WarningMessage } from '../sidebar';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { merge, uniqueId } from 'lodash';
import { createPCPTraces } from './utils';
import { useAsync } from '../../hooks';
const defaultConfig = {};
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null
};
export function PCPVis({ config, optionsConfig, extensions, columns, setConfig, }) {
    const mergedOptionsConfig = React.useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = React.useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createPCPTraces, [columns, config]);
    const id = React.useMemo(() => uniqueId('PCPVis'), []);
    React.useEffect(() => {
        const menu = document.getElementById(`generalVisBurgerMenu${id}`);
        menu.addEventListener('hidden.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${uniqueId}`));
        });
        menu.addEventListener('shown.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${uniqueId}`));
        });
    }, []);
    const layout = React.useMemo(
    // @ts-ignore
    () => {
        return traces ? {
            showlegend: true,
            legend: {
                itemclick: false,
                itemdoubleclick: false
            },
            autosize: true,
            grid: { rows: traces.rows, columns: traces.cols, xgap: .3, pattern: 'independent' },
            shapes: [],
            violingap: 0,
        } : null;
    }, [traces]);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: `position-relative d-flex justify-content-center align-items-center flex-grow-1 ${traceStatus === 'pending' ? 'tdp-busy-partial-overlay' : ''}` },
            mergedExtensions.prePlot,
            traceStatus === 'success' && (traces === null || traces === void 0 ? void 0 : traces.plots.length) > 0 ?
                React.createElement(PlotlyComponent, { divId: `plotlyDiv${id}`, data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' } }) :
                traceStatus !== 'pending' ? React.createElement(InvalidCols, { message: (traceError === null || traceError === void 0 ? void 0 : traceError.message) || (traces === null || traces === void 0 ? void 0 : traces.errorMessage) }) : null,
            mergedExtensions.postPlot),
        React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light overflow-auto" },
            React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#generalVisBurgerMenu${id}`, "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
                React.createElement("i", { className: "fas fa-bars" })),
            React.createElement("div", { className: "collapse show collapse-horizontal", id: `generalVisBurgerMenu${id}` },
                React.createElement("div", { className: "container pb-3", style: { width: '20rem' } },
                    React.createElement(WarningMessage, null),
                    React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
                    React.createElement("hr", null),
                    React.createElement(AllColumnSelect, { callback: (allCols) => {
                            setConfig({ ...config, allColumnsSelected: allCols });
                        }, columns: columns, currentSelected: config.allColumnsSelected || [] }),
                    React.createElement("hr", null),
                    mergedExtensions.preSidebar,
                    mergedExtensions.postSidebar)))));
}
//# sourceMappingURL=PCPVis.js.map