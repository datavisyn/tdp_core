import * as React from 'react';
import d3v3 from 'd3v3';
import { useMemo, useEffect } from 'react';
import { ESupportedPlotlyVis, ENumericalColorScaleType, EColumnTypes, EBarDirection, EBarDisplayType, EBarGroupingType, EScatterSelectSettings, EAggregateTypes, } from './interfaces';
import { isScatter, scatterMergeDefaultConfig, ScatterVis } from './scatter';
import { barMergeDefaultConfig, isBar, BarVis } from './bar';
import { isViolin, violinMergeDefaultConfig, ViolinVis } from './violin';
import { isStrip, stripMergeDefaultConfig, StripVis } from './strip';
import { getCssValue } from '../utils';
import { useSyncedRef } from '../hooks/useSyncedRef';
import { isHexbin } from './hexbin/utils';
import { HexbinVis } from './hexbin/HexbinVis';
const DEFAULT_COLORS = [
    getCssValue('visyn-c1'),
    getCssValue('visyn-c2'),
    getCssValue('visyn-c3'),
    getCssValue('visyn-c4'),
    getCssValue('visyn-c5'),
    getCssValue('visyn-c6'),
    getCssValue('visyn-c7'),
    getCssValue('visyn-c8'),
    getCssValue('visyn-c9'),
    getCssValue('visyn-c10'),
];
const DEFAULT_SHAPES = ['circle', 'square', 'triangle-up', 'star'];
export function Vis({ columns, selected = [], colors = DEFAULT_COLORS, shapes = DEFAULT_SHAPES, selectionCallback = () => null, filterCallback = () => null, setExternalConfig = () => null, closeCallback = () => null, showCloseButton = false, externalConfig = null, hideSidebar = false, }) {
    // Each time you switch between vis config types, there is one render where the config is inconsistent with the type before the merge functions in the useEffect below can be called.
    // To ensure that we never render an incosistent config, keep a consistent and a current in the config. Always render the consistent.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const [{ consistent: visConfig, current: inconsistentVisConfig }, _setVisConfig] = React.useState(externalConfig
        ? { consistent: null, current: externalConfig }
        : columns.filter((c) => c.type === EColumnTypes.NUMERICAL).length > 1
            ? {
                consistent: null,
                current: {
                    type: ESupportedPlotlyVis.SCATTER,
                    numColumnsSelected: [],
                    color: null,
                    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
                    shape: null,
                    dragMode: EScatterSelectSettings.RECTANGLE,
                    alphaSliderVal: 0.5,
                },
            }
            : {
                consistent: null,
                current: {
                    type: ESupportedPlotlyVis.BAR,
                    multiples: null,
                    group: null,
                    direction: EBarDirection.HORIZONTAL,
                    display: EBarDisplayType.ABSOLUTE,
                    groupType: EBarGroupingType.STACK,
                    numColumnsSelected: [],
                    catColumnSelected: null,
                    aggregateColumn: null,
                    aggregateType: EAggregateTypes.COUNT,
                },
            });
    const setExternalConfigRef = useSyncedRef(setExternalConfig);
    useEffect(() => {
        setExternalConfigRef.current?.(visConfig);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visConfig, setExternalConfigRef]);
    const setVisConfig = React.useCallback((newConfig) => {
        _setVisConfig((oldConfig) => {
            return {
                current: newConfig,
                consistent: oldConfig.current.type !== newConfig.type ? oldConfig.consistent : newConfig,
            };
        });
    }, []);
    React.useEffect(() => {
        if (isScatter(inconsistentVisConfig)) {
            const newConfig = scatterMergeDefaultConfig(columns, inconsistentVisConfig);
            _setVisConfig({ current: newConfig, consistent: newConfig });
        }
        if (isViolin(inconsistentVisConfig)) {
            const newConfig = violinMergeDefaultConfig(columns, inconsistentVisConfig);
            _setVisConfig({ current: newConfig, consistent: newConfig });
        }
        if (isStrip(inconsistentVisConfig)) {
            const newConfig = stripMergeDefaultConfig(columns, inconsistentVisConfig);
            _setVisConfig({ current: newConfig, consistent: newConfig });
        }
        if (isBar(inconsistentVisConfig)) {
            const newConfig = barMergeDefaultConfig(columns, inconsistentVisConfig);
            _setVisConfig({ current: newConfig, consistent: newConfig });
        }
        // DANGER:: this useEffect should only occur when the visConfig.type changes. adding visconfig into the dep array will cause an infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inconsistentVisConfig.type]);
    useEffect(() => {
        if (externalConfig) {
            setVisConfig(externalConfig);
        }
    }, [externalConfig, setVisConfig]);
    // Converting the selected list into a map, since searching through the list to find an item is common in the vis components.
    const selectedMap = useMemo(() => {
        const currMap = {};
        selected.forEach((s) => {
            currMap[s] = true;
        });
        return currMap;
    }, [selected]);
    const scales = useMemo(() => {
        const colorScale = d3v3.scale.ordinal().range(colors);
        return {
            color: colorScale,
        };
    }, [colors]);
    if (!visConfig) {
        return React.createElement("div", { className: "tdp-busy" });
    }
    return (React.createElement(React.Fragment, null,
        isScatter(visConfig) ? (React.createElement(ScatterVis, { config: visConfig, optionsConfig: {
                color: {
                    enable: true,
                },
            }, shapes: shapes, setConfig: setVisConfig, filterCallback: filterCallback, selectionCallback: selectionCallback, selectedMap: selectedMap, selectedList: selected, columns: columns, scales: scales, hideSidebar: hideSidebar, showCloseButton: showCloseButton, closeButtonCallback: closeCallback })) : null,
        isViolin(visConfig) ? (React.createElement(ViolinVis, { config: visConfig, optionsConfig: {
                overlay: {
                    enable: true,
                },
            }, setConfig: setVisConfig, columns: columns, scales: scales, hideSidebar: hideSidebar, showCloseButton: showCloseButton, closeButtonCallback: closeCallback })) : null,
        isStrip(visConfig) ? (React.createElement(StripVis, { config: visConfig, selectionCallback: selectionCallback, setConfig: setVisConfig, selected: selectedMap, columns: columns, scales: scales, hideSidebar: hideSidebar, showCloseButton: showCloseButton, closeButtonCallback: closeCallback })) : null,
        isBar(visConfig) ? (React.createElement(BarVis, { config: visConfig, setConfig: setVisConfig, selectionCallback: selectionCallback, selectedMap: selectedMap, selectedList: selected, columns: columns, scales: scales, hideSidebar: hideSidebar, showCloseButton: showCloseButton, closeButtonCallback: closeCallback })) : null,
        isHexbin(visConfig) ? (React.createElement(HexbinVis, { config: visConfig, setConfig: setVisConfig, selectionCallback: selectionCallback, columns: columns, hideSidebar: hideSidebar })) : null));
}
//# sourceMappingURL=Vis.js.map