import * as React from 'react';
import d3v3 from 'd3v3';
import { merge, uniqueId } from 'lodash';
import { useEffect } from 'react';
import { InvalidCols } from '../general/InvalidCols';
import { createScatterTraces } from './utils';
import { beautifyLayout } from '../general/layoutUtils';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { OpacitySlider } from '../sidebar/OpacitySlider';
import { ScatterVisSidebar } from './ScatterVisSidebar';
import { PlotlyComponent, Plotly } from '../Plot';
import { useAsync } from '../../hooks';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function ScatterVis({ config, optionsConfig, extensions, columns, shapes = ['circle', 'square', 'triangle-up', 'star'], filterCallback = () => null, selectionCallback = () => null, selectedMap = {}, selectedList = [], setConfig, hideSidebar = false, showCloseButton = false, closeButtonCallback = () => null, scales, }) {
    const id = React.useMemo(() => uniqueId('ScatterVis'), []);
    const plotlyDivRef = React.useRef(null);
    useEffect(() => {
        const ro = new ResizeObserver(() => {
            const plotDiv = document.getElementById(`plotlyDiv${id}`);
            if (plotDiv) {
                Plotly.Plots.resize(plotDiv);
            }
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
    const mergedExtensions = React.useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createScatterTraces, [columns, selectedMap, config, scales, shapes]);
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
                font: {
                    // same as default label font size in the sidebar
                    size: 13.4,
                },
            },
            font: {
                family: 'Roboto, sans-serif',
            },
            autosize: true,
            grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
            shapes: [],
            violingap: 0,
            dragmode: config.dragMode,
        };
        return beautifyLayout(traces, innerLayout);
    }, [traces, config.dragMode]);
    return (React.createElement("div", { ref: plotlyDivRef, className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: `position-relative d-flex justify-content-center align-items-center flex-grow-1 ${traceStatus === 'pending' ? 'tdp-busy-partial-overlay' : ''}` },
            mergedExtensions.prePlot,
            traceStatus === 'success' && (traces === null || traces === void 0 ? void 0 : traces.plots.length) > 0 ? (React.createElement(PlotlyComponent, { divId: `plotlyDiv${id}`, data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onClick: (event) => {
                    const clickedId = event.points[0].id;
                    if (selectedMap[clickedId]) {
                        selectionCallback(selectedList.filter((s) => s !== clickedId));
                    }
                    else {
                        selectionCallback([...selectedList, clickedId]);
                    }
                }, onSelected: (sel) => {
                    selectionCallback(sel ? sel.points.map((d) => d.id) : []);
                }, 
                // plotly redraws everything on updates, so you need to reappend title and
                // change opacity on update, instead of just in a use effect
                onInitialized: () => {
                    d3v3.selectAll('g .traces').style('opacity', 1);
                    d3v3.selectAll('.scatterpts').style('opacity', selectedList.length > 0 ? 1 : config.alphaSliderVal);
                }, onUpdate: () => {
                    d3v3.selectAll('g .traces').style('opacity', 1);
                    d3v3.selectAll('.scatterpts').style('opacity', selectedList.length > 0 ? 1 : config.alphaSliderVal);
                    for (const p of traces.plots) {
                        d3v3.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);
                        d3v3.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
                    }
                } })) : traceStatus !== 'pending' ? (React.createElement(InvalidCols, { headerMessage: traces === null || traces === void 0 ? void 0 : traces.errorMessageHeader, bodyMessage: (traceError === null || traceError === void 0 ? void 0 : traceError.message) || (traces === null || traces === void 0 ? void 0 : traces.errorMessage) })) : null,
            React.createElement("div", { className: "position-absolute d-flex justify-content-center align-items-center top-0 start-50 translate-middle-x" },
                React.createElement(BrushOptionButtons, { callback: (dragMode) => setConfig({ ...config, dragMode }), dragMode: config.dragMode }),
                React.createElement(OpacitySlider, { callback: (e) => setConfig({ ...config, alphaSliderVal: e }), currentValue: config.alphaSliderVal })),
            mergedExtensions.postPlot,
            showCloseButton ? React.createElement(CloseButton, { closeCallback: closeButtonCallback }) : null),
        !hideSidebar ? (React.createElement(VisSidebarWrapper, { id: id },
            React.createElement(ScatterVisSidebar, { config: config, optionsConfig: optionsConfig, extensions: extensions, columns: columns, filterCallback: filterCallback, setConfig: setConfig }))) : null));
}
//# sourceMappingURL=ScatterVis.js.map