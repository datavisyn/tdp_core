import d3 from 'd3';
import { scale } from 'd3';
import * as React from 'react';
import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { MultiplesSidePanel } from './MultiplesSidePanel';
import { createPCPData } from './PlotlyPCP';
import { createMultiplesScatterplotData } from './PlotlyScatterplot';
import { createMultiplesStripData } from './PlotlyStripPlot';
import { createMultiplesViolinData } from './PlotlyViolinPlot';
function heuristic(columns) {
    return {
        xAxis: columns.filter(c => c.type === "Numerical")[0].name,
        yAxis: columns.filter(c => c.type === "Numerical")[1].name
    };
}
export function Multiples(props) {
    const [currentVis, setCurrentVis] = useState("Scatterplot");
    const [selectedCatCols, setSelectedCatCols] = useState(props.columns.filter(c => c.selectedForMultiples === true && c.type == "Categorical").map(c => c.name));
    const [selectedNumCols, setSelectedNumCols] = useState(props.columns.filter(c => c.selectedForMultiples === true && c.type == "Numerical").map(c => c.name));
    let updateCurrentVis = (s) => setCurrentVis(s);
    let updateSelectedCatCols = (s, b) => b ? setSelectedCatCols([...selectedCatCols, s]) : setSelectedCatCols(selectedCatCols.filter(c => c !== s));
    let updateSelectedNumCols = (s, b) => b ? setSelectedNumCols([...selectedNumCols, s]) : setSelectedNumCols(selectedNumCols.filter(c => c !== s));
    let shapeScale = useMemo(() => {
        return props.shape ?
            scale.ordinal().domain(d3.set(props.shape.vals).values()).range(["circle-open", "square-open", "triangle-up-open", "star-open"])
            : null;
    }, [props.shape]);
    let bubbleScale = useMemo(() => {
        return props.bubbleSize ?
            scale.linear().domain([0, d3.max(props.bubbleSize.vals)]).range([0, 10])
            : null;
    }, [props.bubbleSize]);
    let opacityScale = useMemo(() => {
        return props.opacity ?
            scale.linear().domain([0, d3.max(props.opacity.vals)]).range([0, 1])
            : null;
    }, [props.opacity]);
    let colorScale = useMemo(() => {
        return scale.category10();
    }, [props.color]);
    let traces = undefined;
    switch (currentVis) {
        case "Scatterplot": {
            traces = createMultiplesScatterplotData(props, selectedNumCols, shapeScale, colorScale, opacityScale, colorScale);
            break;
        }
        case "Violin": {
            traces = createMultiplesViolinData(props, selectedNumCols, selectedCatCols, colorScale);
            break;
        }
        case "Strip Plot": {
            traces = createMultiplesStripData(props, selectedNumCols, selectedCatCols, colorScale);
            break;
        }
        case "PCP": {
            traces = createPCPData(props, selectedNumCols, selectedCatCols, colorScale);
            break;
        }
    }
    console.log(traces);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100" },
        React.createElement("div", { className: "flex-grow-1" },
            React.createElement(Plot, { divId: "plotlyDiv", data: traces.data, layout: {
                    showlegend: false,
                    autosize: true,
                    grid: { rows: traces.rows, columns: traces.cols, pattern: 'independent' },
                    violingap: 0,
                    violinmode: "overlay",
                }, config: { responsive: true }, useResizeHandler: true, style: { width: "100%", height: "100%" } })),
        React.createElement(MultiplesSidePanel, { currentVis: currentVis, setCurrentVis: updateCurrentVis, selectedCatCols: selectedCatCols, updateSelectedCatCols: updateSelectedCatCols, selectedNumCols: selectedNumCols, updateSelectedNumCols: updateSelectedNumCols, columns: props.columns, currentType: props.type, dropdowns: [
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
//# sourceMappingURL=Multiples.js.map