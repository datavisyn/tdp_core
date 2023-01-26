import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Center, Container, Group, Stack, Tooltip } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { InvalidCols } from '../general/InvalidCols';
import { createScatterTraces } from './utils';
import { beautifyLayout } from '../general/layoutUtils';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { ScatterVisSidebar } from './ScatterVisSidebar';
import { PlotlyComponent, Plotly } from '../Plot';
import { useAsync } from '../../hooks';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';
import { I18nextManager } from '../../i18n';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function ScatterVis({ config, optionsConfig, extensions, columns, shapes = ['circle', 'square', 'triangle-up', 'star'], filterCallback = () => null, selectionCallback = () => null, selectedMap = {}, selectedList = [], setConfig, hideSidebar = false, showCloseButton = false, closeButtonCallback = () => null, scales, }) {
    const id = React.useMemo(() => uniqueId('ScatterVis'), []);
    const plotlyDivRef = React.useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    console.log('re rendering');
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
    }, [id, hideSidebar, plotlyDivRef]);
    const mergedExtensions = React.useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    const { value: traces, status: traceStatus, error: traceError, } = useAsync(createScatterTraces, [
        columns,
        config.numColumnsSelected,
        config.shape,
        config.color,
        config.alphaSliderVal,
        config.numColorScaleType,
        scales,
        shapes,
    ]);
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
            margin: {
                t: 25,
                r: 25,
                l: 25,
                b: 25,
            },
            autosize: true,
            grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
            shapes: [],
            dragmode: config.dragMode,
        };
        return beautifyLayout(traces, innerLayout);
    }, [traces, config.dragMode]);
    const plotsWithSelectedPoints = useMemo(() => {
        if (traces) {
            const allPlots = traces.plots;
            allPlots
                .filter((trace) => trace.data.type === 'scattergl')
                .forEach((p) => {
                const temp = [];
                p.data.ids.forEach((currId, index) => {
                    if (selectedMap[currId]) {
                        temp.push(index);
                    }
                });
                p.data.selectedpoints = temp;
            });
            return allPlots;
        }
        return [];
    }, [selectedMap, traces]);
    const plotlyData = useMemo(() => {
        return [...plotsWithSelectedPoints.map((p) => p.data), ...plotsWithSelectedPoints.map((p) => p.data)];
    }, [plotsWithSelectedPoints]);
    const plotly = useMemo(() => {
        if (traces?.plots && plotsWithSelectedPoints) {
            return (React.createElement(PlotlyComponent, { divId: `plotlyDiv${id}`, data: plotlyData, layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onClick: (event) => {
                    const clickedId = event.points[0].id;
                    if (selectedMap[clickedId]) {
                        selectionCallback(selectedList.filter((s) => s !== clickedId));
                    }
                    else {
                        selectionCallback([...selectedList, clickedId]);
                    }
                }, className: "tdpCoreVis", onSelected: (sel) => {
                    selectionCallback(sel ? sel.points.map((d) => d.id) : []);
                } }));
        }
        return null;
    }, [id, plotsWithSelectedPoints, layout, selectedMap, selectionCallback, selectedList, traces?.plots, plotlyData]);
    return (React.createElement(Container, { fluid: true, sx: { flexGrow: 1, height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }, ref: plotlyDivRef },
        React.createElement(Tooltip, { withinPortal: true, label: I18nextManager.getInstance().i18n.t('tdp:core.vis.openSettings') },
            React.createElement(ActionIcon, { sx: { position: 'absolute', top: '10px', right: '10px' }, onClick: () => setSidebarOpen(true) },
                React.createElement(FontAwesomeIcon, { icon: faGear }))),
        showCloseButton ? React.createElement(CloseButton, { closeCallback: closeButtonCallback }) : null,
        React.createElement(Stack, { spacing: 0, sx: { height: '100%' } },
            React.createElement(Center, null,
                React.createElement(Group, { mt: "lg" },
                    React.createElement(BrushOptionButtons, { callback: (dragMode) => setConfig({ ...config, dragMode }), dragMode: config.dragMode }))),
            mergedExtensions.prePlot,
            traceStatus === 'success' && plotsWithSelectedPoints.length > 0 ? (plotly) : traceStatus !== 'pending' ? (React.createElement(InvalidCols, { headerMessage: traces?.errorMessageHeader, bodyMessage: traceError?.message || traces?.errorMessage })) : null,
            mergedExtensions.postPlot),
        !hideSidebar ? (React.createElement(VisSidebarWrapper, { id: id, target: plotlyDivRef.current, open: sidebarOpen, onClose: () => setSidebarOpen(false) },
            React.createElement(ScatterVisSidebar, { config: config, optionsConfig: optionsConfig, extensions: extensions, columns: columns, filterCallback: filterCallback, setConfig: setConfig }))) : null));
}
//# sourceMappingURL=ScatterVis.js.map