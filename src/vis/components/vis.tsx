import d3 from 'd3';
import * as React from 'react';
import {useMemo, useState} from 'react';
import {isBar} from '../plotUtils/bar';
import {ENumericalColorScaleType, isScatter} from '../plotUtils/scatter';
import {CategoricalColumn, NumericalColumn, ESupportedPlotlyVis, IVisConfig, Scales} from '../types/generalTypes';
import {ScatterVis} from './plots/ScatterVis';
import {ViolinVis} from './plots/ViolinVis';
import {isViolin} from '../plotUtils/violin';
import {isStrip} from '../plotUtils/strip';
import {StripVis} from './plots/StripVis';
import {isPCP} from '../plotUtils/pcp';
import {PCPVis} from './plots/PCPVis';
import {BarVis} from './plots/BarVis';

export interface VisProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    selected: {[key: number]: boolean};
    colors?: string[];
    shapes?: string[];
    selectionCallback: (s: number[]) => void;
    filterCallback: (s: string) => void;
}

export function Vis(props: VisProps) {
    const [visConfig, setVisConfig] = useState<IVisConfig>({
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
                shapes={props.shapes}
                setConfig={setVisConfig}
                filterCallback={props.filterCallback}
                selectionCallback={props.selectionCallback}
                selected={props.selected}
                columns={props.columns}
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
                columns={props.columns}
                scales={scales}
            /> : null}

        {isStrip(visConfig) ?
            <StripVis
                config={visConfig}
                setConfig={setVisConfig}
                columns={props.columns}
                scales={scales}
            /> : null}

        {isPCP(visConfig) ?
            <PCPVis
                config={visConfig}
                setConfig={setVisConfig}
                columns={props.columns}
            /> : null}

        {isBar(visConfig) ?
            <BarVis
                config={visConfig}
                setConfig={setVisConfig}
                columns={props.columns}
                scales={scales}
            /> : null}
    </>);
}
