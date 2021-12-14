import * as React from 'react';
import { Multiples } from './Multiples';
export function CustomVis(props) {
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