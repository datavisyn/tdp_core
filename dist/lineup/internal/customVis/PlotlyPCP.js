import d3 from 'd3';
import { scale } from 'd3';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { GenericSidePanel } from './GenericSidePanel';
function heuristic(columns) {
    return {
        xAxis: columns.filter(c => c.type === "Numerical")[0].name,
        yAxis: columns.filter(c => c.type === "Numerical")[1].name
    };
}
export function createPCPData(props, selectedNumCols, selectedCatCols, colorScale) {
    let numCols = props.columns.filter(c => selectedNumCols.includes(c.name));
    let catCols = props.columns.filter(c => selectedCatCols.includes(c.name));
    let trace = {
        //yo why does this error i dunno but it works
        dimensions: [...numCols.map(c => {
                return {
                    range: [d3.min(c.vals), d3.max(c.vals)],
                    label: c.name,
                    values: c.vals
                };
            }), ...catCols.map(c => {
                let uniqueList = [...new Set(c.vals)];
                return {
                    range: [0, uniqueList.length - 1],
                    label: c.name,
                    values: c.vals.map(curr => uniqueList.indexOf(curr)),
                    tickvals: [...uniqueList.keys()],
                    ticktext: uniqueList
                };
            })],
        type: 'parcoords',
        line: {
            color: props.color ? props.color.vals.map(c => colorScale(c)) : "red",
        },
    };
    return {
        data: [trace],
        rows: 1,
        cols: 1
    };
}
export function PCP(props) {
    // heuristic for setting up used in this async call
    useEffect(() => {
        // useAsync(async () => {
        const { xAxis, yAxis } = heuristic(props.columns);
        console.log(xAxis);
        if (props.xCol === null || props.xCol.type === "Categorical") {
            props.updateXAxis(xAxis);
        }
        if (props.yCol === null || props.yCol.type === "Categorical") {
            props.updateYAxis(yAxis);
        }
        // })
    }, [props.columns]);
    let colorScale = useMemo(() => {
        return scale.category10();
    }, [props.color]);
    let dataVariable = {
        //yo why does this error i dunno but it works
        dimensions: props.columns.filter(c => c.type === "Numerical").map(c => {
            return {
                range: [d3.min(c.vals), d3.max(c.vals)],
                label: c.name,
                values: c.vals
            };
        }),
        type: 'parcoords',
        line: {
            color: props.color ? props.color.vals.map(c => colorScale(c)) : "red",
        },
    };
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100" },
        React.createElement("div", { className: "flex-grow-1" }, props.xCol !== null &&
            props.yCol !== null &&
            props.xCol.type !== "Categorical" &&
            props.yCol.type !== "Categorical" ? React.createElement(Plot, { divId: "plotlyDiv", data: [dataVariable], layout: {
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
            }, config: { responsive: true }, useResizeHandler: true, style: { width: "100%", height: "100%" } }) : null),
        React.createElement(GenericSidePanel, { currentType: props.type, dropdowns: [
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
            ], chartTypeChangeCallback: props.updateChartType })));
}
//# sourceMappingURL=PlotlyPCP.js.map