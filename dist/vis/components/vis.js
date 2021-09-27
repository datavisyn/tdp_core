import d3 from 'd3';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EViolinOverlay, isBar } from '../plotUtils/bar';
import { ENumericalColorScaleType, isScatter } from '../plotUtils/scatter';
import { EColumnTypes, ESupportedPlotlyVis } from '../types/generalTypes';
import { ScatterVis } from './plots/ScatterVis';
import { getCol } from '../utils/sidebarUtils';
import { ViolinVis } from './plots/ViolinVis';
import { isViolin } from '../plotUtils/violin';
import { isStrip } from '../plotUtils/strip';
import { StripVis } from './plots/StripVis';
import { isPCP } from '../plotUtils/pcp';
import { PCPVis } from './plots/PCPVis';
import { BarVis } from './plots/BarVis';
export function Vis(props) {
    const [visConfig, setVisConfig] = useState({
        type: ESupportedPlotlyVis.SCATTER,
        numColumnsSelected: [],
        color: null,
        numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
        shape: null,
        isRectBrush: true,
        alphaSliderVal: 1
    });
    const [currentVis, setCurrentVis] = useState(ESupportedPlotlyVis.SCATTER);
    const [selectedCatCols, setSelectedCatCols] = useState(props.columns.filter((c) => c.selectedForMultiples === true && c.type === EColumnTypes.CATEGORICAL).map((c) => c.info));
    const [selectedNumCols, setSelectedNumCols] = useState(props.columns.filter((c) => c.selectedForMultiples === true && c.type === EColumnTypes.NUMERICAL).map((c) => c.info));
    const [isRectBrush, setIsRectBrush] = useState(true);
    const [alphaValue, setAlphaValue] = useState(1);
    const [barGroup, setBarGroup] = useState(null);
    const [barMultiples, setBarMultiples] = useState(null);
    const [barDisplayType, setBarDisplayType] = useState(EBarDisplayType.DEFAULT);
    const [barGroupType, setBarGroupType] = useState(EBarGroupingType.STACK);
    const [barDirection, setBarDirection] = useState(EBarDirection.VERTICAL);
    const [violinOverlay, setViolinOverlay] = useState(EViolinOverlay.NONE);
    const updateBarGroup = (newCol) => setBarGroup(props.columns.filter((c) => newCol && c.info.id === newCol.id && c.type === EColumnTypes.CATEGORICAL)[0]);
    const updateBarMultiples = (newCol) => setBarMultiples(props.columns.filter((c) => newCol && c.info.id === newCol.id && c.type === EColumnTypes.CATEGORICAL)[0]);
    const updateCurrentVis = (s) => setCurrentVis(s);
    const updateSelectedCatCols = (s) => setSelectedCatCols(s);
    const updateSelectedNumCols = (s) => setSelectedNumCols(s);
    const updateBarDisplayType = (s) => setBarDisplayType(s);
    const updateBarGroupType = (s) => setBarGroupType(s);
    const updateBarDirection = (s) => setBarDirection(s);
    const updateViolinOverlay = (s) => setViolinOverlay(s);
    const updateAlphaValue = (n) => setAlphaValue(n);
    const shapeScale = useMemo(() => {
        if (isScatter(visConfig)) {
            return visConfig.shape ?
                d3.scale.ordinal().domain([...new Set(getCol(props.columns, visConfig.shape).vals.map((v) => v.val))]).range(['circle', 'square', 'triangle-up', 'star'])
                : null;
        }
        else {
            return null;
        }
    }, [visConfig]);
    const colorScale = useMemo(() => {
        return d3.scale.ordinal().range(['#337ab7', '#ec6836', '#75c4c2', '#e9d36c', '#24b466', '#e891ae', '#db933c', '#b08aa6', '#8a6044', '#7b7b7b']);
    }, [visConfig]);
    const numericalColorScale = useMemo(() => {
        if (isScatter(visConfig)) {
            let min = 0;
            let max = 0;
            if (visConfig.color) {
                min = d3.min(getCol(props.columns, visConfig.color).vals.map((v) => +v.val).filter((v) => v !== null)),
                    max = d3.max(getCol(props.columns, visConfig.color).vals.map((v) => +v.val).filter((v) => v !== null));
            }
            return visConfig.color ?
                d3.scale.linear()
                    .domain([min,
                    (max + min) / 2,
                    max])
                    .range(visConfig.numColorScaleType === ENumericalColorScaleType.SEQUENTIAL ? ['#002245', '#5c84af', '#cff6ff'] : ['#337ab7', '#d3d3d3', '#ec6836'])
                : null;
        }
        else {
            return null;
        }
    }, [visConfig]);
    const scales = useMemo(() => {
        return {
            color: 'color' in visConfig ? getCol(props.columns, visConfig.color) === null ? null : getCol(props.columns, visConfig.color).type === EColumnTypes.NUMERICAL ? numericalColorScale : colorScale : null,
            shape: shapeScale
        };
    }, [visConfig]);
    return (React.createElement(React.Fragment, null,
        isScatter(visConfig) ?
            React.createElement(ScatterVis, { config: visConfig, optionsConfig: {
                    color: {
                        enable: true,
                    }
                }, setConfig: setVisConfig, filterCallback: props.filterCallback, selectionCallback: props.selectionCallback, selected: props.selected, columns: props.columns, scales: scales }) : null,
        isViolin(visConfig) ?
            React.createElement(ViolinVis, { config: visConfig, optionsConfig: {
                    overlay: {
                        enable: true,
                    }
                }, setConfig: setVisConfig, columns: props.columns, scales: scales }) : null,
        isStrip(visConfig) ?
            React.createElement(StripVis, { config: visConfig, setConfig: setVisConfig, columns: props.columns, scales: scales }) : null,
        isPCP(visConfig) ?
            React.createElement(PCPVis, { config: visConfig, setConfig: setVisConfig, columns: props.columns, scales: scales }) : null,
        isBar(visConfig) ?
            React.createElement(BarVis, { config: visConfig, setConfig: setVisConfig, columns: props.columns, scales: scales }) : null));
}
//# sourceMappingURL=vis.js.map