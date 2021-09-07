import * as React from 'react';
import {useState} from 'react';
import {Multiples} from './Multiples';

export type supportedPlotlyVis = 'Chooser' | 'Scatter' | 'Parallel Coordinates' | 'Violin' | 'Strip' | 'Multiples';

export interface CustomVisProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    type: supportedPlotlyVis;
    selectionCallback: (s: string[]) => void;
    filterCallback: (s: string) => void;
}

export interface NumericalColumn {
    name: string;
    vals: {id: string, val: number, selected: boolean}[];
    type: 'number';
    selectedForMultiples: boolean;
}

export interface CategoricalColumn {
    name: string;
    vals: {id: string, val: string, selected: boolean}[];
    type: 'categorical';
    selectedForMultiples: boolean;
}

export const chartTypes: supportedPlotlyVis[] = ['Scatter', 'Parallel Coordinates', 'Violin', 'Strip', 'Multiples'];
export const correlationTypes: supportedPlotlyVis[] = ['Scatter'];
export const distributionTypes: supportedPlotlyVis[] = ['Violin', 'Strip'];
export const highDimensionalTypes: supportedPlotlyVis[] = ['Parallel Coordinates'];

export function CustomVis(props: CustomVisProps) {
    const [xAxis, setXAxis] = useState<NumericalColumn | CategoricalColumn | null>(null);
    const [yAxis, setYAxis] = useState<NumericalColumn | CategoricalColumn | null>(null);
    const [bubbleSize, setBubbleSize] = useState<NumericalColumn | null>(null);
    const [colorMapping, setColorMapping] = useState<CategoricalColumn | null>(null);
    const [opacity, setOpacity] = useState<NumericalColumn | null>(null);
    const [shape, setShape] = useState<CategoricalColumn | null>(null);
    const [visType, setVisType] = useState<supportedPlotlyVis>(props.type);
    // let [selectedCols, setSelectedCols] = useState<string[]>(props.columns.filter(c => c.selectedForMultiples === true).map(c => c.name))

    const updateChartType = (s: supportedPlotlyVis) => setVisType(s);
    // let updateSelectedCols = (s: string, b: boolean) => b ? setSelectedCols([...selectedCols, s]) : setSelectedCols(selectedCols.filter(c => c !== s))
    const updateXAxis = (newCol: string) => setXAxis(props.columns.filter((c) => c.name === newCol)[0]);
    const updateYAxis = (newCol: string) => setYAxis(props.columns.filter((c) => c.name === newCol)[0]);
    const updateBubbleSize = (newCol: string) => setBubbleSize(props.columns.filter((c) => c.name === newCol && c.type === 'number')[0] as NumericalColumn);
    const updateOpacity = (newCol: string) => setOpacity(props.columns.filter((c) => c.name === newCol && c.type === 'number')[0] as NumericalColumn);
    const updateColor = (newCol: string) => setColorMapping(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0] as CategoricalColumn);
    const updateShape = (newCol: string) => setShape(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0] as CategoricalColumn);

    let currentVisComponent = null;

    switch (visType) {
        case 'Multiples': {
            currentVisComponent = <Multiples
                filterCallback={props.filterCallback}
                selectedCallback={props.selectionCallback}
                xCol={xAxis}
                yCol={yAxis}
                type={visType}
                columns={props.columns}
                bubbleSize={bubbleSize}
                opacity={opacity}
                color={colorMapping}
                shape={shape}
                updateXAxis={updateXAxis}
                updateYAxis={updateYAxis}
                updateBubbleSize={updateBubbleSize}
                updateOpacity={updateOpacity}
                updateColor={updateColor}
                updateShape={updateShape}
                updateChartType={updateChartType} />;
            break;
        }
    }

    return (<>
        {currentVisComponent}
    </>);
}
