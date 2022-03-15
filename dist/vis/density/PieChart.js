import * as d3 from 'd3v7';
import * as React from 'react';
export function PieChart({ data, dataCategories, radius, transform, colorScale }) {
    const pie = d3.pie();
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    return (React.createElement("g", { style: { transform } }, pie(data).map((slice, i) => {
        return React.createElement("path", { d: arc(slice), style: { fill: colorScale ? colorScale(dataCategories[i]) : 'cornflowerblue' } });
    })));
}
//# sourceMappingURL=PieChart.js.map