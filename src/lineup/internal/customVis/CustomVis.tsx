import * as React from 'react';
import {useState} from 'react';
import {Multiples} from './Multiples';
import {PCP} from './PlotlyPCP';
// import {Chooser} from './Chooser';
// import {BarChart} from './PlotlyBarChart';
import {Scatterplot} from './PlotlyScatterplot';
import {StripChart} from './PlotlyStripPlot';
import {Violin} from './PlotlyViolinPlot';

export type supportedPlotlyVis = "Chooser" | "Scatterplot" | "PCP" | "Violin" | "Strip Plot" | "Multiples"

export interface CustomVisProps {
    columns: (NumericalColumn | CategoricalColumn)[]
    type: supportedPlotlyVis
}

export interface NumericalColumn {
    name: string
    vals: number[]
    type: "Numerical"
}

export interface CategoricalColumn {
    name: string
    vals: string[]
    type: "Categorical"
}

export function CustomVis(props: CustomVisProps){
    let [xAxis, setXAxis] = useState<NumericalColumn | CategoricalColumn | null>(null);
    let [yAxis, setYAxis] = useState<NumericalColumn | CategoricalColumn | null>(null);
    let [bubbleSize, setBubbleSize] = useState<NumericalColumn | null>(null);
    let [colorMapping, setColorMapping] = useState<CategoricalColumn | null>(null);
    let [opacity, setOpacity] = useState<NumericalColumn | null>(null);
    let [shape, setShape] = useState<CategoricalColumn | null>(null);
    let [visType, setVisType] = useState<supportedPlotlyVis>(props.type);

    let updateChartType = (s: supportedPlotlyVis) => setVisType(s)
    let updateXAxis = (newCol: string) => setXAxis(props.columns.filter(c => c.name === newCol)[0])
    let updateYAxis = (newCol: string) => setYAxis(props.columns.filter(c => c.name === newCol)[0])
    let updateBubbleSize = (newCol: string) => setBubbleSize(props.columns.filter(c => c.name === newCol && c.type == "Numerical")[0] as NumericalColumn)
    let updateOpacity = (newCol: string) => setOpacity(props.columns.filter(c => c.name === newCol && c.type == "Numerical")[0] as NumericalColumn)
    let updateColor = (newCol: string) => setColorMapping(props.columns.filter(c => c.name === newCol && c.type == "Categorical")[0] as CategoricalColumn)
    let updateShape = (newCol: string) => setShape(props.columns.filter(c => c.name === newCol && c.type == "Categorical")[0] as CategoricalColumn)

    let currentVisComponent = null;

    switch(visType)
    {
        case "Violin" : {
            currentVisComponent = <Violin 
                xCol={xAxis} 
                yCol={yAxis} 
                columns={props.columns}
                type={visType}
                updateXAxis={updateXAxis}
                updateYAxis={updateYAxis}
                updateChartType={updateChartType}/>
            break;
        }
        case "Strip Plot" : {
            currentVisComponent = <StripChart 
                xCol={xAxis} 
                yCol={yAxis} 
                type={visType}

                columns={props.columns}
                updateXAxis={updateXAxis}
                updateYAxis={updateYAxis}
                updateChartType={updateChartType}/>
            break;
        }
        case "Chooser": {
            currentVisComponent = <Scatterplot 
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
                updateChartType={updateChartType}/>
            break;
        }
        case "Scatterplot": {
            currentVisComponent = <Scatterplot 
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
                updateChartType={updateChartType}/>
            break;
        }
        case "PCP": {
            currentVisComponent = <PCP 
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
                updateChartType={updateChartType}/>    
            break;
        }
        case "Multiples": {
            currentVisComponent = <Multiples 
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
                updateChartType={updateChartType}/>    
            break;
        }
    }

    return (<>
            {currentVisComponent}
        </>);
}