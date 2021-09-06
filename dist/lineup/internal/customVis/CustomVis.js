import * as React from 'react';
import { useState } from 'react';
import { Multiples } from './Multiples';
export const chartTypes = ["Scatter", "Parallel Coordinates", "Violin", "Strip", "Multiples"];
export const correlationTypes = ["Scatter"];
export const distributionTypes = ["Violin", "Strip"];
export const highDimensionalTypes = ["Parallel Coordinates"];
export function CustomVis(props) {
    let [xAxis, setXAxis] = useState(null);
    let [yAxis, setYAxis] = useState(null);
    let [bubbleSize, setBubbleSize] = useState(null);
    let [colorMapping, setColorMapping] = useState(null);
    let [opacity, setOpacity] = useState(null);
    let [shape, setShape] = useState(null);
    let [visType, setVisType] = useState(props.type);
    // let [selectedCols, setSelectedCols] = useState<string[]>(props.columns.filter(c => c.selectedForMultiples === true).map(c => c.name))
    let updateChartType = (s) => setVisType(s);
    // let updateSelectedCols = (s: string, b: boolean) => b ? setSelectedCols([...selectedCols, s]) : setSelectedCols(selectedCols.filter(c => c !== s))
    let updateXAxis = (newCol) => setXAxis(props.columns.filter(c => c.name === newCol)[0]);
    let updateYAxis = (newCol) => setYAxis(props.columns.filter(c => c.name === newCol)[0]);
    let updateBubbleSize = (newCol) => setBubbleSize(props.columns.filter(c => c.name === newCol && c.type == "number")[0]);
    let updateOpacity = (newCol) => setOpacity(props.columns.filter(c => c.name === newCol && c.type == "number")[0]);
    let updateColor = (newCol) => setColorMapping(props.columns.filter(c => c.name === newCol && c.type == "categorical")[0]);
    let updateShape = (newCol) => setShape(props.columns.filter(c => c.name === newCol && c.type == "categorical")[0]);
    let currentVisComponent = null;
    switch (visType) {
        case "Multiples": {
            currentVisComponent = React.createElement(Multiples, { selectedCallback: props.selectionCallback, xCol: xAxis, yCol: yAxis, type: visType, columns: props.columns, bubbleSize: bubbleSize, opacity: opacity, color: colorMapping, shape: shape, updateXAxis: updateXAxis, updateYAxis: updateYAxis, updateBubbleSize: updateBubbleSize, updateOpacity: updateOpacity, updateColor: updateColor, updateShape: updateShape, updateChartType: updateChartType });
            break;
        }
    }
    return (React.createElement(React.Fragment, null, currentVisComponent));
}
//# sourceMappingURL=CustomVis.js.map