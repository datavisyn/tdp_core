import * as React from 'react';
import d3v3 from 'd3v3';
import { merge, uniqueId, difference } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Container, Space, Tooltip } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { EBarGroupingType } from '../interfaces';
import { PlotlyComponent } from '../../plotly';
import { Plotly } from '../../plotly/full';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { useAsync } from '../../hooks';
import { createBarTraces } from './utils';
import { BarVisSidebar } from './BarVisSidebar';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';
import { I18nextManager } from '../../i18n';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function BarVis({ config, optionsConfig, extensions, columns, setConfig, scales, selectionCallback = () => null, selectedMap = {}, selectedList = [], enableSidebar, showSidebar, setShowSidebar, showCloseButton = false, closeButtonCallback = () => null, }) {
    const mergedExtensions = React.useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createBarTraces, [columns, config, scales]);
    const [layout, setLayout] = useState(null);
    // Make sure selected values is right for each plot.
    const finalTraces = useMemo(() => {
        if (!traces) {
            return null;
        }
        let isTraceSelected = false;
        const editedTraces = { ...traces };
        editedTraces?.plots.forEach((plot) => {
            // custom data on each trace is the ids of every element in that section of the bar.
            const tracePoints = plot.data.customdata;
            const selectedIndices = [];
            tracePoints.forEach((points, index) => {
                if (points.length === 0 || selectedList.length < points.length) {
                    return;
                }
                for (const point of points) {
                    if (!selectedMap[point]) {
                        return;
                    }
                }
                selectedIndices.push(index);
                isTraceSelected = true;
            });
            if (selectedIndices.length > 0) {
                plot.data.selectedpoints = selectedIndices;
            }
            else {
                plot.data.selectedpoints = null;
            }
        });
        if (isTraceSelected) {
            editedTraces?.plots.forEach((plot) => {
                if (plot.data.selectedpoints === null) {
                    plot.data.selectedpoints = [];
                }
            });
        }
        return editedTraces;
    }, [traces, selectedMap, selectedList]);
    const id = React.useMemo(() => uniqueId('BarVis'), []);
    const plotlyDivRef = React.useRef(null);
    useEffect(() => {
        const ro = new ResizeObserver(() => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
        });
        if (plotlyDivRef) {
            ro.observe(plotlyDivRef.current);
        }
        return () => ro.disconnect();
    }, [id, plotlyDivRef]);
    React.useEffect(() => {
        if (!finalTraces) {
            return;
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
            margin: {
                t: 25,
                r: 25,
                l: 25,
                b: 25,
            },
            autosize: true,
            grid: { rows: finalTraces.rows, columns: finalTraces.cols, xgap: 0.3, pattern: 'independent' },
            shapes: [],
            barmode: config.groupType === EBarGroupingType.STACK ? 'stack' : 'group',
            dragmode: false,
        };
        setLayout({ ...layout, ...beautifyLayout(finalTraces, innerLayout, null) });
        // WARNING: Do not update when layout changes, that would be an infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finalTraces, config.groupType]);
    const traceData = useMemo(() => {
        if (!finalTraces) {
            return null;
        }
        return [...finalTraces.plots.map((p) => p.data), ...finalTraces.legendPlots.map((p) => p.data)];
    }, [finalTraces]);
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
        showCloseButton ? React.createElement(CloseButton, { closeCallback: closeButtonCallback }) : null,
        mergedExtensions.prePlot,
        React.createElement(Space, { h: "xl" }),
        enableSidebar ? (React.createElement(Tooltip, { withinPortal: true, label: I18nextManager.getInstance().i18n.t('tdp:core.vis.openSettings') },
            React.createElement(ActionIcon, { sx: { zIndex: 10, position: 'absolute', top: '10px', right: '10px' }, onClick: () => setShowSidebar(true) },
                React.createElement(FontAwesomeIcon, { icon: faGear })))) : null,
        traceStatus === 'success' && layout && finalTraces?.plots.length > 0 ? (React.createElement(PlotlyComponent, { divId: `plotlyDiv${id}`, data: traceData, layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onClick: (e) => {
                // plotly types here are just wrong. So have to convert to unknown first.
                const selectedPoints = e.points[0].customdata;
                let removeSelectionFlag = true;
                for (const pointId of selectedPoints) {
                    if (!selectedMap[pointId]) {
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
                for (const p of finalTraces.plots) {
                    d3v3.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);
                    d3v3.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
                }
            } })) : traceStatus !== 'pending' ? (React.createElement(InvalidCols, { headerMessage: finalTraces?.errorMessageHeader, bodyMessage: traceError?.message || finalTraces?.errorMessage })) : null,
        mergedExtensions.postPlot,
        showSidebar ? (React.createElement(VisSidebarWrapper, { id: id, target: plotlyDivRef.current, open: showSidebar, onClose: () => setShowSidebar(false) },
            React.createElement(BarVisSidebar, { config: config, optionsConfig: optionsConfig, extensions: extensions, columns: columns, setConfig: setConfig }))) : null));
}
//# sourceMappingURL=BarVis.js.map