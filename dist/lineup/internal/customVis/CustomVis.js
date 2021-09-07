import * as React from 'react';
import { useState } from 'react';
import { Multiples } from './Multiples';
export const chartTypes = ['Scatter', 'Parallel Coordinates', 'Violin', 'Strip', 'Multiples'];
export const correlationTypes = ['Scatter'];
export const distributionTypes = ['Violin', 'Strip'];
export const highDimensionalTypes = ['Parallel Coordinates'];
export function CustomVis(props) {
    const [xAxis, setXAxis] = useState(null);
    const [yAxis, setYAxis] = useState(null);
    const [bubbleSize, setBubbleSize] = useState(null);
    const [colorMapping, setColorMapping] = useState(null);
    const [opacity, setOpacity] = useState(null);
    const [shape, setShape] = useState(null);
    const [visType, setVisType] = useState(props.type);
    // let [selectedCols, setSelectedCols] = useState<string[]>(props.columns.filter(c => c.selectedForMultiples === true).map(c => c.name))
    const updateChartType = (s) => setVisType(s);
    // let updateSelectedCols = (s: string, b: boolean) => b ? setSelectedCols([...selectedCols, s]) : setSelectedCols(selectedCols.filter(c => c !== s))
    const updateXAxis = (newCol) => setXAxis(props.columns.filter((c) => c.name === newCol)[0]);
    const updateYAxis = (newCol) => setYAxis(props.columns.filter((c) => c.name === newCol)[0]);
    const updateBubbleSize = (newCol) => setBubbleSize(props.columns.filter((c) => c.name === newCol && c.type === 'number')[0]);
    const updateOpacity = (newCol) => setOpacity(props.columns.filter((c) => c.name === newCol && c.type === 'number')[0]);
    const updateColor = (newCol) => setColorMapping(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0]);
    const updateShape = (newCol) => setShape(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0]);
    let currentVisComponent = null;
    switch (visType) {
        case 'Multiples': {
            currentVisComponent = React.createElement(Multiples, { filterCallback: props.filterCallback, selectedCallback: props.selectionCallback, xCol: xAxis, yCol: yAxis, type: visType, columns: props.columns, bubbleSize: bubbleSize, opacity: opacity, color: colorMapping, shape: shape, updateXAxis: updateXAxis, updateYAxis: updateYAxis, updateBubbleSize: updateBubbleSize, updateOpacity: updateOpacity, updateColor: updateColor, updateShape: updateShape, updateChartType: updateChartType });
            break;
        }
    }
    return (React.createElement(React.Fragment, null, currentVisComponent));
}
//# sourceMappingURL=CustomVis.js.map