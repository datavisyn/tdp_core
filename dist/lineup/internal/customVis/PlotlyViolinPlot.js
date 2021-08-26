import { scale } from 'd3';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { GenericSidePanel } from './GenericSidePanel';
function heuristic(columns) {
    return {
        xAxis: columns.filter(c => c.type === "Categorical")[0].name,
        yAxis: columns.filter(c => c.type === "Numerical")[0].name
    };
}
export function Violin(props) {
    // heuristic for setting up used in this async call
    useEffect(() => {
        // useAsync(async () => {
        const { xAxis, yAxis } = heuristic(props.columns);
        console.log(xAxis);
        if (props.xCol === null || props.xCol.type === "Numerical") {
            props.updateXAxis(xAxis);
        }
        if (props.yCol === null || props.yCol.type === "Categorical") {
            props.updateYAxis(yAxis);
        }
        // })
    }, [props.columns]);
    let colorScale = useMemo(() => {
        return scale.category10();
    }, []);
    return (React.createElement("div", { style: { height: "100%", display: "flex", flexDirection: "row" } },
        React.createElement("div", { style: { flex: "5" } }, props.xCol !== null &&
            props.yCol !== null &&
            props.xCol.type !== "Numerical" &&
            props.yCol.type !== "Categorical" ? React.createElement(Plot, { data: [
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
                            styles: [...new Set(props.xCol.vals)].map(c => {
                                return { target: c, value: { line: { color: colorScale(c) } } };
                            })
                        }]
                },
            ], layout: {
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
                }
            } }) : null),
        React.createElement(GenericSidePanel, { currentType: props.type, dropdowns: [
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
            ], chartTypeChangeCallback: props.updateChartType })));
}
//# sourceMappingURL=PlotlyViolinPlot.js.map