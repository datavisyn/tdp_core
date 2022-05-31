import * as React from 'react';
import d3 from 'd3';
import { merge, uniqueId, difference } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { EBarGroupingType } from '../interfaces';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { useAsync } from '../../hooks';
import { createBarTraces } from './utils';
import { BarVisSidebar } from './BarVisSidebar';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function BarVis({ config, optionsConfig, extensions, columns, setConfig, scales, selectionCallback = () => null, selectedMap = {}, selectedList = [], hideSidebar = false, showCloseButton = false, closeButtonCallback = () => null, }) {
    const mergedExtensions = React.useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createBarTraces, [columns, config, scales]);
    const id = React.useMemo(() => uniqueId('BarVis'), []);
    const plotlyDivRef = React.useRef(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    useEffect(() => {
        const ro = new ResizeObserver(() => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
        });
        if (plotlyDivRef) {
            ro.observe(plotlyDivRef.current);
        }
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
    }, [id, hideSidebar, plotlyDivRef]);
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
            barmode: config.groupType === EBarGroupingType.STACK ? 'stack' : 'group',
        };
        return beautifyLayout(traces, innerLayout);
    }, [traces, config.groupType]);
    // Make sure selected values is right for each plot.
    useEffect(() => {
        let selectedFlag = false;
        const allSelected = [];
        traces === null || traces === void 0 ? void 0 : traces.plots.forEach((plot) => {
            const tracePoints = plot.data.customdata;
            const selectedArr = [];
            tracePoints.forEach((trace, index) => {
                if (trace.length === 0 || selectedList.length < trace.length) {
                    return;
                }
                for (const i of trace) {
                    if (!selectedMap[i]) {
                        return;
                    }
                }
                selectedArr.push(index);
                allSelected.push(trace);
                selectedFlag = true;
            });
            if (selectedArr.length > 0) {
                plot.data.selectedpoints = selectedArr;
            }
            else {
                plot.data.selectedpoints = null;
            }
        });
        if (selectedFlag) {
            traces === null || traces === void 0 ? void 0 : traces.plots.forEach((plot) => {
                if (plot.data.selectedpoints === null) {
                    plot.data.selectedpoints = [];
                }
            });
        }
        setSelectedCategories(allSelected);
    }, [traces, selectedMap, selectedList]);
    const traceData = useMemo(() => {
        if (!traces) {
            return null;
        }
        return [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)];
    }, [traces]);
    return (React.createElement("div", { ref: plotlyDivRef, className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: `position-relative d-flex justify-content-center align-items-center flex-grow-1 ${traceStatus === 'pending' ? 'tdp-busy-partial-overlay' : ''}` },
            mergedExtensions.prePlot,
            traceStatus === 'success' && (traces === null || traces === void 0 ? void 0 : traces.plots.length) > 0 ? (React.createElement(PlotlyComponent, { divId: `plotlyDiv${id}`, data: traceData, layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onClick: (e) => {
                    const selectedPoints = e.points[0].customdata;
                    let removeSelectionFlag = true;
                    for (const j of selectedPoints) {
                        if (!selectedMap[j]) {
                            removeSelectionFlag = false;
                            break;
                        }
                    }
                    if (removeSelectionFlag) {
                        const newList = difference(selectedList, selectedPoints);
                        selectionCallback(newList);
                    }
                    else if (e.event.ctrlKey) {
                        const newList = Array.from(new Set([...selectedList, ...selectedPoints]));
                        selectionCallback(newList);
                    }
                    else {
                        selectionCallback(selectedPoints);
                    }
                }, 
                // plotly redraws everything on updates, so you need to reappend title and
                onUpdate: () => {
                    for (const p of traces.plots) {
                        d3.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);
                        d3.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
                    }
                } })) : traceStatus !== 'pending' ? (React.createElement(InvalidCols, { headerMessage: traces === null || traces === void 0 ? void 0 : traces.errorMessageHeader, bodyMessage: (traceError === null || traceError === void 0 ? void 0 : traceError.message) || (traces === null || traces === void 0 ? void 0 : traces.errorMessage) })) : null,
            mergedExtensions.postPlot,
            showCloseButton ? React.createElement(CloseButton, { closeCallback: closeButtonCallback }) : null),
        !hideSidebar ? (React.createElement(VisSidebarWrapper, { id: id },
            React.createElement(BarVisSidebar, { config: config, optionsConfig: optionsConfig, extensions: extensions, columns: columns, setConfig: setConfig }))) : null));
}
//# sourceMappingURL=BarVis.js.map