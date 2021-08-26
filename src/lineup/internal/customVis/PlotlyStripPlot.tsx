import d3 from 'd3';
import {scale} from 'd3';
import * as React from 'react';
import {useEffect, useMemo} from 'react';
import Plot from 'react-plotly.js';
import {NavLink} from 'react-router-dom';
import {useAsync} from '../../..';
import {CategoricalColumn, NumericalColumn, supportedPlotlyVis} from './CustomVis';
import {GenericSidePanel} from './GenericSidePanel';

interface StripChartProps {
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

export function StripChart(props: StripChartProps) {

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
        <div style={{height: "100%", display: "flex", flexDirection: "row"}}>
            <div style={{flex: "5"}}>
                {props.xCol !== null &&
                props.yCol !== null && 
                props.xCol.type !== "Numerical" &&
                props.yCol.type !== "Categorical" ? <Plot
                data={[
                    {
                        x: props.xCol.vals,
                        y: props.yCol.vals,
                        type: 'box',
                        boxpoints: "all",
                        name: 'All points',
                        mode: "none",
                        pointpos: 0,
                        box: {
                            visible: true
                          },
                          line: {
                            color: 'rgba(255,255,255,0)',
                          },
                          meanline: {
                            visible: true
                          },
                        transforms: [{
                            type: 'groupby',
                          groups: props.xCol.vals,
                          styles: 
                              [...new Set(props.xCol.vals)].map(c => {
                                  return {target: c, value: {marker: {color: colorScale(c)}}}
                              })
                         }]
                    },
                ]}
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