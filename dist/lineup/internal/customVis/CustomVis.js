import * as React from 'react';
import { useState } from 'react';
import { Multiples } from './Multiples';
import { PCP } from './PlotlyPCP';
// import {Chooser} from './Chooser';
// import {BarChart} from './PlotlyBarChart';
import { Scatterplot } from './PlotlyScatterplot';
import { StripChart } from './PlotlyStripPlot';
import { Violin } from './PlotlyViolinPlot';
export function CustomVis(props) {
    let [xAxis, setXAxis] = useState(null);
    let [yAxis, setYAxis] = useState(null);
    let [bubbleSize, setBubbleSize] = useState(null);
    let [colorMapping, setColorMapping] = useState(null);
    let [opacity, setOpacity] = useState(null);
    let [shape, setShape] = useState(null);
    let [visType, setVisType] = useState(props.type);
    let updateChartType = (s) => setVisType(s);
    let updateXAxis = (newCol) => setXAxis(props.columns.filter(c => c.name === newCol)[0]);
    let updateYAxis = (newCol) => setYAxis(props.columns.filter(c => c.name === newCol)[0]);
    let updateBubbleSize = (newCol) => setBubbleSize(props.columns.filter(c => c.name === newCol && c.type == "Numerical")[0]);
    let updateOpacity = (newCol) => setOpacity(props.columns.filter(c => c.name === newCol && c.type == "Numerical")[0]);
    let updateColor = (newCol) => setColorMapping(props.columns.filter(c => c.name === newCol && c.type == "Categorical")[0]);
    let updateShape = (newCol) => setShape(props.columns.filter(c => c.name === newCol && c.type == "Categorical")[0]);
    let currentVisComponent = null;
    switch (visType) {
        case "Violin": {
            currentVisComponent = React.createElement(Violin, { xCol: xAxis, yCol: yAxis, columns: props.columns, type: visType, updateXAxis: updateXAxis, updateYAxis: updateYAxis, updateChartType: updateChartType });
            break;
        }
        case "Strip Plot": {
            currentVisComponent = React.createElement(StripChart, { xCol: xAxis, yCol: yAxis, type: visType, columns: props.columns, updateXAxis: updateXAxis, updateYAxis: updateYAxis, updateChartType: updateChartType });
            break;
        }
        case "Chooser": {
            currentVisComponent = React.createElement(Scatterplot, { xCol: xAxis, yCol: yAxis, type: visType, columns: props.columns, bubbleSize: bubbleSize, opacity: opacity, color: colorMapping, shape: shape, updateXAxis: updateXAxis, updateYAxis: updateYAxis, updateBubbleSize: updateBubbleSize, updateOpacity: updateOpacity, updateColor: updateColor, updateShape: updateShape, updateChartType: updateChartType });
            break;
        }
        case "Scatterplot": {
            currentVisComponent = React.createElement(Scatterplot, { xCol: xAxis, yCol: yAxis, type: visType, columns: props.columns, bubbleSize: bubbleSize, opacity: opacity, color: colorMapping, shape: shape, updateXAxis: updateXAxis, updateYAxis: updateYAxis, updateBubbleSize: updateBubbleSize, updateOpacity: updateOpacity, updateColor: updateColor, updateShape: updateShape, updateChartType: updateChartType });
            break;
        }
        case "PCP": {
            currentVisComponent = React.createElement(PCP, { xCol: xAxis, yCol: yAxis, type: visType, columns: props.columns, bubbleSize: bubbleSize, opacity: opacity, color: colorMapping, shape: shape, updateXAxis: updateXAxis, updateYAxis: updateYAxis, updateBubbleSize: updateBubbleSize, updateOpacity: updateOpacity, updateColor: updateColor, updateShape: updateShape, updateChartType: updateChartType });
            break;
        }
        case "Multiples": {
            currentVisComponent = React.createElement(Multiples, { xCol: xAxis, yCol: yAxis, type: visType, columns: props.columns, bubbleSize: bubbleSize, opacity: opacity, color: colorMapping, shape: shape, updateXAxis: updateXAxis, updateYAxis: updateYAxis, updateBubbleSize: updateBubbleSize, updateOpacity: updateOpacity, updateColor: updateColor, updateShape: updateShape, updateChartType: updateChartType });
            break;
        }
    }
    return (React.createElement(React.Fragment, null, currentVisComponent));
}
//# sourceMappingURL=CustomVis.js.map