import d3 from 'd3';
import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {barMergeDefaultConfig, isBar} from './bar/utils';
import {ENumericalColorScaleType, isScatter, scatterMergeDefaultConfig} from './scatter/utils';
import {CategoricalColumn, NumericalColumn, ESupportedPlotlyVis, IVisConfig, Scales} from './interfaces';
import {ScatterVis} from './scatter/ScatterVis';
import {ViolinVis} from './violin/ViolinVis';
import {isViolin, violinMergeDefaultConfig} from './violin/utils';
import {isStrip, stripMergeDefaultConfig} from './strip/utils';
import {StripVis} from './strip/StripVis';
import {isPCP, pcpMergeDefaultConfig} from './pcp/utils';
import {PCPVis} from './pcp/PCPVis';
import {BarVis} from './bar/BarVis';
import {getCssValue} from '..';

export interface VisProps {
    /**
     * Required data columns which are displayed.
     */
    columns: (NumericalColumn | CategoricalColumn)[];
    /**
     * Optional Prop for identifying which points are selected. The keys of the map should be the same ids that are passed into the columns prop.
     */
    selected?: {[key: string]: boolean};
    /**
     * Optional Prop for changing the colors that are used in color mapping. Defaults to the Datavisyn categorical color scheme
     */
    colors?: string[];
    /**
     * Optional Prop for changing the shapes that are used in shape mapping. Defaults to the circle, square, triangle, star.
     */
    shapes?: string[];
    /**
     * Optional Prop which is called when a selection is made in the scatterplot visualization. Passes in the selected points.
     */
    selectionCallback?: (s: string[]) => void;
    /**
     * Optional Prop which is called when a filter is applied. Returns a string identifying what type of filter is desired, either "Filter In", "Filter Out", or "Clear". This logic will be simplified in the future.
     */
    filterCallback?: (s: string) => void;
    externalConfig?: IVisConfig;
    hideSidebar?: boolean;
}

export function Vis({
    columns,
    selected = {},
    colors = [getCssValue('visyn-c1').slice(1),
                getCssValue('visyn-c2').slice(1),
                getCssValue('visyn-c3').slice(1),
                getCssValue('visyn-c4').slice(1),
                getCssValue('visyn-c5').slice(1),
                getCssValue('visyn-c6').slice(1),
                getCssValue('visyn-c7').slice(1),
                getCssValue('visyn-c8').slice(1),
                getCssValue('visyn-c9').slice(1),
                getCssValue('visyn-c10').slice(1)],
    shapes = ['circle', 'square', 'triangle-up', 'star'],
    selectionCallback = () => null,
    filterCallback = () => null,
    externalConfig = null,
    hideSidebar = false
}: VisProps) {

    const [visConfig, setVisConfig] = useState<IVisConfig>(externalConfig ? externalConfig : {
        type: ESupportedPlotlyVis.SCATTER,
        numColumnsSelected: [],
        color: null,
        numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
        shape: null,
        isRectBrush: true,
        alphaSliderVal: 1
    });

    useEffect(() => {
        setVisConfig(externalConfig);
    }, [externalConfig]);

    useEffect(() => {
        if(isScatter(visConfig)) { setVisConfig(scatterMergeDefaultConfig(columns, visConfig)); }
        if(isViolin(visConfig)) { setVisConfig(violinMergeDefaultConfig(columns, visConfig)); }
        if(isStrip(visConfig)) { setVisConfig(stripMergeDefaultConfig(columns, visConfig)); }
        if(isPCP(visConfig)) { setVisConfig(pcpMergeDefaultConfig(columns, visConfig)); }
        if(isBar(visConfig)) { setVisConfig(barMergeDefaultConfig(columns, visConfig)); }
    }, [visConfig.type]);

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
                hideSidebar={hideSidebar}
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
                hideSidebar={hideSidebar}

            /> : null}

        {isStrip(visConfig) ?
            <StripVis
                config={visConfig}
                setConfig={setVisConfig}
                columns={columns}
                scales={scales}
                hideSidebar={hideSidebar}

            /> : null}

        {isPCP(visConfig) ?
            <PCPVis
                config={visConfig}
                setConfig={setVisConfig}
                columns={columns}
                hideSidebar={hideSidebar}

            /> : null}

        {isBar(visConfig) ?
            <BarVis
                config={visConfig}
                setConfig={setVisConfig}
                columns={columns}
                scales={scales}
                hideSidebar={hideSidebar}

            /> : null}
    </>);
}
