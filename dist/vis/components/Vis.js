import d3 from 'd3';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { barInit, isBar } from '../bar/bar';
import { ENumericalColorScaleType, isScatter, scatterInit } from '../scatter/scatter';
import { ESupportedPlotlyVis } from '../types/generalTypes';
import { ScatterVis } from '../scatter/ScatterVis';
import { ViolinVis } from '../violin/ViolinVis';
import { isViolin, violinInit } from '../violin/violin';
import { isStrip, stripInit } from '../strip/strip';
import { StripVis } from '../strip/StripVis';
import { isPCP, pcpInit } from '../pcp/pcp';
import { PCPVis } from '../pcp/PCPVis';
import { BarVis } from '../bar/BarVis';
export function Vis(props) {
    const [_visConfig, setVisConfig] = useState({
        type: ESupportedPlotlyVis.SCATTER,
        numColumnsSelected: [],
        color: null,
        numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
        shape: null,
        isRectBrush: true,
        alphaSliderVal: 1
    });
    const visConfig = useMemo(() => {
        if (isScatter(_visConfig)) {
            return scatterInit(props.columns, _visConfig);
        }
        if (isViolin(_visConfig)) {
            return violinInit(props.columns, _visConfig);
        }
        if (isStrip(_visConfig)) {
            return stripInit(props.columns, _visConfig);
        }
        if (isPCP(_visConfig)) {
            return pcpInit(props.columns, _visConfig);
        }
        if (isBar(_visConfig)) {
            return barInit(props.columns, _visConfig);
        }
    }, [_visConfig.type]);
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
//# sourceMappingURL=Vis.js.map