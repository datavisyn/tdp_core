import d3 from 'd3';
import {scale} from 'd3';
import {Data, PlotData, ViolinData} from 'plotly.js';
import * as React from 'react';
import {useEffect, useMemo} from 'react';
import Plot from 'react-plotly.js';
import {NavLink} from 'react-router-dom';
import {useAsync} from '../../..';
import {CategoricalColumn, NumericalColumn, supportedPlotlyVis} from './CustomVis';
import {GenericSidePanel} from './GenericSidePanel';
import {MultipleDataTraces, MultiplesProps} from './Multiples';

interface ViolinProps {
    xCol: NumericalColumn | CategoricalColumn,
    yCol: NumericalColumn | CategoricalColumn,
    columns: (NumericalColumn | CategoricalColumn) []
    type: supportedPlotlyVis;
    updateXAxis: (s: string) => void; 
    updateYAxis: (s: string) => void; 
    updateChartType: (s: string) => void;
}

function heuristic(columns) {
    return {
        xAxis: columns.filter(c => c.type === "Categorical")[0].name,
        yAxis: columns.filter(c => c.type === "Numerical")[0].name
    }
}

export function createMultiplesViolinData(props: MultiplesProps, selectedNumCols: string[], selectedCatCols: string[], colorScale) : MultipleDataTraces {
    let counter = 1
    let numCols = props.columns.filter(c =>  selectedNumCols.includes(c.name))
    let catCols = props.columns.filter(c => selectedCatCols.includes(c.name))
    let traces: Data[] = []

    for(let numCurr of numCols)
    {
        for(let catCurr of catCols)
        {
            traces.push( {
                    x: catCurr.vals,
                    y: numCurr.vals,
                    xaxis: counter === 1 ? "x" : "x" + counter,
                    yaxis: counter === 1 ? "y" : "y" + counter,
                    type: 'violin',
                    name: 'All points',
                    scalemode: "count",
                    transforms: [{
                        type: 'groupby',
                        groups: catCurr.vals,
                        styles: 
                            [...new Set<string>(catCurr.vals as string[])].map(c => {
                                return {target: c, value: {line: {color: colorScale(c)}}}
                            })
                        }]
                },
            )
            counter += 1
        }
    }

    return {
        data: traces,
        rows: catCols.length, 
        cols: numCols.length
    };
}

export function Violin(props: ViolinProps) {

    // heuristic for setting up used in this async call
    useEffect(() => {
        // useAsync(async () => {
            const { xAxis, yAxis} = heuristic(props.columns);
    
            console.log(xAxis)
        
            if(props.xCol === null || props.xCol.type === "Numerical")
            {
                props.updateXAxis(xAxis);
            }
        
            if(props.yCol === null || props.yCol.type === "Categorical")
            {
                props.updateYAxis(yAxis);
            }
        // })
    }, [props.columns])

    let colorScale = useMemo(() => {
        return scale.category10()
    }, [])

    return (
        <div className="d-flex flex-row w-100 h-100">
            <div className="flex-grow-1">
                {props.xCol !== null &&
                props.yCol !== null && 
                props.xCol.type !== "Numerical" &&
                props.yCol.type !== "Categorical" ? <Plot
                divId={"plotlyDiv"}

                data={[
                    {
                        x: props.xCol.vals,
                        y: props.yCol.vals,
                        type: 'violin',
                        name: 'All points',
                        box: {
                            visible: true
                          },
                          line: {
                            color: 'green',
                          },
                          meanline: {
                            visible: true
                          },
                        transforms: [{
                            type: 'groupby',
                          groups: props.xCol.vals,
                          styles: 
                              [...new Set(props.xCol.vals)].map(c => {
                                  return {target: c, value: {line: {color: colorScale(c)}}}
                              })
                         }]
                    },
                ]}
                layout={ 
                {   
                    violingap: 0,
                    violinmode: "overlay",
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
                    }} }
                    config={{responsive: true}}
                    useResizeHandler={true}
                    style={{width: "100%", height: "100%"}}
                /> : null }
            </div>
            <GenericSidePanel 
                currentType={props.type}
                dropdowns={[
                    {
                        name: "X Axis",
                        callback: props.updateXAxis,
                        currentSelected: props.xCol ? props.xCol.name : "None",
                        options: props.columns.filter(c => c.type === "Categorical").map(c => c.name)
                    },
                    {
                        name: "Y Axis",
                        callback: props.updateYAxis,
                        currentSelected: props.yCol ? props.yCol.name : "None",
                        options: props.columns.filter(c => c.type === "Numerical").map(c => c.name)
                    },
                ]}
                chartTypeChangeCallback={props.updateChartType}
                ></GenericSidePanel>
        </div>
    );
}