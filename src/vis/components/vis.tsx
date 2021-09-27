import d3 from 'd3';
import * as React from 'react';
import {useMemo, useState} from 'react';
import {EBarDirection, EBarDisplayType, EBarGroupingType, EViolinOverlay, isBar} from '../plotUtils/bar';
import {ENumericalColorScaleType, isScatter} from '../plotUtils/scatter';
import {CategoricalColumn, NumericalColumn, EColumnTypes, ESupportedPlotlyVis, ColumnInfo, IVisConfig, Scales} from '../types/generalTypes';
import {ScatterVis} from './plots/ScatterVis';
import {getCol} from '../utils/sidebarUtils';
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

    const [currentVis, setCurrentVis] = useState<ESupportedPlotlyVis>(ESupportedPlotlyVis.SCATTER);
    const [selectedCatCols, setSelectedCatCols] = useState<ColumnInfo[]>(
        props.columns.filter((c) => c.selectedForMultiples === true && c.type === EColumnTypes.CATEGORICAL).map((c) => c.info)
    );
    const [selectedNumCols, setSelectedNumCols] = useState<ColumnInfo[]>(
        props.columns.filter((c) => c.selectedForMultiples === true && c.type === EColumnTypes.NUMERICAL).map((c) => c.info)
    );

    const [isRectBrush, setIsRectBrush] = useState<boolean>(true);
    const [alphaValue, setAlphaValue] = useState<number>(1);

    const [barGroup, setBarGroup] = useState<CategoricalColumn | null>(null);
    const [barMultiples, setBarMultiples] = useState<CategoricalColumn | null>(null);
    const [barDisplayType, setBarDisplayType] = useState<EBarDisplayType>(EBarDisplayType.DEFAULT);
    const [barGroupType, setBarGroupType] = useState<EBarGroupingType>(EBarGroupingType.STACK);
    const [barDirection, setBarDirection] = useState<EBarDirection>(EBarDirection.VERTICAL);
    const [violinOverlay, setViolinOverlay] = useState<EViolinOverlay>(EViolinOverlay.NONE);

    const updateBarGroup = (newCol: ColumnInfo) => setBarGroup(props.columns.filter((c) => newCol && c.info.id === newCol.id && c.type === EColumnTypes.CATEGORICAL)[0] as CategoricalColumn);
    const updateBarMultiples = (newCol: ColumnInfo) => setBarMultiples(props.columns.filter((c) => newCol && c.info.id === newCol.id && c.type === EColumnTypes.CATEGORICAL)[0] as CategoricalColumn);

    const updateCurrentVis = (s: ESupportedPlotlyVis) => setCurrentVis(s);
    const updateSelectedCatCols = (s: ColumnInfo[]) => setSelectedCatCols(s);
    const updateSelectedNumCols = (s: ColumnInfo[]) => setSelectedNumCols(s);

    const updateBarDisplayType = (s: EBarDisplayType) => setBarDisplayType(s);
    const updateBarGroupType = (s: EBarGroupingType) => setBarGroupType(s);
    const updateBarDirection = (s: EBarDirection) => setBarDirection(s);
    const updateViolinOverlay = (s: EViolinOverlay) => setViolinOverlay(s);
    const updateAlphaValue = (n: number) => setAlphaValue(n);

    const shapeScale = useMemo(() => {
        if(isScatter(visConfig)) {
            return visConfig.shape ?
                d3.scale.ordinal<string>().domain([...new Set(getCol(props.columns, visConfig.shape).vals.map((v) => v.val))]).range(['circle', 'square', 'triangle-up', 'star'])
                : null;
        } else {
            return null;
        }
    }, [visConfig]);

    const colorScale = useMemo(() => {
        return d3.scale.ordinal().range(['#337ab7', '#ec6836', '#75c4c2', '#e9d36c', '#24b466', '#e891ae', '#db933c', '#b08aa6', '#8a6044', '#7b7b7b']);
    }, [visConfig]);

    const numericalColorScale = useMemo(() => {
        if(isScatter(visConfig)) {
            let min = 0;
            let max = 0;

            if(visConfig.color) {
                min = d3.min((getCol(props.columns, visConfig.color) as NumericalColumn).vals.map((v) => +v.val).filter((v) => v !== null)),
                max = d3.max((getCol(props.columns, visConfig.color) as NumericalColumn).vals.map((v) => +v.val).filter((v) => v !== null));
            }

            return visConfig.color ?
                d3.scale.linear<string, number>()
                    .domain([min,
                        (max + min) / 2,
                        max])
                    .range(visConfig.numColorScaleType === ENumericalColorScaleType.SEQUENTIAL ? ['#002245', '#5c84af', '#cff6ff'] : ['#337ab7','#d3d3d3', '#ec6836'])
                : null;
        } else {
            return null;
        }

    }, [visConfig]);

    const scales: Scales = useMemo(() => {
        return {
           color: 'color' in visConfig ? getCol(props.columns, visConfig.color) === null ? null : getCol(props.columns, visConfig.color).type === EColumnTypes.NUMERICAL ? numericalColorScale : colorScale : null,
           shape: shapeScale
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
                scales={scales}
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
