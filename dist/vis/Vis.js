import * as React from 'react';
import d3 from 'd3';
import { useMemo, useEffect } from 'react';
import { ESupportedPlotlyVis, ENumericalColorScaleType, EColumnTypes, EBarDirection, EBarDisplayType, EBarGroupingType, EScatterSelectSettings, EAggregateTypes, } from './interfaces';
import { getCssValue } from '../utils';
import { useSyncedRef } from '../hooks/useSyncedRef';
import { GetVisualizations } from './AllVisualizations';
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
export function Vis({ columns, selected = [], colors = DEFAULT_COLORS, shapes = DEFAULT_SHAPES, selectionCallback = () => null, filterCallback = () => null, setExternalConfig = () => null, closeCallback = () => null, showCloseButton = false, externalConfig = null, }) {
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
        var _a;
        (_a = setExternalConfigRef.current) === null || _a === void 0 ? void 0 : _a.call(setExternalConfigRef, visConfig);
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
        const vis = GetVisualizations().find((renderer) => renderer.type === inconsistentVisConfig.type);
        const newConfig = vis === null || vis === void 0 ? void 0 : vis.initialiteConfig(columns, inconsistentVisConfig, vis.defaultConfig);
        _setVisConfig({ current: newConfig, consistent: newConfig });
        // DANGER:: this useEffect should only occur when the visConfig.type changes. adding visconfig into the dep array will cause an infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inconsistentVisConfig.type]);
    useEffect(() => {
        if (externalConfig) {
            setVisConfig(externalConfig);
        }
    }, [externalConfig, setVisConfig]);
    const selectedMap = useMemo(() => {
        const currMap = {};
        selected.forEach((s) => {
            currMap[s] = true;
        });
        return currMap;
    }, [selected]);
    const scales = useMemo(() => {
        const colorScale = d3.scale.ordinal().range(colors);
        return {
            color: colorScale,
        };
    }, [colors]);
    if (!visConfig) {
        return React.createElement("div", { className: "tdp-busy" });
    }
    const props = {
        optionsConfig: {
            color: {
                enable: true,
            },
        },
        shapes,
        setConfig: setVisConfig,
        filterCallback,
        selectionCallback,
        selectedMap,
        selectedList: selected,
        columns,
        scales,
        showCloseButton,
        closeButtonCallback: closeCallback,
    };
    const renderer = GetVisualizations().find((r) => r.type === (visConfig === null || visConfig === void 0 ? void 0 : visConfig.type));
    return React.createElement(renderer.renderer, { ...props, config: visConfig });
}
//# sourceMappingURL=Vis.js.map