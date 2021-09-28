import d3 from 'd3';
import * as React from 'react';
import {useMemo, useState} from 'react';
import {barInit, isBar} from './bar/utils';
import {ENumericalColorScaleType, isScatter, scatterInit} from './scatter/utils';
import {CategoricalColumn, NumericalColumn, ESupportedPlotlyVis, IVisConfig, Scales} from './interfaces';
import {ScatterVis} from './scatter/ScatterVis';
import {ViolinVis} from './violin/ViolinVis';
import {isViolin, violinInit} from './violin/utils';
import {isStrip, stripInit} from './strip/utils';
import {StripVis} from './strip/StripVis';
import {isPCP, pcpInit} from './pcp/utils';
import {PCPVis} from './pcp/PCPVis';
import {BarVis} from './bar/BarVis';

export interface VisProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    selected?: {[key: number]: boolean};
    colors?: string[];
    shapes?: string[];
    selectionCallback?: (s: number[]) => void;
    filterCallback?: (s: string) => void;
}

export function Vis({
    columns,
    selected = {},
    colors = ['#337ab7', '#ec6836', '#75c4c2', '#e9d36c', '#24b466', '#e891ae', '#db933c', '#b08aa6', '#8a6044', '#7b7b7b'],
    shapes = ['circle', 'square', 'triangle-up', 'star'],
    selectionCallback = () => null,
    filterCallback = () => null
}: VisProps) {
    const [_visConfig, setVisConfig] = useState<IVisConfig>({
        type: ESupportedPlotlyVis.SCATTER,
        numColumnsSelected: [],
        color: null,
        numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
        shape: null,
        isRectBrush: true,
        alphaSliderVal: 1
    });

    const visConfig = useMemo(() => {
        if(isScatter(_visConfig)) { return scatterInit(columns, _visConfig); }
        if(isViolin(_visConfig)) { return violinInit(columns, _visConfig); }
        if(isStrip(_visConfig)) { return stripInit(columns, _visConfig); }
        if(isPCP(_visConfig)) { return pcpInit(columns, _visConfig); }
        if(isBar(_visConfig)) { return barInit(columns, _visConfig); }

    }, [_visConfig.type]);

    const colorScale = useMemo(() => {
        return d3.scale.ordinal().range(colors);
    }, [visConfig]);

    const scales: Scales = useMemo(() => {
        return {
           color: colorScale
        };
    }, [visConfig]);

    return (
    <>
        {isScatter(visConfig) ?
            <ScatterVis
                config={visConfig}
                optionsConfig={{
                    color: {
                        enable: true,
                    }
                }}
                shapes={shapes}
                setConfig={setVisConfig}
                filterCallback={filterCallback}
                selectionCallback={selectionCallback}
                selected={selected}
                columns={columns}
                scales={scales}
            /> : null}

        {isViolin(visConfig) ?
            <ViolinVis
                config={visConfig}
                optionsConfig={{
                    overlay: {
                        enable: true,
                    }
                }}
                setConfig={setVisConfig}
                columns={columns}
                scales={scales}
            /> : null}

        {isStrip(visConfig) ?
            <StripVis
                config={visConfig}
                setConfig={setVisConfig}
                columns={columns}
                scales={scales}
            /> : null}

        {isPCP(visConfig) ?
            <PCPVis
                config={visConfig}
                setConfig={setVisConfig}
                columns={columns}
            /> : null}

        {isBar(visConfig) ?
            <BarVis
                config={visConfig}
                setConfig={setVisConfig}
                columns={columns}
                scales={scales}
            /> : null}
    </>);
}
