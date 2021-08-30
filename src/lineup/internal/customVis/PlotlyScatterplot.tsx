import d3 from 'd3';
import {scale} from 'd3';
import Plotly, {Data, PlotData} from 'plotly.js';
import * as React from 'react';
import {useEffect, useMemo, useRef} from 'react';
import Plot from 'react-plotly.js';
import {CategoricalColumn, NumericalColumn, supportedPlotlyVis} from './CustomVis';
import {GenericSidePanel} from './GenericSidePanel';
import {MultipleDataTraces, MultiplesProps} from './Multiples';

interface ScatterplotProps {
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

export function createMultiplesScatterplotData(props: MultiplesProps, selectedNumCols: string[], shapeScale, colorScale, opacityScale, bubbleScale) : MultipleDataTraces {
    let counter = 1
    let validCols = props.columns.filter(c => selectedNumCols.includes(c.name))
    let traces: Data[] = []

    for(let xCurr of validCols)
    {
        for(let yCurr of validCols)
        {
            if(xCurr === yCurr)
            {
                traces.push(   
                {            
                    xaxis: counter === 1 ? "x" : "x" + counter,
                    yaxis: counter === 1 ? "y" : "y" + counter,
                })
                counter += 1
                continue;
            }

            traces.push( {
                x: xCurr.vals,
                y: yCurr.vals,
                xaxis: counter === 1 ? "x" : "x" + counter,
                yaxis: counter === 1 ? "y" : "y" + counter,
                type: 'scatter',
                mode: 'markers',
                marker: {
                    line: {
                        width: 2
                    },
                    symbol: props.shape ? props.shape.vals.map(v => shapeScale(v)) : "circle-open",
                    color: props.color ? props.color.vals.map(v => colorScale(v)) : "#232b2b",
                    opacity: props.opacity ? props.opacity.vals.map(v => opacityScale(v)) : 1,
                    size: props.bubbleSize ? props.bubbleSize.vals.map(v => bubbleScale(v)) : 7
                },
            })
            counter += 1
        }
    }

    return {
        data: traces,
        rows: Math.sqrt(traces.length),
        cols: Math.sqrt(traces.length)
    };
}


export function Scatterplot(props: ScatterplotProps) {

    let plotRef = useRef<Plotly.PlotlyHTMLElement>(null)

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


    return (
        <div className="d-flex flex-row w-100 h-100">
            <div className="flex-grow-1">
            {props.xCol !== null &&
            props.yCol !== null && 
            props.xCol.type !== "Categorical" &&
            props.yCol.type !== "Categorical" ? <Plot
                divId={"plotlyDiv"}
                data={[
                    {
                        x: props.xCol.vals,
                        y: props.yCol.vals,
                        type: 'scatter',
                        mode: 'markers',
                        name: 'All points',
                        marker: {
                            line: {
                                width: 2
                            },
                            symbol: props.shape ? props.shape.vals.map(v => shapeScale(v)) : "circle-open",
                            color: props.color ? props.color.vals.map(v => colorScale(v)) : "#232b2b",
                            opacity: props.opacity ? props.opacity.vals.map(v => opacityScale(v)) : 1,
                            size: props.bubbleSize ? props.bubbleSize.vals.map(v => bubbleScale(v)) : 7
                        },
                    },
                ]}
                layout={ 
                {   
                    autosize: true,
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
                    }
                } }
                    useResizeHandler={true}
                    config={{responsive: true}}
                    style={{width: "100%", height: "100%"}}
            ></Plot> : null }
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