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
import { PlotlyComponent } from '../../plotly';
import { Plotly } from '../../plotly/full';
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
export function ScatterVis({ config, optionsConfig, extensions, columns, shapes = ['circle', 'square', 'triangle-up', 'star'], filterCallback = () => null, selectionCallback = () => null, selectedMap = {}, selectedList = [], setConfig, enableSidebar, setShowSidebar, showSidebar, showCloseButton = false, closeButtonCallback = () => null, scales, }) {
    const id = React.useMemo(() => uniqueId('ScatterVis'), []);
    const plotlyDivRef = React.useRef(null);
    const [layout, setLayout] = useState(null);
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
        return () => ro.disconnect();
    }, [id, plotlyDivRef]);
    const mergedExtensions = React.useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    useEffect(() => {
        setLayout(null);
    }, [config.numColumnsSelected.length]);
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
    React.useEffect(() => {
        if (!traces) {
            return;
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
                l: 100,
                b: 100,
            },
            grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
            shapes: [],
            dragmode: config.dragMode,
        };
        setLayout({ ...layout, ...beautifyLayout(traces, innerLayout, layout, false) });
        // WARNING: Do not update when layout changes, that would be an infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [traces, config.dragMode]);
    const plotsWithSelectedPoints = useMemo(() => {
        if (traces) {
            const allPlots = traces.plots;
            allPlots
                .filter((trace) => trace.data.type === 'scattergl')
                .forEach((p) => {
                const temp = [];
                p.data.ids.forEach((currId, index) => {
                    if (selectedMap[currId] || (selectedList.length === 0 && config.color)) {
                        temp.push(index);
                    }
                });
                p.data.selectedpoints = temp;
                if (selectedList.length === 0 && config.color) {
                    // @ts-ignore
                    p.data.selected.marker.opacity = config.alphaSliderVal;
                }
                else {
                    // @ts-ignore
                    p.data.selected.marker.opacity = 1;
                }
            });
            return allPlots;
        }
        return [];
    }, [selectedMap, traces, selectedList, config.color, config.alphaSliderVal]);
    const plotlyData = useMemo(() => {
        if (traces) {
            return [...plotsWithSelectedPoints.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)];
        }
        return [];
    }, [plotsWithSelectedPoints, traces]);
    const plotly = useMemo(() => {
        if (traces?.plots && plotsWithSelectedPoints && layout) {
            return (React.createElement(PlotlyComponent, { key: id, divId: `plotlyDiv${id}`, data: plotlyData, layout: layout, config: { responsive: true, displayModeBar: false, scrollZoom: true }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onClick: (event) => {
                    const clickedId = event.points[0].id;
                    if (selectedMap[clickedId]) {
                        selectionCallback(selectedList.filter((s) => s !== clickedId));
                    }
                    else {
                        selectionCallback([...selectedList, clickedId]);
                    }
                }, onSelected: (sel) => {
                    selectionCallback(sel ? sel.points.map((d) => d.id) : []);
                } }));
        }
        return null;
    }, [id, plotsWithSelectedPoints, layout, selectedMap, selectionCallback, selectedList, traces?.plots, plotlyData]);
    return (React.createElement(Container, { fluid: true, sx: {
            flexGrow: 1,
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            // Disable plotly crosshair cursor
            '.nsewdrag': {
                cursor: 'pointer !important',
            },
        }, ref: plotlyDivRef },
        enableSidebar ? (React.createElement(Tooltip, { withinPortal: true, label: I18nextManager.getInstance().i18n.t('tdp:core.vis.openSettings') },
            React.createElement(ActionIcon, { sx: { zIndex: 10, position: 'absolute', top: '10px', right: '10px' }, onClick: () => setShowSidebar(true) },
                React.createElement(FontAwesomeIcon, { icon: faGear })))) : null,
        showCloseButton ? React.createElement(CloseButton, { closeCallback: closeButtonCallback }) : null,
        React.createElement(Stack, { spacing: 0, sx: { height: '100%' } },
            React.createElement(Center, null,
                React.createElement(Group, { mt: "lg" },
                    React.createElement(BrushOptionButtons, { callback: (dragMode) => setConfig({ ...config, dragMode }), dragMode: config.dragMode }))),
            mergedExtensions.prePlot,
            traceStatus === 'success' && layout && plotsWithSelectedPoints.length > 0 ? (plotly) : traceStatus !== 'pending' ? (React.createElement(InvalidCols, { headerMessage: traces?.errorMessageHeader, bodyMessage: traceError?.message || traces?.errorMessage })) : null,
            mergedExtensions.postPlot),
        showSidebar ? (React.createElement(VisSidebarWrapper, { id: id, target: plotlyDivRef.current, open: showSidebar, onClose: () => setShowSidebar(false) },
            React.createElement(ScatterVisSidebar, { config: config, optionsConfig: optionsConfig, extensions: extensions, columns: columns, filterCallback: filterCallback, setConfig: setConfig }))) : null));
}
//# sourceMappingURL=ScatterVis.js.map