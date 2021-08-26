import d3, {color} from 'd3';
import {scale} from 'd3';
import {PlotData, PlotDatum} from 'plotly.js';
import * as React from 'react';
import {useEffect, useMemo} from 'react';
import Plot from 'react-plotly.js';
import {NavLink} from 'react-router-dom';
import {useAsync} from '../../..';
import {ColumnDescUtils} from '../../desc';
import {CategoricalColumn, NumericalColumn, supportedPlotlyVis} from './CustomVis';
import {GenericSidePanel} from './GenericSidePanel';

interface PCPProps {
    xCol: NumericalColumn | CategoricalColumn,
    yCol: NumericalColumn | CategoricalColumn,
    columns: (NumericalColumn | CategoricalColumn) []
    bubbleSize: NumericalColumn | null;
    opacity: NumericalColumn | null;
    color: CategoricalColumn | null;
    shape: CategoricalColumn | null;
    type: supportedPlotlyVis;
    updateXAxis: (s: string) => void; 
    updateYAxis: (s: string) => void; 
    updateBubbleSize: (s: string) => void
    updateOpacity: (s: string) => void;
    updateColor: (s: string) => void;
    updateShape: (s: string) => void;
    updateChartType: (s: string) => void;
}

function heuristic(columns) {
    return {
        xAxis: columns.filter(c => c.type === "Numerical")[0].name,
        yAxis: columns.filter(c => c.type === "Numerical")[1].name
    }
}


export function PCP(props: PCPProps) {

    // heuristic for setting up used in this async call
    useEffect(() => {
        // useAsync(async () => {
            const { xAxis, yAxis} = heuristic(props.columns);
    
            console.log(xAxis)
        
            if(props.xCol === null || props.xCol.type === "Categorical")
            {
                props.updateXAxis(xAxis);
            }
        
            if(props.yCol === null || props.yCol.type === "Categorical")
            {
                props.updateYAxis(yAxis);
            }
        // })
    }, [props.columns])

    let shapeScale = useMemo(() => {
        return props.shape ? 
                scale.ordinal<string>().domain(d3.set(props.shape.vals).values()).range(["circle-open", "square-open", "triangle-up-open", "star-open"])
                : null
    }, [props.shape])

    let bubbleScale = useMemo(() => {
        return props.bubbleSize ? 
                scale.linear().domain([0, d3.max(props.bubbleSize.vals)]).range([0, 10])
                : null
    }, [props.bubbleSize])

    let opacityScale = useMemo(() => {
        return props.opacity ? 
                scale.linear().domain([0, d3.max(props.opacity.vals)]).range([0, 1])
                : null
    }, [props.opacity])

    let colorScale = useMemo(() => {
        return scale.category10()
    }, [props.color])

    let dataVariable = {
        //yo why does this error i dunno but it works
        dimensions: props.columns.filter(c => c.type === "Numerical").map(c => {
            return {
                range: [d3.min(c.vals as number[]), d3.max(c.vals as number[])],
                label: c.name, 
                values: c.vals
            }
        }),
        type: 'parcoords',
        line: {
            color: props.color ? props.color.vals.map(c => colorScale(c)) : "red",
          },
    }

    return (
        <div style={{height: "100%", display: "flex", flexDirection: "row"}}>
            <div style={{flex: "5"}}>
                {props.xCol !== null &&
                props.yCol !== null && 
                props.xCol.type !== "Categorical" &&
                props.yCol.type !== "Categorical" ? <Plot
                data={[dataVariable as Partial<PlotData>]}
                layout={ 
                {   
                    width: 1200, 
                    height: 1200,
                    xaxis: {
                        title: {
                        text: props.xCol.name,
                        font: {
                            family: 'Courier New, monospace',
                            size: 12,
                            color: 'black'
                        }
                        },
                    },
                    yaxis: {
                        title: {
                            text: props.yCol.name,
                            font: {
                                family: 'Courier New, monospace',
                                size: 12,
                                color: 'black'
                            }
                        }
                    }} }
                /> : null }
            </div>
            <GenericSidePanel 
                currentType={props.type}
                dropdowns={[
                    {
                        name: "X Axis",
                        callback: props.updateXAxis,
                        currentSelected: props.xCol ? props.xCol.name : "None",
                        options: props.columns.filter(c => c.type === "Numerical").map(c => c.name)
                    },
                    {
                        name: "Y Axis",
                        callback: props.updateYAxis,
                        currentSelected: props.yCol ? props.yCol.name : "None",
                        options: props.columns.filter(c => c.type === "Numerical").map(c => c.name)
                    },
                    {
                        name: "Bubble Size",
                        callback: props.updateBubbleSize,
                        currentSelected: props.bubbleSize ? props.bubbleSize.name : "None",
                        options: ["None", ...props.columns.filter(c => c.type === "Numerical").map(c => c.name)]
                    },
                    {
                        name: "Opacity",
                        callback: props.updateOpacity,
                        currentSelected: props.opacity ? props.opacity.name : "None",
                        options: ["None", ...props.columns.filter(c => c.type === "Numerical").map(c => c.name)]
                    },
                    {
                        name: "Color",
                        callback: props.updateColor,
                        currentSelected: props.color ? props.color.name : "None",
                        options: ["None", ...props.columns.filter(c => c.type === "Categorical").map(c => c.name)]
                    },
                    {
                        name: "Shape",
                        callback: props.updateShape,
                        currentSelected: props.shape ? props.shape.name : "None",
                        options: ["None", ...props.columns.filter(c => c.type === "Categorical").map(c => c.name)]
                    },
                ]}
                chartTypeChangeCallback={props.updateChartType}
                ></GenericSidePanel>
        </div>
    );
}