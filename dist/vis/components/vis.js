import d3 from 'd3';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { isBar } from '../plotUtils/bar';
import { ENumericalColorScaleType, isScatter } from '../plotUtils/scatter';
import { ESupportedPlotlyVis } from '../types/generalTypes';
import { ScatterVis } from './plots/ScatterVis';
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
    const colorScale = useMemo(() => {
        return d3.scale.ordinal().range(props.colors || ['#337ab7', '#ec6836', '#75c4c2', '#e9d36c', '#24b466', '#e891ae', '#db933c', '#b08aa6', '#8a6044', '#7b7b7b']);
    }, [visConfig]);
    const scales = useMemo(() => {
        return {
            color: colorScale
        };
    }, [visConfig]);
    return (React.createElement(React.Fragment, null,
        isScatter(visConfig) ?
            React.createElement(ScatterVis, { config: visConfig, optionsConfig: {
                    color: {
                        enable: true,
                    }
                }, shapes: props.shapes, setConfig: setVisConfig, filterCallback: props.filterCallback, selectionCallback: props.selectionCallback, selected: props.selected, columns: props.columns, scales: scales }) : null,
        isViolin(visConfig) ?
            React.createElement(ViolinVis, { config: visConfig, optionsConfig: {
                    overlay: {
                        enable: true,
                    }
                }, setConfig: setVisConfig, columns: props.columns, scales: scales }) : null,
        isStrip(visConfig) ?
            React.createElement(StripVis, { config: visConfig, setConfig: setVisConfig, columns: props.columns, scales: scales }) : null,
        isPCP(visConfig) ?
            React.createElement(PCPVis, { config: visConfig, setConfig: setVisConfig, columns: props.columns }) : null,
        isBar(visConfig) ?
            React.createElement(BarVis, { config: visConfig, setConfig: setVisConfig, columns: props.columns, scales: scales }) : null));
}
//# sourceMappingURL=vis.js.map